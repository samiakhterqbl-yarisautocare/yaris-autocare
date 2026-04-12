import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Truck, DollarSign, History, 
  ClipboardList, Info, AlertCircle, Edit2 
} from 'lucide-react';

const COLORS = { 
  primary: '#ef4444', 
  primarySoft: '#fef2f2', 
  dark: '#0f172a', 
  border: '#e2e8f0', 
  bg: '#f8fafc', 
  slate: '#64748b',
  lightText: '#94a3b8' 
};

const AftermarketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data - In the future, this will be fetched from your database
  const product = {
    id: id,
    name: 'Oil Filter - Yaris 2011-2014',
    sku: 'OF-TY-01',
    description: 'High-efficiency replacement oil filter designed for Toyota Yaris engines. Provides superior filtration and protection against engine wear. Recommended replacement every 10,000km.',
    specs: {
      "Thread Size": "3/4-16",
      "Outside Diameter": "65mm",
      "Height": "75mm",
      "Compatible Models": "Toyota Yaris (NCP130, NCP131)",
      "Warranty": "12 Months / 20,000km"
    },
    qty: 4,
    min_stock: 5,
    cost: 8.50,
    price: 25.00,
    loc: 'Shelf A1',
    supplier: 'Repco'
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', backgroundColor: COLORS.bg, minHeight: '100vh' }}>
      
      {/* HEADER ACTIONS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: COLORS.slate, cursor: 'pointer', fontWeight: '700' }}
        >
          <ArrowLeft size={18} /> BACK TO INVENTORY
        </button>
        
        <button 
          onClick={() => navigate(`/aftermarket/edit/${id}`)} 
          style={{ backgroundColor: COLORS.dark, color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Edit2 size={16} /> EDIT PRODUCT
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px' }}>
        
        {/* LEFT COLUMN: IMAGES & DESCRIPTION */}
        <div>
          <div style={{ backgroundColor: '#fff', borderRadius: '20px', border: `1px solid ${COLORS.border}`, height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
             <div style={{ color: '#cbd5e1', textAlign: 'center' }}>
               <History size={64} />
               <p style={{ fontWeight: '600', marginTop: '10px' }}>Product Images Gallery</p>
             </div>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '20px', border: `1px solid ${COLORS.border}` }}>
            <h3 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: '800' }}>
              <ClipboardList size={20} color={COLORS.primary} /> Product Description
            </h3>
            <p style={{ margin: 0, fontSize: '15px', color: '#475569', lineHeight: '1.7' }}>
              {product.description}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: DATA & STATUS */}
        <div>
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ margin: 0, fontSize: '36px', fontWeight: '900', color: COLORS.dark }}>{product.name}</h1>
            <div style={{ display: 'inline-block', backgroundColor: COLORS.primarySoft, color: COLORS.primary, padding: '6px 14px', borderRadius: '8px', fontWeight: '800', marginTop: '10px', fontSize: '14px' }}>
              SKU: {product.sku}
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
             <DetailBox label="LOCATION" value={product.loc} icon={<MapPin size={16} />} />
             <DetailBox label="SUPPLIER" value={product.supplier} icon={<Truck size={16} />} />
             <DetailBox label="COST PRICE" value={`$${product.cost.toFixed(2)}`} icon={<DollarSign size={16} />} />
             <DetailBox label="SALE PRICE" value={`$${product.price.toFixed(2)}`} icon={<DollarSign size={16} />} />
          </div>

          <div style={{ backgroundColor: COLORS.dark, padding: '30px', borderRadius: '24px', color: '#fff', marginBottom: '30px', textAlign: 'center' }}>
             <h4 style={{ margin: 0, fontSize: '12px', color: COLORS.lightText, letterSpacing: '0.1em' }}>CURRENT STOCK STATUS</h4>
             <div style={{ fontSize: '38px', fontWeight: '900', margin: '10px 0' }}>{product.qty} UNITS</div>
             {product.qty <= product.min_stock && (
               <div style={{ color: COLORS.primary, fontWeight: '800', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                 <AlertCircle size={16} /> LOW STOCK ALERT ACTIVE
               </div>
             )}
          </div>

          <div style={{ backgroundColor: '#fff', borderRadius: '20px', border: `1px solid ${COLORS.border}`, overflow: 'hidden' }}>
            <div style={{ padding: '15px 20px', backgroundColor: '#f1f5f9', borderBottom: `1px solid ${COLORS.border}`, fontWeight: '800', fontSize: '13px', color: COLORS.dark }}>
              TECHNICAL SPECIFICATIONS
            </div>
            {Object.entries(product.specs).map(([key, val], index) => (
              <div key={key} style={{ display: 'flex', padding: '14px 20px', borderBottom: index === Object.entries(product.specs).length - 1 ? 'none' : `1px solid #f1f5f9`, fontSize: '14px' }}>
                <div style={{ flex: 1, fontWeight: '700', color: COLORS.slate }}>{key}</div>
                <div style={{ flex: 1.5, color: COLORS.dark, fontWeight: '500' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailBox = ({ label, value, icon }) => (
  <div style={{ padding: '18px', backgroundColor: '#fff', borderRadius: '15px', border: `1px solid ${COLORS.border}` }}>
    <div style={{ fontSize: '10px', fontWeight: '800', color: COLORS.slate, marginBottom: '8px', letterSpacing: '0.05em' }}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', color: COLORS.dark, fontSize: '15px' }}>
      {React.cloneElement(icon, { color: COLORS.primary, size: 16 })} {value}
    </div>
  </div>
);

export default AftermarketDetailPage;