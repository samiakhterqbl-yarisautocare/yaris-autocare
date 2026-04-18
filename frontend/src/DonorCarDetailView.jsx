import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Package, Search } from 'lucide-react';

const API_URL = 'https://yaris-autocare-production.up.railway.app';

const STATUS_COLORS = {
  Available: '#22c55e',
  Sold: '#ef4444',
  Internal: '#3b82f6',
};

export default function DonorCarDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [partSearch, setPartSearch] = useState('');

  useEffect(() => {
    fetchCar();
  }, [id]);

  const fetchCar = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/donor-cars/${id}/`);
      setCar(res.data);
    } catch (err) {
      console.error('Failed to fetch donor car:', err);
      setCar(null);
    } finally {
      setLoading(false);
    }
  };

  const filteredParts = useMemo(() => {
    const parts = Array.isArray(car?.parts) ? car.parts : [];
    const q = partSearch.trim().toLowerCase();
    if (!q) return parts;

    return parts.filter((part) => {
      const name = part.part_name?.toLowerCase() || '';
      const category = part.category?.toLowerCase() || '';
      const grade = part.grading_display?.toLowerCase() || '';
      const status = part.status?.toLowerCase() || '';
      return (
        name.includes(q) ||
        category.includes(q) ||
        grade.includes(q) ||
        status.includes(q)
      );
    });
  }, [car, partSearch]);

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Car Profile...</div>;
  }

  if (!car) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Car not found.</div>;
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <button onClick={() => navigate('/yard-master')} style={backBtn}>
        <ArrowLeft size={16} />
        BACK TO MASTER LIST
      </button>

      <div style={banner}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '900' }}>
            {car.year} {car.make} {car.model}
          </h1>
          <p style={{ margin: '8px 0 0 0', opacity: 0.85 }}>
            Stock: {car.stock_number} | VIN: {car.vin} | Color: {car.color || 'N/A'}
          </p>
        </div>

        <div style={statusGrid}>
          <div style={statItem}>
            <strong style={{ fontSize: '26px' }}>{Array.isArray(car.parts) ? car.parts.length : 0}</strong>
            <span>TOTAL SALVAGED</span>
          </div>
        </div>
      </div>

      <div style={toolbar}>
        <h3 style={sectionTitle}>PARTS HARVEST STATUS</h3>

        <div style={searchWrap}>
          <Search size={16} style={searchIcon} />
          <input
            value={partSearch}
            onChange={(e) => setPartSearch(e.target.value)}
            placeholder="Search parts..."
            style={searchInput}
          />
        </div>
      </div>

      <div style={compactList}>
        {filteredParts.map((part) => (
          <div
            key={part.id}
            onClick={() => navigate(`/used-parts/${part.id}`)}
            style={partRow}
          >
            <div
              style={{
                ...statusDot,
                backgroundColor: STATUS_COLORS[part.status] || STATUS_COLORS.Available,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={partName}>{part.part_name}</div>
              <div style={partMeta}>
                {part.category || 'No Category'} • {part.grading_display || 'No Grade'} • {part.status || 'Available'}
              </div>
            </div>
            <div style={priceTag}>${part.price || 0}</div>
          </div>
        ))}

        {filteredParts.length === 0 && (
          <div style={emptyBox}>No parts found for this donor car.</div>
        )}
      </div>
    </div>
  );
}

const backBtn = {
  background: 'none',
  border: 'none',
  color: '#64748b',
  fontWeight: '700',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '20px',
};

const banner = {
  backgroundColor: '#0f172a',
  color: '#fff',
  padding: '28px',
  borderRadius: '24px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '20px',
  flexWrap: 'wrap',
  marginBottom: '24px',
};

const statusGrid = { display: 'flex', gap: '24px' };
const statItem = {
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  minWidth: '120px',
};
const sectionTitle = {
  fontSize: '14px',
  fontWeight: '900',
  color: '#94a3b8',
  margin: 0,
  textTransform: 'uppercase',
};
const toolbar = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '20px',
  flexWrap: 'wrap',
};
const searchWrap = { position: 'relative', width: '320px', maxWidth: '100%' };
const searchIcon = {
  position: 'absolute',
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#94a3b8',
};
const searchInput = {
  width: '100%',
  padding: '12px 12px 12px 38px',
  borderRadius: '10px',
  border: '1px solid #e2e8f0',
  outline: 'none',
  boxSizing: 'border-box',
};
const compactList = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '10px',
};
const partRow = {
  backgroundColor: '#fff',
  border: '1px solid #e2e8f0',
  padding: '14px 16px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  cursor: 'pointer',
};
const statusDot = { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 };
const partName = {
  fontSize: '14px',
  fontWeight: '800',
  color: '#0f172a',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};
const partMeta = {
  fontSize: '11px',
  color: '#64748b',
  marginTop: '3px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};
const priceTag = {
  fontSize: '14px',
  fontWeight: '900',
  color: '#0f172a',
  flexShrink: 0,
};
const emptyBox = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '20px',
  textAlign: 'center',
  color: '#64748b',
  fontWeight: '700',
};
