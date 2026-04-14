import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Camera, Trash2, Star, Save, 
  DollarSign, MapPin, ClipboardList, Package, 
  ShieldCheck, ShoppingCart, FileText, ChevronRight
} from 'lucide-react';

const API_URL = 'https://yaris-autocare-production.up.railway.app';
const COLORS = { primary: '#ef4444', dark: '#0f172a', border: '#e2e8f0', success: '#22c55e' };

export default function PartDetailModule() {
  const { id } = useParams(); // Can be Database ID or Label ID
  const navigate = useNavigate();
  
  const [part, setPart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Fetch Part Data
  useEffect(() => {
    const fetchPart = async () => {
      try {
        // We search by ID or Label ID
        const res = await axios.get(`${API_URL}/api/used-parts/${id}/`);
        setPart(res.data);
      } catch (err) {
        console.error("Part fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPart();
  }, [id]);

  // --- PHOTO MANAGEMENT ---
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('inventory_item', part.id);

    try {
      await axios.post(`${API_URL}/api/images/upload/`, formData);
      // Refresh part data to show new images
      const res = await axios.get(`${API_URL}/api/used-parts/${part.id}/`);
      setPart(res.data);
    } catch (err) {
      alert("Photo upload failed. Check S3/Railway config.");
    } finally {
      setUploading(false);
    }
  };

  const setMainImage = async (imageId) => {
    try {
      await axios.post(`${API_URL}/api/images/${imageId}/set-main/`);
      const res = await axios.get(`${API_URL}/api/used-parts/${part.id}/`);
      setPart(res.data);
    } catch (err) { alert("Failed to set main image."); }
  };

  const deleteImage = async (imageId) => {
    if (!window.confirm("Delete this photo permanently?")) return;
    try {
      await axios.delete(`${API_URL}/api/images/${imageId}/`); // Ensure this endpoint exists
      setPart({ ...part, images: part.images.filter(img => img.id !== imageId) });
    } catch (err) { alert("Delete failed."); }
  };

  // --- DATA UPDATES ---
  const handleUpdate = async () => {
    setLoading(true);
    try {
      await axios.patch(`${API_URL}/api/used-parts/${part.id}/`, part);
      alert("Part information updated successfully.");
    } catch (err) {
      alert("Update failed.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !part) return <div style={loadingOverlay}>Accessing Encrypted Part Data...</div>;
  if (!part) return <div style={loadingOverlay}>Part Not Found. Invalid QR.</div>;

  return (
    <div style={container}>
      {/* HEADER NAVIGATION */}
      <div style={header}>
        <button onClick={() => navigate(-1)} style={backBtn}><ArrowLeft size={18}/> BACK TO YARD</button>
        <div style={headerInfo}>
          <h1 style={title}>{part.part_name}</h1>
          <div style={badge}>{part.label_id}</div>
        </div>
      </div>

      <div style={contentGrid}>
        {/* LEFT COLUMN: PHOTOS */}
        <div style={leftCol}>
          <div style={panel}>
            <div style={panelHeader}>
              <h3 style={panelTitle}><Camera size={18}/> PHOTO GALLERY</h3>
              <label style={uploadBtn}>
                <PlusCircle size={14}/> ADD PHOTO
                <input type="file" hidden onChange={handlePhotoUpload} disabled={uploading} />
              </label>
            </div>
            
            <div style={photoGrid}>
              {part.images && part.images.map(img => (
                <div key={img.id} style={photoCard}>
                  <img src={img.image} style={imagePreview} alt="Part" />
                  <div style={photoActions}>
                    <button onClick={() => setMainImage(img.id)} style={{...actionBtn, color: img.is_main ? COLORS.success : '#fff'}}>
                      <Star size={14} fill={img.is_main ? COLORS.success : 'none'}/>
                    </button>
                    <button onClick={() => deleteImage(img.id)} style={{...actionBtn, color: COLORS.primary}}>
                      <Trash2 size={14}/>
                    </button>
                  </div>
                  {img.is_main && <div style={mainBadge}>MAIN</div>}
                </div>
              ))}
              {uploading && <div style={photoPlaceholder}>Uploading...</div>}
              {(!part.images || part.images.length === 0) && !uploading && (
                <div style={photoPlaceholder}>No photos yet. Click 'Add Photo'</div>
              )}
            </div>
          </div>

          {/* PARENT CAR INFO BOX */}
          <div style={{...panel, marginTop: '20px', backgroundColor: COLORS.dark, color: '#fff'}}>
            <h3 style={{...panelTitle, color: '#fff'}}><Car size={18}/> DONOR VEHICLE</h3>
            <div style={donorInfo}>
              <div style={infoRow}><span>STOCK #</span><strong>{part.donor_car_stock}</strong></div>
              <div style={infoRow}><span>MAKE/MODEL</span><strong>{part.donor_car_details}</strong></div>
              <div style={infoRow}><span>VIN</span><strong>{part.donor_car_vin || 'N/A'}</strong></div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: BUSINESS DATA */}
        <div style={rightCol}>
          <div style={panel}>
            <h3 style={panelTitle}><ClipboardList size={18}/> COMMERCIAL DETAILS</h3>
            
            <div style={formGrid}>
              <div style={field}>
                <label style={labelStyle}>Price ($ AUD)</label>
                <div style={inputWithIcon}>
                  <DollarSign size={16} style={inputIcon}/>
                  <input style={inputStyle} type="number" value={part.price} onChange={e => setPart({...part, price: e.target.value})} />
                </div>
              </div>

              <div style={field}>
                <label style={labelStyle}>Shelf Location</label>
                <div style={inputWithIcon}>
                  <MapPin size={16} style={inputIcon}/>
                  <input style={inputStyle} placeholder="e.g. B-12" value={part.location || ''} onChange={e => setPart({...part, location: e.target.value})} />
                </div>
              </div>

              <div style={field}>
                <label style={labelStyle}>Grading</label>
                <select style={selectStyle} value={part.grading} onChange={e => setPart({...part, grading: e.target.value})}>
                  <option value="A">Grade A - Excellent</option>
                  <option value="B">Grade B - Good</option>
                  <option value="C">Grade C - Fair</option>
                  <option value="F">Grade F - For Parts</option>
                </select>
              </div>

              <div style={field}>
                <label style={labelStyle}>Usage Type</label>
                <select style={selectStyle} value={part.usage_type} onChange={e => setPart({...part, usage_type: e.target.value})}>
                  <option value="Sale">For Sale (Retail)</option>
                  <option value="Internal">Internal Use Only</option>
                  <option value="Scrap">Scrap/Waste</option>
                </select>
              </div>
            </div>

            <label style={labelStyle}>Condition Notes</label>
            <textarea 
              style={textareaStyle} 
              placeholder="Describe scratches, dents, or testing results..."
              value={part.condition_notes || ''}
              onChange={e => setPart({...part, condition_notes: e.target.value})}
            />

            <div style={actionRow}>
              <button onClick={handleUpdate} style={saveBtn}><Save size={18}/> SAVE ALL CHANGES</button>
            </div>
          </div>

          {/* COMMERCE ACTIONS */}
          <div style={buttonGrid}>
            <button style={commBtn}><FileText size={18}/> GEN. DETAIL SHEET</button>
            <button style={{...commBtn, backgroundColor: COLORS.success, color: '#fff', border: 'none'}}>
              <ShoppingCart size={18}/> ADD TO INVOICE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---
const container = { animation: 'fadeIn 0.3s ease' };
const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const backBtn = { background: 'none', border: 'none', color: '#64748b', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };
const headerInfo = { textAlign: 'right' };
const title = { margin: 0, fontSize: '28px', fontWeight: '900', color: COLORS.dark };
const badge = { display: 'inline-block', padding: '4px 12px', backgroundColor: '#f1f5f9', borderRadius: '6px', fontSize: '12px', fontWeight: '900', color: '#64748b', marginTop: '5px' };

const contentGrid = { display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' };
const panel = { backgroundColor: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: '20px', padding: '30px' };
const panelHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const panelTitle = { fontSize: '13px', fontWeight: '900', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 };
const uploadBtn = { backgroundColor: COLORS.dark, color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };

const photoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px' };
const photoCard = { position: 'relative', height: '140px', borderRadius: '12px', overflow: 'hidden', border: `1px solid ${COLORS.border}` };
const imagePreview = { width: '100%', height: '100%', objectFit: 'cover' };
const photoActions = { position: 'absolute', bottom: 0, width: '100%', padding: '8px', display: 'flex', justifyContent: 'center', gap: '10px', backgroundColor: 'rgba(0,0,0,0.5)' };
const actionBtn = { background: 'none', border: 'none', cursor: 'pointer' };
const mainBadge = { position: 'absolute', top: '8px', left: '8px', backgroundColor: COLORS.success, color: '#fff', fontSize: '9px', fontWeight: '900', padding: '2px 6px', borderRadius: '4px' };
const photoPlaceholder = { height: '140px', backgroundColor: '#f8fafc', border: `2px dashed ${COLORS.border}`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#94a3b8', textAlign: 'center', padding: '20px' };

const donorInfo = { marginTop: '20px' };
const infoRow = { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '12px' };

const formGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' };
const field = { display: 'flex', flexDirection: 'column' };
const labelStyle = { fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' };
const inputWithIcon = { position: 'relative' };
const inputIcon = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' };
const inputStyle = { width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: `1px solid ${COLORS.border}`, fontSize: '14px', outline: 'none' };
const selectStyle = { width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${COLORS.border}`, fontSize: '14px', outline: 'none', backgroundColor: '#fff' };
const textareaStyle = { width: '100%', height: '100px', padding: '15px', borderRadius: '12px', border: `1px solid ${COLORS.border}`, fontSize: '14px', outline: 'none', resize: 'none' };
const saveBtn = { width: '100%', backgroundColor: COLORS.dark, color: '#fff', padding: '18px', borderRadius: '14px', border: 'none', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' };
const buttonGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' };
const commBtn = { padding: '16px', backgroundColor: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: '14px', fontWeight: '800', color: COLORS.dark, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' };
const loadingOverlay = { padding: '100px', textAlign: 'center', fontWeight: '900', color: COLORS.dark };
