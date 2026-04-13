import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Scissors, Package, Wrench, 
  ShoppingCart, AlertTriangle, Menu, X, ShieldCheck
} from 'lucide-react';

// --- TEMPORARY PLACEHOLDERS TO PREVENT CRASHING ---
// If you have these files ready, replace these lines with: import X from './X';
const HomePage = () => <div style={{padding:'40px'}}><h1>Dashboard Home</h1></div>;
const UsedPartsModule = () => <div style={{padding:'40px'}}><h1>Used Parts Inventory</h1></div>;
const AftermarketModule = () => <div style={{padding:'40px'}}><h1>Aftermarket New Parts</h1></div>;
const DismantleModule = () => <div style={{padding:'40px'}}><h1>Dismantle Yard</h1></div>;
const SalesModule = () => <div style={{padding:'40px'}}><h1>Sales & Invoicing</h1></div>;

export default function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        
        {/* HEADER */}
        <header style={{ height: '70px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 25px', position: 'sticky', top: 0, zIndex: 1100 }}>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} style={{background:'none', border:'none', cursor:'pointer'}}><Menu size={20}/></button>
          <Link to="/" style={{ textDecoration: 'none', color: '#0f172a', fontSize: '20px', fontWeight: '900', marginLeft: '20px' }}>
            YARIS <span style={{ color: '#ef4444' }}>AUTOCARE</span>
          </Link>
        </header>

        <div style={{ display: 'flex', flex: 1 }}>
          {/* SIDEBAR */}
          {isSidebarOpen && (
            <aside style={{ width: '260px', backgroundColor: '#fff', borderRight: '1px solid #e2e8f0', padding: '20px' }}>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <Link to="/" style={navLinkStyle}><LayoutDashboard size={18}/> Dashboard</Link>
                <Link to="/used-parts" style={navLinkStyle}><Package size={18}/> Used Parts</Link>
                <Link to="/aftermarket" style={navLinkStyle}><Wrench size={18}/> New Parts</Link>
                <Link to="/dismantle" style={navLinkStyle}><Scissors size={18}/> Dismantle</Link>
                <Link to="/sales" style={navLinkStyle}><ShoppingCart size={18}/> Sales</Link>
              </nav>
            </aside>
          )}

          {/* MAIN */}
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/used-parts" element={<UsedPartsModule />} />
              <Route path="/aftermarket" element={<AftermarketModule />} />
              <Route path="/dismantle" element={<DismantleModule />} />
              <Route path="/sales" element={<SalesModule />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
        </div>

        <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', padding: '15px 30px', fontSize: '11px', textAlign: 'center' }}>
          Yaris Autocare | ABN: 91 650 944 157 | LIC: 6130 / 419296067
        </footer>
      </div>
    </Router>
  );
}

const navLinkStyle = { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', textDecoration: 'none', color: '#1e293b', fontWeight: '600' };
