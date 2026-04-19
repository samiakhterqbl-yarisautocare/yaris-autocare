import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Camera, Star, Package } from 'lucide-react';
import api from './api';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPart = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/used-parts/${id}/`);
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
      alert(
        error?.response?.data?.detail ||
          'Error loading used part'
      );
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

      const res = await api.put(`/used-parts/${id}/`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setPart(res.data);
      alert('Used part updated successfully');
      navigate(`/used-parts/${id}`);
    } catch (error) {
      console.error('Error updating used part:', error);
      alert(
        error?.response?.data?.detail ||
          'Error updating used part'
      );
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

      await api.put(`/used-parts/${id}/`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await fetchPart();
      alert('Images uploaded successfully');
    } catch (error) {
      console.error('Image upload error:', error);
      alert(
        error?.response?.data?.detail ||
          'Error uploading images'
      );
    } finally {
      setUploading(false);
    }
  };

  const setMainImage = async (imageId) => {
    try {
      await api.post(`/images/${imageId}/set-main/`);
      await fetchPart();
    } catch (error) {
      console.error('Set main image error:', error);
      alert(
        error?.response?.data?.detail ||
          'Error setting main image'
      );
    }
  };

  if (loading) {
    return <div style={{ padding: 30 }}>Loading...</div>;
  }

  if (!part) {
    return <div style={{ padding: 30 }}>Used part not found.</div>;
  }

  return (
    <div style={page}>
      <button onClick={() => navigate(`/used-parts/${id}`)} style={backButton}>
        <ArrowLeft size={16} />
        BACK TO DETAILS
      </button>

      <div style={heroCard}>
        <div>
          <div style={eyebrow}>EDIT USED PART</div>
          <h1 style={title}>#{id} Edit Used Part</h1>
          <div style={subText}>
            Update details, condition, location, notes, and photos.
          </div>
          <div style={metaRow}>
            <span style={metaPill}>SKU: {part.sku || '-'}</span>
            <span style={metaPill}>Label: {part.label_id || '-'}</span>
          </div>
        </div>

        <label style={uploadButton}>
          <Camera size={16} />
          {uploading ? 'UPLOADING...' : 'Upload More Photos'}
          <input
            type="file"
            multiple
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleUploadImages}
            disabled={uploading}
          />
        </label>
      </div>

      <div style={layout}>
        <form onSubmit={handleSave} style={formCard}>
          <div style={sectionTitle}>
            <Package size={16} />
            Core Information
          </div>

          <div style={grid2}>
            <Field label="Part Name">
              <input
                style={input}
                value={formData.part_name}
                onChange={(e) => handleChange('part_name', e.target.value)}
              />
            </Field>

            <Field label="Part Number">
              <input
                style={input}
                value={formData.part_number}
                onChange={(e) => handleChange('part_number', e.target.value)}
              />
            </Field>

            <Field label="Category">
              <select
                style={input}
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                {CATEGORY_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Subcategory">
              <input
                style={input}
                value={formData.subcategory}
                onChange={(e) => handleChange('subcategory', e.target.value)}
              />
            </Field>

            <Field label="Make">
              <input
                style={input}
                value={formData.make}
                onChange={(e) => handleChange('make', e.target.value)}
              />
            </Field>

            <Field label="Model">
              <input
                style={input}
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
              />
            </Field>

            <Field label="Variant">
              <input
                style={input}
                value={formData.variant}
                onChange={(e) => handleChange('variant', e.target.value)}
              />
            </Field>

            <Field label="Year From">
              <input
                type="number"
                style={input}
                value={formData.year_from}
                onChange={(e) => handleChange('year_from', e.target.value)}
              />
            </Field>

            <Field label="Year To">
              <input
                type="number"
                style={input}
                value={formData.year_to}
                onChange={(e) => handleChange('year_to', e.target.value)}
              />
            </Field>

            <Field label="Grade">
              <select
                style={input}
                value={formData.grade}
                onChange={(e) => handleChange('grade', e.target.value)}
              >
                {GRADE_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Rating">
              <select
                style={input}
                value={formData.rating}
                onChange={(e) => handleChange('rating', e.target.value)}
              >
                <option value="">Select rating</option>
                {RATING_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Condition">
              <select
                style={input}
                value={formData.condition}
                onChange={(e) => handleChange('condition', e.target.value)}
              >
                {CONDITION_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Usage Type">
              <select
                style={input}
                value={formData.usage_type}
                onChange={(e) => handleChange('usage_type', e.target.value)}
              >
                {USAGE_TYPE_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Sale Status">
              <select
                style={input}
                value={formData.sale_status}
                onChange={(e) => handleChange('sale_status', e.target.value)}
              >
                {SALE_STATUS_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Price">
              <input
                type="number"
                step="0.01"
                style={input}
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
              />
            </Field>

            <Field label="Cost Price">
              <input
                type="number"
                step="0.01"
                style={input}
                value={formData.cost_price}
                onChange={(e) => handleChange('cost_price', e.target.value)}
              />
            </Field>

            <Field label="Quantity">
              <input
                type="number"
                style={input}
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
              />
            </Field>

            <Field label="Location">
              <input
                style={input}
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />
            </Field>

            <Field label="Shelf Code">
              <input
                style={input}
                value={formData.shelf_code}
                onChange={(e) => handleChange('shelf_code', e.target.value)}
              />
            </Field>

            <Field label="Active">
              <select
                style={input}
                value={String(formData.is_active)}
                onChange={(e) => handleChange('is_active', e.target.value === 'true')}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </Field>
          </div>

          <Field label="Description">
            <textarea
              style={textarea}
              rows={4}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </Field>

          <Field label="Condition Notes">
            <textarea
              style={textarea}
              rows={4}
              value={formData.condition_notes}
              onChange={(e) => handleChange('condition_notes', e.target.value)}
            />
          </Field>

          <Field label="Public Notes">
            <textarea
              style={textarea}
              rows={4}
              value={formData.public_notes}
              onChange={(e) => handleChange('public_notes', e.target.value)}
            />
          </Field>

          <Field label="Internal Notes">
            <textarea
              style={textarea}
              rows={4}
              value={formData.internal_notes}
              onChange={(e) => handleChange('internal_notes', e.target.value)}
            />
          </Field>

          <button type="submit" style={saveButton} disabled={saving}>
            <Save size={16} />
            {saving ? 'SAVING...' : 'SAVE CHANGES'}
          </button>
        </form>

        <div style={photoCard}>
          <div style={sectionTitle}>
            <Camera size={16} />
            Photos
          </div>

          {part.images && part.images.length > 0 ? (
            <div style={imageGrid}>
              {part.images.map((img) => (
                <div key={img.id} style={imageItem}>
                  <img
                    src={img.image}
                    alt="Used part"
                    style={image}
                  />
                  <button
                    type="button"
                    onClick={() => setMainImage(img.id)}
                    style={img.is_main ? mainBtnActive : mainBtn}
                  >
                    <Star size={14} />
                    {img.is_main ? 'Main Photo' : 'Set Main'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={emptyState}>No photos uploaded</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={fieldWrap}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

const page = {
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
};

const backButton = {
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

const eyebrow = {
  fontSize: '12px',
  fontWeight: '900',
  color: '#94a3b8',
  textTransform: 'uppercase',
  marginBottom: '6px',
};

const title = {
  margin: 0,
  fontSize: '28px',
  fontWeight: '900',
  color: '#0f172a',
};

const subText = {
  color: '#64748b',
  fontWeight: '600',
  marginTop: '8px',
};

const metaRow = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  marginTop: '14px',
};

const metaPill = {
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  padding: '8px 12px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: '800',
  color: '#334155',
};

const uploadButton = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  background: '#0f172a',
  color: '#fff',
  borderRadius: '12px',
  padding: '12px 16px',
  fontWeight: '800',
  cursor: 'pointer',
};

const layout = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)',
  gap: '20px',
};

const formCard = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '20px',
  padding: '22px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const photoCard = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '20px',
  padding: '22px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const sectionTitle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '14px',
  fontWeight: '900',
  color: '#0f172a',
};

const grid2 = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '14px',
};

const fieldWrap = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const labelStyle = {
  fontSize: '12px',
  fontWeight: '800',
  color: '#475569',
};

const input = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  outline: 'none',
  boxSizing: 'border-box',
  fontSize: '14px',
  background: '#fff',
};

const textarea = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  outline: 'none',
  boxSizing: 'border-box',
  fontSize: '14px',
  background: '#fff',
  resize: 'vertical',
};

const saveButton = {
  marginTop: '8px',
  border: 'none',
  background: '#16a34a',
  color: '#fff',
  borderRadius: '12px',
  padding: '14px 18px',
  fontWeight: '800',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  width: 'fit-content',
};

const imageGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '14px',
};

const imageItem = {
  border: '1px solid #e2e8f0',
  borderRadius: '16px',
  padding: '10px',
  background: '#f8fafc',
};

const image = {
  width: '100%',
  height: '200px',
  objectFit: 'cover',
  borderRadius: '12px',
  display: 'block',
};

const mainBtn = {
  marginTop: '10px',
  border: '1px solid #cbd5e1',
  background: '#fff',
  color: '#334155',
  borderRadius: '10px',
  padding: '10px 12px',
  fontWeight: '800',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
};

const mainBtnActive = {
  ...mainBtn,
  border: '1px solid #f59e0b',
  background: '#fef3c7',
  color: '#92400e',
};

const emptyState = {
  padding: '20px',
  borderRadius: '14px',
  background: '#f8fafc',
  color: '#64748b',
  fontWeight: '700',
  textAlign: 'center',
};
