import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, X, Filter, Car, ChevronRight, Save, CheckCircle, Package } from 'lucide-react';

const API_URL = 'https://yaris-autocare-production.up.railway.app';
const CATEGORIES = ["Front Body", "Mechanical", "Chassis", "Interior", "Doors", "Rear Body"];

// Mapping parts to categories for quick selection
const CATEGORY_MAP = {
  "Front Body": ["Front Bumper", "Headlight Left", "Headlight Right", "Bonnet", "Grille", "Radiator Support"],
  "Mechanical": ["Alternator", "Starter Motor", "AC Compressor", "Engine", "Transmission", "ABS Pump"],
  "Chassis": ["Front Strut L", "Front Strut R", "Control Arm L", "Control Arm R", "Steering Rack"],
  "Interior": ["Airbag Set", "Dashboard", "Front Seat L", "Front Seat R", "Instrument Cluster"],
  "Doors": ["Front Door L", "Front Door R", "Rear Door L", "Rear Door R", "Side Mirror L", "Side Mirror R"],
  "Rear Body": ["Rear Bumper", "Tail Light L", "Tail Light R", "Boot Lid", "Rear Axle", "Fuel Pump"]
};

const DismantleModule = () => {
  const [carId, setCarId] = useState('');
  const [carData, setCarData] = useState(null);
  const [activeTab, setActiveTab] = useState("Front Body");
  const [selectedParts, setSelectedParts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Lookup Car Details from Railway
  useEffect(() => {
    if (carId.length >= 1) {
      axios.get(`${API_URL}/api/donor-cars/${carId}/`)
        .then(res => setCarData(res.data))
        .catch(() => setCarData(null));
    }
  }, [carId]);

  const togglePart = (partName) => {
    setSelectedParts(prev => 
      prev.includes(partName) ? prev.filter(p => p !== partName) : [...prev, partName]
    );
  };

  const handleSave = async () => {
    if (!carData || selectedParts.length === 0) return alert("Select a car and parts first!");
    setLoading(true);
    
    try {
      const partsToCreate = selectedParts.map(name => ({
        part_name: name,
        category: activeTab,
        price: 0, 
        condition: "Used"
      }));

      await axios.post(`${API_URL}/api/bulk-create/`, {
        car_id: carData.id,
        parts: partsToCreate
      });

      alert(`Successfully added ${selectedParts.length} parts to ${carData.stock_number}`);
      setSelectedParts([]);
    } catch (err) {
      alert("Error saving dismantle data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
      
      {/* HEADER: SEARCH & ID LOOKUP */}
      <div style={headerActionStyle}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} style={searchIconStyle} />
          <input 
            type="text" 
            placeholder="Search parts across all categories..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setIsSearching(e.target.value.length > 0); }}
            style={searchBarStyle}
          />
        </div>
        
        <div style={carIdBoxStyle}>
          <Car size={18} color="#ef4444" />
          <span style={{fontSize: '12px', fontWeight: '800', color: '#64748b'}}>DONOR ID:</span>
          <input type="number" placeholder="0" value={carId} onChange={(e) => setCarId(e.target.value)} style={idInputStyle} />
        </div>
      </div>

      {/* CAR INFO HEADER */}
      {carData ? (
        <div style={carHeaderStyle}>
          <div>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '900' }}>{carData.year} {carData.model}</h2>
            <p style={{ margin: '5px 0 0 0', opacity: 0.8, fontWeight: '600' }}>
              STOCK: <span style={{color: '#ef4444'}}>{carData.stock_number}</span> | VIN: {carData.vin} | COLOR: {carData.color}
            </p>
          </div>
          <button 
            onClick={handleSave} 
            disabled={loading || selectedParts.length === 0}
            style={saveBtnStyle}
          >
            {loading ? "SAVING..." : `CREATE ${selectedParts.length} INVENTORY ITEMS`}
          </button>
        </div>
      ) : (
        <div style={emptyState}>Enter a Donor Car ID to start dismantling.</div>
      )}

      {/* CATEGORY TABS */}
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

      {/* CHECKLIST GRID */}
      <div style={partsGridStyle}>
        {CATEGORY_MAP[activeTab].map(part => (
          <div 
            key={part} 
            onClick={() => togglePart(part)}
            style={{
              ...partCardStyle,
              borderColor: selectedParts.includes(part) ? '#ef4444' : '#e2e8f0',
              backgroundColor: selectedParts.includes(part) ? '#fef2f2' : '#fff'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span style={{ fontWeight: '700', fontSize: '14px' }}>{part}</span>
               {selectedParts.includes(part) ? <CheckCircle size={18} color="#ef4444" /> : <Package size={18} color="#cbd5e1" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- STYLES (Aligned with your elegant theme) ---
const headerActionStyle = { display: 'flex', gap: '20px', marginBottom: '30px', alignItems: 'center' };
const searchBarStyle = { width: '100%', padding: '15px 15px 15px 50px', borderRadius: '14px', border: '1px solid #e2e8f0', fontSize: '16px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' };
const searchIconStyle = { position: 'absolute', left: '18px', top: '16px', color: '#94a3b8' };
const carIdBoxStyle = { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#fff', padding: '0 20px', borderRadius: '14px', border: '1px solid #e2e8f0', height: '52px' };
const idInputStyle = { border: 'none', outline: 'none', width: '40px', fontSize: '18px', fontWeight: '900', color: '#ef4444' };
const carHeaderStyle = { backgroundColor: '#0f172a', color: '#fff', padding: '35px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' };
const saveBtnStyle = { backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '18px 35px', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', transition: '0.2s' };
const tabBarStyle = { display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '30px', paddingBottom: '10px' };
const activeTabStyle = { padding: '14px 28px', backgroundColor: '#ef4444', color: '#fff', borderRadius: '12px', border: 'none', fontWeight: '800', cursor: 'pointer', whiteSpace: 'nowrap' };
const inactiveTabStyle = { padding: '14px 28px', backgroundColor: '#fff', color: '#64748b', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: '800', cursor: 'pointer', whiteSpace: 'nowrap' };
const partsGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' };
const partCardStyle = { padding: '20px', borderRadius: '15px', border: '2px solid', cursor: 'pointer', transition: '0.2s' };
const emptyState = { padding: '60px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '24px', border: '2px dashed #e2e8f0', color: '#94a3b8', fontWeight: '700' };

export default DismantleModule;
