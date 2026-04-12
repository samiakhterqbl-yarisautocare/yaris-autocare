import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, X, Filter, Car, ChevronRight, Save } from 'lucide-react';

const CATEGORIES = ["Front Body", "Mechanical", "Chassis", "Interior", "Doors", "Rear Body"];

const DismantleModule = () => {
  const [carId, setCarId] = useState('');
  const [carData, setCarData] = useState(null);
  const [activeTab, setActiveTab] = useState("Front Body");
  const [selectedParts, setSelectedParts] = useState([]);
  
  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filterCat, setFilterCat] = useState('All');

  useEffect(() => {
    if (carId) {
      axios.get(`http://127.0.0.1:8000/api/inventory/car-details/${carId}/`)
        .then(res => setCarData(res.data)).catch(() => setCarData(null));
    }
  }, [carId]);

  // Logic to toggle the search results overlay
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setIsSearching(e.target.value.length > 0);
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* 1. Header with Result Toggle Search */}
      <div style={headerActionStyle}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} style={searchIconStyle} />
          <input 
            type="text" 
            placeholder="Search parts in this car..." 
            value={searchQuery}
            onChange={handleSearch}
            style={searchBarStyle}
          />
          {isSearching && <X size={20} onClick={() => setIsSearching(false)} style={clearSearchStyle} />}
        </div>
        
        <div style={carIdBoxStyle}>
          <Car size={18} color="#ef4444" />
          <input type="number" placeholder="ID" value={carId} onChange={(e) => setCarId(e.target.value)} style={idInputStyle} />
        </div>
      </div>

      {/* 2. Search Results Overlay (Toggled) */}
      {isSearching && (
        <div style={searchOverlayStyle}>
          <div style={searchHeaderStyle}>
            <h3>Results for "{searchQuery}"</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Filter size={18} />
              <select onChange={(e) => setFilterCat(e.target.value)} style={filterDropdownStyle}>
                <option value="All">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={resultsGridStyle}>
             {/* Search Logic goes here to filter parts list */}
             <p style={{ color: '#64748b' }}>Matching parts will appear here...</p>
          </div>
        </div>
      )}

      {/* 3. Main Dashboard (Hidden or Faded when searching) */}
      {!isSearching && (
        <>
          {carData && (
            <div style={carHeaderStyle}>
              <div style={{ color: '#fff' }}>
                <h2 style={{ margin: 0, fontSize: '28px' }}>{carData.year} {carData.model}</h2>
                <p style={{ margin: 0, opacity: 0.7 }}>Stock: {carData.stock_number} | {carData.color}</p>
              </div>
              <button style={saveBtnStyle}>SAVE {selectedParts.length} ITEMS</button>
            </div>
          )}

          <div style={tabBarStyle}>
            {CATEGORIES.map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                style={activeTab === tab ? activeTabStyle : inactiveTabStyle}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={partsGridStyle}>
             {/* Part checklist labels map here */}
             <p>Select category above to start salvaging.</p>
          </div>
        </>
      )}
    </div>
  );
};

// --- STYLES ---
const headerActionStyle = { display: 'flex', gap: '20px', marginBottom: '30px', alignItems: 'center' };
const searchBarStyle = { width: '100%', padding: '15px 15px 15px 50px', borderRadius: '14px', border: '1px solid #e2e8f0', fontSize: '16px', backgroundColor: '#fff' };
const searchIconStyle = { position: 'absolute', left: '18px', top: '16px', color: '#94a3b8' };
const clearSearchStyle = { position: 'absolute', right: '15px', top: '16px', cursor: 'pointer', color: '#64748b' };
const carIdBoxStyle = { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fff', padding: '0 15px', borderRadius: '14px', border: '1px solid #e2e8f0', height: '52px' };
const idInputStyle = { border: 'none', outline: 'none', width: '50px', fontSize: '18px', fontWeight: 'bold' };
const searchOverlayStyle = { backgroundColor: '#fff', borderRadius: '20px', padding: '30px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' };
const searchHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' };
const filterDropdownStyle = { border: 'none', fontWeight: 'bold', cursor: 'pointer', color: '#ef4444' };
const carHeaderStyle = { backgroundColor: '#0f172a', padding: '30px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const saveBtnStyle = { backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '15px 30px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' };
const tabBarStyle = { display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '25px', paddingBottom: '10px' };
const activeTabStyle = { padding: '12px 24px', backgroundColor: '#ef4444', color: '#fff', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer' };
const inactiveTabStyle = { padding: '12px 24px', backgroundColor: '#f1f5f9', color: '#64748b', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer' };
const partsGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' };

export default DismantleModule;