import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, X, MapPin, Truck, DollarSign, Tag, 
  Camera, Trash2, Star, AlertCircle, Barcode 
} from 'lucide-react';

const COLORS = { 
  primary: '#ef4444', 
  dark: '#0f172a', 
  border: '#e2e8f0', 
  bg: '#f8fafc', 
  slate: '#64748b',
  white: '#ffffff'
};

const AftermarketEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    name: 'Oil Filter - Yaris 2011-2014',
    sku: 'OF-TY-01',
    qty: 4,
    min_stock: 5,
    cost: 8.50,
    price: 25.00,
    loc: 'Shelf A1',
    supplier: 'Repco',
    description: 'High-efficiency replacement oil filter designed for Toyota Yaris engines.'
  });

  // Image Gallery State (Mocking existing images from S3)
  const [images, setImages] = useState([
    { id: 'img1', url: 'https://via.placeholder.com/150', isMain: true }
  ]);
  const [mainPhotoId, setMainPhotoId] = useState('img1');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- PHOTO GALLERY LOGIC ---
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      file: file, // For AWS S3 upload
    }));
    setImages([...images, ...newImages]);
  };

  const setMainPhoto = (id) => setMainPhotoId(id);

  const deletePhoto = (id) => {
    setImages(images.filter(img => img.id !== id));
    if (mainPhotoId === id && images.length > 1) {
      setMainPhotoId(images.find(img => img.id !== id).id);
    }
  };

  const handleSave = () => {
    // AWS NOTE: You would send the updated 'formData' and any new 'images' to your backend
    alert(`Success: ${formData.sku} has been updated.`);
    navigate(`/aftermarket/${id}`);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1100px', margin: '0 auto', backgroundColor: COLORS.bg, minHeight: '100vh' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: '900', fontSize: '28px', color: COLORS.dark }}>Edit Product</h2>
          <p style={{ color: COLORS.slate, margin: '5px 0 0 0' }}>Updating SKU: <span style={{color: COLORS.primary, fontWeight: '700'}}>{formData.sku}</span></p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={secondaryBtn}><X size={18}/> Cancel</button>
          <button onClick={handleSave} style={primaryBtn}><Save size={18}/> Save Changes</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
        
        {/* LEFT COLUMN: BASIC INFO & GALLERY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          <div style={cardStyle}>
            <h4 style={sectionTitle}>GENERAL INFORMATION</h4>
            <div style={inputGroup}>
              <label style={labelStyle}>Product Name</label>
              <input name="name" value={formData.name} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} style={{ ...inputStyle, height: '100px', resize: 'none' }} />
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800' }}>PRODUCT GALLERY</h4>
              <button onClick={() => fileInputRef.current.click()} style={{ fontSize: '11px', color: COLORS.primary, background: 'none', border: 'none', fontWeight: '800', cursor: 'pointer' }}>
                <Plus size={14}/> ADD PHOTOS
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '15px' }}>
              {images.map((img) => (
                <div key={img.id} style={{ ...thumbWrapper, border: img.id === mainPhotoId ? `3px solid ${COLORS.primary}` : `1px solid ${COLORS.border}` }}>
                  <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="preview" />
                  {img.id === mainPhotoId && <div style={mainBadge}>MAIN</div>}
                  <div style={thumbOverlay}>
                    <button onClick={() => setMainPhoto(img.id)} style={actionIcon}><Star size={12} fill={img.id === mainPhotoId ? COLORS.primary : 'none'} /></button>
                    <button onClick={() => deletePhoto(img.id)} style={actionIcon}><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
              <div onClick={() => fileInputRef.current.click()} style={uploadPlaceholder}>
                <Camera size={24} />
                <input type="file" multiple hidden ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STOCK & PRICING */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          <div style={cardStyle}>
            <h4 style={sectionTitle}><AlertCircle size={16}/> STOCK CONTROL</h4>
            <div style={inputGroup}>
              <label style={labelStyle}>Quantity in Stock</label>
              <input type="number" name="qty" value={formData.qty} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>Min Stock Alert</label>
              <input type="number" name="min_stock" value={formData.min_stock} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>Warehouse Location</label>
              <div style={iconInput}><MapPin size={16}/> <input name="loc" value={formData.loc} onChange={handleChange} style={bareInput} /></div>
            </div>
          </div>

          <div style={cardStyle}>
            <h4 style={sectionTitle}><DollarSign size={16}/> PRICING (AUD)</h4>
            <div style={inputGroup}>
              <label style={labelStyle}>Supplier</label>
              <div style={iconInput}><Truck size={16}/> <input name="supplier" value={formData.supplier} onChange={handleChange} style={bareInput} /></div>
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>Cost Price</label>
              <div style={iconInput}><DollarSign size={16}/> <input type="number" name="cost" value={formData.cost} onChange={handleChange} style={bareInput} /></div>
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>Sale Price</label>
              <div style={iconInput}><Tag size={16} color={COLORS.primary}/> <input type="number" name="price" value={formData.price} onChange={handleChange} style={bareInput} /></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- STYLES ---
const cardStyle = { backgroundColor: '#fff', padding: '25px', borderRadius: '20px', border: `1px solid ${COLORS.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' };
const inputGroup = { marginBottom: '18px' };
const labelStyle = { display: 'block', fontSize: '11px', fontWeight: '800', color: COLORS.slate, marginBottom: '6px', textTransform: 'uppercase' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${COLORS.border}`, outline: 'none', fontSize: '14px', boxSizing: 'border-box', backgroundColor: COLORS.bg };
const iconInput = { display: 'flex', alignItems: 'center', gap: '10px', padding: '0 12px', borderRadius: '10px', border: `1px solid ${COLORS.border}`, backgroundColor: COLORS.bg };
const bareInput = { border: 'none', outline: 'none', padding: '12px 0', width: '100%', fontSize: '14px', background: 'transparent' };
const sectionTitle = { margin: '0 0 15px 0', fontSize: '13px', fontWeight: '800', color: COLORS.dark, display: 'flex', alignItems: 'center', gap: '8px', borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '10px' };
const primaryBtn = { backgroundColor: COLORS.primary, color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };
const secondaryBtn = { backgroundColor: COLORS.dark, color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };
const thumbWrapper = { position: 'relative', height: '120px', borderRadius: '12px', overflow: 'hidden', backgroundColor: COLORS.bg };
const thumbOverlay = { position: 'absolute', bottom: 0, left: 0, right: 0, height: '35px', backgroundColor: 'rgba(15, 23, 42, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' };
const actionIcon = { background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '5px' };
const mainBadge = { position: 'absolute', top: '8px', left: '8px', backgroundColor: COLORS.primary, color: '#fff', fontSize: '9px', fontWeight: '900', padding: '3px 8px', borderRadius: '5px' };
const uploadPlaceholder = { border: `2px dashed ${COLORS.border}`, borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: COLORS.slate, height: '120px' };

export default AftermarketEditPage;