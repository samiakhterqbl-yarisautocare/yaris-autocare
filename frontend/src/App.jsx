import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Scissors, Package, Wrench, 
  ShoppingCart, AlertTriangle, FileText, Search, 
  Menu, X, ShieldCheck, Phone, MapPin, BarChart3
} from 'lucide-react';

// --- MODULE IMPORTS ---
import HomePage from './HomePage';
import AftermarketModule from './AftermarketModule';
import AftermarketNewPage from './AftermarketNewPage';
import AftermarketDetailPage from './AftermarketDetailPage';
import UsedPartsModule from './UsedPartsModule';
import UsedPartAddPage from './UsedPartAddPage';
import UsedPartDetailPage from './UsedPartDetailPage';
import UsedPartEditPage from './UsedPartEditPage';

// --- PLACEHOLDER COMPONENTS FOR NEW MODULES ---
const DismantleModule = () => <div style={p50}><h2>Dismantle Yard</h2><p>Select donor car to begin salvage checklist...</p></div>;
const SalesModule = () => <div style={p50}><h2>Sales & Invoicing</h2><p>Generate ABN compliant tax invoices and labels...</p></div>;
const SummaryModule = () => <div style={p50}><h2>Business Summary</h2><p>Revenue and stock performance analytics...</p></div>;
const LowStockModule = () => <div style={p50}><h2>Low Stock Alerts</h2><p>Aftermarket items below minimum threshold...</p></div>;

const COLORS = {
  primary: '#ef4444', // Yaris Red
  dark: '#0f172a',    // Deep Navy Sidebar
  slate: '#64748b',
  bg: '#f8fafc',
  white: '#ffffff',
  border: '#e2e8f0',
  warning: '#f59e0b'
};

// --- SUB-COMPONENT: SIDEBAR LINK ---
const MenuLink = ({ to, icon, label, badge }) => (
  <Link to={to} style={menuLinkStyle}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      {icon}
      <span style={{ fontWeight: '600', fontSize: '14px' }}>{label}</span>
    </div>
    {badge && <span style={badgeStyle}>{badge}</span>}
  </Link>
);

export default function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: COLORS.bg, fontFamily: 'Inter, sans-serif' }}>
        
        {/* GLOBAL HEADER */}
        <header style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} style={iconBtn}><Menu size={20}/></button>
            <Link to="/" style={logoStyle}>
              YARIS <span style={{ color: COLORS.primary }}>AUTOCARE</span>
            </Link>
          </div>
          
          <div style={headerSearch}>
            <Search size={16} style={{ color: COLORS.slate }} />
            <input type="text" placeholder="Global search parts or stock #..." style={headerInput} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={statusDot}></div>
            <span style={{ fontSize: '12px', fontWeight: '800', color: COLORS.slate }}>SYSTEM LIVE</span>
          </div>
        </header>

        <div style={{ display: 'flex', flex: 1 }}>
          
          {/* SIDEBAR NAVIGATION */}
          {isSidebarOpen && (
            <aside style={sidebarStyle}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={sectionLabel}>MAIN MENU</div>
                <MenuLink to="/" icon={<LayoutDashboard size={18}/>} label="Dashboard" />
                <MenuLink to="/summary" icon={<BarChart3 size={18}/>} label="Business Summary" />
                
                <div style={sectionLabel}>INVENTORY</div>
                <MenuLink to="/used-parts" icon={<Package size={18}/>} label="Used Parts" />
                <MenuLink to="/aftermarket" icon={<Wrench size={18}/>} label="New Parts" />
                <MenuLink to="/low-stock" icon={<AlertTriangle size={18} color={COLORS.warning}/>} label="Low Stock" badge="18" />
                
                <div style={sectionLabel}>OPERATIONS</div>
                <MenuLink to="/dismantle" icon={<Scissors size={18}/>} label="Dismantle Yard" />
                <MenuLink to="/sales" icon={<ShoppingCart size={18}/>} label="Sales & Invoicing" />
              </div>

              {/* SIDEBAR FOOTER (Legana Details) */}
              <div style={sidebarFooter}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                  <ShieldCheck size={14} color="#22c55e" />
                  <span style={{ fontSize: '11px', fontWeight: '800' }}>LICENSED DISMANTLER</span>
                </div>
                <div style={{ fontSize: '10px', color: COLORS.slate }}>ABN: 91 650 944 157</div>
              </div>
            </aside>
          )}

          {/* MAIN CONTENT AREA */}
          <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
            <Routes>
              {/* Home & Analytics */}
              <Route path="/" element={<HomePage />} />
              <Route path="/summary" element={<SummaryModule />} />
              <Route path="/low-stock" element={<LowStockModule />} />

              {/* Used Parts Module */}
              <Route path="/used-parts" element={<UsedPartsModule />} />
              <Route path="/used-parts/add" element={<UsedPartAddPage />} />
              <Route path="/used-parts/:id" element={<UsedPartDetailPage />} />
              <Route path="/used-parts/edit/:id" element={<UsedPartEditPage />} />

              {/* Aftermarket Module */}
              <Route path="/aftermarket" element={<AftermarketModule />} />
              <Route path="/aftermarket/new" element={<AftermarketNewPage />} />
              <Route path="/aftermarket/:id" element={<AftermarketDetailPage />} />

              {/* Sales & Yard */}
              <Route path="/sales" element={<SalesModule />} />
              <Route path="/dismantle" element={<DismantleModule />} />

              {/* Redirect any broken links to Home */}
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
        </div>

        {/* BOTTOM COMPLIANCE BAR */}
        <footer style={footerStyle}>
          <div style={footerContent}>
            <div>© 2026 Yaris Autocare | Pyramid Enterprises AU | Legana, TAS</div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <span><Phone size={12} style={{marginRight: '5px'}}/> 0449 828 749</span>
              <span><MapPin size={12} style={{marginRight: '5px'}}/> LIC: 6130 / 419296067</span>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

// --- STYLES ---
const p50 = { padding: '50px' };
const headerStyle = { height: '70px', backgroundColor: COLORS.white, borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 25px', position: 'sticky', top: 0, zIndex: 1100 };
const logoStyle = { textDecoration: 'none', color: COLORS.dark, fontSize: '20px', fontWeight: '900', letterSpacing: '-1px' };
const headerSearch = { flex: 1, maxWidth: '500px', margin: '0 40px', position: 'relative', display: 'flex', alignItems: 'center', backgroundColor: COLORS.bg, padding: '8px 15px', borderRadius: '12px', border: `1px solid ${COLORS.border}` };
const headerInput = { border: 'none', background: 'none', marginLeft: '10px', width: '100%', outline: 'none', fontSize: '14px' };
const iconBtn = { background: 'none', border: 'none', cursor: 'pointer', color: COLORS.dark };

const sidebarStyle = { width: '280px', backgroundColor: COLORS.white, borderRight: `1px solid ${COLORS.border}`, padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' };
const sectionLabel = { fontSize: '10px', fontWeight: '800', color: COLORS.slate, letterSpacing: '0.05em', margin: '20px 0 10px 10px' };
const menuLinkStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 15px', borderRadius: '12px', textDecoration: 'none', color: COLORS.dark, transition: '0.2s' };
const badgeStyle = { backgroundColor: '#fee2e2', color: COLORS.primary, fontSize: '11px', fontWeight: '900', padding: '2px 8px', borderRadius: '6px' };
const sidebarFooter = { padding: '20px 15px', borderTop: `1px solid ${COLORS.border}`, marginTop: '20px' };

const statusDot = { width: '8px', height: '8px', backgroundColor: '#22c55e', borderRadius: '50%', boxShadow: '0 0 8px #22c55e' };
const footerStyle = { backgroundColor: COLORS.dark, color: '#94a3b8', padding: '15px 30px', fontSize: '11px' };
const footerContent = { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
