import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Save,
  Camera,
  Star,
  Package,
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

export default function UsedPartEditPage() {
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
      const data = res.data;
      setPart(data);

      setFormData({
        part_name: data.part_name || '',
        part_number: data.part_number || '',
        category: data.category || 'Other',
        subcategory: data.subcategory || '',
        make: data.make || '',
        model: data.model || '',
        variant: data.variant || '',
        year_from: data.year_from ?? '',
        year_to: data.year_to ?? '',
        description: data.description || '',
        grade: data.grade || 'B',
        rating: data.rating || '',
        condition: data.condition || 'Used Good',
        condition_notes: data.condition_notes || '',
        usage_type: data.usage_type || 'FOR_SALE',
        sale_status: data.sale_status || 'AVAILABLE',
        price: data.price ?? '0',
        cost_price: data.cost_price ?? '0',
        quantity: data.quantity ?? '1',
        location: data.location || '',
        shelf_code: data.shelf_code || '',
        public_notes: data.public_notes || '',
        internal_notes: data.internal_notes || '',
        is_active: data.is_active ?? true,
      });
    } catch (error) {
      console.error('Error loading used part:', error);
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
      navigate(`/used-parts/${id}`);
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

  if (loading) {
    return <div style={page}>Loading...</div>;
  }

  if (!part) {
    return <div style={page}>Used part not found.</div>;
  }

  return (
    <div style={page}>
      <div style={topBar}>
        <button onClick={() => navigate(`/used-parts/${id}`)} style={backButton}>
          <ArrowLeft size={16} />
          BACK TO DETAILS
        </button>
      </div>

      <div style={headerCard}>
        <div>
          <h1 style={title}>Edit Used Part</h1>
          <p style={subtitle}>
            Update details, condition, location, notes, and photos.
          </p>
        </div>

        <div style={systemBadges}>
          <span style={chip}>SKU: {part.sku || '-'}</span>
          <span style={chip}>Label: {part.label_id || '-'}</span>
        </div>
      </div>

      <form onSubmit={handleSave} style={layout}>
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
                      style={img.is_main ? mainBtnActive : mainBtn}
                    >
                      <Star size={14} fill={img.is_main ? 'gold' : 'none'} />
                    </button>
                  </div>
                ))
              ) : (
                <div style={emptyPhoto}>
                  <Package size={24} />
                  <span>No photos uploaded</span>
                </div>
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
  display: 'flex',
  justifyContent: 'space-between',
  gap: '16px',
  flexWrap: 'wrap',
};

const title = {
  margin: 0,
  fontSize: '32px',
  fontWeight: '900',
  color: '#0f172a',
};

const subtitle = {
  marginTop: '8px',
  color: '#64748b',
  fontWeight: '500',
};

const systemBadges = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
};

const chip = {
  padding: '8px 12px',
  borderRadius: '999px',
  background: '#f1f5f9',
  color: '#475569',
  fontWeight: '800',
  fontSize: '12px',
};

const layout = {
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

const mainBtn = {
  position: 'absolute',
  top: '8px',
  right: '8px',
  border: 'none',
  background: 'rgba(255,255,255,0.9)',
  borderRadius: '8px',
  padding: '6px',
  cursor: 'pointer',
};

const mainBtnActive = {
  ...mainBtn,
  background: '#0f172a',
  color: 'gold',
};

const emptyPhoto = {
  minHeight: '100px',
  borderRadius: '14px',
  border: '1px dashed #cbd5e1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  color: '#94a3b8',
  fontWeight: '700',
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
