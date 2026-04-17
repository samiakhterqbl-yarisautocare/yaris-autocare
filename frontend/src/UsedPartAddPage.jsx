import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Camera, Save, ArrowLeft } from 'lucide-react';

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

const USAGE_TYPE_OPTIONS = [
  { value: 'FOR_SALE', label: 'For Sale' },
  { value: 'INTERNAL_USE', label: 'Internal Use' },
];

export default function UsedPartAddPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [images, setImages] = useState([]);

  const [formData, setFormData] = useState({
    part_name: '',
    category: 'Engine',
    location: '',
    usage_type: 'FOR_SALE',
    make: '',
    model: '',
    sale_status: 'AVAILABLE',
    price: '0',
    quantity: '1',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    setImages(selectedFiles);

    const previews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.part_name.trim()) {
      alert('Part name is required');
      return;
    }

    if (!formData.category) {
      alert('Category is required');
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          payload.append(key, value);
        }
      });

      images.forEach((file) => {
        payload.append('images', file);
      });

      await axios.post(`${API_URL}/api/used-parts/`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Used part added successfully');
      navigate('/used-parts');
    } catch (error) {
      console.error('Error adding used part:', error);
      alert('Error adding used part');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={page}>
      <div style={topBar}>
        <button onClick={() => navigate('/used-parts')} style={backButton}>
          <ArrowLeft size={16} />
          BACK
        </button>
      </div>

      <div style={container}>
        <div style={header}>
          <h1 style={title}>Quick Add Used Part</h1>
          <p style={subtitle}>
            Fast intake form for daily stock entry. Full details can be added later from Edit page.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={formCard}>
          <div style={imageSection}>
            <label style={uploadBox}>
              <Camera size={28} />
              <span style={uploadTitle}>Upload Photo</span>
              <span style={uploadSubtitle}>Add one or more images</span>
              <input type="file" multiple hidden onChange={handleImageChange} />
            </label>

            {previewImages.length > 0 && (
              <div style={previewGrid}>
                {previewImages.map((src, index) => (
                  <div key={index} style={previewCard}>
                    <img src={src} alt={`Preview ${index + 1}`} style={previewImage} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={grid}>
            <div style={fieldGroup}>
              <label style={label}>Part Name *</label>
              <input
                type="text"
                value={formData.part_name}
                onChange={(e) => handleChange('part_name', e.target.value)}
                placeholder="e.g. Left Headlight"
                style={input}
                required
              />
            </div>

            <div style={fieldGroup}>
              <label style={label}>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                style={input}
                required
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div style={fieldGroup}>
              <label style={label}>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="e.g. Shelf A1"
                style={input}
              />
            </div>

            <div style={fieldGroup}>
              <label style={label}>Usage Type</label>
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
            </div>

            <div style={fieldGroup}>
              <label style={label}>Make</label>
              <input
                type="text"
                value={formData.make}
                onChange={(e) => handleChange('make', e.target.value)}
                placeholder="e.g. Toyota"
                style={input}
              />
            </div>

            <div style={fieldGroup}>
              <label style={label}>Model</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                placeholder="e.g. Yaris"
                style={input}
              />
            </div>
          </div>

          <div style={actionRow}>
            <button type="button" onClick={() => navigate('/used-parts')} style={secondaryButton}>
              Cancel
            </button>

            <button type="submit" disabled={loading} style={primaryButton}>
              <Save size={16} />
              {loading ? 'SAVING...' : 'SAVE USED PART'}
            </button>
          </div>
        </form>
      </div>
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

const container = {
  maxWidth: '900px',
  margin: '0 auto',
};

const header = {
  marginBottom: '24px',
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

const formCard = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '24px',
  padding: '28px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
};

const imageSection = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const uploadBox = {
  minHeight: '150px',
  border: '2px dashed #cbd5e1',
  borderRadius: '18px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: '#64748b',
  gap: '8px',
  background: '#f8fafc',
};

const uploadTitle = {
  fontSize: '16px',
  fontWeight: '800',
  color: '#0f172a',
};

const uploadSubtitle = {
  fontSize: '13px',
  color: '#64748b',
};

const previewGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
  gap: '12px',
};

const previewCard = {
  borderRadius: '14px',
  overflow: 'hidden',
  border: '1px solid #e2e8f0',
  height: '120px',
};

const previewImage = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const grid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
};

const fieldGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const label = {
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

const actionRow = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  marginTop: '8px',
};

const secondaryButton = {
  padding: '14px 18px',
  borderRadius: '12px',
  border: '1px solid #cbd5e1',
  background: '#fff',
  color: '#334155',
  fontWeight: '800',
  cursor: 'pointer',
};

const primaryButton = {
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
