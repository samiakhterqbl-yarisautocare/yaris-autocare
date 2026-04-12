import React, { useState, useEffect } from 'react'; // 1. Added useEffect
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // 2. Added Axios
import { 
  Plus, Minus, Search, Maximize2, Camera, X
} from 'lucide-react';

const API_URL = 'https://yaris-autocare-production.up.railway.app';

const COLORS = { 
  primary: '#ef4444', 
  dark: '#0f172a', 
  border: '#e2e8f0', 
  bg: '#f8fafc', 
  slate: '#64748b',
  success: '#166534',
  successBg: '#dcfce7'
};

const AftermarketModule = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [stock, setStock] = useState([]); // Start with empty list
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA FROM RAILWAY ---
  const fetchInventory = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/parts/`);
      setStock(response.data);
    } catch (error) {
      console.error("Failed to load inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const adjustQty = async (id, amount) => {
    // Optimistic UI update
    setStock(stock.map(item => item.id === id ? { ...item, quantity: Math.max(0, item.quantity + amount) } : item));
    
    // Optional: Add axios.patch here later to save the new qty to cloud
  };

  // Filter logic - using 'part_name' and 'quantity' to match your model
  const filteredStock = stock.filter(item => 
    (item.part_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '25px', backgroundColor: COLORS.bg, minHeight: '100vh' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h2 style={{ fontWeight: '900', color: COLORS.dark, margin: 0, fontSize: '26px' }}>Aftermarket Inventory</h2>
          <p style={{ margin: 0, color: COLORS.slate, fontSize: '14px' }}>Cloud Database: {API_URL}</p>
        </div>
        <button 
          onClick={() => navigate('/aftermarket/new')} 
          style={primaryBtn}
        >
          <Plus size={18}/> NEW PRODUCT
        </button>
      </div>

      {/* SCAN / SEARCH BAR */}
      <div style={{ position: 'relative', marginBottom: '25px' }}>
        <Search size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: COLORS.slate }} />
        <input 
          placeholder="SCAN BARCODE OR SEARCH SKU..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={scanInputStyle} 
        />
        {searchTerm && (
          <X size={18} onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: COLORS.slate }} />
        )}
      </div>

      {/* INVENTORY TABLE */}
      <div style={containerStyle}>
        <div style={tableHeader}>
          <div style={{ width: '70px' }}>THUMB</div>
          <div style={{ flex: 2 }}>PRODUCT / SKU</div>
          <div style={{ flex: 1, textAlign: 'center' }}>STOCK CONTROL</div>
          <div style={{ flex: 1, textAlign: 'right' }}>PRICE / VIEW</div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading Yaris Inventory...</div>
        ) : filteredStock.length > 0 ? filteredStock.map(item => (
          <div key={item.id} style={tableRow}>
            
            <div style={{ width: '70px' }}>
              <div style={thumbBox}>
                <Camera size={18} color={COLORS.slate} />
              </div>
            </div>

            <div style={{ flex: 2 }}>
              <div style={{ fontWeight: '800', color: COLORS.dark, fontSize: '15px' }}>{item.part_name}</div>
              <div style={{ fontSize: '12px', fontWeight: '800', color: COLORS.primary, marginTop: '2px' }}>{item.sku}</div>
              <div style={{ fontSize: '11px', color: COLORS.slate, marginTop: '2px' }}>Loc: {item.location}</div>
            </div>

            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
              <button onClick={() => adjustQty(item.id, -1)} style={minusBtn}><Minus size={16}/></button>
              <div style={{ textAlign: 'center', minWidth: '60px' }}>
                <div style={{ fontWeight: '900', fontSize: '20px', color: item.quantity <= 5 ? COLORS.primary : COLORS.dark }}>
                  {item.quantity}
                </div>
              </div>
              <button onClick={() => adjustQty(item.id, 1)} style={plusBtn}><Plus size={16}/></button>
            </div>

            <div style={{ flex: 1, textAlign: 'right' }}>
              <div style={{ fontWeight: '900', fontSize: '16px', color: COLORS.dark, marginBottom: '8px' }}>
                ${parseFloat(item.sale_price).toFixed(2)}
              </div>
              <button onClick={() => navigate(`/aftermarket/${item.id}`)} style={viewBtn}>
                <Maximize2 size={14} /> DETAILS
              </button>
            </div>

          </div>
        )) : (
          <div style={{ padding: '40px', textAlign: 'center', color: COLORS.slate }}>
            No products found in cloud.
          </div>
        )}
      </div>
    </div>
  );
};

// ... (Rest of your styles stay the same)
const scanInputStyle = { width: '100%', padding: '16px 16px 16px 55px', borderRadius: '14px', border: `2px solid ${COLORS.dark}`, fontSize: '15px', fontWeight: '800', outline: 'none' };
const containerStyle = { backgroundColor: '#fff', borderRadius: '18px', border: `1px solid ${COLORS.border}`, overflow: 'hidden' };
const thumbBox = { width: '50px', height: '50px', backgroundColor: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const tableHeader = { display: 'flex', padding: '14px 20px', backgroundColor: COLORS.dark, color: '#fff', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' };
const tableRow = { display: 'flex', padding: '18px 20px', borderBottom: `1px solid ${COLORS.border}`, alignItems: 'center' };
const primaryBtn = { backgroundColor: COLORS.primary, color: '#fff', border: 'none', padding: '12px 22px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };
const plusBtn = { backgroundColor: COLORS.successBg, color: COLORS.success, border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer' };
const minusBtn = { backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer' };
const viewBtn = { background: 'none', border: `1px solid ${COLORS.border}`, padding: '8px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' };

export default AftermarketModule;
