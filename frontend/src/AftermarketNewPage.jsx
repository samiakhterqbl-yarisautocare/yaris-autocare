import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // 1. Added Axios for the "Save" action
import { 
  Save, X, MapPin, Truck, DollarSign, Tag, 
  Camera, Plus, Barcode, Trash2, Star, Printer 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// Get the backend address from your Vercel settings
const API_URL = 'https://yaris-autocare-production.up.railway.app';

const COLORS = { 
  primary: '#ef4444', 
  dark: '#0f172a', 
  border: '#e2e8f0', 
  bg: '#f8fafc', 
  slate: '#64748b' 
};

const AftermarketNewPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false); // Track if we are saving

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    qty: 0,
    min_stock: 5,
    cost: '',
    price: '',
    loc: '',
    supplier: '',
    description: ''
  });

  const [images, setImages] = useState([]);

  // --- SAVE TO CLOUD LOGIC ---
  const handleSave = async () => {
    if (!formData.name) return alert("Product name is required!");
    
    setLoading(true);
    try {
      // Package the data for Django
      const dataToSend = {
        ...formData,
        qty: parseInt(formData.qty),
        price: parseFloat(formData.price) || 0,
        cost: parseFloat(formData.cost) || 0
      };

      // Send to Railway
      await axios.post(`${API_URL}/api/parts/`, dataToSend);
      
      alert("Part added successfully to inventory!");
      navigate('/aftermarket'); // Go back to the list
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save to Railway. Check the console for errors.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      file: file
    }));
    setImages([...images, ...newImages]);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1100px', margin: '0 auto', backgroundColor: COLORS.bg, minHeight: '100vh' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: '900', fontSize: '28px' }}>Add New Product</h2>
          <p style={{ color: COLORS.slate }}>Connected to: {API_URL}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={secondaryBtn}><X size={18}/> Cancel</button>
          
          {/* UPDATED CREATE BUTTON */}
          <button 
            onClick={handleSave} 
            disabled={loading}
            style={{ ...primaryBtn, opacity: loading ? 0.5 : 1 }}
          >
            <Save size={18}/> {loading ? 'Saving...' : 'Create Product'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div style={cardStyle}>
            <h4 style={sectionTitle}>GENERAL INFORMATION</h4>
            <div style={inputGroup}>
              <label style={labelStyle}>Product Name</label>
              <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Brake Pad Set" style={inputStyle} />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} style={{ ...inputStyle, height: '80px', resize: 'none' }} />
            </div>
          </div>

          <div style={cardStyle}>
            <h4 style={sectionTitle}>PRODUCT IMAGES</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
              {images.map(img => (
                <div key={img.id} style={{ height: '100px', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                  <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => setImages(images.filter(i => i.id !== img.id))} style={deleteBtn}><Trash2 size={12}/></button>
                </div>
              ))}
              <div onClick={() => fileInputRef.current.click()} style={uploadBtn}>
                <Camera size={24} />
                <input type="file" hidden multiple ref={fileInputRef} onChange={handlePhotoUpload} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div style={cardStyle}>
            <h4 style={sectionTitle}>LOGISTICS</h4>
            <div style={inputGroup}>
              <label style={labelStyle}>SKU / BARCODE</label>
              <div style={iconInput}><Barcode size={16}/> <input name="sku" value={formData.sku} onChange={handleChange} style={bareInput} /></div>
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>Location</label>
              <div style={iconInput}><MapPin size={16}/> <input name="loc" value={formData.loc} onChange={handleChange} style={bareInput} /></div>
            </div>
            <div style={inputGroup}>
                <label style={labelStyle}>Available Qty</label>
                <input type="number" name="qty" value={formData.qty} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <div style={cardStyle}>
            <h4 style={sectionTitle}>PRICING</h4>
            <div style={inputGroup}>
              <label style={labelStyle}>Our Cost</label>
              <div style={iconInput}><DollarSign size={16}/> <input name="cost" value={formData.cost} onChange={handleChange} style={bareInput} /></div>
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>Sale Price</label>
              <div style={iconInput}><Tag size={16} color={COLORS.primary}/> <input name="price" value={formData.price} onChange={handleChange} style={bareInput} /></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// ... (Your existing styles remain the same below) ...
const cardStyle = { backgroundColor: '#fff', padding: '25px', borderRadius: '20px', border: `1px solid ${COLORS.border}` };
const inputGroup = { marginBottom: '15px' };
const labelStyle = { display: 'block', fontSize: '11px', fontWeight: '800', color: COLORS.slate, marginBottom: '5px' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, backgroundColor: COLORS.bg };
const iconInput = { display: 'flex', alignItems: 'center', gap: '10px', padding: '0 10px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, backgroundColor: COLORS.bg };
const bareInput = { border: 'none', outline: 'none', padding: '10px 0', width: '100%', background: 'transparent' };
const sectionTitle = { margin: '0 0 15px 0', fontSize: '13px', fontWeight: '800', borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '10px' };
const primaryBtn = { backgroundColor: COLORS.primary, color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };
const secondaryBtn = { backgroundColor: COLORS.dark, color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };
const uploadBtn = { border: `2px dashed ${COLORS.border}`, borderRadius: '8px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: COLORS.slate };
const deleteBtn = { position: 'absolute', top: '5px', right: '5px', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '4px', padding: '4px', cursor: 'pointer' };

export default AftermarketNewPage;
