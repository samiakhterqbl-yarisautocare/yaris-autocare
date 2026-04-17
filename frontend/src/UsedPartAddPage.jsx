import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'https://yaris-autocare-production.up.railway.app';

export default function UsedPartAddPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    part_name: '',
    part_number: '',
    category: 'Engine',
    subcategory: '',
    make: '',
    model: '',
    variant: '',
    year_from: '',
    year_to: '',
    description: '',
    grade: 'B',
    rating: 'Good',
    condition: 'Used Good',
    condition_notes: '',
    usage_type: 'FOR_SALE',
    sale_status: 'AVAILABLE',
    price: '',
    cost_price: '',
    quantity: 1,
    location: '',
    shelf_code: '',
    public_notes: '',
    internal_notes: '',
  });

  const [images, setImages] = useState([]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });

      images.forEach((img) => {
        data.append('images', img);
      });

      await axios.post(`${API_URL}/api/used-parts/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Used Part Added Successfully!');
      navigate('/used-parts');
    } catch (err) {
      console.error(err);
      alert('Error adding part');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <h1 style={title}>Add Used Part</h1>

      <form onSubmit={handleSubmit} style={form}>
        <Section title="Basic Information">
          <Input label="Part Name" required onChange={(v) => handleChange('part_name', v)} />
          <Input label="Part Number" onChange={(v) => handleChange('part_number', v)} />

          <Select
            label="Category"
            value={formData.category}
            onChange={(v) => handleChange('category', v)}
            options={categories}
          />

          <Input label="Subcategory" onChange={(v) => handleChange('subcategory', v)} />
          <TextArea label="Description" onChange={(v) => handleChange('description', v)} />
        </Section>

        <Section title="Vehicle Compatibility">
          <Input label="Make" onChange={(v) => handleChange('make', v)} />
          <Input label="Model" onChange={(v) => handleChange('model', v)} />
          <Input label="Variant" onChange={(v) => handleChange('variant', v)} />
          <Input label="Year From" type="number" onChange={(v) => handleChange('year_from', v)} />
          <Input label="Year To" type="number" onChange={(v) => handleChange('year_to', v)} />
        </Section>

        <Section title="Condition & Grading">
          <Select label="Grade" options={['A','B','C','D']} value={formData.grade} onChange={(v)=>handleChange('grade',v)} />
          <Select label="Rating" options={['Excellent','Good','Fair','Poor']} value={formData.rating} onChange={(v)=>handleChange('rating',v)} />
          <Select label="Condition" options={conditions} value={formData.condition} onChange={(v)=>handleChange('condition',v)} />
          <TextArea label="Condition Notes" onChange={(v)=>handleChange('condition_notes',v)} />
        </Section>

        <Section title="Pricing & Stock">
          <Input label="Price ($)" type="number" required onChange={(v)=>handleChange('price',v)} />
          <Input label="Cost Price" type="number" onChange={(v)=>handleChange('cost_price',v)} />
          <Input label="Quantity" type="number" onChange={(v)=>handleChange('quantity',v)} />
          <Input label="Location" onChange={(v)=>handleChange('location',v)} />
          <Input label="Shelf Code" onChange={(v)=>handleChange('shelf_code',v)} />

          <Select label="Usage Type" options={['FOR_SALE','INTERNAL_USE']} value={formData.usage_type} onChange={(v)=>handleChange('usage_type',v)} />
          <Select label="Sale Status" options={['AVAILABLE','RESERVED','SOLD','HOLD']} value={formData.sale_status} onChange={(v)=>handleChange('sale_status',v)} />
        </Section>

        <Section title="Images">
          <input type="file" multiple onChange={handleImageChange} />
        </Section>

        <button type="submit" disabled={loading} style={button}>
          {loading ? 'SAVING...' : 'ADD USED PART'}
        </button>
      </form>
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

const Section = ({ title, children }) => (
  <div style={section}>
    <h3>{title}</h3>
    <div style={grid}>{children}</div>
  </div>
);

const Input = ({ label, onChange, type="text", required }) => (
  <div>
    <label>{label}</label>
    <input type={type} required={required} onChange={(e)=>onChange(e.target.value)} style={input}/>
  </div>
);

const Select = ({ label, options, value, onChange }) => (
  <div>
    <label>{label}</label>
    <select value={value} onChange={(e)=>onChange(e.target.value)} style={input}>
      {options.map(opt => <option key={opt}>{opt}</option>)}
    </select>
  </div>
);

const TextArea = ({ label, onChange }) => (
  <div style={{gridColumn:'span 2'}}>
    <label>{label}</label>
    <textarea onChange={(e)=>onChange(e.target.value)} style={input}/>
  </div>
);

/* ---------- DATA ---------- */

const categories = [
  'Engine','Transmission','Suspension','Steering','Brakes','Electrical',
  'Lighting','Interior','Exterior','Body Panels','Cooling','Fuel System',
  'Exhaust','Wheels & Tyres','Doors & Windows','Mirrors','AC & Heating',
  'Sensors','ECU / Modules','Accessories','Other'
];

const conditions = [
  'New Old Stock','Used Excellent','Used Good','Used Fair','Reconditioned','Damaged'
];

/* ---------- STYLES ---------- */

const container = { padding:'40px', maxWidth:'900px', margin:'auto' };
const title = { fontSize:'32px', fontWeight:'900', marginBottom:'20px' };
const form = { display:'flex', flexDirection:'column', gap:'25px' };
const section = { background:'#fff', padding:'20px', borderRadius:'15px', border:'1px solid #e2e8f0' };
const grid = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px' };
const input = { width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #ccc' };
const button = { padding:'15px', background:'#ef4444', color:'#fff', border:'none', borderRadius:'10px', fontWeight:'800' };
