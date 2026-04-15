import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Search, PlusCircle, Scissors, Printer, CheckCircle, Package, ArrowLeft, RefreshCw, Plus, Camera, X } from 'lucide-react';
import QRCode from 'react-qr-code';

const API_URL = 'https://yaris-autocare-production.up.railway.app';
const COLORS = { primary: '#ef4444', dark: '#0f172a', border: '#e2e8f0', bg: '#f8fafc' };

const CATEGORY_MAP = {
  "Front Body": ["Front Bumper", "Bonnet", "Grille", "Headlight Left", "Headlight Right", "Front Fog Light L", "Front Fog Light R", "Front Guard L", "Front Guard R", "Radiator Support"],
  "Engine Bay": ["Engine Assembly", "Alternator", "Starter Motor", "AC Compressor", "Radiator", "Condenser", "Radiator Fan Assembly", "Air Cleaner Box", "Throttle Body"],
  "Mechanical": ["Transmission", "Driveshaft L", "Driveshaft R", "Front Strut L", "Front Strut R", "Control Arm L", "Control Arm R", "Steering Rack"],
  "Doors": ["Front Door L", "Front Door R", "Rear Door L", "Rear Door R", "Mirror L", "Mirror R", "Window Glass FL", "Window Glass FR"],
  "Interior": ["Airbag Kit", "Steering Wheel", "Dashboard", "Instrument Cluster", "Clock Spring", "Front Seat L", "Front Seat R", "Rear Seat Set"],
  "Rear Body": ["Rear Bumper", "Tail Light L", "Tail Light R", "Boot Lid", "Fuel Pump", "Fuel Tank", "Rear Axle", "Tow Bar"]
};

const CATEGORIES = Object.keys(CATEGORY_MAP);

export default function DismantleModule() {
  const [phase, setPhase] = useState('decision'); 
  const [loading, setLoading] = useState(false);
  const [carData, setCarData] = useState(null);
  const [selectedParts, setSelectedParts] = useState([]); 
  const [activeTab, setActiveTab] = useState(CATEGORIES[0]);
  const [imageFiles, setImageFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [carForm, setCarForm] = useState({ 
    make: 'Toyota', model: '', year: '', color: '', vin: '', rego: '', notes: '' 
  });

  const handleImageSelect = (e) => {
    if (e.target.files) {
      setImageFiles([...imageFiles, ...Array.from(e.target.files)]);
    }
  };

  const removeImage = (index) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const handleCreateCar = async () => {
    if (!carForm.make || !carForm.model || !carForm.year || !carForm.vin) return alert("Fill required fields!");
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(carForm).forEach(key => formData.append(key, carForm[key]));
      imageFiles.forEach(file => formData.append('images', file));

      const res = await axios.post(`${API_URL}/api/donor-cars/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCarData(res.data);
      setPhase('checklist');
    } catch (err) { 
      console.error(err);
      alert("Error registering vehicle. Check VIN length (17) and AWS S3 settings."); 
    } finally { setLoading(false); }
  };

  const togglePart = (name, category = activeTab) => {
    const exists = selectedParts.find(p => p.name === name);
    if (exists) setSelectedParts(selectedParts.filter(p => p.name !== name));
    else setSelectedParts([...selectedParts, { name, category }]);
  };

  const handleFinalizeDismantle = async () => {
    if (selectedParts.length === 0) return alert("Select parts!");
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/bulk-create/`, { car_id: carData.id, parts: selectedParts.map(p => ({ part_name: p.name, category: p.category })) });
      setPhase('labels');
    } catch (err) { alert("Error."); } finally { setLoading(false); }
  };

  if (phase === 'decision') return (
    <div style={{padding: '40px'}}>
      <h2 style={{fontSize: '28px', fontWeight: '900'}}>Dismantle Yard Registry</h2>
      <button onClick={() => setPhase('registry')} style={{padding: '40px', borderRadius: '20px', border: `1px solid ${COLORS.border}`, cursor: 'pointer', backgroundColor: '#fff', textAlign: 'left'}}>
        <PlusCircle size={40} color={COLORS.primary} />
        <div style={{fontWeight: '900', marginTop: '10px', fontSize: '18px'}}>REGISTER NEW DONOR</div>
      </button>
    </div>
  );

  if (phase === 'registry') return (
    <div style={{padding: '40px'}}>
      <button onClick={() => setPhase('decision')} style={{border: 'none', background: 'none', cursor: 'pointer', fontWeight: '800', marginBottom: '15px'}}><ArrowLeft size={16}/> BACK</button>
      <div style={{backgroundColor: '#fff', padding: '40px', borderRadius: '20px', border: `1px solid ${COLORS.border}`}}>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px'}}>
          <input style={{padding: '12px', borderRadius: '8px', border: `1px solid ${COLORS.border}`}} value={carForm.make} onChange={e => setCarForm({...carForm, make: e.target.value})} placeholder="Make"/>
          <input style={{padding: '12px', borderRadius: '8px', border: `1px solid ${COLORS.border}`}} value={carForm.model} onChange={e => setCarForm({...carForm, model: e.target.value})} placeholder="Model"/>
          <input style={{padding: '12px', borderRadius: '8px', border: `1px solid ${COLORS.border}`}} value={carForm.year} onChange={e => setCarForm({...carForm, year: e.target.value})} placeholder="Year"/>
          <input style={{padding: '12px', borderRadius: '8px', border: `1px solid ${COLORS.border}`}} value={carForm.vin} onChange={e => setCarForm({...carForm, vin: e.target.value.toUpperCase()})} placeholder="VIN"/>
          <input style={{padding: '12px', borderRadius: '8px', border: `1px solid ${COLORS.border}`}} value={carForm.rego} onChange={e => setCarForm({...carForm, rego: e.target.value.toUpperCase()})} placeholder="Rego"/>
          <input style={{padding: '12px', borderRadius: '8px', border: `1px solid ${COLORS.border}`}} value={carForm.color} onChange={e => setCarForm({...carForm, color: e.target.value})} placeholder="Color"/>
          <textarea style={{gridColumn: '1 / -1', padding: '12px', borderRadius: '8px', border: `1px solid ${COLORS.border}`}} value={carForm.notes} onChange={e => setCarForm({...carForm, notes: e.target.value})} placeholder="Notes"/>
          <div style={{gridColumn: '1 / -1'}}>
            <button onClick={() => fileInputRef.current.click()} style={{padding: '10px 20px', backgroundColor: '#f1f5f9', border: `1px solid ${COLORS.border}`, borderRadius: '8px', cursor: 'pointer'}}><Camera size={18}/> PHOTOS</button>
            <input type="file" multiple ref={fileInputRef} style={{display: 'none'}} onChange={handleImageSelect} />
            <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>{imageFiles.map((f, i) => <img key={i} src={URL.createObjectURL(f)} style={{width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover'}} />)}</div>
          </div>
        </div>
        <button onClick={handleCreateCar} disabled={loading} style={{marginTop: '20px', backgroundColor: COLORS.dark, color: '#fff', padding: '12px 30px', borderRadius: '8px', border: 'none', fontWeight: '800', cursor: 'pointer'}}>
          {loading ? "PROCESSING..." : "REGISTER & HARVEST"}
        </button>
      </div>
    </div>
  );

  if (phase === 'checklist') return (
    <div style={{padding: '40px'}}>
      <div style={{backgroundColor: COLORS.dark, color: '#fff', padding: '20px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div><h2 style={{margin: 0}}>{carData.year} {carData.model}</h2><span>Stock: {carData.stock_number}</span></div>
        <button onClick={handleFinalizeDismantle} style={{backgroundColor: COLORS.primary, color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: '800', cursor: 'pointer'}}>FINALIZE ({selectedParts.length})</button>
      </div>
      <div style={{display: 'flex', gap: '10px', margin: '20px 0', overflowX: 'auto'}}>
        {CATEGORIES.map(cat => <button key={cat} onClick={() => setActiveTab(cat)} style={{padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === cat ? COLORS.dark : '#fff', color: activeTab === cat ? '#fff' : '#64748b', cursor: 'pointer', fontWeight: '700'}}>{cat}</button>)}
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px'}}>
        {CATEGORY_MAP[activeTab].map(part => {
          const isSelected = selectedParts.find(p => p.name === part);
          return <div key={part} onClick={() => togglePart(part)} style={{padding: '15px', borderRadius: '12px', border: `2px solid ${isSelected ? COLORS.primary : COLORS.border}`, cursor: 'pointer', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between'}}><span style={{fontWeight: '700'}}>{part}</span>{isSelected && <CheckCircle size={18} color={COLORS.primary} />}</div>
        })}
      </div>
    </div>
  );

  if (phase === 'labels') return (
    <div style={{padding: '40px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
        <h2 style={{fontWeight: '900'}}>Labels Ready</h2>
        <div style={{display: 'flex', gap: '10px'}}><button onClick={() => window.print()} style={{backgroundColor: COLORS.dark, color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer'}}><Printer size={18}/> PRINT ALL</button><button onClick={() => window.location.reload()} style={{padding: '10px 20px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, cursor: 'pointer'}}>NEW CAR</button></div>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px'}}>
        {selectedParts.map((p, i) => (
          <div key={i} style={{padding: '15px', border: '1px solid #000', borderRadius: '10px', display: 'flex', gap: '10px', alignItems: 'center'}}>
            <QRCode size={50} value={`${carData.stock_number}-${p.name.toUpperCase()}`} />
            <div><div style={{fontSize: '12px', fontWeight: '900'}}>{carData.stock_number}</div><div style={{fontSize: '14px', fontWeight: '900'}}>{p.name}</div><div style={{fontSize: '11px'}}>{carData.year} {carData.model}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}
