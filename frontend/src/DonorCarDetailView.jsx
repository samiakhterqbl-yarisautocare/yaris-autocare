import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Search,
  Camera,
  Package,
  Car,
  Palette,
  Hash,
  ChevronRight,
} from 'lucide-react';

const API_URL = 'https://yaris-autocare-production.up.railway.app';

const STATUS_COLORS = {
  Available: '#22c55e',
  Sold: '#ef4444',
  Internal: '#3b82f6',
};

const COLORS = {
  primary: '#ef4444',
  dark: '#0f172a',
  slate: '#334155',
  border: '#e2e8f0',
  bg: '#f8fafc',
  muted: '#64748b',
};

export default function DonorCarDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [partSearch, setPartSearch] = useState('');
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    fetchCar();
  }, [id]);

  const fetchCar = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/donor-cars/${id}/`);
      setCar(res.data);
    } catch (err) {
      console.error('Failed to fetch donor car:', err);
      setCar(null);
    } finally {
      setLoading(false);
    }
  };

  const carImages = useMemo(() => {
    if (!car) return [];

    const rawImages = car.images || car.photos || [];
    const normalized = [];

    rawImages.forEach((img) => {
      if (!img) return;
      if (typeof img === 'string') normalized.push(img);
      else if (img.image) normalized.push(img.image);
      else if (img.url) normalized.push(img.url);
    });

    if (car.main_photo) normalized.unshift(car.main_photo);

    return [...new Set(normalized.filter(Boolean))];
  }, [car]);

  useEffect(() => {
    if (carImages.length > 0) {
      setActiveImage(carImages[0]);
    } else {
      setActiveImage('');
    }
  }, [carImages]);

  const filteredParts = useMemo(() => {
    const parts = Array.isArray(car?.parts) ? car.parts : [];
    const q = partSearch.trim().toLowerCase();

    if (!q) return parts;

    return parts.filter((part) => {
      const name = part.part_name?.toLowerCase() || '';
      const category = part.category?.toLowerCase() || '';
      const grade = part.grading_display?.toLowerCase() || '';
      const status = part.status?.toLowerCase() || '';
      const price = String(part.price || '').toLowerCase();

      return (
        name.includes(q) ||
        category.includes(q) ||
        grade.includes(q) ||
        status.includes(q) ||
        price.includes(q)
      );
    });
  }, [car, partSearch]);

  const stats = useMemo(() => {
    const parts = Array.isArray(car?.parts) ? car.parts : [];

    return {
      total: parts.length,
      available: parts.filter((p) => p.status === 'Available').length,
      sold: parts.filter((p) => p.status === 'Sold').length,
      internal: parts.filter((p) => p.status === 'Internal').length,
    };
  }, [car]);

  if (loading) {
    return (
      <div style={{ padding: '40px' }}>
        <div style={loadingBox}>Loading donor vehicle profile...</div>
      </div>
    );
  }

  if (!car) {
    return (
      <div style={{ padding: '40px' }}>
        <button onClick={() => navigate('/yard-master')} style={backBtn}>
          <ArrowLeft size={16} />
          BACK TO MASTER LIST
        </button>
        <div style={notFoundBox}>Donor car not found.</div>
      </div>
    );
  }

  return (
    <div style={page}>
      <button onClick={() => navigate('/yard-master')} style={backBtn}>
        <ArrowLeft size={16} />
        BACK TO MASTER LIST
      </button>

      <div style={hero}>
        <div style={heroOverlay} />

        <div style={heroTop}>
          <div style={heroBadge}>
            <Car size={14} />
            DONOR VEHICLE PROFILE
          </div>
        </div>

        <div style={heroContent}>
          <div style={heroLeft}>
            <h1 style={heroTitle}>
              {car.year} {car.make} {car.model}
            </h1>

            <div style={heroMeta}>
              <span style={metaChip}>
                <Hash size={14} />
                Stock: {car.stock_number || 'N/A'}
              </span>
              <span style={metaChip}>
                <Palette size={14} />
                Color: {car.color || 'N/A'}
              </span>
              <span style={metaChip}>
                <Package size={14} />
                Salvaged: {stats.total}
              </span>
            </div>

            <div style={vinBox}>
              VIN: {car.vin || 'N/A'}
            </div>
          </div>

          <div style={heroRight}>
            <div style={statsGrid}>
              <StatCard label="Total Parts" value={stats.total} />
              <StatCard label="Available" value={stats.available} color="#22c55e" />
              <StatCard label="Sold" value={stats.sold} color="#ef4444" />
              <StatCard label="Internal" value={stats.internal} color="#3b82f6" />
            </div>
          </div>
        </div>
      </div>

      <div style={contentGrid}>
        <div style={leftCol}>
          <div style={card}>
            <div style={cardHeader}>
              <div style={cardTitleWrap}>
                <Camera size={18} />
                <h3 style={cardTitle}>Vehicle Images</h3>
              </div>
            </div>

            {activeImage ? (
              <img src={activeImage} alt={`${car.make} ${car.model}`} style={mainImage} />
            ) : (
              <div style={imagePlaceholder}>No vehicle images available</div>
            )}

            {carImages.length > 1 && (
              <div style={thumbGrid}>
                {carImages.map((img, index) => (
                  <img
                    key={`${img}-${index}`}
                    src={img}
                    alt={`Vehicle ${index + 1}`}
                    onClick={() => setActiveImage(img)}
                    style={{
                      ...thumbImage,
                      border:
                        activeImage === img
                          ? `2px solid ${COLORS.primary}`
                          : `1px solid ${COLORS.border}`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div style={card}>
            <div style={cardHeader}>
              <div style={cardTitleWrap}>
                <Package size={18} />
                <h3 style={cardTitle}>Vehicle Overview</h3>
              </div>
            </div>

            <div style={infoGrid}>
              <InfoItem label="Make" value={car.make || 'N/A'} />
              <InfoItem label="Model" value={car.model || 'N/A'} />
              <InfoItem label="Year" value={car.year || 'N/A'} />
              <InfoItem label="Color" value={car.color || 'N/A'} />
              <InfoItem label="Stock Number" value={car.stock_number || 'N/A'} />
              <InfoItem label="VIN" value={car.vin || 'N/A'} mono />
            </div>
          </div>
        </div>

        <div style={rightCol}>
          <div style={partsCard}>
            <div style={partsHeader}>
              <div>
                <div style={partsEyebrow}>SALVAGED INVENTORY</div>
                <h3 style={partsTitle}>Dismantled Parts</h3>
              </div>

              <div style={searchWrap}>
                <Search size={16} style={searchIcon} />
                <input
                  value={partSearch}
                  onChange={(e) => setPartSearch(e.target.value)}
                  placeholder="Search part, category, grade, status..."
                  style={searchInput}
                />
              </div>
            </div>

            <div style={partsList}>
              {filteredParts.map((part) => {
                const statusColor =
                  STATUS_COLORS[part.status] || STATUS_COLORS.Available;

                return (
                  <div
                    key={part.id}
                    onClick={() => navigate(`/dismantle-parts/${part.id}`)}
                    style={partRow}
                  >
                    <div
                      style={{
                        ...statusPill,
                        backgroundColor: `${statusColor}15`,
                        color: statusColor,
                      }}
                    >
                      <span
                        style={{
                          ...statusDot,
                          backgroundColor: statusColor,
                        }}
                      />
                      {part.status || 'Available'}
                    </div>

                    <div style={partMain}>
                      <div style={partName}>{part.part_name || 'Unnamed Part'}</div>
                      <div style={partMeta}>
                        {part.category || 'No Category'} • {part.grading_display || 'No Grade'}
                      </div>
                    </div>

                    <div style={partSide}>
                      <div style={priceTag}>${part.price || 0}</div>
                      <ChevronRight size={18} color="#94a3b8" />
                    </div>
                  </div>
                );
              })}

              {filteredParts.length === 0 && (
                <div style={emptyBox}>No parts found for this donor car.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color = '#ffffff' }) {
  return (
    <div style={statCard}>
      <div style={{ ...statValue, color }}>{value}</div>
      <div style={statLabel}>{label}</div>
    </div>
  );
}

function InfoItem({ label, value, mono = false }) {
  return (
    <div style={infoItem}>
      <div style={infoLabel}>{label}</div>
      <div style={{ ...infoValue, fontFamily: mono ? 'monospace' : 'inherit' }}>
        {value}
      </div>
    </div>
  );
}

const page = {
  animation: 'fadeIn 0.3s ease',
};

const backBtn = {
  background: 'none',
  border: 'none',
  color: '#64748b',
  fontWeight: '800',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '18px',
};

const hero = {
  position: 'relative',
  background: 'linear-gradient(135deg, #020617 0%, #0f172a 55%, #1e293b 100%)',
  color: '#fff',
  borderRadius: '28px',
  padding: '26px',
  overflow: 'hidden',
  marginBottom: '24px',
  boxShadow: '0 20px 50px rgba(15,23,42,0.18)',
};

const heroOverlay = {
  position: 'absolute',
  inset: 0,
  background:
    'radial-gradient(circle at top right, rgba(239,68,68,0.18), transparent 28%), radial-gradient(circle at bottom left, rgba(255,255,255,0.05), transparent 22%)',
  pointerEvents: 'none',
};

const heroTop = {
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '18px',
};

const heroBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  borderRadius: '999px',
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.1)',
  fontSize: '12px',
  fontWeight: '800',
  letterSpacing: '0.04em',
};

const heroContent = {
  position: 'relative',
  zIndex: 1,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)',
  gap: '24px',
  alignItems: 'end',
};

const heroLeft = {
  minWidth: 0,
};

const heroRight = {};

const heroTitle = {
  margin: 0,
  fontSize: '34px',
  fontWeight: '900',
  lineHeight: 1.1,
};

const heroMeta = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
  marginTop: '16px',
};

const metaChip = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '7px',
  padding: '10px 12px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.1)',
  fontSize: '13px',
  fontWeight: '700',
};

const vinBox = {
  marginTop: '16px',
  fontSize: '13px',
  color: '#cbd5e1',
  fontFamily: 'monospace',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '14px',
  padding: '12px 14px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const statsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '12px',
};

const statCard = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '18px',
  padding: '18px',
  minHeight: '92px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
};

const statValue = {
  fontSize: '28px',
  fontWeight: '900',
  lineHeight: 1,
};

const statLabel = {
  fontSize: '12px',
  color: '#cbd5e1',
  fontWeight: '800',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const contentGrid = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 0.95fr) minmax(0, 1.05fr)',
  gap: '24px',
};

const leftCol = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
};

const rightCol = {
  display: 'flex',
  flexDirection: 'column',
};

const card = {
  background: '#fff',
  border: `1px solid ${COLORS.border}`,
  borderRadius: '22px',
  padding: '20px',
  boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
};

const cardHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '16px',
};

const cardTitleWrap = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  color: COLORS.dark,
};

const cardTitle = {
  margin: 0,
  fontSize: '17px',
  fontWeight: '900',
};

const mainImage = {
  width: '100%',
  height: '380px',
  objectFit: 'cover',
  borderRadius: '18px',
  border: `1px solid ${COLORS.border}`,
  backgroundColor: '#fff',
};

const imagePlaceholder = {
  height: '380px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '18px',
  background: '#f8fafc',
  border: `1px solid ${COLORS.border}`,
  color: '#94a3b8',
  fontWeight: '800',
};

const thumbGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(92px, 1fr))',
  gap: '10px',
  marginTop: '14px',
};

const thumbImage = {
  width: '100%',
  height: '82px',
  objectFit: 'cover',
  borderRadius: '12px',
  cursor: 'pointer',
};

const infoGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '14px',
};

const infoItem = {
  padding: '14px',
  borderRadius: '16px',
  background: '#f8fafc',
  border: `1px solid ${COLORS.border}`,
};

const infoLabel = {
  fontSize: '12px',
  fontWeight: '800',
  color: '#94a3b8',
  textTransform: 'uppercase',
  marginBottom: '8px',
};

const infoValue = {
  fontSize: '14px',
  fontWeight: '800',
  color: COLORS.dark,
  wordBreak: 'break-word',
};

const partsCard = {
  background: '#fff',
  border: `1px solid ${COLORS.border}`,
  borderRadius: '22px',
  padding: '20px',
  boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
  height: '100%',
};

const partsHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
  flexWrap: 'wrap',
  marginBottom: '18px',
};

const partsEyebrow = {
  fontSize: '12px',
  fontWeight: '900',
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: '6px',
};

const partsTitle = {
  margin: 0,
  fontSize: '24px',
  fontWeight: '900',
  color: COLORS.dark,
};

const searchWrap = {
  position: 'relative',
  width: '360px',
  maxWidth: '100%',
};

const searchIcon = {
  position: 'absolute',
  left: '14px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#94a3b8',
};

const searchInput = {
  width: '100%',
  padding: '13px 14px 13px 40px',
  borderRadius: '14px',
  border: `1px solid ${COLORS.border}`,
  outline: 'none',
  boxSizing: 'border-box',
  fontSize: '14px',
  background: '#fff',
};

const partsList = {
  display: 'grid',
  gap: '12px',
};

const partRow = {
  backgroundColor: '#fff',
  border: `1px solid ${COLORS.border}`,
  padding: '16px',
  borderRadius: '18px',
  display: 'grid',
  gridTemplateColumns: 'auto minmax(0, 1fr) auto',
  gap: '14px',
  alignItems: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const statusPill = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: '800',
  whiteSpace: 'nowrap',
};

const statusDot = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  flexShrink: 0,
};

const partMain = {
  minWidth: 0,
};

const partName = {
  fontSize: '15px',
  fontWeight: '900',
  color: COLORS.dark,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const partMeta = {
  fontSize: '12px',
  color: COLORS.muted,
  marginTop: '5px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const partSide = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
};

const priceTag = {
  fontSize: '16px',
  fontWeight: '900',
  color: COLORS.dark,
  whiteSpace: 'nowrap',
};

const emptyBox = {
  background: '#fff',
  border: `1px dashed ${COLORS.border}`,
  borderRadius: '16px',
  padding: '28px',
  textAlign: 'center',
  color: '#64748b',
  fontWeight: '700',
};

const loadingBox = {
  background: '#fff',
  border: `1px solid ${COLORS.border}`,
  borderRadius: '16px',
  padding: '24px',
  color: '#64748b',
  fontWeight: '700',
  textAlign: 'center',
};

const notFoundBox = {
  background: '#fff',
  border: `1px solid ${COLORS.border}`,
  borderRadius: '16px',
  padding: '24px',
  color: '#64748b',
  fontWeight: '700',
  textAlign: 'center',
};
