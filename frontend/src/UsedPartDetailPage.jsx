import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import api from './api';

export default function UsedPartDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [part, setPart] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div style={{ padding: 30 }}>Loading...</div>;
  }

  if (!part) {
    return <div style={{ padding: 30 }}>Used part not found</div>;
  }

  const mainImage =
    part.images?.find((img) => img.is_main)?.image ||
    part.images?.[0]?.image ||
    '';

  return (
    <div style={page}>
      <button onClick={() => navigate('/used-parts')} style={backBtn}>
        <ArrowLeft size={16} />
        BACK TO USED PARTS
      </button>

      <div style={heroCard}>
        <div style={heroLeft}>
          <div style={eyebrow}>USED PART DETAILS</div>
          <h1 style={title}>{part.part_name || 'Unnamed Part'}</h1>
          <div style={subtitle}>
            SKU: {part.sku || '-'} • Label: {part.label_id || '-'}
          </div>

          <div style={pillRow}>
            <Pill icon={<Tag size={14} />} text={`Status: ${part.sale_status || '-'}`} />
            <Pill icon={<Package size={14} />} text={`Qty: ${part.quantity ?? 0}`} />
            <Pill icon={<MapPin size={14} />} text={`Loc: ${part.location || '-'}`} />
          </div>
        </div>

        <div style={heroActions}>
          <Link to={`/used-parts/${id}/label`} style={secondaryBtn}>
            <QrCode size={16} />
            PRINT LABEL
          </Link>

          <Link to={`/used-parts/${id}/edit`} style={primaryBtn}>
            <Edit size={16} />
            EDIT PART
          </Link>
        </div>
      </div>

      <div style={grid}>
        <div style={leftCol}>
          <Card title="Main Photo" icon={<Camera size={16} />}>
            {mainImage ? (
              <img src={mainImage} alt={part.part_name} style={mainImageStyle} />
            ) : (
              <div style={emptyBox}>No image uploaded</div>
            )}
          </Card>

          <Card title="All Photos" icon={<Camera size={16} />}>
            {part.images && part.images.length > 0 ? (
              <div style={thumbGrid}>
                {part.images.map((img) => (
                  <img
                    key={img.id}
                    src={img.image}
                    alt="Used part"
                    style={thumb}
                  />
                ))}
              </div>
            ) : (
              <div style={emptyBox}>No photos available</div>
            )}
          </Card>

          <Card title="Description" icon={<FileText size={16} />}>
            <div style={textBlock}>{part.description || 'No description added.'}</div>
          </Card>

          <Card title="Condition Notes" icon={<Wrench size={16} />}>
            <div style={textBlock}>{part.condition_notes || 'No condition notes added.'}</div>
          </Card>

          <Card title="Public Notes" icon={<FileText size={16} />}>
            <div style={textBlock}>{part.public_notes || 'No public notes added.'}</div>
          </Card>

          <Card title="Internal Notes" icon={<FileText size={16} />}>
            <div style={textBlock}>{part.internal_notes || 'No internal notes added.'}</div>
          </Card>
        </div>

        <div style={rightCol}>
          <Card title="Part Information" icon={<Package size={16} />}>
            <InfoRow label="Part Name" value={part.part_name} />
            <InfoRow label="Part Number" value={part.part_number} />
            <InfoRow label="Category" value={part.category} />
            <InfoRow label="Subcategory" value={part.subcategory} />
            <InfoRow label="Make" value={part.make} />
            <InfoRow label="Model" value={part.model} />
            <InfoRow label="Variant" value={part.variant} />
            <InfoRow label="Year From" value={part.year_from} />
            <InfoRow label="Year To" value={part.year_to} />
          </Card>

          <Card title="Condition & Sale" icon={<Tag size={16} />}>
            <InfoRow label="Grade" value={part.grade} />
            <InfoRow label="Rating" value={part.rating} />
            <InfoRow label="Condition" value={part.condition} />
            <InfoRow label="Usage Type" value={part.usage_type} />
            <InfoRow label="Sale Status" value={part.sale_status} />
            <InfoRow label="Active" value={part.is_active ? 'Yes' : 'No'} />
          </Card>

          <Card title="Stock & Pricing" icon={<Package size={16} />}>
            <InfoRow label="Price" value={`$${part.price ?? 0}`} />
            <InfoRow label="Cost Price" value={`$${part.cost_price ?? 0}`} />
            <InfoRow label="Quantity" value={part.quantity} />
            <InfoRow label="Location" value={part.location} />
            <InfoRow label="Shelf Code" value={part.shelf_code} />
          </Card>

          <Card title="System Info" icon={<Calendar size={16} />}>
            <InfoRow label="SKU" value={part.sku} />
            <InfoRow label="Label ID" value={part.label_id} />
            <InfoRow label="QR Value" value={part.qr_code_value} />
            <InfoRow label="Created" value={formatDateTime(part.created_at)} />
            <InfoRow label="Updated" value={formatDateTime(part.updated_at)} />
            <InfoRow label="Sold At" value={formatDateTime(part.sold_at)} />
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ title, icon, children }) {
  return (
    <div style={card}>
      <div style={cardHeader}>
        <div style={cardTitle}>
          {icon}
          {title}
        </div>
      </div>
      <div style={cardBody}>{children}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={infoRow}>
      <div style={infoLabel}>{label}</div>
      <div style={infoValue}>{value || '-'}</div>
    </div>
  );
}

function Pill({ icon, text }) {
  return (
    <div style={pill}>
      {icon}
      {text}
    </div>
  );
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
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
};

const backBtn = {
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  fontWeight: '800',
  color: '#475569',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  width: 'fit-content',
};

const heroCard = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '20px',
  padding: '22px',
  display: 'flex',
  justifyContent: 'space-between',
  gap: '16px',
  flexWrap: 'wrap',
  alignItems: 'center',
};

const heroLeft = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const eyebrow = {
  fontSize: '12px',
  fontWeight: '900',
  color: '#94a3b8',
  textTransform: 'uppercase',
};

const title = {
  margin: 0,
  fontSize: '28px',
  fontWeight: '900',
  color: '#0f172a',
};

const subtitle = {
  color: '#64748b',
  fontWeight: '700',
};

const pillRow = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  marginTop: '6px',
};

const pill = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  border: '1px solid #e2e8f0',
  background: '#f8fafc',
  borderRadius: '999px',
  padding: '8px 12px',
  fontSize: '12px',
  fontWeight: '800',
  color: '#334155',
};

const heroActions = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
};

const primaryBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 16px',
  borderRadius: '12px',
  border: 'none',
  background: '#0f172a',
  color: '#fff',
  fontWeight: '800',
  textDecoration: 'none',
};

const secondaryBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 16px',
  borderRadius: '12px',
  border: '1px solid #cbd5e1',
  background: '#fff',
  color: '#0f172a',
  fontWeight: '800',
  textDecoration: 'none',
};

const grid = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.6fr) minmax(320px, 1fr)',
  gap: '20px',
};

const leftCol = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
};

const rightCol = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
};

const card = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '20px',
  overflow: 'hidden',
};

const cardHeader = {
  padding: '16px 20px',
  borderBottom: '1px solid #f1f5f9',
  background: '#fcfdfe',
};

const cardTitle = {
  fontSize: '14px',
  fontWeight: '900',
  color: '#0f172a',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const cardBody = {
  padding: '20px',
};

const mainImageStyle = {
  width: '100%',
  maxHeight: '420px',
  objectFit: 'cover',
  borderRadius: '16px',
  display: 'block',
};

const thumbGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
  gap: '12px',
};

const thumb = {
  width: '100%',
  height: '120px',
  objectFit: 'cover',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
};

const emptyBox = {
  padding: '20px',
  borderRadius: '14px',
  background: '#f8fafc',
  color: '#64748b',
  fontWeight: '700',
  textAlign: 'center',
};

const textBlock = {
  whiteSpace: 'pre-wrap',
  color: '#334155',
  lineHeight: 1.6,
  fontWeight: '600',
};

const infoRow = {
  display: 'grid',
  gridTemplateColumns: '140px 1fr',
  gap: '12px',
  padding: '10px 0',
  borderBottom: '1px solid #f1f5f9',
};

const infoLabel = {
  fontSize: '12px',
  fontWeight: '800',
  color: '#64748b',
  textTransform: 'uppercase',
};

const infoValue = {
  fontSize: '14px',
  fontWeight: '700',
  color: '#0f172a',
  wordBreak: 'break-word',
};
