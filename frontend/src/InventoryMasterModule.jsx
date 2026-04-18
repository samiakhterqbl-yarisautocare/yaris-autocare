import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Layers } from 'lucide-react';

const API_URL = 'https://yaris-autocare-production.up.railway.app';
const COLORS = {
  primary: '#ef4444',
  dark: '#0f172a',
  border: '#e2e8f0',
  bg: '#f8fafc',
};

export default function InventoryMasterModule() {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/donor-cars/`);
      setCars(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch donor cars:', err);
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCars = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return cars;

    return cars.filter((car) => {
      const stock = car.stock_number?.toLowerCase() || '';
      const model = car.model?.toLowerCase() || '';
      const vin = car.vin?.toLowerCase() || '';
      const make = car.make?.toLowerCase() || '';
      const year = String(car.year || '').toLowerCase();

      return (
        stock.includes(q) ||
        model.includes(q) ||
        vin.includes(q) ||
        make.includes(q) ||
        year.includes(q)
      );
    });
  }, [cars, searchTerm]);

  return (
    <div style={container}>
      <div style={header}>
        <div>
          <h1 style={title}>Yard Inventory Master</h1>
          <p style={subtitle}>Managing {cars.length} Active Donor Vehicles</p>
        </div>

        <div style={searchWrapper}>
          <Search size={18} style={searchIcon} />
          <input
            style={searchInput}
            placeholder="Search Stock #, VIN, Make, Model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={loadingText}>Syncing Yard Data...</div>
      ) : filteredCars.length === 0 ? (
        <div style={emptyState}>No donor cars found.</div>
      ) : (
        <div style={grid}>
          {filteredCars.map((car) => (
            <div
              key={car.id}
              style={carCard}
              onClick={() => navigate(`/yard-master/${car.id}`)}
            >
              <div style={cardTop}>
                <div style={stockBadge}>{car.stock_number || 'NO STOCK #'}</div>
                <div style={dateBadge}>
                  {car.date_added
                    ? new Date(car.date_added).toLocaleDateString()
                    : 'No date'}
                </div>
              </div>

              <div style={cardMain}>
                <h3 style={carName}>
                  {car.year} {car.make} {car.model}
                </h3>
                <div style={vinText}>VIN: {car.vin || 'N/A'}</div>
              </div>

              <div style={cardFooter}>
                <div style={stats}>
                  <Layers size={14} />
                  <span>{car.parts_count || 0} Parts Salvaged</span>
                </div>
                <ChevronRight size={18} color="#cbd5e1" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const container = { animation: 'fadeIn 0.4s ease' };
const header = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  gap: '20px',
  marginBottom: '30px',
  flexWrap: 'wrap',
};
const title = { fontSize: '28px', fontWeight: '900', color: COLORS.dark, margin: 0 };
const subtitle = { color: '#64748b', fontSize: '14px', marginTop: '5px' };
const searchWrapper = { position: 'relative', width: '400px', maxWidth: '100%' };
const searchIcon = {
  position: 'absolute',
  left: '15px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#94a3b8',
};
const searchInput = {
  width: '100%',
  padding: '14px 14px 14px 45px',
  borderRadius: '12px',
  border: `1px solid ${COLORS.border}`,
  outline: 'none',
  fontSize: '14px',
  boxSizing: 'border-box',
};
const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '20px',
};
const carCard = {
  backgroundColor: '#fff',
  border: `1px solid ${COLORS.border}`,
  borderRadius: '16px',
  padding: '20px',
  cursor: 'pointer',
  transition: '0.2s',
  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
};
const cardTop = { display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '15px' };
const stockBadge = {
  backgroundColor: COLORS.dark,
  color: '#fff',
  padding: '4px 10px',
  borderRadius: '6px',
  fontSize: '11px',
  fontWeight: '900',
};
const dateBadge = { color: '#94a3b8', fontSize: '11px', fontWeight: '700' };
const cardMain = {};
const carName = { margin: '0 0 5px 0', fontSize: '18px', fontWeight: '800', color: COLORS.dark };
const vinText = { fontSize: '12px', color: '#64748b', fontFamily: 'monospace' };
const cardFooter = {
  marginTop: '20px',
  paddingTop: '15px',
  borderTop: `1px solid ${COLORS.bg}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};
const stats = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '12px',
  fontWeight: '700',
  color: '#64748b',
};
const loadingText = { textAlign: 'center', padding: '50px', fontWeight: '800', color: '#94a3b8' };
const emptyState = {
  textAlign: 'center',
  padding: '50px',
  fontWeight: '700',
  color: '#64748b',
  background: '#fff',
  borderRadius: '16px',
  border: `1px solid ${COLORS.border}`,
};
