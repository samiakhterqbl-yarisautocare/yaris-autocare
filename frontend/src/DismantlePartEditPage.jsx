import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Save,
  Camera,
  Upload,
  Tag,
  Package,
  DollarSign,
  MapPin,
  ClipboardList,
  Trash2,
} from 'lucide-react';

const API_URL = 'https://yaris-autocare-production.up.railway.app';

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  outline: 'none',
  boxSizing: 'border-box',
  fontSize: '14px',
  background: '#fff',
};

export default function DismantlePartEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const statePart = location.state?.part || null;
  const stateDonorCar = location.state?.donorCar || null;

  const [part, setPart] = useState(statePart);
  const [donorCar, setDonorCar] = useState(stateDonorCar);
  const [loading, setLoading] = useState(!statePart);
  const [saving, setSaving] = useState(false);
  const [newImages, setNewImages] = useState([]);
  const [activeImage, setActiveImage] = useState('');

  const [form, setForm] = useState({
    part_name: '',
    category: '',
    grading: '',
    condition_notes: '',
    price: '',
    usage_type: 'Sale',
    status: 'Available',
    location: '',
    label_id: '',
  });

  useEffect(() => {
    if (!id) {
      setPart(null);
      setLoading(false);
      return;
    }

    if (statePart) {
      hydrateFromPart(statePart);
      setDonorCar(stateDonorCar || null);
      setLoading(false);
      return;
    }

    fetchPart();
  }, [id, statePart, stateDonorCar]);

  const fetchPart = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/dismantle-parts/${encodeURIComponent(id)}/`);
      hydrateFromPart(res.data);
    } catch (err) {
      console.error('Failed to fetch dismantle part for edit:', err?.response?.data || err);
      setPart(null);
    } finally {
      setLoading(false);
    }
  };

  const hydrateFromPart = (data) => {
    setPart(data);
    setForm({
      part_name: data?.part_name || '',
      category: data?.category || '',
      grading: data?.grading || '',
      condition_notes: data?.condition_notes || '',
      price: data?.price ?? '',
      usage_type: data?.usage_type || 'Sale',
      status: data?.status || 'Available',
      location: data?.location || '',
      label_id: data?.label_id || '',
    });
  };

  const existingImages = useMemo(() => {
    const imgs = [];
    if (Array.isArray(part?.images)) {
      part.images.forEach((img) => {
        if (!img) return;
        if (typeof img === 'string') imgs.push({ image: img });
        else if (img.image) imgs.push(img);
      });
    }
    return imgs;
  }, [part]);

  const newImagePreviews = useMemo(() => {
    return newImages.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [newImages]);

  useEffect(() => {
    return () => {
      newImagePreviews.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [newImagePreviews]);

  useEffect(() => {
    if (existingImages.length > 0) {
      setActiveImage(existingImages[0].image);
    } else if (newImagePreviews.length > 0) {
      setActiveImage(newImagePreviews[0].url);
    } else {
      setActiveImage('');
    }
  }, [existingImages, newImagePreviews]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (e) => {
    if (!e.target.files) return;
    setNewImages((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  const removeNewImage = (indexToRemove) => {
    setNewImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSetMainImage = async (imageId) => {
    try {
      await axios.post(`${API_URL}/api/images/${imageId}/set-main/`);
      await fetchPart();
    } catch (err) {
      console.error('Failed to set main image:', err?.response?.data || err);
      alert('Failed to set main image.');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const formData = new FormData();
      formData.append('part_name', form.part_name);
      formData.append('category', form.category);
      formData.append('grading', form.grading);
      formData.append('condition_notes', form.condition_notes);
      formData.append('price', form.price || 0);
      formData.append('usage_type', form.usage_type);
      formData.append('status', form.status);
      formData.append('location', form.location);
      formData.append('label_id', form.label_id);

      newImages.forEach((file) => {
        formData.append('images', file);
      });

      const res = await axios.patch(
        `${API_URL}/api/dismantle-parts/${encodeURIComponent(id)}/`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      hydrateFromPart(res.data);
      setNewImages([]);
      alert('Dismantle part updated successfully.');
    } catch (err) {
      console.error('Failed to update dismantle part:', err?.response?.data || err);
      alert('Failed to update dismantle part.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '32px' }}>
        <div style={box}>Loading dismantle part editor...</div>
      </div>
    );
  }

  if (!part) {
    return (
      <div style={{ padding: '32px' }}>
        <button onClick={() => navigate('/dismantle')} style={backBtn}>
          <ArrowLeft size={16} />
          BACK
        </button>
        <div style={box}>Part not found.</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', animation: 'fadeIn 0.3s ease' }}>
      <button onClick={() => navigate(-1)} style={backBtn}>
        <ArrowLeft size={16} />
        BACK
      </button>

      <div style={hero}>
        <div>
          <div style={heroEyebrow}>Dismantle Part Editor</div>
          <h1 style={heroTitle}>{form.part_name || 'Unnamed Part'}</h1>
          <div style={heroSub}>
            {donorCar
              ? [donorCar.year, donorCar.make, donorCar.model].filter(Boolean).join(' ')
              : 'Inventory Item'}
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} style={saveBtn}>
          <Save size={16} />
          {saving ? 'SAVING...' : 'SAVE CHANGES'}
        </button>
      </div>

      <div style={layout}>
        <div style={leftCol}>
          <div style={card}>
            <div style={cardTitleRow}>
              <Camera size={18} />
              <h3 style={cardTitle}>Images</h3>
            </div>

            {activeImage ? (
              <img src={activeImage} alt="Part" style={mainImage} />
            ) : (
              <div style={placeholder}>No image available</div>
            )}

            <div style={{ marginTop: '14px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={uploadBtn}
                type="button"
              >
                <Upload size={16} />
                UPLOAD IMAGES
              </button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
            </div>

            {existingImages.length > 0 && (
              <>
                <div style={subheading}>Existing Images</div>
                <div style={thumbGrid}>
                  {existingImages.map((img, index) => (
                    <div key={img.id || `${img.image}-${index}`} style={thumbWrap}>
                      <img
                        src={img.image}
                        alt="Existing"
                        onClick={() => setActiveImage(img.image)}
                        style={thumbImage}
                      />
                      {img.id && (
                        <button
                          type="button"
                          onClick={() => handleSetMainImage(img.id)}
                          style={smallBtn}
                        >
                          Set Main
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {newImagePreviews.length > 0 && (
              <>
                <div style={subheading}>New Images to Upload</div>
                <div style={thumbGrid}>
                  {newImagePreviews.map((item, index) => (
                    <div key={`${item.file.name}-${index}`} style={thumbWrap}>
                      <img
                        src={item.url}
                        alt={item.file.name}
                        onClick={() => setActiveImage(item.url)}
                        style={thumbImage}
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        style={removeBtn}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div style={rightCol}>
          <div style={card}>
            <div style={cardTitleRow}>
              <Package size={18} />
              <h3 style={cardTitle}>Core Details</h3>
            </div>

            <div style={formGrid}>
              <Field label="Part Name" icon={<Tag size={15} />}>
                <input
                  value={form.part_name}
                  onChange={(e) => handleChange('part_name', e.target.value)}
                  style={inputStyle}
                />
              </Field>

              <Field label="Category" icon={<Tag size={15} />}>
                <input
                  value={form.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  style={inputStyle}
                />
              </Field>

              <Field label="Grade" icon={<ClipboardList size={15} />}>
                <input
                  value={form.grading}
                  onChange={(e) => handleChange('grading', e.target.value)}
                  style={inputStyle}
                  placeholder="e.g. Grade A"
                />
              </Field>

              <Field label="Price" icon={<DollarSign size={15} />}>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  style={inputStyle}
                />
              </Field>

              <Field label="Usage Type" icon={<Package size={15} />}>
                <select
                  value={form.usage_type}
                  onChange={(e) => handleChange('usage_type', e.target.value)}
                  style={inputStyle}
                >
                  <option value="Sale">Sale</option>
                  <option value="Internal">Internal</option>
                </select>
              </Field>

              <Field label="Status" icon={<Package size={15} />}>
                <select
                  value={form.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  style={inputStyle}
                >
                  <option value="Available">Available</option>
                  <option value="Sold">Sold</option>
                  <option value="Internal">Internal</option>
                </select>
              </Field>

              <Field label="Location" icon={<MapPin size={15} />}>
                <input
                  value={form.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  style={inputStyle}
                />
              </Field>

              <Field label="Label ID" icon={<Tag size={15} />}>
                <input
                  value={form.label_id}
                  onChange={(e) => handleChange('label_id', e.target.value)}
                  style={inputStyle}
                />
              </Field>
            </div>
          </div>

          <div style={card}>
            <div style={cardTitleRow}>
              <ClipboardList size={18} />
              <h3 style={cardTitle}>Condition Notes</h3>
            </div>

            <textarea
              value={form.condition_notes}
              onChange={(e) => handleChange('condition_notes', e.target.value)}
              style={{ ...inputStyle, minHeight: '140px', resize: 'vertical' }}
              placeholder="Describe actual condition, damage, missing clips, tested state, etc."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, children }) {
  return (
    <div>
      <div style={fieldLabel}>
        {icon}
        <span>{label}</span>
      </div>
      {children}
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

const hero = {
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  border: '1px solid #e2e8f0',
  borderRadius: '22px',
  padding: '22px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '20px',
  flexWrap: 'wrap',
  marginBottom: '24px',
};

const heroEyebrow = {
  fontSize: '12px',
  fontWeight: '900',
  color: '#94a3b8',
  textTransform: 'uppercase',
  marginBottom: '8px',
};

const heroTitle = {
  margin: 0,
  fontSize: '28px',
  fontWeight: '900',
  color: '#0f172a',
};

const heroSub = {
  marginTop: '8px',
  color: '#64748b',
  fontWeight: '700',
};

const saveBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  background: '#0f172a',
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  padding: '12px 18px',
  fontWeight: '800',
  cursor: 'pointer',
};

const uploadBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  background: '#fff',
  color: '#0f172a',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '10px 14px',
  fontWeight: '800',
  cursor: 'pointer',
};

const layout = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) minmax(380px, 1fr)',
  gap: '24px',
};

const leftCol = { display: 'flex', flexDirection: 'column', gap: '16px' };
const rightCol = { display: 'flex', flexDirection: 'column', gap: '16px' };

const card = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '18px',
  padding: '18px',
};

const cardTitleRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '14px',
  color: '#0f172a',
};

const cardTitle = {
  margin: 0,
  fontSize: '17px',
  fontWeight: '900',
};

const mainImage = {
  width: '100%',
  height: '360px',
  objectFit: 'cover',
  borderRadius: '14px',
  border: '1px solid #e2e8f0',
};

const placeholder = {
  height: '360px',
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
  gridTemplateColumns: 'repeat(auto-fill, minmax(92px, 1fr))',
  gap: '10px',
  marginTop: '10px',
};

const thumbWrap = {
  position: 'relative',
};

const thumbImage = {
  width: '100%',
  height: '84px',
  objectFit: 'cover',
  borderRadius: '10px',
  border: '1px solid #e2e8f0',
  cursor: 'pointer',
};

const smallBtn = {
  marginTop: '6px',
  width: '100%',
  border: '1px solid #e2e8f0',
  background: '#fff',
  borderRadius: '8px',
  padding: '6px 8px',
  fontSize: '11px',
  fontWeight: '800',
  cursor: 'pointer',
};

const removeBtn = {
  position: 'absolute',
  top: '6px',
  right: '6px',
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  border: 'none',
  background: '#ef4444',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

const subheading = {
  marginTop: '16px',
  marginBottom: '8px',
  fontSize: '12px',
  fontWeight: '900',
  color: '#64748b',
  textTransform: 'uppercase',
};

const formGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '14px',
};

const fieldLabel = {
  display: 'flex',
  alignItems: 'center',
  gap: '7px',
  fontSize: '12px',
  fontWeight: '800',
  color: '#64748b',
  marginBottom: '8px',
};

const box = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '16px',
  padding: '24px',
  color: '#64748b',
  fontWeight: '700',
};
