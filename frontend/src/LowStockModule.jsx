import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, ShoppingCart, ArrowRight } from 'lucide-react';

const API_URL = 'https://yaris-autocare-production.up.railway.app';

export default function LowStockModule() {
  const [parts, setParts] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/api/low-stock/`).then(res => setParts(res.data));
  }, []);

  return (
    <div style={{padding: '40px'}}>
      <h2 style={{fontWeight: 900, display: 'flex', alignItems: 'center', gap: '15px'}}>
        <AlertTriangle color="#f59e0b" size={32}/> REORDER ALERTS
      </h2>
      <div style={{marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
        {parts.map(part => (
          <div key={part.id} style={alertCard}>
            <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
               <div style={qtyBadge}>{part.quantity} left</div>
               <div>
                 <div style={{fontWeight: 800}}>{part.part_name}</div>
                 <div style={{fontSize: '12px', color: '#64748b'}}>SKU: {part.sku} | Min: {part.min_stock_level}</div>
               </div>
            </div>
            <button style={orderBtn}>ORDER NOW <ArrowRight size={14}/></button>
          </div>
        ))}
      </div>
    </div>
  );
}

const alertCard = { backgroundColor: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const qtyBadge = { backgroundColor: '#fef2f2', color: '#ef4444', padding: '10px 15px', borderRadius: '10px', fontWeight: '900' };
const orderBtn = { backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };
