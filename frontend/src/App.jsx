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
  bg: '#f8fafc', 
  border: '#e2e8f0' 
};

export default function App() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Router>
      <div style={appWrapper}>
        
        {/* SIDEBAR - Fixed Industrial Sidebar */}
        <aside style={{ 
          ...sidebarStyle, 
          width: isOpen ? '260px' : '0px', 
          minWidth: isOpen ? '260px' : '0px',
          opacity: isOpen ? 1 : 0 
        }}>
          <div style={logoSection}>
            <div style={logoIcon}>Y</div>
            <h1 style={logoText}>YARIS <span style={{color: COLORS.primary}}>AUTOCARE</span></h1>
          </div>
          
          <nav style={navSection}>
            <NavItem to="/" icon={<LayoutDashboard size={20}/>} label="Dashboard" />
            <NavItem to="/used-parts" icon={<Package size={20}/>} label="Used Parts" />
            <NavItem to="/aftermarket" icon={<Wrench size={20}/>} label="Aftermarket" />
            <NavItem to="/low-stock" icon={<AlertTriangle size={20}/>} label="Low Stock" />
            <NavItem to="/dismantle" icon={<Scissors size={20}/>} label="Dismantle Yard" />
            <NavItem to="/sales" icon={<ShoppingCart size={20}/>} label="Sales & POS" />
          </nav>

          <div style={sidebarFooter}>
            <div style={{fontWeight: '700', color: '#94a3b8'}}>TERMINAL V2.0</div>
            <div>Tas Auto Wreckers</div>
          </div>
        </aside>

        {/* MAIN VIEWPORT */}
        <div style={viewport}>
          <header style={headerStyle}>
            <button onClick={() => setIsOpen(!isOpen)} style={toggleBtn}>
              {isOpen ? <X size={20}/> : <Menu size={20} />}
            </button>
            
            <div style={userHeader}>
              <div style={{textAlign: 'right'}}>
                <div style={userTitle}>ADMIN CONTROL</div>
                <div style={userSub}>Legana Yard Terminal</div>
              </div>
              <div style={avatar}>BA</div>
            </div>
          </header>

          <main style={contentArea}>
            <Suspense fallback={<div style={loading}>Initializing Module...</div>}>
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
      color: isActive ? '#fff' : '#cbd5e1',
      borderLeft: isActive ? `4px solid ${COLORS.primary}` : '4px solid transparent'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {icon} <span style={{fontWeight: '600'}}>{label}</span>
      </div>
      {isActive && <ChevronRight size={14} />}
    </Link>
  );
};

// --- INDUSTRIAL LAYOUT STYLES ---
const appWrapper = { display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: COLORS.bg };
const sidebarStyle = { backgroundColor: COLORS.sidebar, color: '#fff', display: 'flex', flexDirection: 'column', transition: 'all 0.2s ease' };
const logoSection = { padding: '25px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #334155' };
const logoIcon = { backgroundColor: COLORS.primary, width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' };
const logoText = { margin: 0, fontSize: '18px', fontWeight: '900', letterSpacing: '-0.5px' };
const navSection = { padding: '20px 0', flex: 1 };
const navItemStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', textDecoration: 'none', fontSize: '14px', transition: '0.2s' };
const sidebarFooter = { padding: '20px', fontSize: '10px', borderTop: '1px solid #334155' };
const viewport = { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' };
const headerStyle = { height: '64px', backgroundColor: '#fff', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' };
const toggleBtn = { background: 'none', border: 'none', cursor: 'pointer', color: COLORS.dark };
const userHeader = { display: 'flex', alignItems: 'center', gap: '12px' };
const userTitle = { fontSize: '12px', fontWeight: '800', color: COLORS.dark };
const userSub = { fontSize: '11px', color: '#64748b' };
const avatar = { width: '36px', height: '36px', borderRadius: '8px', backgroundColor: COLORS.dark, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' };
const contentArea = { flex: 1, overflowY: 'auto', padding: '24px', boxSizing: 'border-box' };
const loading = { padding: '24px', fontWeight: '700', color: COLORS.dark };
