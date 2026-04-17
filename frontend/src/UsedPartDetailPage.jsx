import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Camera,
  Save,
  Star,
  Package,
  MapPin,
  Tag,
  Car,
  FileText,
} from 'lucide-react';

const API_URL = 'https://yaris-autocare-production.up.railway.app';

const CATEGORY_OPTIONS = [
  'Engine',
  'Transmission',
  'Suspension',
  'Steering',
  'Brakes',
  'Electrical',
  'Lighting',
  'Interior',
  'Exterior',
  'Body Panels',
  'Cooling',
  'Fuel System',
  'Exhaust',
  'Wheels & Tyres',
  'Doors & Windows',
  'Mirrors',
  'AC & Heating',
  'Sensors',
  'ECU / Modules',
  'Accessories',
  'Other',
];

const GRADE_OPTIONS = ['A', 'B', 'C', 'D'];
const RATING_OPTIONS = ['Excellent', 'Good', 'Fair', 'Poor'];
const CONDITION_OPTIONS = [
  'New Old Stock',
  'Used Excellent',
  'Used Good',
  'Used Fair',
  'Reconditioned',
  'Damaged',
];
const USAGE_TYPE_OPTIONS = [
  { value: 'FOR_SALE', label: 'For Sale' },
  { value: 'INTERNAL_USE', label: 'Internal Use' },
];
const SALE_STATUS_OPTIONS = [
  'AVAILABLE',
  'RESERVED',
  'SOLD',
  'REMOVED',
  'DAMAGED',
  'HOLD',
];

export default function UsedPartDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [part, setPart] = useState(null);

  const [formData, setFormData] = useState({
    part_name: '',
    part_number: '',
    category: 'Other',
    subcategory: '',
    make: '',
    model: '',
    variant: '',
    year_from: '',
    year_to: '',
    description: '',
    grade: 'B',
    rating: '',
    condition: 'Used Good',
    condition_notes: '',
    usage_type: 'FOR_SALE',
    sale_status: 'AVAILABLE',
    price: '0',
    cost_price: '0',
    quantity: '1',
    location: '',
    shelf_code: '',
    public_notes: '',
    internal_notes: '',
    is_active: true,
  });

  useEffect(() => {
    fetchPart();
  }, [id]);

  const fetchPart = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/used-parts/${id}/`);
      setPart(res.data);

      setFormData({
        part_name: res.data.part_name || '',
        part_number: res.data.part_number || '',
        category: res.data.category || 'Other',
        subcategory: res.data.subcategory || '',
        make: res.data.make || '',
        model: res.data.model || '',
        variant: res.data.variant || '',
        year_from: res.data.year_from ?? '',
        year_to: res.data.year_to ?? '',
        description: res.data.description || '',
        grade: res.data.grade || 'B',
        rating: res.data.rating || '',
        condition: res.data.condition || 'Used Good',
        condition_notes: res.data.condition_notes || '',
        usage_type: res.data.usage_type || 'FOR_SALE',
        sale_status: res.data.sale_status || 'AVAILABLE',
        price: res.data.price ?? '0',
        cost_price: res.data.cost_price ?? '0',
        quantity: res.data.quantity ?? '1',
        location: res.data.location || '',
        shelf_code: res.data.shelf_code || '',
        public_notes: res.data.public_notes || '',
        internal_notes: res.data.internal_notes || '',
        is_active: res.data.is_active ?? true,
      });
    } catch (error) {
      console.error('Error fetching used part:', error);
      alert('Error loading used part');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          payload.append(key, value);
        }
      });

      const res = await axios.put(`${API_URL}/api/used-parts/${id}/`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setPart(res.data);
      alert('Used part updated successfully');
      fetchPart();
    } catch (error) {
      console.error('Error updating used part:', error);
      alert('Error updating used part');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadImages = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);

    try {
      const payload = new FormData();
      files.forEach((file) => payload.append('images', file));

      await axios.put(`${API_URL}/api/used-parts/${id}/`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await fetchPart();
      alert('Images uploaded successfully');
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Error uploading images');
    } finally {
      setUploading(false);
    }
  };

  const setMainImage = async (imageId) => {
    try {
      await axios.post(`${API_URL}/api/images/${imageId}/set-main/`);
      fetchPart();
    } catch (error) {
      console.error('Set main image error:', error);
      alert('Error setting main image');
    }
  };

  const getMainImage = () => {
    if (!part?.images?.length) return null;
    return part.images.find((img) => img.is_main)?.image || part.images[0]?.image || null;
  };

  const statusStyle = getStatusBadgeStyle(formData.sale_status);

  if (loading) {
    return <div style={page}>Loading used part...</div>;
  }

  if (!part) {
    return <div style={page}>Used part not found.</div>;
  }

  return (
    <div style={page}>
      <div style={topBar}>
        <button onClick={() => navigate('/used-parts')} style={backButton}>
          <ArrowLeft size={16} />
          BACK
        </button>
      </div>

      <div style={headerCard}>
        <div style={headerLeft}>
          <div style={heroImageWrap}>
            {getMainImage() ? (
              <img src={getMainImage()} alt={part.part_name} style={heroImage} />
            ) : (
              <div style={heroPlaceholder}>
                <Package size={32} />
              </div>
            )}
          </div>

          <div style={headerInfo}>
            <h1 style={title}>{part.part_name}</h1>

            <div style={badgesRow}>
              <span style={categoryBadge}>{part.category || 'Other'}</span>
              <span style={statusStyle}>{part.sale_status || 'AVAILABLE'}</span>
            </div>

            <div style={metaList}>
              <div style={metaItem}>
                <Tag size={14} />
                <span>SKU: {part.sku || '-'}</span>
              </div>
              <div style={metaItem}>
                <FileText size={14} />
                <span>Label: {part.label_id || '-'}</span>
              </div>
              {part.location && (
                <div style={metaItem}>
                  <MapPin size={14} />
                  <span>Location: {part.location}</span>
                </div>
              )}
              {(part.make || part.model) && (
                <div style={metaItem}>
                  <Car size={14} />
                  <span>{[part.make, part.model, part.variant].filter(Boolean).join(' ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} style={contentGrid}>
        <div style={leftColumn}>
          <Section title="Photos">
            <label style={uploadBox}>
              <Camera size={24} />
              <span>{uploading ? 'UPLOADING...' : 'Upload More Photos'}</span>
              <input type="file" multiple hidden onChange={handleUploadImages} />
            </label>

            <div style={photoGrid}>
              {part.images && part.images.length > 0 ? (
                part.images.map((img) => (
                  <div key={img.id} style={photoCard}>
                    <img src={img.image} alt="Part" style={photoImage} />
                    <button
                      type="button"
                      onClick={() => setMainImage(img.id)}
                      style={img.is_main ? mainImageBtnActive : mainImageBtn}
                    >
                      <Star size={14} fill={img.is_main ? 'gold' : 'none'} />
                    </button>
                  </div>
                ))
              ) : (
                <div style={emptyPhoto}>No photos uploaded</div>
              )}
            </div>
          </Section>

          <Section title="Basic Information">
            <div style={grid2}>
              <Field label="Part Name *">
                <input
                  value={formData.part_name}
                  onChange={(e) => handleChange('part_name', e.target.value)}
                  style={input}
                  required
                />
              </Field>

              <Field label="Part Number">
                <input
                  value={formData.part_number}
                  onChange={(e) => handleChange('part_number', e.target.value)}
                  style={input}
                />
              </Field>

              <Field label="Category">
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  style={input}
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Subcategory">
                <input
                  value={formData.subcategory}
                  onChange={(e) => handleChange('subcategory', e.target.value)}
                  style={input}
                />
              </Field>

              <Field label="Description" full>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  style={textarea}
                />
              </Field>
            </div>
          </Section>

          <Section title="Vehicle Compatibility">
            <div style={grid2}>
              <Field label="Make">
                <input
                  value={formData.make}
                  onChange={(e) => handleChange('make', e.target.value)}
                  style={input}
                />
              </Field>

              <Field label="Model">
                <input
                  value={formData.model}
                  onChange={(e) => handleChange('model', e.target.value)}
                  style={input}
                />
              </Field>

              <Field label="Variant">
                <input
                  value={formData.variant}
                  onChange={(e) => handleChange('variant', e.target.value)}
                  style={input}
                />
              </Field>

              <Field label="Year From">
                <input
                  type="number"
                  value={formData.year_from}
                  onChange={(e) => handleChange('year_from', e.target.value)}
                  style={input}
                />
              </Field>

              <Field label="Year To">
                <input
                  type="number"
                  value={formData.year_to}
                  onChange={(e) => handleChange('year_to', e.target.value)}
                  style={input}
                />
              </Field>
            </div>
          </Section>
        </div>

        <div style={rightColumn}>
          <Section title="Condition & Stock">
            <div style={grid1}>
              <Field label="Grade">
                <select
                  value={formData.grade}
                  onChange={(e) => handleChange('grade', e.target.value)}
                  style={input}
                >
                  {GRADE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Rating">
                <select
                  value={formData.rating}
                  onChange={(e) => handleChange('rating', e.target.value)}
                  style={input}
                >
                  <option value="">Select</option>
                  {RATING_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Condition">
                <select
                  value={formData.condition}
                  onChange={(e) => handleChange('condition', e.target.value)}
                  style={input}
                >
                  {CONDITION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Condition Notes">
                <textarea
                  value={formData.condition_notes}
                  onChange={(e) => handleChange('condition_notes', e.target.value)}
                  style={textareaSmall}
                />
              </Field>

              <Field label="Usage Type">
                <select
                  value={formData.usage_type}
                  onChange={(e) => handleChange('usage_type', e.target.value)}
                  style={input}
                >
                  {USAGE_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Sale Status">
                <select
                  value={formData.sale_status}
                  onChange={(e) => handleChange('sale_status', e.target.value)}
                  style={input}
                >
                  {SALE_STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Price">
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  style={input}
                />
              </Field>

              <Field label="Cost Price">
                <input
                  type="number"
                  value={formData.cost_price}
                  onChange={(e) => handleChange('cost_price', e.target.value)}
                  style={input}
                />
              </Field>

              <Field label="Quantity">
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  style={input}
                />
              </Field>

              <Field label="Location">
                <input
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  style={input}
                />
              </Field>

              <Field label="Shelf Code">
                <input
                  value={formData.shelf_code}
                  onChange={(e) => handleChange('shelf_code', e.target.value)}
                  style={input}
                />
              </Field>
            </div>
          </Section>

          <Section title="Notes">
            <div style={grid1}>
              <Field label="Public Notes">
                <textarea
                  value={formData.public_notes}
                  onChange={(e) => handleChange('public_notes', e.target.value)}
                  style={textareaSmall}
                />
              </Field>

              <Field label="Internal Notes">
                <textarea
                  value={formData.internal_notes}
                  onChange={(e) => handleChange('internal_notes', e.target.value)}
                  style={textareaSmall}
                />
              </Field>
            </div>
          </Section>

          <Section title="System Info">
            <div style={infoBox}>
              <div><strong>SKU:</strong> {part.sku || '-'}</div>
              <div><strong>Label ID:</strong> {part.label_id || '-'}</div>
              <div><strong>QR Value:</strong> {part.qr_code_value || '-'}</div>
              <div><strong>Created:</strong> {part.created_at ? new Date(part.created_at).toLocaleString() : '-'}</div>
              <div><strong>Updated:</strong> {part.updated_at ? new Date(part.updated_at).toLocaleString() : '-'}</div>
            </div>
          </Section>

          <div style={actionBar}>
            <button type="submit" disabled={saving} style={saveBtn}>
              <Save size={16} />
              {saving ? 'SAVING...' : 'SAVE CHANGES'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={sectionCard}>
      <h3 style={sectionTitle}>{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children, full = false }) {
  return (
    <div style={full ? fieldFull : field}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function getStatusBadgeStyle(status) {
  switch (status) {
    case 'AVAILABLE':
      return badgeAvailable;
    case 'SOLD':
      return badgeSold;
    case 'RESERVED':
      return badgeReserved;
    case 'DAMAGED':
      return badgeDamaged;
    case 'HOLD':
      return badgeHold;
    default:
      return badgeDefault;
  }
}

const page = {
  padding: '32px',
};

const topBar = {
  marginBottom: '20px',
};

const backButton = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontWeight: '800',
  color: '#64748b',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const headerCard = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '24px',
  padding: '24px',
  marginBottom: '24px',
};

const headerLeft = {
  display: 'flex',
  gap: '20px',
  alignItems: 'center',
  flexWrap: 'wrap',
};

const heroImageWrap = {
  width: '180px',
  height: '180px',
  borderRadius: '18px',
  overflow: 'hidden',
  border: '1px solid #e2e8f0',
  background: '#f8fafc',
};

const heroImage = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const heroPlaceholder = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#94a3b8',
};

const headerInfo = {
  flex: 1,
  minWidth: '280px',
};

const title = {
  margin: 0,
  fontSize: '32px',
  fontWeight: '900',
  color: '#0f172a',
};

const badgesRow = {
  display: 'flex',
  gap: '10px',
  marginTop: '14px',
  flexWrap: 'wrap',
};

const categoryBadge = {
  padding: '6px 12px',
  borderRadius: '999px',
  background: '#f1f5f9',
  color: '#475569',
  fontWeight: '800',
  fontSize: '12px',
};

const badgeBase = {
  padding: '6px 12px',
  borderRadius: '999px',
  fontWeight: '800',
  fontSize: '12px',
};

const badgeAvailable = {
  ...badgeBase,
  background: '#dcfce7',
  color: '#166534',
};

const badgeSold = {
  ...badgeBase,
  background: '#fee2e2',
  color: '#b91c1c',
};

const badgeReserved = {
  ...badgeBase,
  background: '#fef3c7',
  color: '#92400e',
};

const badgeDamaged = {
  ...badgeBase,
  background: '#e5e7eb',
  color: '#374151',
};

const badgeHold = {
  ...badgeBase,
  background: '#ede9fe',
  color: '#6d28d9',
};

const badgeDefault = {
  ...badgeBase,
  background: '#f1f5f9',
  color: '#475569',
};

const metaList = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  marginTop: '18px',
};

const metaItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: '#475569',
  fontWeight: '600',
};

const contentGrid = {
  display: 'grid',
  gridTemplateColumns: '1.4fr 1fr',
  gap: '24px',
};

const leftColumn = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
};

const rightColumn = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
};

const sectionCard = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '24px',
  padding: '24px',
};

const sectionTitle = {
  margin: '0 0 18px 0',
  fontSize: '18px',
  fontWeight: '900',
  color: '#0f172a',
};

const uploadBox = {
  minHeight: '100px',
  border: '2px dashed #cbd5e1',
  borderRadius: '16px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: '#64748b',
  gap: '8px',
  background: '#f8fafc',
  marginBottom: '16px',
};

const photoGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
  gap: '12px',
};

const photoCard = {
  position: 'relative',
  height: '130px',
  borderRadius: '14px',
  overflow: 'hidden',
  border: '1px solid #e2e8f0',
};

const photoImage = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const mainImageBtn = {
  position: 'absolute',
  top: '8px',
  right: '8px',
  border: 'none',
  background: 'rgba(255,255,255,0.9)',
  borderRadius: '8px',
  padding: '6px',
  cursor: 'pointer',
};

const mainImageBtnActive = {
  ...mainImageBtn,
  background: '#0f172a',
  color: 'gold',
};

const emptyPhoto = {
  color: '#94a3b8',
  fontWeight: '600',
};

const grid2 = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
};

const grid1 = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '16px',
};

const field = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const fieldFull = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  gridColumn: '1 / -1',
};

const labelStyle = {
  fontSize: '13px',
  fontWeight: '800',
  color: '#334155',
};

const input = {
  padding: '14px',
  borderRadius: '12px',
  border: '1px solid #cbd5e1',
  outline: 'none',
  fontSize: '14px',
  fontWeight: '600',
  background: '#fff',
};

const textarea = {
  minHeight: '110px',
  resize: 'vertical',
  padding: '14px',
  borderRadius: '12px',
  border: '1px solid #cbd5e1',
  outline: 'none',
  fontSize: '14px',
  fontWeight: '600',
  background: '#fff',
};

const textareaSmall = {
  minHeight: '90px',
  resize: 'vertical',
  padding: '14px',
  borderRadius: '12px',
  border: '1px solid #cbd5e1',
  outline: 'none',
  fontSize: '14px',
  fontWeight: '600',
  background: '#fff',
};

const infoBox = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  color: '#475569',
  fontWeight: '600',
  fontSize: '14px',
};

const actionBar = {
  display: 'flex',
  justifyContent: 'flex-end',
};

const saveBtn = {
  padding: '14px 18px',
  borderRadius: '12px',
  border: 'none',
  background: '#ef4444',
  color: '#fff',
  fontWeight: '800',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};
