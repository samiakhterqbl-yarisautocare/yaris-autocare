import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'https://yaris-autocare-production.up.railway.app';

const AftermarketNewPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', sku: '', qty: 0, price: '' });

  const handleSave = async (e) => {
    // 1. THIS STOPS THE REDIRECT
    if (e) e.preventDefault();
    
    window.alert("CHECKPOINT 1: Button Clicked!");

    if (!formData.name) {
      window.alert("ERROR: Name is empty!");
      return;
    }

    setLoading(true);

    try {
      const dataToSend = {
        part_name: formData.name,
        sku: formData.sku,
        quantity: parseInt(formData.qty) || 0,
        sale_price: parseFloat(formData.price) || 0,
        supplier: "Manual Entry",
        cost_price: 0,
        location: "Yard",
        min_stock_level: 1
      };

      window.alert("CHECKPOINT 2: Sending to " + API_URL);

      const response = await axios.post(`${API_URL}/api/parts/`, dataToSend);
      
      window.alert("CHECKPOINT 3: SUCCESS! Status: " + response.status);
      navigate('/aftermarket');
      
    } catch (error) {
      window.alert("CHECKPOINT 4: FAILED! " + JSON.stringify(error.response?.data || error.message));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '50px', background: '#f8fafc', minHeight: '100vh' }}>
      <h1>Add New Part (Debug Mode)</h1>
      <p>Server: {API_URL}</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
        <input 
          placeholder="Part Name" 
          onChange={(e) => setFormData({...formData, name: e.target.value})} 
          style={{padding: '10px'}}
        />
        <input 
          placeholder="SKU" 
          onChange={(e) => setFormData({...formData, sku: e.target.value})} 
          style={{padding: '10px'}}
        />
        <input 
          placeholder="Price" 
          type="number"
          onChange={(e) => setFormData({...formData, price: e.target.value})} 
          style={{padding: '10px'}}
        />

        <button 
          onClick={handleSave} 
          style={{ padding: '20px', background: 'red', color: 'white', fontWeight: 'bold' }}
        >
          {loading ? "SAVING..." : "CONFIRM CREATE PRODUCT"}
        </button>
        
        <button onClick={() => navigate('/aftermarket')}>Cancel</button>
      </div>
    </div>
  );
};

export default AftermarketNewPage;
