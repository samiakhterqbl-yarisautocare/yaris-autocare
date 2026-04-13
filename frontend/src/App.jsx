import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Scissors, Package, Wrench, 
  ShoppingCart, Menu, X, ShieldCheck, ChevronRight, AlertTriangle
} from 'lucide-react';

// --- CORE MODULES ---
import HomePage from './HomePage';
import AftermarketModule from './AftermarketModule';
import AftermarketNewPage from './AftermarketNewPage';
import AftermarketEditPage from './AftermarketEditPage';
import AftermarketDetailPage from './AftermarketDetailPage';
import DismantleModule from './DismantleModule';

// --- USED PARTS MODULES ---
import UsedPartsModule from './UsedPartsModule';
import UsedPartAddPage from './UsedPartAddPage';
import UsedPartDetailPage from './UsedPartDetailPage';
import UsedPartEditPage from './UsedPartEditPage';

// --- SALES & BUSINESS MODULES ---
import SalesModule from './SalesModule';
import LowStockModule from './LowStockModule';

const COLORS = {
  primary: '#ef4444', 
  dark: '#0f172a',    
  sidebar: '#1e293b', 
  bg: '#f8fafc',
  border: '#e2e8f0',
  warning: '#f59e0b'
};

const NavItem = ({ to, icon, label, badge }) => (
  <Link to={to} style={navItemStyle}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      {icon}
      <span style={{ fontWeight: '600' }}>{label}</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {badge && <span style={badgeStyle}>{badge}</span>}
      <ChevronRight size={14} opacity={0.5} />
    </div>
  </Link>
);

export default function App() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: COLORS.bg }}>
        
        {/* SIDEBAR */}
        <aside style={{ ...sidebarContainer, width: isOpen ? '280px' : '0px', opacity: isOpen ? 1 : 0, overflow: 'hidden' }}>
          <div style={logoSection}>
            <div style={logoIcon}>Y</div>
            <h1 style={logoText}>YARIS <span style={{color: COLORS.primary}}>AUTOCARE</span></h1>
          </div>

          <nav style={navSection}>
            <NavItem to="/" icon={<LayoutDashboard size={18}/>} label="Dashboard" />
            <NavItem to="/used-parts" icon={<Package size={18}/>} label="Used Parts" />
            <NavItem to="/aftermarket" icon={<Wrench size={18}/>} label="Aftermarket" />
            <NavItem 
              to="/low-stock" 
              icon={<AlertTriangle size={18} color={COLORS.warning}/>} 
              label="Low Stock" 
              badge="!"
            />
            <NavItem to="/dismantle" icon={<Scissors size={18}/>} label="Dismantle Yard" />
            <NavItem to="/sales" icon={<ShoppingCart size={18}/>} label="Sales & POS" />
          </nav>

          <div style={sidebarFooter}>
            <div style={complianceBox}>
              <ShieldCheck size={14} color="#22c55e" />
              <div style={{display: 'flex', flexDirection: 'column'}}>
                <span style={{fontSize: '10px', fontWeight: 'bold'}}>LICENSED TAS DISMANTLER</span>
                <span style={{fontSize: '9px', opacity: 0.7}}>ABN 91 650 944 157</span>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <header style={headerStyle}>
            <button onClick={() => setIsOpen(!isOpen)} style={toggleBtn}>
              {isOpen ? <X size={20}/> : <Menu size={20} />}
            </button>
            
            <div style={userProfile}>
              <div style={{textAlign: 'right'}}>
                <div style={{fontSize: '13px', fontWeight: '800'}}>Admin Control</div>
                <div style={{fontSize: '11px', color: '#64748b'}}>Legana Warehouse</div>
              </div>
              <div style={avatar}>BA</div>
            </div>
          </header>

          <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
            <Routes>
              {/* HOME & ANALYTICS */}
              <Route path="/" element={<HomePage />} />
              <Route path="/low-stock" element={<LowStockModule />} />
              
              {/* USED PARTS */}
              <Route path="/used-parts" element={<UsedPartsModule />} />
              <Route path="/used-parts/add" element={<UsedPartAddPage />} />
              <Route path="/used-parts/:id" element={<UsedPartDetailPage />} />
              <Route path="/used-parts/edit/:id" element={<UsedPartEditPage />} />
              
              {/* AFTERMARKET */}
              <Route path="/aftermarket" element={<AftermarketModule />} />
              <Route path="/aftermarket/new" element={<AftermarketNewPage />} />
              <Route path="/aftermarket/edit/:id" element={<AftermarketEditPage />} />
              <Route path="/aftermarket/:id" element={<AftermarketDetailPage />} />
              
              {/* OPERATIONS */}
              <Route path="/dismantle" element={<DismantleModule />} />
              <Route path="/sales" element={<SalesModule />} />
              
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

// --- STYLES ---
const sidebarContainer = { backgroundColor: COLORS.sidebar, color: '#fff', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', zIndex: 100 };
const logoSection = { padding: '30px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #334155' };
const logoIcon = { backgroundColor: COLORS.primary, width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '18px' };
const logoText = { margin: 0, fontSize: '18px', fontWeight: '900', letterSpacing: '-1px' };
const navSection = { padding: '20px 15px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' };
const navItemStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 15px', borderRadius: '10px', textDecoration: 'none', color: '#cbd5e1', fontSize: '14px', transition: '0.2s' };
const badgeStyle = { backgroundColor: COLORS.warning, color: COLORS.dark, fontSize: '10px', fontWeight: '900', padding: '2px 6px', borderRadius: '4px' };
const sidebarFooter = { padding: '20px', borderTop: '1px solid #334155' };
const complianceBox = { display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8' };
const headerStyle = { height: '70px', backgroundColor: '#fff', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', position: 'sticky', top: 0, zIndex: 90 };
const toggleBtn = { background: 'none', border: 'none', cursor: 'pointer', color: COLORS.dark };
const userProfile = { display: 'flex', alignItems: 'center', gap: '12px' };
const avatar = { width: '35px', height: '35px', borderRadius: '10px', backgroundColor: COLORS.dark, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' };
