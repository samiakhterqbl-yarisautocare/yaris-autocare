import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Search, Maximize2, Camera, AlertCircle } from 'lucide-react';

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

  // Mock data representing your ~200 items
  const [stock, setStock] = useState([
    { id: 1, name: 'Oil Filter - Yaris 2011-14', sku: 'OF-TY-01', qty: 4, min_stock: 5, price: 25.00, loc: 'Shelf A1', img: null },
    { id: 2, name: 'Brake Pad Set (Front)', sku: 'BP-TY-F', qty: 12, min_stock: 5, price: 85.00, loc: 'Rack 2', img: null },
    { id: 3, name: 'Wing Mirror Glass (L)', sku: 'WM-TY-13L', qty: 2, min_stock: 3, price: 45.00, loc: 'Shelf B4', img: null },
  ]);

  const adjustQty = (id, amount) => {
    setStock(stock.map(item => item.id === id ? { ...item, qty: Math.max(0, item.qty + amount) } : item));
  };

  // Filter logic for Searching/Scanning
  const filteredStock = stock.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '25px', backgroundColor: COLORS.bg, minHeight: '100vh' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h2 style={{ fontWeight: '900', color: COLORS.dark, margin: 0, fontSize: '26px' }}>Aftermarket Inventory</h2>
          <p style={{ margin: 0, color: COLORS.slate, fontSize: '14px' }}>Manage recurring stock and scanning</p>
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

        {filteredStock.length > 0 ? filteredStock.map(item => (
          <div key={item.id} style={tableRow}>
            
            {/* Thumbnail Box */}
            <div style={{ width: '70px' }}>
              <div style={thumbBox}>
                {item.img ? (
                  <img src={item.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="part" />
                ) : (
                  <Camera size={18} color={COLORS.slate} />
                )}
              </div>
            </div>

            {/* Name & SKU */}
            <div style={{ flex: 2 }}>
              <div style={{ fontWeight: '800', color: COLORS.dark, fontSize: '15px' }}>{item.name}</div>
              <div style={{ fontSize: '12px', fontWeight: '800', color: COLORS.primary, marginTop: '2px' }}>{item.sku}</div>
              <div style={{ fontSize: '11px', color: COLORS.slate, marginTop: '2px' }}>Loc: {item.loc}</div>
            </div>

            {/* Stock Control (Scan In/Out Simulation) */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
              <button onClick={() => adjustQty(item.id, -1)} style={minusBtn} title="Sell (Scan Out)">
                <Minus size={16}/>
              </button>
              
              <div style={{ textAlign: 'center', minWidth: '60px' }}>
                <div style={{ 
                  fontWeight: '900', 
                  fontSize: '20px', 
                  color: item.qty <= item.min_stock ? COLORS.primary : COLORS.dark 
                }}>
                  {item.qty}
                </div>
                {item.qty <= item.min_stock && (
                  <div style={{ fontSize: '9px', color: COLORS.primary, fontWeight: '900', letterSpacing: '0.05em' }}>
                    LOW STOCK
                  </div>
                )}
              </div>

              <button onClick={() => adjustQty(item.id, 1)} style={plusBtn} title="Receive (Scan In)">
                <Plus size={16}/>
              </button>
            </div>

            {/* Price & Actions */}
            <div style={{ flex: 1, textAlign: 'right' }}>
              <div style={{ fontWeight: '900', fontSize: '16px', color: COLORS.dark, marginBottom: '8px' }}>
                ${item.price.toFixed(2)}
              </div>
              <button onClick={() => navigate(`/aftermarket/${item.id}`)} style={viewBtn}>
                <Maximize2 size={14} /> DETAILS
              </button>
            </div>

          </div>
        )) : (
          <div style={{ padding: '40px', textAlign: 'center', color: COLORS.slate }}>
            No products found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
};

// --- STYLES ---
const scanInputStyle = { 
  width: '100%', 
  padding: '16px 16px 16px 55px', 
  borderRadius: '14px', 
  border: `2px solid ${COLORS.dark}`, 
  fontSize: '15px', 
  fontWeight: '800',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  outline: 'none'
};

const containerStyle = { 
  backgroundColor: '#fff', 
  borderRadius: '18px', 
  border: `1px solid ${COLORS.border}`, 
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
};

const thumbBox = { 
  width: '50px', 
  height: '50px', 
  backgroundColor: '#f1f5f9', 
  borderRadius: '10px', 
  overflow: 'hidden', 
  border: `1px solid ${COLORS.border}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const tableHeader = { 
  display: 'flex', 
  padding: '14px 20px', 
  backgroundColor: COLORS.dark, 
  color: '#fff', 
  fontSize: '11px', 
  fontWeight: '800',
  letterSpacing: '0.05em',
  textTransform: 'uppercase'
};

const tableRow = { 
  display: 'flex', 
  padding: '18px 20px', 
  borderBottom: `1px solid ${COLORS.border}`, 
  alignItems: 'center',
  transition: 'background-color 0.2s'
};

const primaryBtn = { 
  backgroundColor: COLORS.primary, 
  color: '#fff', 
  border: 'none', 
  padding: '12px 22px', 
  borderRadius: '12px', 
  fontWeight: '800', 
  cursor: 'pointer', 
  display: 'flex', 
  alignItems: 'center', 
  gap: '8px',
  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)'
};

const plusBtn = { backgroundColor: COLORS.successBg, color: COLORS.success, border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer', display: 'flex' };
const minusBtn = { backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer', display: 'flex' };
const viewBtn = { background: 'none', border: `1px solid ${COLORS.border}`, padding: '8px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' };

export default AftermarketModule;