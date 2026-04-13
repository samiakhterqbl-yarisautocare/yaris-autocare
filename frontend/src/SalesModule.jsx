import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShoppingCart, Search, Trash2, FileText, 
  User, Phone, Printer, Plus, Minus, Receipt 
} from 'lucide-react';

const API_URL = 'https://yaris-autocare-production.up.railway.app';

export default function SalesModule() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ name: 'Walk-in Customer', phone: '' });
  const [loading, setLoading] = useState(false);

  // Search Logic
  useEffect(() => {
    if (searchTerm.length > 2) {
      const delayDebounceFn = setTimeout(() => {
        axios.get(`${API_URL}/api/used-parts/?search=${searchTerm}`)
          .then(res => setSearchResults(res.data))
          .catch(err => console.error(err));
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const addToCart = (item) => {
    if (cart.find(i => i.id === item.id)) return;
    setCart([...cart, { ...item, qty: 1 }]);
    setSearchTerm('');
    setSearchResults([]);
  };

  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));

  const calculateTotal = () => cart.reduce((total, item) => total + (parseFloat(item.price) * item.qty), 0);

  const handleProcessSale = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    setLoading(true);

    const invoiceData = {
      customer_name: customer.name,
      customer_phone: customer.phone,
      total_amount: calculateTotal(),
      items: cart.map(item => ({
        id: item.id,
        name: item.part_name,
        price: item.price,
        qty: item.qty
      }))
    };

    try {
      const res = await axios.post(`${API_URL}/api/invoices/`, invoiceData);
      alert(`Invoice ${res.data.invoice_number} Generated Successfully!`);
      setCart([]);
      setCustomer({ name: 'Walk-in Customer', phone: '' });
      // In a real scenario, you'd trigger window.open(res.data.pdf_invoice) here
    } catch (err) {
      alert("Error processing sale.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px', animation: 'fadeIn 0.5s' }}>
      
      {/* LEFT: PART SEARCH & SELECTION */}
      <div style={cardStyle}>
        <h2 style={{ fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={24} color="#ef4444" /> POS Terminal
        </h2>
        
        <div style={{ position: 'relative', marginTop: '20px' }}>
          <input 
            style={searchBarStyle} 
            placeholder="Search parts by name, stock # or category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          {searchResults.length > 0 && (
            <div style={resultsDropdown}>
              {searchResults.map(item => (
                <div key={item.id} onClick={() => addToCart(item)} style={resultItem}>
                  <span>{item.part_name} - <small>{item.donor_car_stock}</small></span>
                  <span style={{ fontWeight: '900' }}>${item.price}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: '30px' }}>
          <h4 style={sectionLabel}>CURRENT ITEMS</h4>
          {cart.length === 0 ? (
            <div style={emptyCart}><ShoppingCart size={40} opacity={0.2} /><p>Search and add parts to begin</p></div>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#64748b', fontSize: '12px' }}>
                  <th>PART</th>
                  <th>PRICE</th>
                  <th>QTY</th>
                  <th>TOTAL</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '15px 0' }}>{item.part_name}</td>
                    <td>${item.price}</td>
                    <td>{item.qty}</td>
                    <td style={{ fontWeight: '700' }}>${(item.price * item.qty).toFixed(2)}</td>
                    <td><Trash2 size={16} color="#ef4444" style={{ cursor: 'pointer' }} onClick={() => removeFromCart(item.id)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* RIGHT: CUSTOMER & CHECKOUT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={cardStyle}>
          <h4 style={sectionLabel}>CUSTOMER DETAILS</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={inputGroup}><User size={16}/> <input style={miniInput} placeholder="Name" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} /></div>
            <div style={inputGroup}><Phone size={16}/> <input style={miniInput} placeholder="Phone" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} /></div>
          </div>
        </div>

        <div style={{ ...cardStyle, backgroundColor: '#0f172a', color: '#fff' }}>
          <h4 style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>GRAND TOTAL</h4>
          <div style={{ fontSize: '42px', fontWeight: '900' }}>${calculateTotal().toFixed(2)}</div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Includes GST: ${(calculateTotal() / 11).toFixed(2)}</div>
          
          <button 
            disabled={loading || cart.length === 0} 
            onClick={handleProcessSale} 
            style={checkoutBtn}
          >
            {loading ? "PROCESSING..." : "PROCESS SALE & INVOICE"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---
const cardStyle = { backgroundColor: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0' };
const searchBarStyle = { width: '100%', padding: '18px 25px', borderRadius: '15px', border: '1px solid #e2e8f0', fontSize: '16px', outline: 'none' };
const resultsDropdown = { position: 'absolute', width: '100%', backgroundColor: '#fff', borderRadius: '15px', border: '1px solid #e2e8f0', marginTop: '5px', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', zIndex: 10 };
const resultItem = { padding: '15px 20px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' };
const sectionLabel = { fontSize: '11px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '15px' };
const emptyCart = { textAlign: 'center', padding: '60px 0', color: '#cbd5e1' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const inputGroup = { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f8fafc', padding: '10px 15px', borderRadius: '12px', border: '1px solid #e2e8f0' };
const miniInput = { border: 'none', background: 'none', outline: 'none', fontSize: '14px', width: '100%' };
const checkoutBtn = { width: '100%', marginTop: '30px', padding: '20px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: '900', cursor: 'pointer' };
