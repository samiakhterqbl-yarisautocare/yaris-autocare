import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { 
  Search, Menu, X, Car, Wrench, Scissors, 
  ShoppingCart, ShieldCheck, Phone, MapPin, 
  Package, LayoutDashboard, AlertTriangle, BarChart3, FileText
} from 'lucide-react';

// --- IMPORT ALL MODULES ---
import HomePage from './HomePage';
import AftermarketModule from './AftermarketModule';
import AftermarketNewPage from './AftermarketNewPage';
import UsedPartsModule from './UsedPartsModule';
import UsedPartAddPage from './UsedPartAddPage';
import UsedPartDetailPage from './UsedPartDetailPage';
import UsedPartEditPage from './UsedPartEditPage';

// --- NEW MODULES FOR COMPLETION ---
const DismantleModule = () => <div style={p50}><h2>Dismantle Yard</h2><p>Select donor car to begin salvage...</p></div>;
const SalesModule = () => <div style={p50}><h2>Point of Sale & Invoicing</h2><p>Generate ABN compliant tax invoices...</p></div>;
const SummaryModule = () => <div style={p50}><h2>Business Summary</h2><p>Revenue and Inventory analytics...</p></div>;
const LowStockModule = () => <div style={p50}><h2>Low Stock Alerts</h2><p>Items below minimum threshold...</p></div>;

const COLORS = {
  primary: '#ef4444',
  dark: '#0f172a',
  slate: '#64748b',
  bg: '#f8fafc',
  white: '#ffffff',
  border: '#e2e8f0',
  warning: '#f59e0b'
};

const Header = () => {
  const [isMobileMenu, setIsMobileMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <nav style={headerStyle}>
      <div style={navContainer}>
        <Link to="/" style={logoStyle}>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '900' }}>
            YARIS <span style={{ color: COLORS.primary }}>AUTOCARE</span>
          </h1>
        </Link>

        {/* DESKTOP NAV */}
        <div style={navLinks}>
          <Link to="/used-parts" style={linkStyle}><Package size={16}/> Used</Link>
          <Link to="/aftermarket" style={linkStyle}><Wrench size={16}/> New</Link>
          <Link to="/dismantle" style={linkStyle}><Scissors size={16}/> Dismantle</Link>
          <Link to="/sales" style={linkStyle}><ShoppingCart size={16}/> Sales</Link>
          
          <div style={{ height: '20px', width: '1px', backgroundColor: COLORS.border, margin: '0 10px' }}></div>
          
          <Link to="/low-stock" style={{ ...linkStyle, color: COLORS.warning }}>
            <AlertTriangle size={16}/> <span style={{fontWeight: '900'}}>18</span>
          </Link>
          
          <button onClick={() => navigate('/sales')} style={saleBtn}>+ INVOICE</button>
        </div>

        <div style={mobileToggle} onClick={() => setIsMobileMenu(!isMobileMenu)}>
          {isMobileMenu ? <X /> : <Menu />}
        </div>
      </div>

      {isMobileMenu && (
        <div style={mobileDropdown}>
          <Link to="/used-parts" onClick={() => setIsMobileMenu(false)} style={mobileLink}>Used Inventory</Link>
          <Link to="/aftermarket" onClick={() => setIsMobileMenu(false)} style={mobileLink}>Aftermarket New</Link>
          <Link to="/dismantle" onClick={() => setIsMobileMenu(false)} style={mobileLink}>Dismantle Yard</Link>
          <Link to="/sales" onClick={() => setIsMobileMenu(false)} style={mobileLink}>Sales & Invoicing</Link>
          <Link to="/summary" onClick={() => setIsMobileMenu(false)} style={mobileLink}>Business Summary</Link>
        </div>
      )}
    </nav>
  );
};

const Footer = () => (
  <footer style={footerStyle}>
    <div style={footerGrid}>
      <div style={footerSection}>
        <h3 style={{ color: '#fff', marginBottom: '10px' }}>YARIS AUTOCARE</h3>
        <p style={{ fontSize: '13px' }}>Specialist Toyota Dismantlers. Northern Tasmania.</p>
        <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            <div style={badge}><ShieldCheck size={12}/> Licensed</div>
            <div style={badge}><Package size={12}/> S3 Cloud Secured</div>
        </div>
      </div>
      <div style={footerSection}>
        <h4 style={footTitle}>QUICK LINKS</h4>
        <Link to="/summary" style={footLink}>Revenue Summary</Link>
        <Link to="/low-stock" style={footLink}>Reorder Alerts</Link>
        <Link to="/sales" style={footLink}>Tax Invoices</Link>
      </div>
      <div style={footerSection}>
        <h4 style={footTitle}>BUSINESS DETAILS</h4>
        <p style={footText}>ABN: 91 650 944 157</p>
        <p style={footText}>PH: 0449 828 749</p>
        <p style={footText}>TAS LIC: 6130 / 419296067</p>
      </div>
    </div>
  </footer>
);

export default function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: COLORS.bg }}>
        <Header />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            
            {/* USED PARTS */}
            <Route path="/used-parts" element={<UsedPartsModule />} />
            <Route path="/used-parts/add" element={<UsedPartAddPage />} />
            <Route path="/used-parts/:id" element={<UsedPartDetailPage />} />
            <Route path="/used-parts/edit/:id" element={<UsedPartEditPage />} />
            
            {/* AFTERMARKET */}
            <Route path="/aftermarket" element={<AftermarketModule />} />
            <Route path="/aftermarket/new" element={<AftermarketNewPage />} />
            
            {/* NEW BUSINESS OPERATIONS */}
            <Route path="/dismantle" element={<DismantleModule />} />
            <Route path="/sales" element={<SalesModule />} />
            <Route path="/summary" element={<SummaryModule />} />
            <Route path="/low-stock" element={<LowStockModule />} />

            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

// --- STYLES ---
const p50 = { padding: '50px', maxWidth: '1200px', margin: '0 auto' };
const headerStyle = { backgroundColor: COLORS.white, borderBottom: `1px solid ${COLORS.border}`, position: 'sticky', top: 0, zIndex: 1000 };
const navContainer = { maxWidth: '1200px', margin: '0 auto', padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' };
const logoStyle = { textDecoration: 'none', color: COLORS.dark };
const navLinks = { display: 'flex', alignItems: 'center', gap: '25px' };
const linkStyle = { textDecoration: 'none', color: COLORS.dark, fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' };
const saleBtn = { backgroundColor: COLORS.dark, color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '12px' };
const mobileToggle = { cursor: 'pointer', display: 'none' }; // Show in Media Queries
const mobileDropdown = { backgroundColor: COLORS.white, borderBottom: `1px solid ${COLORS.border}`, padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' };
const mobileLink = { textDecoration: 'none', color: COLORS.dark, fontWeight: '800' };

const footerStyle = { backgroundColor: '#020617', color: '#94a3b8', padding: '60px 20px', marginTop: 'auto' };
const footerGrid = { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px' };
const footerSection = { display: 'flex', flexDirection: 'column' };
const footTitle = { color: '#fff', fontSize: '14px', marginBottom: '15px', fontWeight: '800' };
const footLink = { color: '#94a3b8', textDecoration: 'none', fontSize: '13px', marginBottom: '8px' };
const footText = { fontSize: '12px', margin: '0 0 5px 0' };
const badge = { backgroundColor: '#1e293b', color: '#22c55e', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' };
