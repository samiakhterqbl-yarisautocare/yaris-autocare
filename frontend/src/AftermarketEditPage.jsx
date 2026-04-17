import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Save,
  X,
  MapPin,
  Truck,
  DollarSign,
  Tag,
  Camera,
  Trash2,
  Star,
  AlertCircle,
  Layers,
  Barcode
} from 'lucide-react';

const API_URL = 'https://yaris-autocare-production.up.railway.app';

const COLORS = {
  primary: '#ef4444',
  dark: '#0f172a',
  border: '#e2e8f0',
  bg: '#f8fafc',
  slate: '#64748b',
  white: '#ffffff'
};

const CATEGORY_OPTIONS = [
  'Oil Filters',
  'Air Filters',
  'Cabin Filters',
  'Fuel Filters',
  'Brake Pads',
  'Brake Rotors',
  'Spark Plugs',
  'Ignition Coils',
  'Wiper Blades',
  'Bulbs',
  'Sensors',
  'Suspension',
  'Cooling',
  'Belts',
  'Batteries',
  'Fluids',
  'Accessories',
  'Other'
];

const STATUS_OPTIONS = ['Available', 'Out of Stock', 'Inactive'];

const AftermarketEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [mainPhotoId, setMainPhotoId] = useState(null);

  const [formData, setFormData] = useState({
    part_name: '',
    category: 'Other',
    description: '',
    quantity: 0,
    min_stock_level: 5,
    cost_price: '',
    sale_price: '',
    location: '',
    supplier: '',
    status: 'Available',
    sku: '',
    label_id: ''
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/aftermarket/${id}/`);
        const data = response.data;

        setFormData({
          part_name: data.part_name || '',
          category: data.category || 'Other',
          description: data.description || '',
          quantity: data.quantity ?? 0,
          min_stock_level: data.min_stock_level ?? 5,
          cost_price: data.cost_price ?? '',
          sale_price: data.sale_price ?? '',
          location: data.location || '',
          supplier: data.supplier || '',
          status: data.status || 'Available',
          sku: data.sku || '',
          label_id: data.label_id || ''
        });

        const imgs = Array.isArray(data.images) ? data.images : [];
        setExistingImages(imgs);

        const main = imgs.find((img) => img.is_main) || imgs[0] || null;
        setMainPhotoId(main ? `existing-${main.id}` : null);
      } catch (error) {
        console.error('Failed to load product for edit:', error);
        alert('Failed to load product.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const mapped = files.map((file) => ({
      id: `new-${Math.random().toString(36).slice(2, 11)}`,
      file,
      url: URL.createObjectURL(file)
    }));

    const updated = [...newImages, ...mapped];
    setNewImages(updated);

    if (!mainPhotoId && updated.length > 0) {
      setMainPhotoId(updated[0].id);
    }
  };

  const deleteExistingPhoto = (imageId) => {
    const updated = existingImages.filter((img) => img.id !== imageId);
    setExistingImages(updated);

    if (mainPhotoId === `existing-${imageId}`) {
      const nextExisting = updated[0];
      const nextNew = newImages[0];
      setMainPhotoId(
        nextExisting ? `existing-${nextExisting.id}` : nextNew ? nextNew.id : null
      );
    }
  };

  const deleteNewPhoto = (imageId) => {
    const updated = newImages.filter((img) => img.id !== imageId);
    setNewImages(updated);

    if (mainPhotoId === imageId) {
      const nextExisting = existingImages[0];
      const nextNew = updated[0];
      setMainPhotoId(
        nextExisting ? `existing-${nextExisting.id}` : nextNew ? nextNew.id : null
      );
    }
  };

  const handleSave = async () => {
    if (!formData.part_name.trim()) {
      alert('Product name is required.');
      return;
    }

    try {
      setSaving(true);

      const payload = new FormData();
      payload.append('part_name', formData.part_name.trim());
      payload.append('category', formData.category || 'Other');
      payload.append('description', formData.description || '');
      payload.append('quantity', String(parseInt(formData.quantity, 10) || 0));
      payload.append('min_stock_level', String(parseInt(formData.min_stock_level, 10) || 5));
      payload.append('cost_price', String(parseFloat(formData.cost_price) || 0));
      payload.append('sale_price', String(parseFloat(formData.sale_price) || 0));
      payload.append('location', formData.location || '');
      payload.append('supplier', formData.supplier || '');
      payload.append('status', formData.status || 'Available');

      existingImages.forEach((img) => {
        payload.append('existing_image_ids', String(img.id));
      });

      newImages.forEach((img) => {
        payload.append('images', img.file);
      });

      if (mainPhotoId) {
        payload.append('main_photo_id', mainPhotoId);
      }

      const response = await axios.patch(`${API_URL}/api/aftermarket/${id}/`, payload, {
        headers: {
          Accept: 'application/json'
        }
      });

      if (response.status === 200) {
        alert('Product updated successfully.');
        navigate(`/aftermarket/${id}`);
      }
    } catch (error) {
      console.error('Update failed:', error.response?.data || error.message);
      alert('Error: ' + JSON.stringify(error.response?.data || 'Update failed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={loadingStyle}>Loading product for edit...</div>;
  }

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <h2 style={titleStyle}>Edit Product</h2>
          <p style={subtitleStyle}>
            SKU: <span style={{ color: COLORS.primary, fontWeight: '900' }}>{formData.sku}</span>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={secondaryBtn}>
            <X size={18} />
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={primaryBtn}>
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div style={gridStyle}>
        <div style={columnStyle}>
          <div style={cardStyle}>
            <h4 style={sectionTitle}>General Information</h4>

            <div style={inputGroup}>
              <label style={labelStyle}>Product Name</label>
              <input
                name="part_name"
                value={formData.part_name}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Category</label>
              <div style={iconInput}>
                <Layers size={16} color={COLORS.slate} />
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  style={bareInput}
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                style={{ ...inputStyle, height: '110px', resize: 'none' }}
              />
            </div>

            <div style={twoColGrid}>
              <div style={inputGroup}>
                <label style={labelStyle}>SKU</label>
                <div style={iconInput}>
                  <Barcode size={16} color={COLORS.slate} />
                  <input value={formData.sku} disabled style={{ ...bareInput, color: COLORS.slate }} />
                </div>
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Label ID</label>
                <div style={iconInput}>
                  <Tag size={16} color={COLORS.slate} />
                  <input value={formData.label_id} disabled style={{ ...bareInput, color: COLORS.slate }} />
                </div>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={galleryHeader}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: COLORS.dark }}>
                Product Gallery
              </h4>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={addPhotoBtn}
              >
                <Camera size={14} />
                Add Photos
              </button>
            </div>

            <div style={galleryGrid}>
              {existingImages.map((img) => (
                <div
                  key={`existing-${img.id}`}
                  style={{
                    ...thumbWrapper,
                    border:
                      mainPhotoId === `existing-${img.id}`
                        ? `2px solid ${COLORS.primary}`
                        : `1px solid ${COLORS.border}`
                  }}
                >
                  <img
                    src={img.image}
                    alt="existing"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {mainPhotoId === `existing-${img.id}` && <div style={mainBadge}>MAIN</div>}
                  <div style={thumbOverlay}>
                    <button
                      onClick={() => setMainPhotoId(`existing-${img.id}`)}
                      style={actionIcon}
                    >
                      <Star
                        size={13}
                        fill={mainPhotoId === `existing-${img.id}` ? COLORS.primary : 'none'}
                      />
                    </button>
                    <button
                      onClick={() => deleteExistingPhoto(img.id)}
                      style={actionIcon}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}

              {newImages.map((img) => (
                <div
                  key={img.id}
                  style={{
                    ...thumbWrapper,
                    border:
                      mainPhotoId === img.id
                        ? `2px solid ${COLORS.primary}`
                        : `1px solid ${COLORS.border}`
                  }}
                >
                  <img
                    src={img.url}
                    alt="new"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {mainPhotoId === img.id && <div style={mainBadge}>MAIN</div>}
                  <div style={thumbOverlay}>
                    <button onClick={() => setMainPhotoId(img.id)} style={actionIcon}>
                      <Star size={13} fill={mainPhotoId === img.id ? COLORS.primary : 'none'} />
                    </button>
                    <button onClick={() => deleteNewPhoto(img.id)} style={actionIcon}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}

              <div onClick={() => fileInputRef.current?.click()} style={uploadPlaceholder}>
                <Camera size={24} />
                <span style={{ marginTop: '6px', fontSize: '11px', fontWeight: '800' }}>
                  ADD PHOTO
                </span>
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                />
              </div>
            </div>
          </div>
        </div>

        <div style={columnStyle}>
          <div style={cardStyle}>
            <h4 style={sectionTitle}>
              <AlertCircle size={16} />
              Stock Control
            </h4>

            <div style={twoColGrid}>
              <div style={inputGroup}>
                <label style={labelStyle}>Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Min Stock Alert</label>
                <input
                  type="number"
                  name="min_stock_level"
                  value={formData.min_stock_level}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Warehouse Location</label>
              <div style={iconInput}>
                <MapPin size={16} />
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  style={bareInput}
                />
              </div>
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Status</label>
              <div style={iconInput}>
                <Tag size={16} />
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={bareInput}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <h4 style={sectionTitle}>
              <DollarSign size={16} />
              Pricing & Supplier
            </h4>

            <div style={inputGroup}>
              <label style={labelStyle}>Supplier</label>
              <div style={iconInput}>
                <Truck size={16} />
                <input
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  style={bareInput}
                />
              </div>
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Cost Price</label>
              <div style={iconInput}>
                <DollarSign size={16} />
                <input
                  type="number"
                  step="0.01"
                  name="cost_price"
                  value={formData.cost_price}
                  onChange={handleChange}
                  style={bareInput}
                />
              </div>
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Sale Price</label>
              <div style={iconInput}>
                <Tag size={16} color={COLORS.primary} />
                <input
                  type="number"
                  step="0.01"
                  name="sale_price"
                  value={formData.sale_price}
                  onChange={handleChange}
                  style={bareInput}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const pageStyle = {
  padding: '32px',
  maxWidth: '1200px',
  margin: '0 auto',
  backgroundColor: COLORS.bg,
  minHeight: '100vh'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '28px'
};

const titleStyle = {
  margin: 0,
  fontWeight: '900',
  fontSize: '30px',
  color: COLORS.dark
};

const subtitleStyle = {
  color: COLORS.slate,
  margin: '6px 0 0 0'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: '1.5fr 1fr',
  gap: '28px'
};

const columnStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px'
};

const cardStyle = {
  backgroundColor: '#fff',
  padding: '24px',
  borderRadius: '20px',
  border: `1px solid ${COLORS.border}`,
  boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
};

const inputGroup = {
  marginBottom: '18px'
};

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '800',
  color: COLORS.slate,
  marginBottom: '7px',
  textTransform: 'uppercase'
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '12px',
  border: `1px solid ${COLORS.border}`,
  outline: 'none',
  fontSize: '14px',
  boxSizing: 'border-box',
  backgroundColor: COLORS.bg
};

const iconInput = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '0 12px',
  borderRadius: '12px',
  border: `1px solid ${COLORS.border}`,
  backgroundColor: COLORS.bg
};

const bareInput = {
  border: 'none',
  outline: 'none',
  padding: '12px 0',
  width: '100%',
  fontSize: '14px',
  background: 'transparent'
};

const sectionTitle = {
  margin: '0 0 16px 0',
  fontSize: '14px',
  fontWeight: '900',
  color: COLORS.dark,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  borderBottom: `1px solid ${COLORS.border}`,
  paddingBottom: '10px',
  textTransform: 'uppercase'
};

const primaryBtn = {
  backgroundColor: COLORS.primary,
  color: '#fff',
  border: 'none',
  padding: '12px 22px',
  borderRadius: '12px',
  fontWeight: '900',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const secondaryBtn = {
  backgroundColor: '#fff',
  color: COLORS.dark,
  border: `1px solid ${COLORS.border}`,
  padding: '12px 22px',
  borderRadius: '12px',
  fontWeight: '800',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const galleryHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '14px'
};

const addPhotoBtn = {
  fontSize: '12px',
  color: COLORS.primary,
  background: 'none',
  border: 'none',
  fontWeight: '900',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px'
};

const galleryGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
  gap: '14px'
};

const thumbWrapper = {
  position: 'relative',
  height: '120px',
  borderRadius: '14px',
  overflow: 'hidden',
  backgroundColor: COLORS.bg
};

const thumbOverlay = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '36px',
  backgroundColor: 'rgba(15, 23, 42, 0.82)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '10px'
};

const actionIcon = {
  background: 'none',
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  padding: '5px'
};

const mainBadge = {
  position: 'absolute',
  top: '8px',
  left: '8px',
  backgroundColor: COLORS.primary,
  color: '#fff',
  fontSize: '9px',
  fontWeight: '900',
  padding: '3px 8px',
  borderRadius: '5px'
};

const uploadPlaceholder = {
  border: `2px dashed ${COLORS.border}`,
  borderRadius: '14px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: COLORS.slate,
  height: '120px',
  backgroundColor: '#fff'
};

const twoColGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '14px'
};

const loadingStyle = {
  padding: '40px',
  textAlign: 'center',
  color: COLORS.slate,
  fontWeight: '700'
};

export default AftermarketEditPage;
