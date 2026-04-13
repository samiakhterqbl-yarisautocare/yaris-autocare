import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Edit, Trash2, Printer, Calendar, Tag, MapPin, Package } from 'lucide-react';

const API_URL = 'https://yaris-autocare-production.up.railway.app';

export default function UsedPartDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [part, setPart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/api/used-parts/${id}/`)
      .then(res => { setPart(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this part from inventory?")) {
      try {
        await axios.delete(`${API_URL}/api/used-parts/${id}/`);
        navigate('/used-parts');
      } catch (err) { alert("Error deleting part."); }
    }
  };

  if (loading) return <div style={{padding: '40px'}}>Loading Part Details...</div>;
  if (!part) return <div style={{padding: '40px'}}>Part not found.</div>;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <button onClick={() => navigate('/used-parts')} style={backBtn}><ArrowLeft size={18}/> Back to Inventory</button>

      <div style={detailGrid}>
        {/* LEFT: IMAGE & ACTIONS */}
        <div style={imageSection}>
          <div style={imagePlaceholder}>
            {part.images && part.images.length > 0 ? (
              <img src={part.images[0].image} style={mainImg} alt={part.part_name} />
            ) : (
              <Package size={80} color="#cbd5e1" />
            )}
          </div>
          <div style={actionRow}>
            <button onClick={() => navigate(`/used-parts/edit/${id}`)} style={editBtn}><Edit size={18}/> Edit Part</button>
            <button onClick={handleDelete} style={deleteBtn}><Trash2 size={18}/> Delete</button>
          </div>
          <button onClick={() => window.print()} style={printBtn}><Printer size={18}/> Print QR Label</button>
        </div>

        {/* RIGHT: DATA */}
        <div style={infoSection}>
          <span style={categoryBadge}>{part.category}</span>
          <h1 style={titleStyle}>{part.part_name}</h1>
          <div style={priceTag}>${part.price}</div>

          <div style={specsBox}>
            <div style={specItem}><Tag size={16}/> <strong>Condition:</strong> {part.condition}</div>
            <div style={specItem}><MapPin size={16}/> <strong>Storage Location:</strong> {part.location || 'Not Assigned'}</div>
            <div style={specItem}><Calendar size={16}/> <strong>Added:</strong> {new Date(part.date_added).toLocaleDateString()}</div>
          </div>
          
          <div style={stockBox}>
            <div style={{fontSize: '12px', color: '#64748b'}}>Current Status</div>
            <div style={{fontSize: '18px', fontWeight: '900', color: '#22c55e'}}>{part.status || 'FOR SALE'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---
const backBtn = { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#64748b', marginBottom: '25px' };
const detailGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', backgroundColor: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0' };
const imageSection = { display: 'flex', flexDirection: 'column', gap: '20px' };
const imagePlaceholder = { height: '400px', backgroundColor: '#f8fafc', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', overflow: 'hidden' };
const mainImg = { width: '100%', height: '100%', objectFit: 'cover' };
const actionRow = { display: 'flex', gap: '10px' };
const editBtn = { flex: 1, padding: '15px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' };
const deleteBtn = { padding: '15px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' };
const printBtn = { width: '100%', padding: '15px', backgroundColor: '#f1f5f9', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' };
const infoSection = { display: 'flex', flexDirection: 'column', gap: '15px' };
const categoryBadge = { padding: '5px 12px', backgroundColor: '#f1f5f9', color: '#64748b', borderRadius: '6px', fontWeight: '800', fontSize: '12px', width: 'fit-content' };
const titleStyle = { fontSize: '36px', fontWeight: '900', margin: 0, color: '#0f172a' };
const priceTag = { fontSize: '32px', fontWeight: '900', color: '#22c55e' };
const specsBox = { marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' };
const specItem = { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', color: '#1e293b' };
const stockBox = { marginTop: 'auto', padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '15px', border: '1px solid #bbf7d0' };
