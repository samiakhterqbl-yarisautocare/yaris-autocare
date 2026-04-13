import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Save, X, MapPin, DollarSign, Tag, 
  Camera, Barcode, Trash2, Truck, Star, CheckCircle
} from 'lucide-react';

const API_URL = 'https://yaris-autocare-production.up.railway.app';

const COLORS = { 
  primary: '#ef4444', 
  dark: '#0f172a', 
  border: '#e2e8f0', 
  bg: '#f1f5f9', 
  slate: '#64748b' 
};

const AftermarketNewPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sku: '', // This is your custom ID (e.g., MAS-101)
    qty: 0,
    min_stock: 5,
    cost: '',
    price: '',
    loc: '',
    supplier: 'Yaris Autocare',
    description: ''
  });

  const [images, setImages] = useState([]);
  const [mainImageId, setMainImageId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => {
      const id = Math.random().toString(36).substr(2, 9);
      if (!mainImageId) setMainImageId(id); // Set first upload as main by default
      return {
        id: id,
        url: URL.createObjectURL(file),
        file: file
      };
    });
    setImages([...images, ...newImages]);
  };

  const handleSave = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!formData.name) {
      alert("Product name is required!");
      return;
    }
    
    setLoading(true);

    try {
      const dataToSend = {
        part_name: formData.name,
        sku: formData.sku || `SKU-${Math.floor(Math.random() * 10000)}`, // Auto-gen if empty
        quantity: parseInt(formData.qty) || 0,
        supplier: formData.supplier,
        cost_price: parseFloat(formData.cost) || 0,
        sale_price: parseFloat(formData.price) || 0,
        location: formData.loc,
        min_stock_level: parseInt(formData.min_stock) || 5,
        description: formData.description
      };

      // NOTE: Update endpoint to match your Django urls.py
      const response = await axios.post(`${API_URL}/api/aftermarket/`, dataToSend);
      
      if (response.status === 201 || response.status === 200) {
        alert("Success! Part added to inventory.");
        navigate('/aftermarket');
      }
    } catch (error) {
      console.error("Save failed:", error.response?.data || error.message);
      alert("Error: " + JSON.stringify(error.response?.data || "Check connection"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageWrapper}>
      <div style={containerCenter}>
        
        {/* HEADER SECTION */}
        <div style={headerStyle}>
          <div>
            <h2 style={{ margin: 0, fontWeight: '900', fontSize: '32px', letterSpacing: '-1px' }}>New Product</h2>
            <p style={{ color: COLORS.slate, margin: '5px 0 0 0', fontWeight: '500' }}>Add new aftermarket stock to Railway Cloud</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" onClick={() => navigate('/aftermarket')} style={secondaryBtn}>
              <X size={18}/> Cancel
            </button>
            <button type="button" onClick={handleSave} disabled={loading} style={primaryBtn}>
              <Save size={18}/> {loading ? 'Saving...' : 'Create Product'}
            </button>
          </div>
        </div>

        <div style={mainGrid}>
          
          {/* LEFT: INFO & IMAGES */}
          <div style={columnStack}>
            <div style={cardStyle}>
              <h4 style={sectionTitle}>General Information</h4>
              <div style={inputGroup}>
                <label style={labelStyle}>Product Name</label>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Masuma Oil Filter" style={inputStyle} />
              </div>
              <div style={inputGroup}>
                <label style={labelStyle}>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Add fitment details or part notes..." style={{ ...inputStyle, height: '100px', resize: 'none' }} />
              </div>
            </div>

            <div style={cardStyle}>
              <h4 style={sectionTitle}>Gallery Management</h4>
              <p style={{fontSize: '11px', color: COLORS.slate, marginBottom: '15px'}}>Click the star to set the <b>Main Photo</b> for the catalogue.</p>
              <div style={imageGrid}>
                {images.map(img => (
                  <div key={img.id} style={imgWrapper}>
                    <img src={img.url} style={imgTag} alt="part" />
                    
                    <button type="button" onClick={() => setImages(images.filter(i => i.id !== img.id))} style={deleteBtn}><Trash2 size={12}/></button>
                    
                    <button 
                      type="button" 
                      onClick={() => setMainImageId(img.id)} 
                      style={{...starBtn, color: mainImageId === img.id ? '#fbbf24' : '#fff'}}
                    >
                      <Star size={16} fill={mainImageId === img.id ? '#fbbf24' : 'rgba(0,0,0,0.3)'} />
                    </button>

                    {mainImageId === img.id && <div style={mainBadge}>MAIN</div>}
                  </div>
                ))}
                <div onClick={() => fileInputRef.current.click()} style={uploadArea}>
                  <Camera size={28} />
                  <span style={{fontSize: '11px', fontWeight: '700', marginTop: '5px'}}>ADD PHOTO</span>
                  <input type="file" hidden multiple ref={fileInputRef} onChange={handlePhotoUpload} />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: LOGISTICS & PRICING */}
          <div style={columnStack}>
            <div style={cardStyle}>
              <h4 style={sectionTitle}>Inventory Logistics</h4>
              <div style={inputGroup}>
                <label style={labelStyle}>SKU / BARCODE (Your Unique ID)</label>
                <div style={iconInput}><Barcode size={16} color={COLORS.slate}/> <input name="sku" value={formData.sku} onChange={handleChange} placeholder="e.g. YAR-OIL-001" style={bareInput} /></div>
              </div>
              <div style={inputGroup}>
                <label style={labelStyle}>Storage Location</label>
                <div style={iconInput}><MapPin size={16} color={COLORS.slate}/> <input name="loc" value={formData.loc} onChange={handleChange} placeholder="e.g. Shelf A-1" style={bareInput} /></div>
              </div>
              <div style={inputGroup}>
                <label style={labelStyle}>Supplier</label>
                <div style={iconInput}><Truck size={16} color={COLORS.slate}/> <input name="supplier" value={formData.supplier} onChange={handleChange} style={bareInput} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={inputGroup}>
                  <label style={labelStyle}>Current Qty</label>
                  <input type="number" name="qty" value={formData.qty} onChange={handleChange} style={inputStyle} />
                </div>
                <div style={inputGroup}>
                  <label style={labelStyle}>Low Stock Alert</label>
                  <input type="number" name="min_stock" value={formData.min_stock} onChange={handleChange} style={inputStyle} />
                </div>
              </div>
            </div>

            <div style={{...cardStyle, backgroundColor: COLORS.dark, color: '#fff'}}>
              <h4 style={{...sectionTitle, color: '#fff', borderBottom: '1px solid #334155'}}>Pricing (AUD)</h4>
              <div style={inputGroup}>
                <label style={{...labelStyle, color: '#94a3b8'}}>Our Buying Cost</label>
                <div style={darkIconInput}><DollarSign size={16} color="#94a3b8"/> <input name="cost" value={formData.cost} onChange={handleChange} style={darkBareInput} /></div>
              </div>
              <div style={inputGroup}>
                <label style={{...labelStyle, color: '#94a3b8'}}>Retail Sale Price</label>
                <div style={{...darkIconInput, borderColor: COLORS.primary}}><Tag size={16} color={COLORS.primary}/> <input name="price" value={formData.price} onChange={handleChange} style={darkBareInput} /></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- STYLES FOR CENTERED PUSHED DESIGN ---
const pageWrapper = { backgroundColor: COLORS.bg, minHeight: '100vh', padding: '40px 20px' };
const containerCenter = { maxWidth: '1000px', margin: '0 auto' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' };
const mainGrid = { display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '30px' };
const columnStack = { display: 'flex', flexDirection: 'column', gap: '30px' };
const cardStyle = { backgroundColor: '#fff', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: `1px solid ${COLORS.border}` };
const sectionTitle = { margin: '0 0 20px 0', fontSize: '14px', fontWeight: '900', color: COLORS.dark, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '12px' };
const inputGroup = { marginBottom: '20px' };
const labelStyle = { display: 'block', fontSize: '11px', fontWeight: '800', color: COLORS.slate, marginBottom: '8px', textTransform: 'uppercase' };
const inputStyle = { width: '100%', padding: '14px', borderRadius: '12px', border: `1px solid ${COLORS.border}`, backgroundColor: '#fcfdfe', fontSize: '14px', outline: 'none' };
const iconInput = { display: 'flex', alignItems: 'center', gap: '12px', padding: '0 15px', borderRadius: '12px', border: `1px solid ${COLORS.border}`, backgroundColor: '#fcfdfe' };
const bareInput = { border: 'none', outline: 'none', padding: '14px 0', width: '100%', background: 'transparent', fontSize: '14px', fontWeight: '600' };
const primaryBtn = { backgroundColor: COLORS.primary, color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3)' };
const secondaryBtn = { backgroundColor: '#fff', color: COLORS.dark, border: `1px solid ${COLORS.border}`, padding: '14px 28px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' };

// IMAGE GALLERY STYLES
const imageGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '15px' };
const imgWrapper = { height: '110px', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: `1px solid ${COLORS.border}` };
const imgTag = { width: '100%', height: '100%', objectFit: 'cover' };
const deleteBtn = { position: 'absolute', top: '5px', right: '5px', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: COLORS.primary };
const starBtn = { position: 'absolute', top: '5px', left: '5px', background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer' };
const mainBadge = { position: 'absolute', bottom: '0', width: '100%', backgroundColor: COLORS.primary, color: '#fff', fontSize: '9px', fontWeight: '900', textAlign: 'center', padding: '2px 0' };
const uploadArea = { border: `2px dashed ${COLORS.border}`, borderRadius: '16px', height: '110px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: COLORS.slate, backgroundColor: '#f8fafc' };

// DARK THEME PRICING
const darkIconInput = { display: 'flex', alignItems: 'center', gap: '12px', padding: '0 15px', borderRadius: '12px', border: `1px solid #334155`, backgroundColor: '#1e293b' };
const darkBareInput = { border: 'none', outline: 'none', padding: '14px 0', width: '100%', background: 'transparent', fontSize: '16px', fontWeight: '900', color: '#fff' };

export default AftermarketNewPage;
