import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, X, MapPin, Truck, DollarSign, Tag, 
  Camera, Plus, Barcode, Trash2, Star, Printer 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

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
  const [mainPhotoId, setMainPhotoId] = useState(null);

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
    if (images.length === 0 && newImages.length > 0) setMainPhotoId(newImages[0].id);
  };

  // --- PRINT LOGIC ---
  const handlePrint = () => {
    const printContent = document.getElementById('label-area').innerHTML;
    const windowPrint = window.open('', '', 'width=600,height=600');
    windowPrint.document.write(`
      <html>
        <head>
          <title>Print Label</title>
          <style>
            @page { size: 50mm 30mm; margin: 0; }
            body { margin: 0; padding: 0; font-family: sans-serif; }
            .label-wrapper { 
              width: 50mm; 
              height: 30mm; 
              padding: 2mm; 
              box-sizing: border-box; 
              display: flex; 
              flex-direction: column;
              justify-content: space-between;
            }
          </style>
        </head>
        <body>
          <div class="label-wrapper">${printContent}</div>
          <script>setTimeout(() => { window.print(); window.close(); }, 250);</script>
        </body>
      </html>
    `);
    windowPrint.document.close();
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1100px', margin: '0 auto', backgroundColor: COLORS.bg, minHeight: '100vh' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: '900', fontSize: '28px' }}>Add New Product</h2>
          <p style={{ color: COLORS.slate }}>50mm x 30mm Label Ready</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={secondaryBtn}><X size={18}/> Cancel</button>
          <button onClick={handlePrint} style={{ ...secondaryBtn, backgroundColor: '#475569' }}><Printer size={18}/> Print Label</button>
          <button onClick={() => navigate('/aftermarket')} style={primaryBtn}><Save size={18}/> Create Product</button>
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

          {/* HIDDEN PREVIEW FOR PRINTING ENGINE */}
          <div style={{ display: 'none' }}>
            <div id="label-area">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: '65%' }}>
                   <div style={{ fontSize: '7pt', fontWeight: 'bold', marginBottom: '1mm' }}>YARIS AUTOCARE</div>
                   <div style={{ fontSize: '8pt', fontWeight: '900', lineHeight: '1', height: '8mm', overflow: 'hidden' }}>{formData.name || 'NEW PRODUCT'}</div>
                   <div style={{ fontSize: '10pt', fontWeight: '900', color: COLORS.primary, marginTop: '1mm' }}>{formData.sku || 'SKU-PENDING'}</div>
                </div>
                <div style={{ width: '30%', textAlign: 'right' }}>
                  <QRCodeSVG value={formData.sku || 'N/A'} size={35} />
                </div>
              </div>
              <div style={{ borderTop: '0.2mm solid #000', marginTop: '1mm', paddingTop: '1mm', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '6pt' }}>LOC: {formData.loc || 'N/A'}</div>
                <div style={{ fontSize: '11pt', fontWeight: '900' }}>${formData.price || '0.00'}</div>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <h4 style={sectionTitle}>PRODUCT IMAGES</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
              {images.map(img => (
                <div key={img.id} style={{ height: '100px', borderRadius: '8px', overflow: 'hidden', position: 'relative', border: img.id === mainPhotoId ? `3px solid ${COLORS.primary}` : 'none' }}>
                  <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => setImages(images.filter(i => i.id !== img.id))} style={deleteBtn}><Trash2 size={12}/></button>
                </div>
              ))}
              <div onClick={() => fileInputRef.current.click()} style={uploadBtn}><Camera size={24} /><input type="file" hidden multiple ref={fileInputRef} onChange={handlePhotoUpload} /></div>
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

// --- STYLES ---
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