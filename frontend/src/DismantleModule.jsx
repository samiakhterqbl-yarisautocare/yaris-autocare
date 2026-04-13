import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, X, Filter, Car, ChevronRight, Save, CheckCircle, Package, PlusCircle, Wrench } from 'lucide-react';

const API_URL = 'https://yaris-autocare-production.up.railway.app';
const CATEGORIES = ["Front Body", "Engine Bay", "Mechanical & Drive", "Doors & Glass", "Interior & Safety", "Rear Body"];

// THE FULL MASTER LIST WE DESIGNED
const CATEGORY_MAP = {
  "Front Body": [
    "Front Bumper", "Bonnet", "Grille", "Headlight Left", "Headlight Right", 
    "Front Fog Light L", "Front Fog Light R", "Front Guard L", "Front Guard R", 
    "Radiator Support", "Front Bar Reinforcement", "Bonnet Hinge Set", "Bonnet Latch"
  ],
  "Engine Bay": [
    "Engine Assembly", "Alternator", "Starter Motor", "AC Compressor", 
    "Radiator", "Condenser", "Radiator Fan Assembly", "Air Cleaner Box", 
    "Throttle Body", "Ignition Coil Set", "Fuse Box Engine", "Brake Master Cylinder",
    "ABS Pump", "Wiper Motor Front", "Engine Mount Set"
  ],
  "Mechanical & Drive": [
    "Transmission/Gearbox", "Driveshaft Left", "Driveshaft Right", "Front Strut L", 
    "Front Strut R", "Control Arm L", "Control Arm R", "Steering Rack", 
    "Power Steering Pump", "Hub & Knuckle L", "Hub & Knuckle R", "Front Brake Caliper L",
    "Front Brake Caliper R", "Exhaust Manifold", "Catalytic Converter"
  ],
  "Doors & Glass": [
    "Front Door L", "Front Door R", "Rear Door L", "Rear Door R", 
    "Side Mirror L", "Side Mirror R", "Door Window Glass FL", "Door Window Glass FR",
    "Window Regulator FL", "Window Regulator FR", "Door Lock Actuator FL", "Door Lock Actuator FR",
    "Windscreen", "Quarter Glass L", "Quarter Glass R"
  ],
  "Interior & Safety": [
    "Airbag Kit (Full)", "Steering Wheel", "Dashboard Assembly", "Instrument Cluster",
    "Clock Spring", "Front Seat L", "Front Seat R", "Rear Seat Set", 
    "Door Trim Set", "Roof Lining", "Center Console", "AC Heater Control", 
    "Indicator/Wiper Stalk", "Master Window Switch"
  ],
  "Rear Body": [
    "Rear Bumper", "Tail Light L", "Tail Light R", "Boot Lid/Tailgate", 
    "Tailgate Strut Set", "Rear Bar Reinforcement", "Fuel Pump", "Fuel Tank",
    "Rear Axle Assembly", "Rear Shock L", "Rear Shock R", "Tow Bar",
    "Reverse Camera", "Spare Wheel/Tool Kit"
  ]
};

const DismantleModule = () => {
  const [entryMode, setEntryMode] = useState('lookup'); 
  const [carId, setCarId] = useState('');
  const [newCar, setNewCar] = useState({ stock_number: '', vin: '', model: '', year: '', color: '', make: 'Toyota' });
  const [carData, setCarData] = useState(null);
  const [activeTab, setActiveTab] = useState("Front Body");
  const [selectedParts, setSelectedParts] = useState([]); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (entryMode === 'lookup' && carId.length >= 1) {
      axios.get(`${API_URL}/api/donor-cars/${carId}/`)
        .then(res => setCarData(res.data))
        .catch(() => setCarData(null));
    }
  }, [carId, entryMode]);

  const togglePart = (partName) => {
    const isSelected = selectedParts.find(p => p.name === partName);
    if (isSelected) {
      setSelectedParts(selectedParts.filter(p => p.name !== partName));
    } else {
      setSelectedParts([...selectedParts, { name: partName, category: activeTab }]);
    }
  };

  const handleFinalizeDismantle = async () => {
    if (selectedParts.length === 0) return alert("Select at least one part!");
    setLoading(true);

    try {
      let donorId = carData?.id;
      if (entryMode === 'new') {
        const carRes = await axios.post(`${API_URL}/api/donor-cars/`, newCar);
        donorId = carRes.data.id;
      }

      const partsPayload = selectedParts.map(p => ({
        part_name: p.name,
        category: p.category,
        price: 0, 
        grading: 'A',
        status: 'Available'
      }));

      await axios.post(`${API_URL}/api/bulk-create/`, {
        car_id: donorId,
        parts: partsPayload
      });

      alert(`SAVED: ${selectedParts.length} parts added to ${newCar.stock_number || carData.stock_number}. Ready for QR labeling.`);
      setSelectedParts([]);
      setCarId('');
      setCarData(null);
      setEntryMode('lookup');
    } catch (err) {
      alert("Error: Process failed. Check VIN uniqueness.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* HEADER ACTION AREA */}
      <div style={headerActionStyle}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setEntryMode('lookup')} style={entryMode === 'lookup' ? activeModeBtn : inactiveModeBtn}><Search size={18}/> Lookup</button>
          <button onClick={() => setEntryMode('new')} style={entryMode === 'new' ? activeModeBtn : inactiveModeBtn}><PlusCircle size={18}/> New Car</button>
        </div>

        {entryMode === 'lookup' ? (
          <div style={carIdBoxStyle}>
            <Car size={18} color="#ef4444" />
            <input type="number" placeholder="ID" value={carId} onChange={(e) => setCarId(e.target.value)} style={idInputStyle} />
          </div>
        ) : (
          <div style={{display: 'flex', gap: '8px'}}>
             <input placeholder="Stock #" style={miniInput} onChange={e => setNewCar({...newCar, stock_number: e.target.value})} />
             <input placeholder="VIN" style={miniInput} onChange={e => setNewCar({...newCar, vin: e.target.value})} />
             <input placeholder="Model" style={miniInput} onChange={e => setNewCar({...newCar, model: e.target.value})} />
             <input placeholder="Year" style={miniInput} onChange={e => setNewCar({...newCar, year: e.target.value})} />
          </div>
        )}
      </div>

      {/* CAR DISPLAY */}
      {(carData || entryMode === 'new') && (
        <div style={carHeaderStyle}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '900' }}>
              {entryMode === 'new' ? `${newCar.year} ${newCar.model || 'Donor'}` : `${carData.year} ${carData.model}`}
            </h2>
            <p style={{ margin: '5px 0 0 0', opacity: 0.8, fontSize: '13px' }}>
              {entryMode === 'new' ? "Registering New Stock..." : `STOCK: ${carData.stock_number} | VIN: ${carData.vin}`}
            </p>
          </div>
          <div style={{display: 'flex', gap: '15px'}}>
             <div style={countBadge}>{selectedParts.length} ITEMS SELECTED</div>
             <button onClick={handleFinalizeDismantle} disabled={loading} style={saveBtnStyle}>
               {loading ? "SAVING..." : "FINISH & GENERATE LABELS"}
             </button>
          </div>
        </div>
      )}

      {/* CATEGORY TABS */}
      <div style={tabBarStyle}>
        {CATEGORIES.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={activeTab === tab ? activeTabStyle : inactiveTabStyle}>
            {tab}
          </button>
        ))}
      </div>

      {/* MASTER PARTS GRID */}
      <div style={partsGridStyle}>
        {CATEGORY_MAP[activeTab].map(part => {
          const isSelected = selectedParts.find(p => p.name === part);
          return (
            <div 
              key={part} 
              onClick={() => togglePart(part)}
              style={{
                ...partCardStyle,
                borderColor: isSelected ? '#ef4444' : '#e2e8f0',
                backgroundColor: isSelected ? '#fef2f2' : '#fff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span style={{ fontWeight: '700', fontSize: '12px', lineHeight: '1.2' }}>{part}</span>
                 {isSelected ? <CheckCircle size={16} color="#ef4444" /> : <Package size={16} color="#cbd5e1" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- STYLES ---
const headerActionStyle = { display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center', backgroundColor: '#fff', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' };
const activeModeBtn = { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 15px', backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '13px' };
const inactiveModeBtn = { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 15px', backgroundColor: '#f1f5f9', color: '#64748b', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '13px' };
const carIdBoxStyle = { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafc', padding: '0 12px', borderRadius: '8px', border: '1px solid #e2e8f0', height: '38px' };
const idInputStyle = { border: 'none', outline: 'none', width: '40px', fontSize: '15px', fontWeight: '900', color: '#ef4444', background: 'none' };
const miniInput = { padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '12px', width: '90px' };
const carHeaderStyle = { backgroundColor: '#0f172a', color: '#fff', padding: '25px', borderRadius: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' };
const countBadge = { backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', padding: '10px 15px', borderRadius: '10px', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center' };
const saveBtnStyle = { backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '13px' };
const tabBarStyle = { display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '5px' };
const activeTabStyle = { padding: '10px 18px', backgroundColor: '#ef4444', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: '800', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '12px' };
const inactiveTabStyle = { padding: '10px 18px', backgroundColor: '#fff', color: '#64748b', borderRadius: '8px', border: '1px solid #e2e8f0', fontWeight: '800', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '12px' };
const partsGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' };
const partCardStyle = { padding: '15px', borderRadius: '10px', border: '2px solid', cursor: 'pointer', transition: '0.2s' };

export default DismantleModule;
