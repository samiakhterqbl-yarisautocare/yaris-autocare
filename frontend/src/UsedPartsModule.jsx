import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Search, Car, Layers, Zap, Disc, Wind, ArrowRight, Package, Filter as FilterIcon } from 'lucide-react';
const API_URL = 'https://yaris-autocare-production.up.railway.app';

const CATEGORIES = [
  { name: 'Engine & Components', icon: <Car />, slug: 'engine' },
  { name: 'Transmission', icon: <Layers />, slug: 'transmission' },
  { name: 'Electrical & Lighting', icon: <Zap />, slug: 'electrical' },
  { name: 'Body Panels', icon: <Car />, slug: 'body' },
  { name: 'Suspension & Braking', icon: <Disc />, slug: 'suspension' },
  { name: 'Interior', icon: <Wind />, slug: 'interior' },
];

export default function UsedPartsModule() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [inventory, setInventory] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch all used parts for the search function
  useEffect(() => {
    const fetchParts = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/used-parts/`);
        setInventory(res.data);
      } catch (err) {
        console.error("Error fetching inventory", err);
      }
    };
    fetchParts();
  }, []);

  const filteredParts = inventory.filter(part => 
    part.part_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      {/* HEADER SECTION */}
      <div style={headerSection}>
        <div>
          <h2 style={{ fontWeight: '900', fontSize: '32px', margin: 0, color: '#0f172a' }}>Used Inventory</h2>
          <p style={{ color: '#64748b', marginTop: '5px' }}>Manage salvaged parts from Yaris and Camry donor cars.</p>
        </div>
        <button 
          onClick={() => navigate('/used-parts/add')}
          style={addBtn}
        >
          <Plus size={20}/> ADD NEW PART
        </button>
      </div>

      {/* GLOBAL SEARCH BAR */}
      <div style={searchContainer}>
        <div style={searchWrapper}>
          <Search size={20} style={searchIcon} />
          <input 
            type="text" 
            placeholder="Search by part name, category, or stock number..." 
            style={searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {searchTerm === '' ? (
        <>
          {/* CATEGORY GRID (Shown when NOT searching) */}
          <div style={sectionTitle}>Browse by Category</div>
          <div style={grid}>
            {CATEGORIES.map((cat) => (
              <div key={cat.slug} onClick={() => navigate(`/used-parts/category/${cat.slug}`)} style={categoryCard}>
                <div style={iconBox}>{cat.icon}</div>
                <h3 style={catTitle}>{cat.name}</h3>
                <div style={catFooter}>
                  <span>View All</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* SEARCH RESULTS (Shown when user types) */}
          <div style={sectionTitle}>Search Results ({filteredParts.length})</div>
          <div style={grid}>
            {filteredParts.map((part) => (
              <div key={part.id} onClick={() => navigate(`/used-parts/${part.id}`)} style={partCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={partBadge}>{part.category}</span>
                  <span style={priceText}>${part.price}</span>
                </div>
                <h4 style={partName}>{part.part_name}</h4>
                <div style={partInfo}>Stock: {part.status || 'Available'}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// --- STYLES ---
const headerSection = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const addBtn = { backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '14px 24px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' };
const searchContainer = { marginBottom: '40px' };
const searchWrapper = { position: 'relative', maxWidth: '800px', margin: '0 auto' };
const searchIcon = { position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' };
const searchInput = { width: '100%', padding: '18px 20px 18px 55px', borderRadius: '18px', border: '1px solid #e2e8f0', fontSize: '16px', outline: 'none', backgroundColor: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' };
const sectionTitle = { fontSize: '14px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '20px', textTransform: 'uppercase' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' };
const categoryCard = { backgroundColor: '#fff', padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: '0.2s hover' };
const iconBox = { width: '45px', height: '45px', backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const catTitle = { fontSize: '18px', fontWeight: '800', margin: '15px 0 5px 0', color: '#1e293b' };
const catFooter = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '15px', color: '#ef4444', fontWeight: '700', fontSize: '14px' };
const partCard = { backgroundColor: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0', cursor: 'pointer' };
const partBadge = { fontSize: '10px', fontWeight: '800', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', color: '#64748b' };
const priceText = { fontWeight: '900', color: '#22c55e' };
const partName = { fontSize: '16px', fontWeight: '800', margin: '12px 0 5px 0' };
const partInfo = { fontSize: '12px', color: '#94a3b8' };
