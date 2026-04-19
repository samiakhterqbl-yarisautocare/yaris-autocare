import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Camera, Star } from 'lucide-react';
import api from './api';

export default function DismantlePartEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [part, setPart] = useState(null);

  const [formData, setFormData] = useState({
    part_name: '',
    category: '',
    price: '',
    grading: '',
    condition_notes: '',
    usage_type: '',
    status: '',
    location: '',
  });

  useEffect(() => {
    fetchPart();
  }, [id]);

  const fetchPart = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/dismantle-parts/${id}/`);
      const data = res.data;

      setPart(data);
      setFormData({
        part_name: data.part_name || '',
        category: data.category || '',
        price: data.price || '',
        grading: data.grading || '',
        condition_notes: data.condition_notes || '',
        usage_type: data.usage_type || '',
        status: data.status || '',
        location: data.location || '',
      });
    } catch (err) {
      console.error(err);
      alert('Error loading dismantle part');
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
        payload.append(key, value);
      });

      await api.patch(`/dismantle-parts/${id}/`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Updated successfully');
      navigate(`/dismantle-parts/${id}`);
    } catch (err) {
      console.error(err);
      alert('Error updating part');
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

      await api.patch(`/dismantle-parts/${id}/`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await fetchPart();
    } catch (err) {
      console.error(err);
      alert('Error uploading images');
    } finally {
      setUploading(false);
    }
  };

  const setMainImage = async (imageId) => {
    try {
      await api.post(`/images/${imageId}/set-main/`);
      await fetchPart();
    } catch (err) {
      console.error(err);
      alert('Error setting main image');
    }
  };

  if (loading) return <div style={{ padding: 30 }}>Loading...</div>;
  if (!part) return <div style={{ padding: 30 }}>Not found</div>;

  return (
    <div style={{ padding: 24 }}>
      <button onClick={() => navigate(-1)} style={backBtn}>
        <ArrowLeft size={16} />
        BACK
      </button>

      <h2>Edit Dismantle Part</h2>

      <form onSubmit={handleSave} style={{ marginTop: 20 }}>
        <input style={input} value={formData.part_name} onChange={(e) => handleChange('part_name', e.target.value)} placeholder="Part Name" />
        <input style={input} value={formData.category} onChange={(e) => handleChange('category', e.target.value)} placeholder="Category" />
        <input style={input} value={formData.price} onChange={(e) => handleChange('price', e.target.value)} placeholder="Price" />
        <input style={input} value={formData.grading} onChange={(e) => handleChange('grading', e.target.value)} placeholder="Grading" />
        <input style={input} value={formData.location} onChange={(e) => handleChange('location', e.target.value)} placeholder="Location" />

        <textarea style={input} value={formData.condition_notes} onChange={(e) => handleChange('condition_notes', e.target.value)} placeholder="Condition Notes" />

        <button type="submit" disabled={saving} style={saveBtn}>
          <Save size={16} />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>

      <div style={{ marginTop: 30 }}>
        <label style={uploadBtn}>
          <Camera size={16} />
          {uploading ? 'Uploading...' : 'Upload Images'}
          <input type="file" multiple hidden onChange={handleUploadImages} />
        </label>

        <div style={{ marginTop: 20 }}>
          {part.images?.map((img) => (
            <div key={img.id} style={{ marginBottom: 10 }}>
              <img src={img.image} alt="" width="100%" />
              <button onClick={() => setMainImage(img.id)}>
                <Star size={14} /> Set Main
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const input = {
  display: 'block',
  width: '100%',
  marginBottom: 10,
  padding: 10,
};

const saveBtn = {
  padding: 12,
  background: '#16a34a',
  color: '#fff',
  border: 'none',
  cursor: 'pointer',
};

const backBtn = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

const uploadBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  background: '#000',
  color: '#fff',
  padding: 10,
  cursor: 'pointer',
};
