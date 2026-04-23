import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Tag,
  MapPin,
  Package,
  Calendar,
  Wrench,
  FileText,
  Camera,
  QrCode,
  DollarSign,
  Car,
  Boxes,
} from 'lucide-react';
import api from './api';

const COLORS = {
  bg: '#f6f8fb',
  card: '#ffffff',
  border: '#e8edf3',
  text: '#0f172a',
  muted: '#64748b',
  soft: '#94a3b8',
  red: '#ef4444',
  dark: '#111827',
  green: '#16a34a',
  amber: '#d97706',
  blue: '#2563eb',
};

export default function UsedPartDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [part, setPart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    fetchPart();
  }, [id]);

  const fetchPart = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/used-parts/${id}/`);
      setPart(res.data);
    } catch (err) {
      console.error(err);
      alert('Error loading used part');
    } finally {
      setLoading(false);
    }
  };

  const images = useMemo(() => {
    if (!part?.images?.length) return [];
    return part.images.map((img) => img.image).filter(Boolean);
  }, [part]);

  useEffect(() => {
    if (images.length > 0) {
      setActiveImage(images[0]);
    } else {
      setActiveImage('');
    }
  }, [images]);

  const mainImage =
    activeImage ||
    part?.images?.find((img) => img.is_main)?.image ||
    part?.images?.[0]?.image ||
    '';

  const fitmentText = [part?.make, part?.model, part?.variant].filter(Boolean).join(' ') || '-';
  const yearText =
    part?.year_from || part?.year_to
      ? `${part?.year_from || ''}${part?.year_to ? ` - ${part.year_to}` : ''}`
      : '-';

  if (loading) {
    return (
      <div style={page}>
        <div style={loadingCard}>Loading used part...</div>
      </div>
    );
  }

  if (!part) {
    return (
      <div style={page}>
        <div style={loadingCard}>Used part not found</div>
      </div>
    );
  }

  return (
    <div style={page}>
      <button onClick={() => navigate('/used-parts')} style={backBtn}>
        <ArrowLeft size={15} />
        BACK TO USED PARTS
      </button>

      <div style={heroCard}>
        <div style={heroLeft}>
          <div style={eyebrow}>USED PART PROFILE</div>

          <div style={titleRow}>
            <h1 style={title}>{part.part_name || 'Unnamed Part'}</h1>
            <div style={priceTag}>${Number(part.price || 0).toFixed(2)}</div>
          </div>

          <div style={subtitleRow}>
            <span style={monoMeta}>SKU: {part.sku || '-'}</span>
            <span style={dividerDot}>•</span>
            <span style={monoMeta}>LABEL: {part.label_id || '-'}</span>
          </div>

          <div style={chipRow}>
            <StatusChip label={part.sale_status || '-'} />
            <MiniChip icon={<Boxes size={13} />} text={`Qty ${part.quantity ?? 0}`} />
            <MiniChip icon={<MapPin size={13} />} text={part.location || 'No location'} />
            <MiniChip icon={<Car size={13} />} text={fitmentText} />
          </div>
        </div>

        <div style={heroActions}>
          <Link to={`/used-parts/${id}/label`} style={ghostBtn}>
            <QrCode size={15} />
            PRINT LABEL
          </Link>

          <Link to={`/used-parts/${id}/edit`} style={primaryBtn}>
            <Edit size={15} />
            EDIT PART
          </Link>
        </div>
      </div>

      <div style={statsGrid}>
        <StatCard label="Category" value={part.category || '-'} />
        <StatCard label="Grade" value={part.grade || '-'} />
        <StatCard label="Condition" value={part.condition || '-'} />
        <StatCard label="Usage" value={part.usage_type || '-'} />
      </div>

      <div style={contentGrid}>
        <div style={leftCol}>
          <SectionCard title="Photo Gallery" icon={<Camera size={15} />}>
            {mainImage ? (
              <>
                <img src={mainImage} alt={part.part_name} style={mainImageStyle} />

                {images.length > 1 && (
                  <div style={thumbGrid}>
                    {images.map((img, index) => (
                      <img
                        key={`${img}-${index}`}
                        src={img}
                        alt={`Part ${index + 1}`}
                        onClick={() => setActiveImage(img)}
                        style={{
                          ...thumb,
                          border:
                            activeImage === img
                              ? `2px solid ${COLORS.red}`
                              : `1px solid ${COLORS.border}`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <EmptyState text="No images uploaded" />
            )}
          </SectionCard>

          <SectionCard title="Description" icon={<FileText size={15} />}>
            <TextBlock text={part.description || 'No description added.'} />
          </SectionCard>

          <div style={doubleTextGrid}>
            <SectionCard title="Condition Notes" icon={<Wrench size={15} />}>
              <TextBlock text={part.condition_notes || 'No condition notes added.'} />
            </SectionCard>

            <SectionCard title="Public Notes" icon={<FileText size={15} />}>
              <TextBlock text={part.public_notes || 'No public notes added.'} />
            </SectionCard>
          </div>

          <SectionCard title="Internal Notes" icon={<FileText size={15} />}>
            <TextBlock text={part.internal_notes || 'No internal notes added.'} />
          </SectionCard>
        </div>

        <div style={rightCol}>
          <SectionCard title="Part Information" icon={<Package size={15} />}>
            <InfoRow label="Part Name" value={part.part_name} />
            <InfoRow label="Part Number" value={part.part_number} />
            <InfoRow label="Category" value={part.category} />
            <InfoRow label="Subcategory" value={part.subcategory} />
            <InfoRow label="Fitment" value={fitmentText} />
            <InfoRow label="Years" value={yearText} />
          </SectionCard>

          <SectionCard title="Stock & Pricing" icon={<DollarSign size={15} />}>
            <InfoRow label="Price" value={`$${part.price ?? 0}`} />
            <InfoRow label="Cost Price" value={`$${part.cost_price ?? 0}`} />
            <InfoRow label="Quantity" value={part.quantity} />
            <InfoRow label="Location" value={part.location} />
            <InfoRow label="Shelf Code" value={part.shelf_code} />
          </SectionCard>

          <SectionCard title="Condition & Sale" icon={<Tag size={15} />}>
            <InfoRow label="Grade" value={part.grade} />
            <InfoRow label="Rating" value={part.rating} />
            <InfoRow label="Condition" value={part.condition} />
            <InfoRow label="Usage Type" value={part.usage_type} />
            <InfoRow label="Sale Status" value={part.sale_status} />
            <InfoRow label="Active" value={part.is_active ? 'Yes' : 'No'} />
          </SectionCard>

          <SectionCard title="System Info" icon={<Calendar size={15} />}>
            <InfoRow label="SKU" value={part.sku} mono />
            <InfoRow label="Label ID" value={part.label_id} mono />
            <InfoRow label="QR Value" value={part.qr_code_value} mono />
            <InfoRow label="Created" value={formatDateTime(part.created_at)} />
            <InfoRow label="Updated" value={formatDateTime(part.updated_at)} />
            <InfoRow label="Sold At" value={formatDateTime(part.sold_at)} />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, icon, children }) {
  return (
    <div style={card}>
      <div style={cardHeader}>
        <div style={cardTitle}>
          {icon}
          <span>{title}</span>
        </div>
      </div>
      <div style={cardBody}>{children}</div>
    </div>
  );
}

function InfoRow({ label, value, mono = false }) {
  return (
    <div style={infoRow}>
      <div style={infoLabel}>{label}</div>
      <div
        style={{
          ...infoValue,
          fontFamily: mono ? 'monospace' : 'inherit',
        }}
      >
        {value || '-'}
      </div>
    </div>
  );
}

function MiniChip({ icon, text }) {
  return (
    <div style={miniChip}>
      {icon}
      <span>{text}</span>
    </div>
  );
}

function StatusChip({ label }) {
  const styles = getStatusStyle(label);

  return (
    <div style={{ ...miniChip, ...styles }}>
      <span>{label}</span>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={statCard}>
      <div style={statLabel}>{label}</div>
      <div style={statValue}>{value || '-'}</div>
    </div>
  );
}

function TextBlock({ text }) {
  return <div style={textBlock}>{text}</div>;
}

function EmptyState({ text }) {
  return <div style={emptyBox}>{text}</div>;
}

function getStatusStyle(status) {
  switch (status) {
    case 'AVAILABLE':
      return { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' };
    case 'SOLD':
      return { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' };
    case 'RESERVED':
      return { background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' };
    case 'HOLD':
      return { background: '#ede9fe', color: '#6d28d9', border: '1px solid #ddd6fe' };
    case 'DAMAGED':
      return { background: '#e5e7eb', color: '#374151', border: '1px solid #d1d5db' };
    default:
      return { background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' };
  }
}

function formatDateTime(value) {
  if (!value) return '-';

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

const page = {
  padding: '22px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  background: COLORS.bg,
  minHeight: '100%',
};

const backBtn = {
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  fontWeight: '700',
  fontSize: '12px',
  color: COLORS.muted,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  width: 'fit-content',
  letterSpacing: '0.03em',
};

const heroCard = {
  background: 'linear-gradient(135deg, #ffffff 0%, #fbfcfe 100%)',
  border: `1px solid ${COLORS.border}`,
  borderRadius: '18px',
  padding: '18px 20px',
  display: 'flex',
  justifyContent: 'space-between',
  gap: '18px',
  flexWrap: 'wrap',
  alignItems: 'center',
  boxShadow: '0 8px 28px rgba(15, 23, 42, 0.04)',
};

const heroLeft = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  minWidth: 0,
};

const eyebrow = {
  fontSize: '11px',
  fontWeight: '700',
  color: COLORS.soft,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

const titleRow = {
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
  flexWrap: 'wrap',
};

const title = {
  margin: 0,
  fontSize: '26px',
  fontWeight: '800',
  color: COLORS.text,
  lineHeight: 1.1,
  letterSpacing: '-0.03em',
};

const priceTag = {
  padding: '8px 12px',
  borderRadius: '999px',
  background: '#f8fafc',
  border: `1px solid ${COLORS.border}`,
  color: COLORS.green,
  fontWeight: '800',
  fontSize: '15px',
};

const subtitleRow = {
  display: 'flex',
  gap: '10px',
  alignItems: 'center',
  flexWrap: 'wrap',
};

const monoMeta = {
  color: COLORS.muted,
  fontWeight: '600',
  fontSize: '12px',
  fontFamily: 'monospace',
};

const dividerDot = {
  color: '#cbd5e1',
  fontSize: '12px',
};

const chipRow = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
  marginTop: '4px',
};

const miniChip = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  border: `1px solid ${COLORS.border}`,
  background: '#fff',
  borderRadius: '999px',
  padding: '7px 10px',
  fontSize: '12px',
  fontWeight: '600',
  color: '#334155',
};

const heroActions = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  alignItems: 'center',
};

const primaryBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 14px',
  borderRadius: '12px',
  border: 'none',
  background: COLORS.dark,
  color: '#fff',
  fontWeight: '700',
  fontSize: '13px',
  textDecoration: 'none',
};

const ghostBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 14px',
  borderRadius: '12px',
  border: `1px solid ${COLORS.border}`,
  background: '#fff',
  color: COLORS.text,
  fontWeight: '700',
  fontSize: '13px',
  textDecoration: 'none',
};

const statsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '10px',
};

const statCard = {
  background: '#fff',
  border: `1px solid ${COLORS.border}`,
  borderRadius: '14px',
  padding: '14px',
};

const statLabel = {
  fontSize: '11px',
  fontWeight: '700',
  color: COLORS.soft,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '6px',
};

const statValue = {
  fontSize: '15px',
  fontWeight: '700',
  color: COLORS.text,
};

const contentGrid = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.45fr) minmax(320px, 0.95fr)',
  gap: '16px',
};

const leftCol = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const rightCol = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const doubleTextGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '16px',
};

const card = {
  background: COLORS.card,
  border: `1px solid ${COLORS.border}`,
  borderRadius: '18px',
  overflow: 'hidden',
  boxShadow: '0 4px 18px rgba(15, 23, 42, 0.03)',
};

const cardHeader = {
  padding: '14px 16px',
  borderBottom: '1px solid #f1f5f9',
  background: '#fcfdff',
};

const cardTitle = {
  fontSize: '13px',
  fontWeight: '700',
  color: COLORS.text,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const cardBody = {
  padding: '16px',
};

const mainImageStyle = {
  width: '100%',
  maxHeight: '430px',
  objectFit: 'cover',
  borderRadius: '14px',
  display: 'block',
  border: `1px solid ${COLORS.border}`,
};

const thumbGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
  gap: '10px',
  marginTop: '12px',
};

const thumb = {
  width: '100%',
  height: '74px',
  objectFit: 'cover',
  borderRadius: '10px',
  cursor: 'pointer',
};

const emptyBox = {
  padding: '18px',
  borderRadius: '12px',
  background: '#f8fafc',
  color: COLORS.muted,
  fontWeight: '600',
  textAlign: 'center',
  fontSize: '13px',
};

const textBlock = {
  whiteSpace: 'pre-wrap',
  color: '#334155',
  lineHeight: 1.65,
  fontWeight: '500',
  fontSize: '13px',
};

const infoRow = {
  display: 'grid',
  gridTemplateColumns: '118px 1fr',
  gap: '12px',
  padding: '9px 0',
  borderBottom: '1px solid #f1f5f9',
};

const infoLabel = {
  fontSize: '11px',
  fontWeight: '700',
  color: COLORS.soft,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const infoValue = {
  fontSize: '13px',
  fontWeight: '600',
  color: COLORS.text,
  wordBreak: 'break-word',
};

const loadingCard = {
  background: '#fff',
  border: `1px solid ${COLORS.border}`,
  borderRadius: '16px',
  padding: '24px',
  color: COLORS.muted,
  fontWeight: '600',
};
