import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import AftermarketModule from './AftermarketModule';
import AftermarketDetailPage from './AftermarketDetailPage';
import AftermarketEditPage from './AftermarketEditPage';
import AftermarketNewPage from './AftermarketNewPage';
import {
  Search, Scissors, Box, Wrench, ShoppingCart, AlertTriangle, BarChart3,
  ShieldCheck, X, Filter, Plus, ArrowRight, Package, CarFront, ClipboardList, TriangleAlert
} from 'lucide-react';

const COLORS = {
  primary: '#ef4444',
  primarySoft: '#fef2f2',
  dark: '#0f172a',
  white: '#ffffff',
  bg: '#f8fafc',
  border: '#e2e8f0',
  slate: '#64748b',
  success: '#22c55e',
};

// --- COMPACT MODULE CARD ---
const ModuleCard = ({ to, icon, title, desc, stat, isAlert }) => {
  const [hover, setHover] = useState(false);
  return (
    <Link
      to={to}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        backgroundColor: isAlert ? COLORS.primarySoft : COLORS.white,
        padding: '20px',
        borderRadius: '16px',
        textDecoration: 'none',
        border: `1px solid ${hover ? COLORS.primary : isAlert ? '#fecaca' : COLORS.border}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        boxShadow: hover ? '0 12px 20px rgba(0,0,0,0.06)' : '0 2px 4px rgba(0,0,0,0.02)',
        transform: hover ? 'translateY(-5px)' : 'translateY(0)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
        <div style={{ backgroundColor: hover ? COLORS.primary : COLORS.dark, color: '#fff', padding: '10px', borderRadius: '10px', transition: '0.3s' }}>
          {React.cloneElement(icon, { size: 22 })}
        </div>
        <div style={{ fontSize: '11px', fontWeight: '800', color: isAlert ? '#dc2626' : COLORS.slate, backgroundColor: isAlert ? '#fee2e2' : COLORS.bg, padding: '4px 8px', borderRadius: '6px' }}>
          {stat}
        </div>
      </div>
      <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: '800', color: COLORS.dark }}>{title}</h3>
      <p style={{ margin: 0, fontSize: '13px', color: COLORS.slate, lineHeight: '1.4', flex: 1 }}>{desc}</p>
      <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: COLORS.primary, fontWeight: '800', fontSize: '12px' }}>
        <span>OPEN MODULE</span>
        <ArrowRight size={14} style={{ transform: hover ? 'translateX(4px)' : 'none', transition: '0.3s' }} />
      </div>
    </Link>
  );
};
const Header = () => (
  <header style={{ backgroundColor: COLORS.white, borderBottom: `1px solid ${COLORS.border}`, height: '65px', display: 'flex', alignItems: 'center', sticky: 'top', zIndex: 1000 }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h1 style={{ margin: 0, fontWeight: '900', fontSize: '22px', color: COLORS.dark }}>YARIS <span style={{ color: COLORS.primary }}>AUTOCARE</span></h1>
      </Link>
      
      <div style={{ flex: 1, maxWidth: '450px', position: 'relative', margin: '0 20px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: COLORS.slate }} />
        <input placeholder="Quick search..." style={{ width: '100%', height: '38px', padding: '0 40px', borderRadius: '10px', border: `1px solid ${COLORS.border}`, backgroundColor: COLORS.bg, fontSize: '14px', outline: 'none' }} />
      </div>

      <nav style={{ display: 'flex', gap: '15px' }}>
        <Link to="/dismantle" style={{ textDecoration: 'none', color: COLORS.dark, fontWeight: '700', fontSize: '14px' }}>Dismantle</Link>
        <button style={{ backgroundColor: COLORS.dark, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>+ Sale</button>
      </nav>
    </div>
  </header>
);

const HomePage = () => (
  <div style={{ padding: '40px 20px', maxWidth: '1100px', margin: '0 auto' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '35px' }}>
      <div>
        <h2 style={{ fontSize: '32px', fontWeight: '900', color: COLORS.dark, margin: 0 }}>Control Panel</h2>
        <p style={{ color: COLORS.slate, margin: '5px 0 0 0' }}>Manage daily operations and salvage inventory.</p>
      </div>
      <div style={{ display: 'flex', gap: '15px' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: COLORS.slate }}>YARD STOCK</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: COLORS.dark }}>14 <CarFront size={16} color={COLORS.primary}/></div>
        </div>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
      <ModuleCard to="/dismantle" icon={<Scissors/>} title="Dismantle" desc="Salvage parts from donor cars." stat="12 active" />
      <ModuleCard to="/used-parts" icon={<Box/>} title="Used Parts" desc="Manage salvage inventory." stat="3,102 items" />
      <ModuleCard to="/aftermarket" icon={<Wrench/>} title="Aftermarket" desc="New replacement stock." stat="412 SKUs" />
      <ModuleCard to="/sales" icon={<ShoppingCart/>} title="Sales" desc="Invoicing and counter sales." stat="Ready" />
      <ModuleCard to="/low-stock" icon={<AlertTriangle/>} title="Low Stock" desc="Items requiring restock." stat="18 alerts" isAlert />
      <ModuleCard to="/summary" icon={<BarChart3/>} title="Summary" desc="Revenue and performance." stat="+12.4%" />
    </div>
  </div>
);

const Footer = () => (
  <footer style={{ backgroundColor: '#020b23', color: '#94a3b8', padding: '15px 20px', borderTop: `3px solid ${COLORS.primary}`, marginTop: 'auto' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
      <div><strong style={{ color: '#fff' }}>YARIS AUTOCARE</strong> | Pyramid Enterprises AU | ABN: 91 650 944 157</div>
      <div style={{ display: 'flex', gap: '20px' }}>
        <span>PH: 0449 828 749</span>
        <span>LIC: 6130 / 419296067</span>
        <ShieldCheck color={COLORS.success} size={16} />
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
            <Route path="/aftermarket" element={<AftermarketModule />} />
            <Route path="/aftermarket/:id" element={<AftermarketDetailPage />} />
            <Route path="/aftermarket/edit/:id" element={<AftermarketEditPage />} />
            <Route path="/aftermarket/new" element={<AftermarketNewPage />} />
            <Route path="/dismantle" element={<div style={{padding: '50px', textAlign: 'center'}}><h2>Dismantle Module</h2></div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}