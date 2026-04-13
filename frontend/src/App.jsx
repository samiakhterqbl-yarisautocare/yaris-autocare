import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Scissors, Package, Wrench, 
  ShoppingCart, Menu, X, ChevronRight, AlertTriangle
} from 'lucide-react';

// Lazy Load Modules
const HomePage = lazy(() => import('./HomePage'));
const AftermarketModule = lazy(() => import('./AftermarketModule'));
const AftermarketDetailPage = lazy(() => import('./AftermarketDetailPage'));
const AftermarketNewPage = lazy(() => import('./AftermarketNewPage'));
const AftermarketEditPage = lazy(() => import('./AftermarketEditPage'));
const DismantleModule = lazy(() => import('./DismantleModule'));
const LowStockModule = lazy(() => import('./LowStockModule'));
const SalesModule = lazy(() => import('./SalesModule'));
const UsedPartsModule = lazy(() => import('./UsedPartsModule'));
const UsedPartAddPage = lazy(() => import('./UsedPartAddPage'));
const UsedPartDetailPage = lazy(() => import('./UsedPartDetailPage'));

const COLORS = { 
  primary: '#ef4444', 
  dark: '#0f172a', 
  sidebar: '#1e293b', 
  bg: '#f1f5f9', 
  border: '#e2e8f0', 
  warning: '#f59e0b' 
};

export default function App() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: COLORS.bg, width: '100vw', overflowX: 'hidden' }}>
        
        {/* SIDEBAR */}
        <aside style={{ 
          ...sidebarStyle, 
          width: isOpen ? '260px' : '0px', 
          minWidth: isOpen ? '260px' : '0px',
          opacity: isOpen ? 1 : 0,
          overflow: 'hidden'
        }}>
          <div style={logoSection}>
            <div style={logoIcon}>Y</div>
            <h1 style={logoText}>YARIS <span style={{color: COLORS.primary}}>AUTOCARE</span></h1>
          </div>
          <nav style={navSection}>
            <NavItem to="/" icon={<LayoutDashboard size={20}/>} label="Dashboard" />
            <NavItem to="/used-parts" icon={<Package size={20}/>} label="Used Parts" />
            <NavItem to="/aftermarket" icon={<Wrench size={20}/>} label="Aftermarket" />
            <NavItem to="/low-stock" icon={<AlertTriangle size={20} color={COLORS.warning}/>} label="Low Stock" />
            <NavItem to="/dismantle" icon={<Scissors size={20}/>} label="Dismantle Yard" />
            <NavItem to="/sales" icon={<ShoppingCart size={20}/>} label="Sales & POS" />
          </nav>
          <div style={sidebarFooter}>
            Tas Auto Wreckers Terminal
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
          <header style={headerStyle}>
            <button onClick={() => setIsOpen(!isOpen)} style={toggleBtn}>
              {isOpen ? <X size={22}/> : <Menu size={22} />}
            </button>
            
            <div style={userProfile}>
              <div style={{textAlign: 'right'}}>
                <div style={{fontSize: '14px', fontWeight: '800', color: COLORS.dark}}>Admin Control</div>
                <div style={{fontSize: '12px', color: '#64748b'}}>Legana Terminal</div>
              </div>
              <div style={avatar}>BA</div>
            </div>
          </header>

          <main style={mainContentStyle}>
            <Suspense fallback={<div style={{padding: '40px', fontWeight: 'bold'}}>Loading...</div>}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/used-parts" element={<UsedPartsModule />} />
                <Route path="/used-parts/add" element={<UsedPartAddPage />} />
                <Route path="/used-parts/:id" element={<UsedPartDetailPage />} />
                <Route path="/aftermarket" element={<AftermarketModule />} />
                <Route path="/aftermarket/new" element={<AftermarketNewPage />} />
                <Route path="/aftermarket/edit/:id" element={<AftermarketEditPage />} />
                <Route path="/aftermarket/:id" element={<AftermarketDetailPage />} />
                <Route path="/dismantle" element={<DismantleModule />} />
                <Route path="/sales" element={<SalesModule />} />
                <Route path="/low-stock" element={<LowStockModule />} />
                <Route path="*" element={<HomePage />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
    </Router>
  );
}

const NavItem = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} style={{ 
      ...navItemStyle, 
      backgroundColor: isActive ? '#334155' : 'transparent',
      color: isActive ? '#fff' : '#cbd5e1'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {icon} 
        <span style={{fontWeight: '600'}}>{label}</span>
      </div>
      {isActive && <ChevronRight size={14} />}
    </Link>
  );
};

// --- STYLES ---
const sidebarStyle = { backgroundColor: COLORS.sidebar, color: '#fff', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', zIndex: 100 };
const logoSection = { padding: '30px 24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #334155' };
const logoIcon = { backgroundColor: COLORS.primary, width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '18px' };
const logoText = { margin: 0, fontSize: '20px', fontWeight: '900', letterSpacing: '-1px' };
const navSection = { padding: '24px 16px', flex: 1 };
const navItemStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '12px', textDecoration: 'none', fontSize: '15px', marginBottom: '8px', transition: '0.2s' };
const sidebarFooter = { padding: '20px', fontSize: '11px', color: '#64748b', textAlign: 'center', borderTop: '1px solid #334155' };

const headerStyle = { height: '80px', backgroundColor: '#fff', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', position: 'sticky', top: 0, zIndex: 90 };
const mainContentStyle = { flex: 1, padding: '40px', width: '100%', boxSizing: 'border-box' };
const toggleBtn = { background: 'none', border: 'none', cursor: 'pointer', color: COLORS.dark };
const userProfile = { display: 'flex', alignItems: 'center', gap: '16px' };
const avatar = { width: '42px', height: '42px', borderRadius: '12px', backgroundColor: COLORS.dark, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' };
