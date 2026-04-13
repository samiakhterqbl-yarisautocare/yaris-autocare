import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'https://yaris-autocare-production.up.railway.app';

export default function UsedPartAddPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    part_name: '', category: 'Engine', condition: 'Used', price: '', location: ''
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/used-parts/`, formData);
      alert("Part Added Successfully!");
      navigate('/used-parts');
    } catch (err) {
      alert("Error saving part.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px', backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
      <h2 style={{ fontWeight: '900', marginBottom: '25px' }}>Add Salvaged Part</h2>
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input placeholder="Part Name (e.g. Alternator)" required style={inputStyle} onChange={e => setFormData({...formData, part_name: e.target.value})} />
        <select style={inputStyle} onChange={e => setFormData({...formData, category: e.target.value})}>
          <option>Engine</option>
          <option>Body Panels</option>
          <option>Transmission</option>
          <option>Electrical</option>
        </select>
        <input placeholder="Price ($)" type="number" required style={inputStyle} onChange={e => setFormData({...formData, price: e.target.value})} />
        <input placeholder="Location (e.g. Shelf B1)" style={inputStyle} onChange={e => setFormData({...formData, location: e.target.value})} />
        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? "SAVING..." : "ADD TO INVENTORY"}
        </button>
      </form>
    </div>
  );
}

const inputStyle = { padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' };
const btnStyle = { padding: '15px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' };
