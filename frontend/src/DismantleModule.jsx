import React, { useState } from 'react';
import axios from 'axios';
import { 
  Search, PlusCircle, Scissors, Printer, CheckCircle, 
  Package, Car, ArrowRight, ArrowLeft, RefreshCw, AlertTriangle, Plus 
} from 'lucide-react';
import QRCode from 'react-qr-code';

const API_URL = 'https://yaris-autocare-production.up.railway.app';
const COLORS = { primary: '#ef4444', dark: '#0f172a', border: '#e2e8f0', bg: '#f8fafc' };

const CATEGORY_MAP = {
  "Front Body": ["Front Bumper", "Bonnet", "Grille", "Headlight Left", "Headlight Right", "Front Fog Light L", "Front Fog Light R", "Front Guard L", "Front Guard R", "Radiator Support", "Front Bar Reinforcement", "Bonnet Hinge Set", "Bonnet Latch"],
  "Engine Bay": ["Engine Assembly", "Alternator", "Starter Motor", "AC Compressor", "Radiator", "Condenser", "Radiator Fan Assembly", "Air Cleaner Box", "Throttle Body", "Ignition Coil Set", "Fuse Box Engine", "Brake Master Cylinder", "ABS Pump", "Wiper Motor Front", "Engine Mount Set"],
  "Mechanical & Drive": ["Transmission/Gearbox", "Driveshaft Left", "Driveshaft Right", "Front Strut L", "Front Strut R", "Control Arm L", "Control Arm R", "Steering Rack", "Power Steering Pump", "Hub & Knuckle L", "Hub & Knuckle R", "Front Brake Caliper L", "Front Brake Caliper R", "Exhaust Manifold", "Catalytic Converter"],
  "Doors & Glass": ["Front Door L", "Front Door R", "Rear Door L", "Rear Door R", "Side Mirror L", "Side Mirror R", "Door Window Glass FL", "Door Window Glass FR", "Window Regulator FL", "Window Regulator FR", "Door Lock Actuator FL", "Door Lock Actuator FR", "Windscreen", "Quarter Glass L", "Quarter Glass R"],
  "Interior & Safety": ["Airbag Kit (Full)", "Steering Wheel", "Dashboard Assembly", "Instrument Cluster", "Clock Spring", "Front Seat L", "Front Seat R", "Rear Seat Set", "Door Trim Set", "Roof Lining", "Center Console", "AC Heater Control", "Indicator/Wiper Stalk", "Master Window Switch"],
  "Rear Body": ["Rear Bumper", "Tail Light L", "Tail Light R", "Boot Lid/Tailgate", "Tailgate Strut Set", "Rear Bar Reinforcement", "Fuel Pump", "Fuel Tank", "Rear Axle Assembly", "Rear Shock L", "Rear Shock R", "Tow Bar", "Reverse Camera", "Spare Wheel/Tool Kit"]
};

const CATEGORIES = Object.keys(CATEGORY_MAP);

export default function DismantleModule() {
  const [phase, setPhase] = useState('decision'); 
  const [loading, setLoading] = useState(false);
  const [carData, setCarData] = useState(null);
  const [selectedParts, setSelectedParts] = useState([]); 
  const [activeTab, setActiveTab] = useState(CATEGORIES[0]);
  const [customPartName, setCustomPartName] = useState('');
  const [carForm, setCarForm] = useState({ make: 'Toyota', model: '', year: '', color: '', vin: '', rego: '', notes: '' });

  const handleCreateCar = async () => {
    if (!carForm.model || !carForm.year || !carForm.vin) return alert("Model, Year, and VIN are compulsory!");
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/donor-cars/`, carForm);
      setCarData(res.data);
      setPhase('checklist');
    } catch (err) { alert("Error: VIN already exists."); }
    finally { setLoading(false); }
  };

  const togglePart = (name, category = activeTab) => {
    const exists = selectedParts.find(p => p.name === name);
    if (exists) {
      setSelectedParts(selectedParts.filter(p => p.name !== name));
    } else {
      setSelectedParts([...selectedParts, { name, category }]);
    }
  };

  const addCustomPart = (e) => {
    e.preventDefault();
    if (!customPartName) return;
    togglePart(customPartName, "Custom/Misc");
    setCustomPartName('');
  };

  const handleFinalizeDismantle = async () => {
    if (selectedParts.length === 0) return alert("Please select at least one part!");
    setLoading(true);
    try {
      const payload = { car_id: carData.id, parts: selectedParts.map(p => ({ part_name: p.name, category: p.category })) };
      await axios.post(`${API_URL}/api/bulk-create/`, payload);
      setPhase('labels');
    } catch (err) { alert("Bulk creation failed."); }
    finally { setLoading(false); }
  };

  if (phase === 'decision') return (
    <div style={container}>
      <h2 style={titleStyle}>Dismantle Yard Registry</h2>
      <div style={decisionGrid}>
        <button onClick={() => setPhase('registry')} style={bigBtn}>
          <PlusCircle size={48} color={COLORS.primary} />
          <div style={bigBtnText}>REGISTER NEW DONOR</div>
        </button>
        <button onClick={() => alert("Search functionality coming in Master Yard module")} style={{...bigBtn, opacity: 0.5}}>
          <Search size={48} />
          <div style={bigBtnText}>FIND EXISTING STOCK</div>
        </button>
      </div>
    </div>
  );

  if (phase === 'registry') return (
    <div style={container}>
      <div style={panel}>
        <div style={panelHeader}>
          <button onClick={() => setPhase('decision')} style={backBtn}><ArrowLeft size={16}/> BACK</button>
          <h2 style={panelTitle}>New Car Registry</h2>
        </div>
        <div style={formGrid}>
          <div style={formCol}>
            <label style={labelStyle}>Make</label>
            <input style={inputStyle} value={carForm.make} readOnly />
            <label style={labelStyle}>Model *</label>
            <input style={inputCompulsory} placeholder="e.g. Yaris" value={carForm.model} onChange={e => setCarForm({...carForm, model: e.target.value})} />
            <label style={labelStyle}>Year *</label>
            <input style={inputCompulsory} type="number" placeholder="2012" value={carForm.year} onChange={e => setCarForm({...carForm, year: e.target.value})} />
          </div>
          <div style={formCol}>
            <label style={labelStyle}>VIN (Full 17 digits) *</label>
            <input style={inputCompulsory} placeholder="VIN Number" value={carForm.vin} onChange={e => setCarForm({...carForm, vin: e.target.value})} />
            <label style={labelStyle}>Color</label>
            <input style={inputStyle} placeholder="Silver" value={carForm.color} onChange={e => setCarForm({...carForm, color: e.target.value})} />
            <label style={labelStyle}>Rego</label>
            <input style={inputStyle} placeholder="EHG 123" value={carForm.rego} onChange={e => setCarForm({...carForm, rego: e.target.value})} />
          </div>
        </div>
        <div style={formFooter}>
          <button onClick={handleCreateCar} disabled={loading} style={primaryBtn}>{loading ? "PROCESSING..." : "REGISTER & HARVEST"}</button>
        </div>
      </div>
    </div>
  );

  if (phase === 'checklist') return (
    <div style={container}>
      <div style={carBanner}>
        <div>
          <h2 style={{margin: 0, fontWeight: '900'}}>{carData.year} {carData.model}</h2>
          <div style={{fontSize: '13px', opacity: 0.8}}>Stock: {carData.stock_number} | VIN: {carData.vin}</div>
        </div>
        <div style={{textAlign: 'right'}}>
          <div style={selectionCount}>{selectedParts.length} SELECTED</div>
          <button onClick={handleFinalizeDismantle} disabled={loading} style={finishBtn}>FINALIZE & PRINT</button>
        </div>
      </div>

      <div style={tabContainer}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveTab(cat)} style={activeTab === cat ? activeTabStyle : inactiveTabStyle}>{cat}</button>
        ))}
      </div>

      <div style={partsGrid}>
        {CATEGORY_MAP[activeTab].map(part => {
          const isSelected = selectedParts.find(p => p.name === part);
          return (
            <div key={part} onClick={() => togglePart(part)} style={{...partCard, borderColor: isSelected ? COLORS.primary : COLORS.border, backgroundColor: isSelected ? '#fffafa' : '#fff'}}>
              <div style={{fontSize: '13px', fontWeight: '700'}}>{part}</div>
              {isSelected ? <CheckCircle size={18} color={COLORS.primary} /> : <Package size={18} color="#cbd5e1" />}
            </div>
          );
        })}
      </div>

      {/* CUSTOM PART INJECTOR */}
      <div style={customSection}>
        <h3 style={{fontSize: '14px', fontWeight: '900', marginBottom: '15px'}}>Missing a part? Add it manually:</h3>
        <form onSubmit={addCustomPart} style={{display: 'flex', gap: '10px'}}>
          <input 
            style={{...inputStyle, marginBottom: 0, flex: 1}} 
            placeholder="Enter custom part name (e.g. Roof Rack, Rare Trim...)" 
            value={customPartName}
            onChange={(e) => setCustomPartName(e.target.value)}
          />
          <button type="submit" style={{...primaryBtn, padding: '0 25px'}}><Plus size={20}/> ADD PART</button>
        </form>
      </div>
    </div>
  );

  if (phase === 'labels') return (
    <div style={container}>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center'}}>
        <h2 style={titleStyle}>Labels: {carData.stock_number}</h2>
        <div style={{display: 'flex', gap: '10px'}}>
          <button onClick={() => window.print()} style={primaryBtn}><Printer size={18}/> PRINT</button>
          <button onClick={() => window.location.reload()} style={outlineBtn}><RefreshCw size={18}/> NEW CAR</button>
        </div>
      </div>
      <div style={labelGrid} id="printableArea">
        {selectedParts.map((p, index) => (
          <div key={index} style={qrLabel}>
            <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
              <QRCode size={64} value={`${carData.stock_number}-${p.name.replace(/\s/g, '').toUpperCase()}`} />
              <div style={{flex: 1}}>
                <div style={labelStockNo}>{carData.stock_number}</div>
                <div style={labelPartName}>{p.name}</div>
                <div style={labelCarInfo}>{carData.year} {carData.model} | {carData.color}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// STYLES
const container = { width: '100%' };
const titleStyle = { fontSize: '28px', fontWeight: '900', color: COLORS.dark };
const decisionGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '30px' };
const bigBtn = { padding: '60px', backgroundColor: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: '24px', cursor: 'pointer' };
const bigBtnText = { fontSize: '18px', fontWeight: '900', marginTop: '20px' };
const panel = { backgroundColor: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: '20px', padding: '40px' };
const panelHeader = { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' };
const panelTitle = { fontSize: '20px', fontWeight: '900', margin: 0 };
const backBtn = { background: 'none', border: 'none', fontWeight: '800', cursor: 'pointer', color: '#64748b' };
const formGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' };
const formCol = { display: 'flex', flexDirection: 'column' };
const labelStyle = { fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' };
const inputStyle = { padding: '15px', borderRadius: '12px', border: `1px solid ${COLORS.border}`, marginBottom: '20px', outline: 'none' };
const inputCompulsory = { ...inputStyle, border: `1px solid ${COLORS.dark}` };
const formFooter = { marginTop: '40px', textAlign: 'right' };
const primaryBtn = { backgroundColor: COLORS.dark, color: '#fff', padding: '16px 30px', borderRadius: '14px', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' };
const outlineBtn = { ...primaryBtn, backgroundColor: '#fff', color: COLORS.dark, border: `1px solid ${COLORS.border}` };
const carBanner = { backgroundColor: COLORS.dark, color: '#fff', padding: '30px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const selectionCount = { fontSize: '12px', fontWeight: '800', color: COLORS.primary, marginBottom: '10px' };
const finishBtn = { backgroundColor: COLORS.primary, color: '#fff', padding: '14px 25px', borderRadius: '12px', border: 'none', fontWeight: '900', cursor: 'pointer' };
const tabContainer = { display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto' };
const activeTabStyle = { padding: '12px 20px', backgroundColor: COLORS.dark, color: '#fff', borderRadius: '10px', border: 'none', fontWeight: '800', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' };
const inactiveTabStyle = { ...activeTabStyle, backgroundColor: '#fff', color: '#64748b', border: `1px solid ${COLORS.border}` };
const partsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' };
const partCard = { padding: '20px', borderRadius: '16px', border: '2px solid', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const customSection = { marginTop: '40px', padding: '30px', border: `1px dashed ${COLORS.border}`, borderRadius: '20px', backgroundColor: '#fff' };
const labelGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '10px' };
const qrLabel = { padding: '20px', border: '1px solid #000', borderRadius: '10px' };
const labelStockNo = { fontSize: '16px', fontWeight: '900' };
const labelPartName = { fontSize: '14px', fontWeight: '800', borderBottom: '1px solid #000', marginBottom: '4px' };
const labelCarInfo = { fontSize: '11px', fontWeight: '700' };
