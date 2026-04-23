import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  MapPin,
  Truck,
  DollarSign,
  ClipboardList,
  AlertCircle,
  Edit2,
  Tag,
  Layers,
  Package,
  Calendar,
  Trash2,
  Boxes,
} from 'lucide-react';

const API_URL = 'https://yaris-autocare-production.up.railway.app';

const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  return `${API_URL}${imageUrl}`;
};

const COLORS = {
  primary: '#ef4444',
  dark: '#0f172a',
  text: '#1e293b',
  muted: '#64748b',
  soft: '#94a3b8',
  border: '#e2e8f0',
  borderSoft: '#eef2f7',
  bg: '#f8fafc',
  white: '#ffffff',
  success: '#166534',
  successBg: '#dcfce7',
  warning: '#92400e',
  warningBg: '#fef3c7',
  danger: '#991b1b',
  dangerBg: '#fee2e2',
};

const AftermarketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/aftermarket/${id}/`);
        setProduct(response.data);

        if (response.data?.images?.length) {
          const main =
            response.data.images.find((img) => img.is_main) ||
            response.data.images[0];
          setSelectedImage(main);
        }
      } catch (error) {
        console.error('Failed to load product:', error);
        alert('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const stockState = useMemo(() => {
    if (!product) return null;
    const qty = Number(product.quantity) || 0;
    const min = Number(product.min_stock_level) || 0;

    if (qty <= 0) {
      return { label: 'Out of Stock', color: COLORS.danger, bg: COLORS.dangerBg };
    }
    if (qty <= min) {
      return { label: 'Low Stock', color: COLORS.warning, bg: COLORS.warningBg };
    }
    return {
      label: product.status || 'Available',
      color: COLORS.success,
      bg: COLORS.successBg,
    };
  }, [product]);

  const handleDelete = async () => {
    if (!product?.id) return;

    const confirmed = window.confirm(
      `Delete this product?\n\n${product.part_name || 'Unnamed Product'}`
    );
    if (!confirmed) return;

    try {
      setDeleting(true);
      await axios.delete(`${API_URL}/api/aftermarket/${product.id}/`);
      alert('Product deleted successfully.');
      navigate('/aftermarket');
    } catch (error) {
      console.error('Failed to delete product:', error?.response?.data || error);
      alert('Delete failed. Check backend delete endpoint/permissions.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div style={loadingStyle}>Loading product details...</div>;
  }

  if (!product) {
    return <div style={loadingStyle}>Product not found.</div>;
  }

  return (
    <div style={pageStyle}>
      <div style={topBar}>
        <button onClick={() => navigate('/aftermarket')} style={backBtn}>
          <ArrowLeft size={15} />
          BACK TO INVENTORY
        </button>

        <div style={topActions}>
          <button onClick={() => navigate(`/aftermarket/edit/${id}`)} style={editBtn}>
            <Edit2 size={14} />
            Edit
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              ...deleteBtn,
              opacity: deleting ? 0.7 : 1,
              cursor: deleting ? 'not-allowed' : 'pointer',
            }}
          >
            <Trash2 size={14} />
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <div style={heroCard}>
        <div style={heroLeft}>
          <div style={eyebrow}>AFTERMARKET PRODUCT</div>
          <div style={titleRow}>
            <h1 style={productTitle}>{product.part_name}</h1>
            <div style={priceTag}>${Number(product.sale_price || 0).toFixed(2)}</div>
          </div>

          <div style={metaRow}>
            <span style={metaMono}>SKU: {product.sku || '-'}</span>
            <span style={dot}>•</span>
            <span style={metaMono}>LABEL: {product.label_id || '-'}</span>
          </div>

          <div style={chipRow}>
            <StatusChip
              label={stockState?.label || '-'}
              bg={stockState?.bg}
              color={stockState?.color}
            />
            <MiniChip icon={<Boxes size={13} />} text={`${product.quantity ?? 0} in stock`} />
            <MiniChip icon={<Layers size={13} />} text={product.category || 'No category'} />
            <MiniChip icon={<MapPin size={13} />} text={product.location || 'No location'} />
          </div>
        </div>
      </div>

      <div style={statsGrid}>
        <StatCard label="Supplier" value={product.supplier || '-'} icon={<Truck size={14} />} />
        <StatCard
          label="Cost Price"
          value={`$${Number(product.cost_price || 0).toFixed(2)}`}
          icon={<DollarSign size={14} />}
        />
        <StatCard
          label="Min Stock"
          value={String(product.min_stock_level ?? 0)}
          icon={<AlertCircle size={14} />}
        />
        <StatCard
          label="Created"
          value={product.created_at ? new Date(product.created_at).toLocaleDateString() : '-'}
          icon={<Calendar size={14} />}
        />
      </div>

      <div style={mainGrid}>
        <div style={leftCol}>
          <SectionCard title="Photo Gallery" icon={<Package size={15} />}>
            <div style={mainImageCard}>
              {selectedImage?.image ? (
                <img
                  src={resolveImageUrl(selectedImage.image)}
                  alt={product.part_name}
                  style={mainImageStyle}
                />
              ) : (
                <div style={emptyMedia}>
                  <Package size={42} />
                  <div style={{ marginTop: '10px' }}>No product image</div>
                </div>
              )}
            </div>

            {Array.isArray(product.images) && product.images.length > 0 && (
              <div style={thumbStrip}>
                {product.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img)}
                    style={{
                      ...thumbBtn,
                      border:
                        selectedImage?.id === img.id
                          ? `2px solid ${COLORS.primary}`
                          : `1px solid ${COLORS.border}`,
                    }}
                  >
                    <img
                      src={resolveImageUrl(img.image)}
                      alt="thumb"
                      style={thumbImage}
                    />
                  </button>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Description" icon={<ClipboardList size={15} />}>
            <div style={descriptionStyle}>
              {product.description || 'No description available for this product.'}
            </div>
          </SectionCard>
        </div>

        <div style={rightCol}>
          <SectionCard title="Product Information" icon={<Tag size={15} />}>
            <InfoRow label="Category" value={product.category || '-'} />
            <InfoRow label="Supplier" value={product.supplier || '-'} />
            <InfoRow label="Location" value={product.location || '-'} />
            <InfoRow label="Status" value={product.status || '-'} />
            <InfoRow label="Quantity" value={String(product.quantity ?? 0)} />
            <InfoRow label="Minimum Stock" value={String(product.min_stock_level ?? 0)} />
          </SectionCard>

          <SectionCard title="Pricing" icon={<DollarSign size={15} />}>
            <InfoRow
              label="Cost Price"
              value={`$${Number(product.cost_price || 0).toFixed(2)}`}
            />
            <InfoRow
              label="Sale Price"
              value={`$${Number(product.sale_price || 0).toFixed(2)}`}
            />
          </SectionCard>

          <SectionCard title="System Info" icon={<Calendar size={15} />}>
            <InfoRow label="SKU" value={product.sku || '-'} mono />
            <InfoRow label="Label ID" value={product.label_id || '-'} mono />
            <InfoRow
              label="Created"
              value={product.created_at ? new Date(product.created_at).toLocaleString() : '-'}
            />
            <InfoRow
              label="Updated"
              value={product.updated_at ? new Date(product.updated_at).toLocaleString() : '-'}
            />
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

const SectionCard = ({ title, icon, children }) => (
  <div style={cardStyle}>
    <div style={sectionHeader}>
      <div style={sectionTitle}>
        {icon}
        <span>{title}</span>
      </div>
    </div>
    <div style={sectionBody}>{children}</div>
  </div>
);

const InfoRow = ({ label, value, mono = false }) => (
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

const MiniChip = ({ icon, text }) => (
  <div style={miniChip}>
    {icon}
    <span>{text}</span>
  </div>
);

const StatusChip = ({ label, bg, color }) => (
  <div
    style={{
      ...miniChip,
      background: bg || '#f8fafc',
      color: color || COLORS.text,
      border: 'none',
    }}
  >
    <span>{label}</span>
  </div>
);

const StatCard = ({ label, value, icon }) => (
  <div style={statCard}>
    <div style={statTop}>
      {icon}
      <span>{label}</span>
    </div>
    <div style={statValue}>{value || '-'}</div>
  </div>
);

const pageStyle = {
  padding: '22px',
  maxWidth: '1280px',
  margin: '0 auto',
  backgroundColor: COLORS.bg,
  minHeight: '100vh',
};

const topBar = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '14px',
  flexWrap: 'wrap',
};

const topActions = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
};

const backBtn = {
  background: 'none',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: COLORS.muted,
  cursor: 'pointer',
  fontWeight: '700',
  fontSize: '12px',
  letterSpacing: '0.04em',
};

const editBtn = {
  backgroundColor: COLORS.dark,
  color: '#fff',
  border: 'none',
  padding: '9px 12px',
  borderRadius: '10px',
  fontWeight: '700',
  fontSize: '12px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
};

const deleteBtn = {
  backgroundColor: '#fff5f5',
  color: '#dc2626',
  border: '1px solid #fecaca',
  padding: '9px 12px',
  borderRadius: '10px',
  fontWeight: '700',
  fontSize: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
};

const heroCard = {
  background: 'linear-gradient(135deg, #ffffff 0%, #fbfcfe 100%)',
  border: `1px solid ${COLORS.border}`,
  borderRadius: '18px',
  padding: '18px',
  marginBottom: '12px',
};

const heroLeft = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
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

const productTitle = {
  margin: 0,
  fontSize: '28px',
  fontWeight: '800',
  color: COLORS.dark,
  letterSpacing: '-0.03em',
  lineHeight: 1.1,
};

const priceTag = {
  padding: '8px 12px',
  borderRadius: '999px',
  background: '#f8fafc',
  border: `1px solid ${COLORS.border}`,
  color: COLORS.primary,
  fontWeight: '800',
  fontSize: '15px',
};

const metaRow = {
  display: 'flex',
  gap: '10px',
  alignItems: 'center',
  flexWrap: 'wrap',
};

const metaMono = {
  color: COLORS.muted,
  fontWeight: '600',
  fontSize: '12px',
  fontFamily: 'monospace',
};

const dot = {
  color: '#cbd5e1',
};

const chipRow = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
  marginTop: '2px',
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
  color: COLORS.text,
};

const statsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: '10px',
  marginBottom: '14px',
};

const statCard = {
  background: '#fff',
  border: `1px solid ${COLORS.border}`,
  borderRadius: '14px',
  padding: '12px 14px',
};

const statTop = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '11px',
  color: COLORS.soft,
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '8px',
};

const statValue = {
  fontSize: '15px',
  color: COLORS.text,
  fontWeight: '700',
};

const mainGrid = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.15fr) minmax(320px, 0.85fr)',
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

const cardStyle = {
  backgroundColor: '#fff',
  borderRadius: '18px',
  border: `1px solid ${COLORS.border}`,
  overflow: 'hidden',
};

const sectionHeader = {
  padding: '14px 16px',
  borderBottom: `1px solid ${COLORS.borderSoft}`,
  background: '#fcfdff',
};

const sectionTitle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '13px',
  fontWeight: '700',
  color: COLORS.dark,
};

const sectionBody = {
  padding: '16px',
};

const mainImageCard = {
  backgroundColor: '#fff',
  borderRadius: '14px',
  border: `1px solid ${COLORS.border}`,
  height: '400px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
};

const mainImageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const emptyMedia = {
  color: '#cbd5e1',
  textAlign: 'center',
  fontWeight: '600',
  fontSize: '13px',
};

const thumbStrip = {
  display: 'flex',
  gap: '10px',
  marginTop: '12px',
  flexWrap: 'wrap',
};

const thumbBtn = {
  width: '74px',
  height: '74px',
  borderRadius: '12px',
  overflow: 'hidden',
  cursor: 'pointer',
  backgroundColor: '#fff',
  padding: 0,
};

const thumbImage = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const descriptionStyle = {
  margin: 0,
  fontSize: '13px',
  color: '#475569',
  lineHeight: 1.7,
  fontWeight: '500',
};

const infoRow = {
  display: 'grid',
  gridTemplateColumns: '120px 1fr',
  gap: '12px',
  padding: '10px 0',
  borderBottom: `1px solid ${COLORS.borderSoft}`,
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
  color: COLORS.text,
  fontWeight: '600',
  wordBreak: 'break-word',
};

const loadingStyle = {
  padding: '40px',
  textAlign: 'center',
  color: COLORS.muted,
  fontWeight: '600',
};
