import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Search, PlusCircle, Scissors, Printer, CheckCircle, Package, ArrowLeft, RefreshCw, Plus, Camera, X } from 'lucide-react';
import QRCode from 'react-qr-code';

const API_URL = 'https://yaris-autocare-production.up.railway.app';
const COLORS = { primary: '#ef4444', dark: '#0f172a', border: '#e2e8f0', bg: '#f8fafc' };

// --- PART CATEGORIES & ITEMS ---
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
  const [imageFiles, setImageFiles] = useState([]); // Store files for upload
  const fileInputRef = useRef(null);
  const [carForm, setCarForm] = useState({ 
    make: 'Toyota', model: '', year: '', color: '', vin: '', rego: '', notes: '' 
  });

  // --- IMAGE HANDLING ---
  const handleImageSelect = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImageFiles([...imageFiles, ...newFiles]);
    }
  };

  const removeImage = (index) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  // --- REGISTER CAR & UPLOAD IMAGES ---
  const handleCreateCar = async () => {
    if (!carForm.make || !carForm.model || !carForm.year || !carForm.vin) {
      return alert("Make, Model, Year, and VIN are compulsory!");
    }
    if (imageFiles.length === 0) {
      return alert("At least one car photo is required for the audit!");
    }
    
    setLoading(true);
    try {
      // 1. Create FormData for the car data and images
      const formData = new FormData();
      Object.keys(carForm).forEach(key => formData.append(key, carForm[key]));
      imageFiles.forEach(file => formData.append('images', file)); // Add multiple images

      // 2. Post to backend (Backend needs to handle multi-part/form-data)
      const res = await axios.post(`${API_URL}/api/donor-cars/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCarData(res.data);
      setPhase('checklist');
    } catch (err) { 
      console.error(err);
      alert("Registration failed. This is likely because the backend isn't set up to process FormData yet."); 
    } finally { setLoading(false); }
  };

  // --- PART SELECTION ---
  const togglePart = (name, category = activeTab) => {
    const exists = selectedParts.find(p => p.name === name);
    if (exists) {
      setSelectedParts(selectedParts.filter(p => p.name !== name));
    } else {
      setSelectedParts([...selectedParts, { name, category }]);
    }
  };

  // --- BULK CREATE USED PARTS ---
  const handleFinalizeDismantle = async () => {
    if (selectedParts.length === 0) return alert("Select at least one part to label!");
    setLoading(true);
    try {
      const payload = { car_id: carData.id, parts: selectedParts.map(p => ({ part_name: p.name, category: p.category })) };
      await axios.post(`${API_URL}/api/bulk-create/`, payload);
      setPhase('labels');
    } catch (err) { alert("Bulk creation failed."); }
    finally { setLoading(false); }
  };

  // --- VIEW 1: PHASE DECISION (INITIAL) ---
  if (phase === 'decision') return (
    <div style={{padding: '40px'}}>
      <h2 style={{fontSize: '28px', fontWeight: '900'}}>Dismantle Yard Registry</h2>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px'}}>
        <button onClick={() => setPhase('registry')} style={{padding: '60px', borderRadius: '20px', border: `1px solid ${COLORS.border}`, cursor: 'pointer', backgroundColor: '#fff', textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
          <PlusCircle size={40} color={COLORS.primary} />
          <div style={{fontWeight: '900', marginTop: '10px', fontSize: '18px'}}>REGISTER NEW DONOR</div>
          <p style={{margin: 0, fontSize: '14px', color: '#64748b'}}>Photograph, Audit, and Harvest</p>
        </button>
      </div>
    </div>
  );

  // --- VIEW 2: PHASE REGISTRY (THE CORRECT, COMPLETE FORM) ---
  if (phase === 'registry') return (
    <div style={{padding: '40px'}}>
      <button onClick={() => setPhase('decision')} style={{border: 'none', background: 'none', cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '15px'}}><ArrowLeft size={16}/> BACK</button>
      <div style={{backgroundColor: '#fff', padding: '40px', borderRadius: '20px', border: `1px solid ${COLORS.border}`}}>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px'}}>
          
          {/* CAR DETAILS */}
          <div>
            <label style={{fontSize: '12px', fontWeight: '800', color: '#64748b'}}>MAKE *</label>
            <input style={{width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${COLORS.border}`, marginTop: '5px'}} value={carForm.make} onChange={e => setCarForm({...carForm, make: e.target.value})} placeholder="e.g. Toyota"/>
          </div>
          <div>
            <label style={{fontSize: '12px', fontWeight: '800', color: '#64748b'}}>MODEL *</label>
            <input style={{width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${COLORS.border}`, marginTop: '5px'}} value={carForm.model} onChange={e => setCarForm({...carForm, model: e.target.value})} placeholder="e.g. Yaris"/>
          </div>
          <div>
            <label style={{fontSize: '12px', fontWeight: '800', color: '#64748b'}}>YEAR *</label>
            <input type="number" style={{width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${COLORS.border}`, marginTop: '5px'}} value={carForm.year} onChange={e => setCarForm({...carForm, year: e.target.value})} placeholder="e.g. 2012"/>
          </div>
          <div>
            <label style={{fontSize: '12px', fontWeight: '800', color: '#64748b'}}>VIN (17 Digits) *</label>
            <input style={{width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${COLORS.border}`, marginTop: '5px'}} value={carForm.vin} onChange={e => setCarForm({...carForm, vin: e.target.value.toUpperCase()})} placeholder="Compulsory Audit VIN"/>
          </div>
          <div>
            <label style={{fontSize: '12px', fontWeight: '800', color: '#64748b'}}>REGO</label>
            <input style={{width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${COLORS.border}`, marginTop: '5px'}} value={carForm.rego} onChange={e => setCarForm({...carForm, rego: e.target.value.toUpperCase()})} placeholder="EHG432"/>
          </div>
          <div>
            <label style={{fontSize: '12px', fontWeight: '800', color: '#64748b'}}>COLOR</label>
            <input style={{width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${COLORS.border}`, marginTop: '5px'}} value={carForm.color} onChange={e => setCarForm({...carForm, color: e.target.value})} placeholder="e.g. Silver"/>
          </div>
          <div style={{gridColumn: '1 / -1'}}>
            <label style={{fontSize: '12px', fontWeight: '800', color: '#64748b'}}>NOTES (Condition summary for the yard)</label>
            <textarea style={{width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${COLORS.border}`, marginTop: '5px', height: '100px'}} value={carForm.notes} onChange={e => setCarForm({...carForm, notes: e.target.value})} placeholder="Rear-end damage. Front half perfectly usable."/>
          </div>

          {/* IMAGE AUDIT UPLOAD (AWS S3) */}
          <div style={{gridColumn: '1 / -1', marginTop: '20px'}}>
            <label style={{fontSize: '14px', fontWeight: '900', color: '#0f172a'}}>CAR PHOTO AUDIT (Required for S3 Gallery)</label>
            <button 
              onClick={() => fileInputRef.current.click()} 
              style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 25px', borderRadius: '8px', backgroundColor: '#f1f5f9', border: `1px solid ${COLORS.border}`, fontWeight: '700', cursor: 'pointer', marginTop: '10px'}}
            >
              <Camera size={18} /> ADD CAR PHOTOS
            </button>
            <input type="file" multiple ref={fileInputRef} style={{display: 'none'}} onChange={handleImageSelect} accept="image/*" />
            
            {/* Image Preview Grid */}
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px', marginTop: '15px'}}>
              {imageFiles.map((file, index) => (
                <div key={index} style={{position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${COLORS.border}`}}>
                  <img src={URL.createObjectURL(file)} alt="car preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                  <button onClick={() => removeImage(index)} style={{position: 'absolute', top: '5px', right: '5px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px'}}>X</button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <button onClick={handleCreateCar} disabled={loading} style={{marginTop: '30px', backgroundColor: COLORS.dark, color: '#fff', padding: '15px 40px', borderRadius: '10px', border: 'none', fontWeight: '900', fontSize: '16px', cursor: 'pointer'}}>
          {loading ? "REGISTERING DONOR..." : "REGISTER & HARVEST"}
        </button>
      </div>
    </div>
  );

  // --- VIEW 3: PHASE CHECKLIST (PART HARVESTING) ---
  if (phase === 'checklist') return (
    <div style={{padding: '40px'}}>
       <div style={{backgroundColor: COLORS.dark, color: '#fff', padding: '30px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <h2 style={{margin: 0}}>{carData.year} {carData.make} {carData.model}</h2>
          <span style={{opacity: 0.7}}>VIN: {carData.vin} | Stock: {carData.stock_number}</span>
        </div>
        <button onClick={handleFinalizeDismantle} style={{backgroundColor: COLORS.primary, color: '#fff', padding: '12px 25px', borderRadius: '10px', border: 'none', fontWeight: '900', cursor: 'pointer'}}>FINALIZE & PRINT ({selectedParts.length})</button>
       </div>
       <div style={{display: 'flex', gap: '10px', margin: '20px 0', overflowX: 'auto'}}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveTab(cat)} style={{padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === cat ? COLORS.dark : '#fff', color: activeTab === cat ? '#fff' : '#64748b', cursor: 'pointer', fontWeight: '700'}}>{cat}</button>
          ))}
       </div>
       <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px'}}>
          {CATEGORY_MAP[activeTab].map(part => {
             const isSelected = selectedParts.find(p => p.name === part);
             return (
               <div key={part} onClick={() => togglePart(part)} style={{padding: '20px', borderRadius: '15px', border: `2px solid ${isSelected ? COLORS.primary : COLORS.border}`, cursor: 'pointer', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span style={{fontWeight: '700', fontSize: '14px'}}>{part}</span>
                  {isSelected ? <CheckCircle size={18} color={COLORS.primary} /> : <Package size={18} color="#cbd5e1" />}
               </div>
             )
          })}
       </div>
    </div>
  );

  // --- VIEW 4: PHASE LABELS (PRINTING) ---
  if (phase === 'labels') return (
    <div style={{padding: '40px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
        <h2 style={{fontWeight: '900'}}>Print Labels</h2>
        <div style={{display: 'flex', gap: '10px'}}>
          <button onClick={() => window.print()} style={{backgroundColor: COLORS.dark, color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer'}}><Printer size={18}/> PRINT ALL</button>
          <button onClick={() => window.location.reload()} style={{backgroundColor: '#fff', color: COLORS.dark, padding: '10px 20px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, fontWeight: '700', cursor: 'pointer'}}><RefreshCw size={18}/> NEW CAR</button>
        </div>
      </div>
      <div id="printableArea" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px'}}>
        {selectedParts.map((p, i) => (
          <div key={i} style={{padding: '20px', border: '1px solid #000', borderRadius: '10px', display: 'flex', gap: '15px', alignItems: 'center', backgroundColor: '#fff'}}>
            <QRCode size={60} value={`${carData.stock_number}-${p.name.replace(/\s/g, '').toUpperCase()}`} />
            <div>
              <div style={{fontSize: '14px', fontWeight: '900'}}>{carData.stock_number}</div>
              <div style={{fontSize: '16px', fontWeight: '900', borderBottom: '1px solid #000'}}>{p.name}</div>
              <div style={{fontSize: '12px', fontWeight: '700'}}>{carData.year} {carData.make} {carData.model}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
