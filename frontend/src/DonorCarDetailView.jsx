import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Package, Tag, ShoppingCart, Wrench, Info } from 'lucide-react';

const API_URL = 'https://yaris-autocare-production.up.railway.app';
const COLORS = { Available: '#22c55e', Sold: '#ef4444', Internal: '#3b82f6', border: '#e2e8f0' };

export default function DonorCarDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/donor-cars/${id}/`)
      .then(res => setCar(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!car) return <div style={{padding: '50px', textAlign: 'center'}}>Loading Car Profile...</div>;

  return (
    <div style={{animation: 'fadeIn 0.3s ease'}}>
      <button onClick={() => navigate('/yard-master')} style={backBtn}><ArrowLeft size={16}/> BACK TO MASTER LIST</button>
      
      <div style={banner}>
        <div>
          <h1 style={{margin: 0, fontSize: '32px', fontWeight: '900'}}>{car.year} {car.model}</h1>
          <p style={{margin: '5px 0 0 0', opacity: 0.8}}>Stock: {car.stock_number} | VIN: {car.vin} | Color: {car.color}</p>
        </div>
        <div style={statusGrid}>
          <div style={statItem}><strong>{car.parts.length}</strong><span>TOTAL SALVAGED</span></div>
        </div>
      </div>

      <h3 style={sectionTitle}>PARTS HARVEST STATUS</h3>
      <div style={partsGrid}>
        {car.parts.map(part => (
          <div key={part.id} onClick={() => navigate(`/used-parts/${part.id}`)} style={partCard}>
            <div style={{...statusDot, backgroundColor: COLORS[part.status] || COLORS.Available}}></div>
            <div style={{flex: 1}}>
              <div style={partName}>{part.part_name}</div>
              <div style={partMeta}>{part.category} | {part.grading_display}</div>
            </div>
            <div style={priceTag}>${part.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const backBtn = { background: 'none', border: 'none', color: '#64748b', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' };
const banner = { backgroundColor: '#0f172a', color: '#fff', padding: '40px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' };
const statusGrid = { display: 'flex', gap: '40px' };
const statItem = { textAlign: 'center', display: 'flex', flexDirection: 'column' };
const sectionTitle = { fontSize: '14px', fontWeight: '900', color: '#94a3b8', marginBottom: '20px', textTransform: 'uppercase' };
const partsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' };
const partCard = { backgroundColor: '#fff', border: '1px solid #e2e8f0', padding: '15px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' };
const statusDot = { width: '10px', height: '10px', borderRadius: '50%' };
const partName = { fontSize: '14px', fontWeight: '800', color: '#0f172a' };
const partMeta = { fontSize: '11px', color: '#64748b' };
const priceTag = { fontSize: '14px', fontWeight: '900', color: '#0f172a' };
