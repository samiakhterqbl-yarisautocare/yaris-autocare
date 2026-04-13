import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Scissors, Package, Wrench, 
  ShoppingCart, Menu, X, ShieldCheck, ChevronRight, AlertTriangle
} from 'lucide-react';

// --- IMPORTS MATCHING YOUR SCREENSHOT ---
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

const COLORS = { primary: '#ef4444', dark: '#0f172a', sidebar: '#1e293b', bg: '#f8fafc', border: '#e2e8f0', warning: '#f59e0b' };

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
            <NavItem to="/low-stock" icon={<AlertTriangle size={18} color={COLORS.warning}/>} label="Low Stock" />
            <NavItem to="/dismantle" icon={<Scissors size={18}/>} label="Dismantle Yard" />
            <NavItem to="/sales" icon={<ShoppingCart size={18}/>} label="Sales & POS" />
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <header style={headerStyle}>
            <button onClick={() => setIsOpen(!isOpen)} style={toggleBtn}>{isOpen ? <X size={20}/> : <Menu size={20} />}</button>
            <div style={userProfile}>
              <div style={{textAlign: 'right'}}>
                <div style={{fontSize: '13px', fontWeight: '800'}}>Admin Control</div>
                <div style={{fontSize: '11px', color: '#64748b'}}>Tas Auto Wreckers</div>
              </div>
              <div style={avatar}>BA</div>
            </div>
          </header>

          <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
            <Suspense fallback={<div style={{padding: '20px'}}>Loading Yaris Autocare Terminal...</div>}>
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

const NavItem = ({ to, icon, label }) => (
  <Link to={to} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 15px', borderRadius: '10px', textDecoration: 'none', color: '#cbd5e1', fontSize: '14px', marginBottom: '5px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>{icon} <span style={{fontWeight: '600'}}>{label}</span></div>
    <ChevronRight size={14} opacity={0.3} />
  </Link>
);

const sidebarContainer = { backgroundColor: COLORS.sidebar, color: '#fff', transition: 'all 0.3s', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' };
const logoSection = { padding: '30px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #334155' };
const logoIcon = { backgroundColor: COLORS.primary, width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' };
const logoText = { margin: 0, fontSize: '18px', fontWeight: '900', letterSpacing: '-1px' };
const navSection = { padding: '20px 15px', flex: 1 };
const headerStyle = { height: '70px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px' };
const toggleBtn = { background: 'none', border: 'none', cursor: 'pointer' };
const userProfile = { display: 'flex', alignItems: 'center', gap: '12px' };
const avatar = { width: '35px', height: '35px', borderRadius: '10px', backgroundColor: COLORS.dark, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' };
