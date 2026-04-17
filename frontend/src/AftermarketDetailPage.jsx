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
  Calendar
} from 'lucide-react';

const API_URL = 'https://yaris-autocare-production.up.railway.app';

const COLORS = {
  primary: '#ef4444',
  primarySoft: '#fef2f2',
  dark: '#0f172a',
  border: '#e2e8f0',
  bg: '#f8fafc',
  slate: '#64748b',
  lightText: '#94a3b8'
};

const AftermarketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/aftermarket/${id}/`);
        setProduct(response.data);

        if (response.data?.images?.length) {
          const main = response.data.images.find((img) => img.is_main) || response.data.images[0];
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

    if (qty <= 0) return { label: 'Out of Stock', color: '#991b1b', bg: '#fee2e2' };
    if (qty <= min) return { label: 'Low Stock', color: '#92400e', bg: '#fef3c7' };
    return { label: product.status || 'Available', color: '#166534', bg: '#dcfce7' };
  }, [product]);

  if (loading) {
    return <div style={loadingStyle}>Loading product details...</div>;
  }

  if (!product) {
    return <div style={loadingStyle}>Product not found.</div>;
  }

  return (
    <div style={pageStyle}>
      <div style={headerRow}>
        <button onClick={() => navigate('/aftermarket')} style={backBtn}>
          <ArrowLeft size={18} />
          Back to Inventory
        </button>

        <button onClick={() => navigate(`/aftermarket/edit/${id}`)} style={editBtn}>
          <Edit2 size={16} />
          Edit Product
        </button>
      </div>

      <div style={mainGrid}>
        <div>
          <div style={mainImageCard}>
            {selectedImage?.image ? (
              <img
                src={selectedImage.image}
                alt={product.part_name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ color: '#cbd5e1', textAlign: 'center' }}>
                <Package size={64} />
                <p style={{ fontWeight: '700', marginTop: '10px' }}>No product image</p>
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
                        : `1px solid ${COLORS.border}`
                  }}
                >
                  <img
                    src={img.image}
                    alt="thumb"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </button>
              ))}
            </div>
          )}

          <div style={cardStyle}>
            <h3 style={sectionTitle}>
              <ClipboardList size={20} color={COLORS.primary} />
              Product Description
            </h3>
            <p style={descriptionStyle}>
              {product.description || 'No description available for this product.'}
            </p>
          </div>
        </div>

        <div>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={productTitle}>{product.part_name}</h1>
            <div style={chipRow}>
              <span style={chip}>SKU: {product.sku || '-'}</span>
              <span style={chip}>Label ID: {product.label_id || '-'}</span>
            </div>
          </div>

          <div style={infoGrid}>
            <DetailBox label="Category" value={product.category || '-'} icon={<Layers size={16} />} />
            <DetailBox label="Supplier" value={product.supplier || '-'} icon={<Truck size={16} />} />
            <DetailBox label="Location" value={product.location || '-'} icon={<MapPin size={16} />} />
            <DetailBox label="Status" value={product.status || '-'} icon={<Tag size={16} />} />
            <DetailBox
              label="Cost Price"
              value={`$${Number(product.cost_price || 0).toFixed(2)}`}
              icon={<DollarSign size={16} />}
            />
            <DetailBox
              label="Sale Price"
              value={`$${Number(product.sale_price || 0).toFixed(2)}`}
              icon={<DollarSign size={16} />}
            />
            <DetailBox
              label="Created"
              value={
                product.created_at
                  ? new Date(product.created_at).toLocaleDateString()
                  : '-'
              }
              icon={<Calendar size={16} />}
            />
            <DetailBox
              label="Minimum Stock"
              value={String(product.min_stock_level ?? 0)}
              icon={<AlertCircle size={16} />}
            />
          </div>

          <div style={stockCard}>
            <h4 style={stockLabel}>Current Stock</h4>
            <div style={stockValue}>{product.quantity ?? 0} Units</div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: stockState.bg,
                color: stockState.color,
                borderRadius: '999px',
                padding: '8px 12px',
                fontWeight: '800',
                fontSize: '13px'
              }}
            >
              <AlertCircle size={14} />
              {stockState.label}
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={sectionTitle}>Inventory Notes</h3>
            <div style={noteRow}>
              <div style={noteLabel}>Reorder Alert Level</div>
              <div style={noteValue}>{product.min_stock_level ?? 0}</div>
            </div>
            <div style={noteRow}>
              <div style={noteLabel}>Available Quantity</div>
              <div style={noteValue}>{product.quantity ?? 0}</div>
            </div>
            <div style={noteRow}>
              <div style={noteLabel}>Category</div>
              <div style={noteValue}>{product.category || '-'}</div>
            </div>
            <div style={noteRow}>
              <div style={noteLabel}>Supplier</div>
              <div style={noteValue}>{product.supplier || '-'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailBox = ({ label, value, icon }) => (
  <div style={detailBox}>
    <div style={detailLabel}>{label}</div>
    <div style={detailValue}>
      {React.cloneElement(icon, { color: COLORS.primary, size: 16 })}
      {value}
    </div>
  </div>
);

const pageStyle = {
  padding: '30px',
  maxWidth: '1300px',
  margin: '0 auto',
  backgroundColor: COLORS.bg,
  minHeight: '100vh'
};

const headerRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px'
};

const backBtn = {
  background: 'none',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: COLORS.slate,
  cursor: 'pointer',
  fontWeight: '800'
};

const editBtn = {
  backgroundColor: COLORS.dark,
  color: '#fff',
  border: 'none',
  padding: '11px 18px',
  borderRadius: '12px',
  fontWeight: '900',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const mainGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1.1fr',
  gap: '32px'
};

const mainImageCard = {
  backgroundColor: '#fff',
  borderRadius: '22px',
  border: `1px solid ${COLORS.border}`,
  height: '420px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '16px',
  overflow: 'hidden'
};

const thumbStrip = {
  display: 'flex',
  gap: '10px',
  marginBottom: '20px',
  flexWrap: 'wrap'
};

const thumbBtn = {
  width: '82px',
  height: '82px',
  borderRadius: '12px',
  overflow: 'hidden',
  cursor: 'pointer',
  backgroundColor: '#fff',
  padding: 0
};

const cardStyle = {
  backgroundColor: '#fff',
  padding: '24px',
  borderRadius: '20px',
  border: `1px solid ${COLORS.border}`
};

const sectionTitle = {
  margin: '0 0 14px 0',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '18px',
  fontWeight: '900',
  color: COLORS.dark
};

const descriptionStyle = {
  margin: 0,
  fontSize: '15px',
  color: '#475569',
  lineHeight: 1.7
};

const productTitle = {
  margin: 0,
  fontSize: '34px',
  fontWeight: '900',
  color: COLORS.dark,
  letterSpacing: '-0.8px'
};

const chipRow = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  marginTop: '12px'
};

const chip = {
  display: 'inline-block',
  backgroundColor: COLORS.primarySoft,
  color: COLORS.primary,
  padding: '7px 12px',
  borderRadius: '10px',
  fontWeight: '800',
  fontSize: '13px'
};

const infoGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '14px',
  marginBottom: '24px'
};

const detailBox = {
  padding: '18px',
  backgroundColor: '#fff',
  borderRadius: '16px',
  border: `1px solid ${COLORS.border}`
};

const detailLabel = {
  fontSize: '11px',
  fontWeight: '800',
  color: COLORS.slate,
  marginBottom: '8px',
  textTransform: 'uppercase'
};

const detailValue = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontWeight: '800',
  color: COLORS.dark,
  fontSize: '15px'
};

const stockCard = {
  backgroundColor: COLORS.dark,
  padding: '28px',
  borderRadius: '24px',
  color: '#fff',
  marginBottom: '24px',
  textAlign: 'center'
};

const stockLabel = {
  margin: 0,
  fontSize: '12px',
  color: COLORS.lightText,
  letterSpacing: '0.1em',
  textTransform: 'uppercase'
};

const stockValue = {
  fontSize: '40px',
  fontWeight: '900',
  margin: '10px 0 14px 0'
};

const noteRow = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '12px 0',
  borderBottom: `1px solid ${COLORS.border}`
};

const noteLabel = {
  fontSize: '14px',
  color: COLORS.slate,
  fontWeight: '700'
};

const noteValue = {
  fontSize: '14px',
  color: COLORS.dark,
  fontWeight: '800'
};

const loadingStyle = {
  padding: '40px',
  textAlign: 'center',
  color: COLORS.slate,
  fontWeight: '700'
};

export default AftermarketDetailPage;
