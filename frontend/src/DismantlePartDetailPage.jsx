import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Package,
  Tag,
  DollarSign,
  ClipboardList,
  Car,
  Boxes,
} from 'lucide-react';

const API_URL = 'https://yaris-autocare-production.up.railway.app';

const STATUS_COLORS = {
  Available: '#22c55e',
  Sold: '#ef4444',
  Internal: '#3b82f6',
};

export default function DismantlePartDetailPage() {
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
      const res = await axios.get(`${API_URL}/api/used-parts/${id}/`);
      setPart(res.data);
    } catch (err) {
      console.error('Failed to fetch dismantle part detail:', err);
      setPart(null);
    } finally {
      setLoading(false);
    }
  };

  const galleryImages = useMemo(() => {
    if (!part) return [];

    const images = [];

    if (part.main_photo) {
      images.push(part.main_photo);
    }

    if (Array.isArray(part.images)) {
      part.images.forEach((img) => {
        if (!img) return;
        if (typeof img === 'string') {
          images.push(img);
        } else if (img.image) {
          images.push(img.image);
        } else if (img.url) {
          images.push(img.url);
        }
      });
    }

    return [...new Set(images.filter(Boolean))];
  }, [part]);

  useEffect(() => {
    if (galleryImages.length > 0) {
      setActiveImage(galleryImages[0]);
    } else {
      setActiveImage('');
    }
  }, [galleryImages]);

  if (loading) {
    return (
      <div style={{ padding: '40px' }}>
        <div style={loadingBox}>Loading dismantle part details...</div>
      </div>
    );
  }

  if (!part) {
    return (
      <div style={{ padding: '40px' }}>
        <button onClick={() => navigate(-1)} style={backBtn}>
          <ArrowLeft size={16} />
          BACK
        </button>

        <div style={notFoundBox}>Part not found.</div>
      </div>
    );
  }

  const statusColor = STATUS_COLORS[part.status] || STATUS_COLORS.Available;

  return (
    <div style={{ padding: '30px', animation: 'fadeIn 0.3s ease' }}>
      <button onClick={() => navigate(-1)} style={backBtn}>
        <ArrowLeft size={16} />
        BACK
      </button>

      <div style={heroCard}>
        <div style={{ minWidth: 0 }}>
          <div style={statusLine}>
            <span style={{ ...statusDot, backgroundColor: statusColor }} />
            <span style={statusText}>{part.status || 'Available'}</span>
          </div>

          <h1 style={title}>{part.part_name || 'Unnamed Part'}</h1>

          <div style={subtitle}>
            {part.category || 'No Category'} • {part.grading_display || part.grade || 'No Grade'}
          </div>
        </div>

        <div style={priceBadge}>${part.price || 0}</div>
      </div>

      <div style={layout}>
        <div style={leftCol}>
          <div style={card}>
            <div style={sectionTitle}>Part Images</div>

            {activeImage ? (
              <img
                src={activeImage}
                alt={part.part_name}
                style={mainImage}
              />
            ) : (
              <div style={imagePlaceholder}>No image available</div>
            )}

            {galleryImages.length > 1 && (
              <div style={thumbGrid}>
                {galleryImages.map((img, index) => (
                  <img
                    key={`${img}-${index}`}
                    src={img}
                    alt={`Part ${index + 1}`}
                    onClick={() => setActiveImage(img)}
                    style={{
                      ...thumbImage,
                      border:
                        activeImage === img
                          ? '2px solid #ef4444'
                          : '1px solid #e2e8f0',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={rightCol}>
          <div style={card}>
            <div style={sectionTitle}>Part Information</div>

            <InfoRow
              icon={<Tag size={16} />}
              label="Category"
              value={part.category}
            />
            <InfoRow
              icon={<ClipboardList size={16} />}
              label="Grade"
              value={part.grading_display || part.grade}
            />
            <InfoRow
              icon={<Package size={16} />}
              label="Condition"
              value={part.condition}
            />
            <InfoRow
              icon={<DollarSign size={16} />}
              label="Price"
              value={`$${part.price || 0}`}
            />
            <InfoRow
              icon={<Boxes size={16} />}
              label="Status"
              value={part.status || 'Available'}
            />
            <InfoRow
              icon={<Package size={16} />}
              label="Stock No"
              value={part.stock_number || part.part_number || 'N/A'}
            />
          </div>

          <div style={card}>
            <div style={sectionTitle}>Description</div>
            <div style={description}>
              {part.description || 'No description available.'}
            </div>
          </div>

          <div style={card}>
            <div style={sectionTitle}>Donor Vehicle</div>
            <InfoRow
              icon={<Car size={16} />}
              label="Vehicle"
              value={[
                part.year,
                part.make,
                part.model,
              ]
                .filter(Boolean)
                .join(' ') || 'N/A'}
            />
            <InfoRow
              icon={<Car size={16} />}
              label="VIN"
              value={part.vin || 'N/A'}
            />
            <InfoRow
              icon={<Car size={16} />}
              label="Color"
              value={part.color || 'N/A'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={row}>
      <div style={rowLeft}>
        {icon}
        <span>{label}</span>
      </div>
      <div style={rowRight}>{value || 'N/A'}</div>
    </div>
  );
}

const backBtn = {
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  fontWeight: '800',
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  color: '#475569',
};

const heroCard = {
  background: '#0f172a',
  color: '#fff',
  borderRadius: '22px',
  padding: '24px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '20px',
  flexWrap: 'wrap',
  marginBottom: '24px',
};

const statusLine = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '10px',
};

const statusDot = {
  width: '10px',
  height: '10px',
  borderRadius: '50%',
};

const statusText = {
  fontSize: '13px',
  fontWeight: '800',
  color: '#cbd5e1',
};

const title = {
  margin: 0,
  fontSize: '30px',
  fontWeight: '900',
};

const subtitle = {
  marginTop: '8px',
  color: '#cbd5e1',
  fontWeight: '600',
};

const priceBadge = {
  fontSize: '28px',
  fontWeight: '900',
  whiteSpace: 'nowrap',
};

const layout = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)',
  gap: '24px',
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

const card = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '18px',
  padding: '18px',
};

const sectionTitle = {
  marginBottom: '14px',
  fontSize: '16px',
  fontWeight: '900',
  color: '#0f172a',
};

const mainImage = {
  width: '100%',
  height: '420px',
  objectFit: 'cover',
  borderRadius: '14px',
  border: '1px solid #e2e8f0',
};

const imagePlaceholder = {
  height: '420px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '14px',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  color: '#94a3b8',
  fontWeight: '700',
};

const thumbGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
  gap: '10px',
  marginTop: '12px',
};

const thumbImage = {
  width: '100%',
  height: '82px',
  objectFit: 'cover',
  borderRadius: '10px',
  cursor: 'pointer',
};

const row = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
  padding: '12px 0',
  borderBottom: '1px solid #f1f5f9',
};

const rowLeft = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: '#475569',
  fontWeight: '700',
};

const rowRight = {
  color: '#0f172a',
  fontWeight: '800',
  textAlign: 'right',
  wordBreak: 'break-word',
};

const description = {
  color: '#475569',
  lineHeight: 1.6,
  fontSize: '14px',
};

const loadingBox = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '16px',
  padding: '24px',
  color: '#64748b',
  fontWeight: '700',
};

const notFoundBox = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '16px',
  padding: '24px',
  color: '#64748b',
  fontWeight: '700',
};
