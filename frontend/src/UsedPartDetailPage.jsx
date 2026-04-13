import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Camera, Tag, Settings, Printer, 
  Trash2, Star, CheckCircle, Package, Image as ImageIcon 
} from 'lucide-react';

const API_URL = 'https://yaris-autocare-production.up.railway.app';

export default function UsedPartDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [part, setPart] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPart();
  }, [id]);

  const fetchPart = () => {
    axios.get(`${API_URL}/api/used-parts/${id}/`)
      .then(res => { setPart(res.data); setLoading(false); })
      .catch(err => console.error(err));
  };

  const setMainImage = async (imageId) => {
    try {
      await axios.post(`${API_URL}/api/images/${imageId}/set-main/`);
      fetchPart(); // Refresh to show new star
    } catch (err) { alert("Error setting main image"); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    formData.append('inventory_item', id);

    try {
      await axios.post(`${API_URL}/api/images/upload/`, formData);
      fetchPart();
    } catch (err) { alert("S3 Upload Failed"); }
  };

  if (loading) return <div style={p40}>Loading...</div>;

  return (
    <div style={p40}>
      <button onClick={() => navigate('/used-parts')} style={backBtn}><ArrowLeft size={16}/> BACK</button>

      <div style={headerContainer}>
        <div>
          <h1 style={title}>{part.part_name}</h1>
          <p style={subtitle}>Stock: {part.donor_car_stock} | {part.category}</p>
        </div>
        <div style={actionButtons}>
          <button style={printBtn} onClick={() => window.print()}><Printer size={18}/> PRINT QR LABEL</button>
          <button style={deleteBtn}><Trash2 size={18}/></button>
        </div>
      </div>

      {/* TABS */}
      <div style={tabContainer}>
        <button onClick={() => setActiveTab('general')} style={activeTab === 'general' ? activeTabStyle : tabStyle}>DETAILS & GRADING</button>
        <button onClick={() => setActiveTab('images')} style={activeTab === 'images' ? activeTabStyle : tabStyle}>PHOTO GALLERY ({part.images.length})</button>
      </div>

      <div style={contentCard}>
        {activeTab === 'general' ? (
          <div style={formGrid}>
             <div style={inputGroup}><label>PRICE ($)</label><input defaultValue={part.price} style={input} /></div>
             <div style={inputGroup}>
               <label>CONDITION GRADE</label>
               <select defaultValue={part.grading} style={input}>
                 <option value="A">Grade A - Excellent</option>
                 <option value="B">Grade B - Good</option>
                 <option value="C">Grade C - Fair</option>
               </select>
             </div>
             <div style={inputGroup}><label>USAGE</label><select defaultValue={part.usage_type} style={input}><option>Sale</option><option>Internal</option></select></div>
             <button style={saveBtn}>UPDATE PART DETAILS</button>
          </div>
        ) : (
          <div style={imageGrid}>
             <label style={uploadCard}>
               <Camera size={30} />
               <span>Add Photo</span>
               <input type="file" hidden onChange={handleUpload} />
             </label>
             {part.images.map(img => (
               <div key={img.id} style={imgCard}>
                 <img src={img.image} style={imgThumb} />
                 <button onClick={() => setMainImage(img.id)} style={img.is_main ? mainStarActive : mainStar}>
                   <Star size={14} fill={img.is_main ? "gold" : "none"}/>
                 </button>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- STYLES ---
const p40 = { padding: '40px' };
const backBtn = { background: 'none', border: 'none', cursor: 'pointer', fontWeight: '800', color: '#64748b', display: 'flex', gap: '8px', marginBottom: '20px' };
const headerContainer = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const title = { margin: 0, fontSize: '32px', fontWeight: '900', color: '#0f172a' };
const subtitle = { color: '#64748b', fontWeight: '600' };
const actionButtons = { display: 'flex', gap: '10px' };
const printBtn = { backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', gap: '8px' };
const deleteBtn = { backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer' };
const tabContainer = { display: 'flex', gap: '20px', borderBottom: '2px solid #e2e8f0', marginBottom: '30px' };
const tabStyle = { padding: '15px 5px', border: 'none', background: 'none', color: '#94a3b8', fontWeight: '800', cursor: 'pointer' };
const activeTabStyle = { ...tabStyle, color: '#ef4444', borderBottom: '3px solid #ef4444' };
const contentCard = { backgroundColor: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0' };
const imageGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px' };
const uploadCard = { border: '2px dashed #cbd5e1', borderRadius: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8' };
const imgCard = { position: 'relative', borderRadius: '15px', overflow: 'hidden', height: '150px', border: '1px solid #e2e8f0' };
const imgThumb = { width: '100%', height: '100%', objectFit: 'cover' };
const mainStar = { position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '5px', padding: '5px', cursor: 'pointer' };
const mainStarActive = { ...mainStar, backgroundColor: '#0f172a', color: 'gold' };
const formGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '8px' };
const input = { padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontWeight: '600' };
const saveBtn = { gridColumn: 'span 2', padding: '15px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '900', marginTop: '20px', cursor: 'pointer' };
