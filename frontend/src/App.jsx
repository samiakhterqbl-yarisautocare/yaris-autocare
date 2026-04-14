import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Scissors, Package, Wrench, 
  ShoppingCart, Menu, X, ChevronRight, AlertTriangle, Settings, ExternalLink
} from 'lucide-react';

// Lazy Load All Modules (Ensure these filenames match your actual files EXACTLY)
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
// Added missing imports that were used in your routes:
const InventoryMasterModule = lazy(() => import('./InventoryMasterModule')); 
const DonorCarDetailView = lazy(() => import('./DonorCarDetailView'));

const COLORS = { 
  primary: '#ef4444', 
  dark: '#0f172a', 
  sidebar: '#1e293b', 
  bg: '#f8fafc', 
  border: '#e2e8f0' 
};

const DJANGO_ADMIN_URL = 'https://yaris-autocare-production.up.railway.app/admin/';

export default function App() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Router>
      <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: COLORS.bg }}>
        
        {/* SIDEBAR */}
        <aside style={{ 
          backgroundColor: COLORS.sidebar,
          width: isOpen ? '260px' : '0px',
          minWidth: isOpen ? '260px' : '0px',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.2s ease',
          overflow: 'hidden',
          color: '#fff',
          zIndex: 100
        }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ padding: '25px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ backgroundColor: COLORS.primary, width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#fff', fontSize: '20px' }}>Y</div>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#fff' }}>YARIS <span style={{color: COLORS.primary}}>AUTOCARE</span></h1>
            </div>
          </Link>
          
          <nav style={{ flex: 1, padding: '20px 0' }}>
            <NavItem to="/" icon={<LayoutDashboard size={20}/>} label="Dashboard" />
            <NavItem to="/used-parts" icon={<Package size={20}/>} label="Used Parts" />
            <NavItem to="/aftermarket" icon={<Wrench size={20}/>} label="Aftermarket" />
            <NavItem to="/low-stock" icon={<AlertTriangle size={20}/>} label="Low Stock" />
            <NavItem to="/dismantle" icon={<Scissors size={20}/>} label="Dismantle Yard" />
            <NavItem to="/sales" icon={<ShoppingCart size={20}/>} label="Sales & POS" />
          </nav>

          <div style={{ padding: '15px', borderTop: '1px solid #334155', backgroundColor: '#161e2b' }}>
            <a href={DJANGO_ADMIN_URL} target="_blank" rel="noopener noreferrer" style={adminLinkStyle}>
              <Settings size={16} />
              <span style={{ flex: 1 }}>SYSTEM ADMIN</span>
              <ExternalLink size={12} opacity={0.5} />
            </a>
          </div>
        </aside>

        {/* VIEWPORT */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh' }}>
          <header style={{ height: '64px', backgroundColor: '#fff', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
            <button onClick={() => setIsOpen(!isOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              {isOpen ? <X size={20}/> : <Menu size={20} />}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', fontWeight: '800' }}>ADMIN CONTROL</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Legana Yard Terminal</div>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: COLORS.dark, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>BA</div>
            </div>
          </header>

          <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
            <Suspense fallback={<div style={{ fontWeight: '700' }}>Loading Module...</div>}>
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
                <Route path="/yard-master" element={<InventoryMasterModule />} />
                <Route path="/yard-master/:id" element={<DonorCarDetailView />} />
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
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 25px', 
      textDecoration: 'none', fontSize: '14px', backgroundColor: isActive ? '#334155' : 'transparent',
      color: isActive ? '#fff' : '#cbd5e1', borderLeft: isActive ? `4px solid ${COLORS.primary}` : '4px solid transparent'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {icon} <span style={{ fontWeight: '600' }}>{label}</span>
      </div>
      {isActive && <ChevronRight size={14} />}
    </Link>
  );
};

const adminLinkStyle = { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', color: '#94a3b8', textDecoration: 'none', fontSize: '12px', fontWeight: '800' };
