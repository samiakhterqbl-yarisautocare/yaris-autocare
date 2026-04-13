import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, Package, AlertTriangle, 
  ArrowUpRight, Car, Search, Zap, Clock, TrendingUp,
  Scissors, ShoppingCart // FIXED: These must be imported here
} from 'lucide-react';

const API_URL = 'https://yaris-autocare-production.up.railway.app';

const StatCard = ({ title, val, trend, icon, color, subtitle }) => (
  <div style={cardStyle}>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
      <div style={{backgroundColor: color + '15', color: color, padding: '14px', borderRadius: '16px'}}>{icon}</div>
      <div style={{textAlign: 'right'}}>
        <div style={{fontSize: '12px', color: '#22c55e', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>
          {trend} <ArrowUpRight size={14} style={{marginLeft: '4px'}}/>
        </div>
        <div style={{fontSize: '11px', color: '#94a3b8', marginTop: '4px'}}>{subtitle}</div>
      </div>
    </div>
    <div style={{marginTop: '25px'}}>
      <div style={{fontSize: '14px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px'}}>{title}</div>
      <div style={{fontSize: '36px', fontWeight: '900', color: '#0f172a', marginTop: '5px'}}>{val}</div>
    </div>
  </div>
);

export default function HomePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [summary, setSummary] = useState({
    total_revenue: 0,
    used_parts_count: 0,
    aftermarket_count: 0,
    low_stock_alerts: 0
  });

  useEffect(() => {
    axios.get(`${API_URL}/api/summary/`)
      .then(res => setSummary(res.data))
      .catch(err => console.error("Summary fetch failed", err));
  }, []);

  return (
    <div style={{ width: '100%' }}>
      {/* TOP HEADER */}
      <div style={headerSection}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-1px' }}>Yard Control Panel</h2>
          <p style={{ color: '#64748b', fontSize: '16px', marginTop: '5px' }}>Legana Terminal — Full Width View</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); navigate(`/used-parts?search=${searchTerm}`); }} style={searchContainer}>
          <Search size={20} style={searchIcon} />
          <input 
            type="text" 
            placeholder="Search stock # or VIN..." 
            style={searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
      </div>

      {/* STATS GRID */}
      <div style={statsGrid}>
        <StatCard title="Revenue (MTD)" val={`$${summary.total_revenue.toLocaleString()}`} trend="+12.5%" subtitle="Live sales" icon={<BarChart3 size={24}/>} color="#22c55e" />
        <StatCard title="Used Inventory" val={summary.used_parts_count} trend="In Stock" subtitle="Salvaged items" icon={<Package size={24}/>} color="#0f172a" />
        <StatCard title="Aftermarket" val={summary.aftermarket_count} trend="Online" subtitle="New stock" icon={<Zap size={24}/>} color="#3b82f6" />
        <StatCard title="Low Stock" val={summary.low_stock_alerts} trend="Critical" subtitle="Action needed" icon={<AlertTriangle size={24}/>} color="#ef4444" />
      </div>

      {/* LOWER AREA */}
      <div style={contentLayout}>
        <div style={largeCard}>
          <div style={cardHeader}>
            <h3 style={cardTitle}><Clock size={20} color="#64748b" /> Activity Feed</h3>
            <span style={liveBadge}>REAL-TIME</span>
          </div>
          <div style={streamList}>
            <p style={{fontSize: '14px', color: '#64748b', padding: '20px 0'}}>Waiting for recent activity updates from yard...</p>
          </div>
        </div>

        <div style={sideContainer}>
          <div style={smallCard}>
            <h3 style={cardTitle}><Car size={20} color="#64748b" /> Operations</h3>
            <div style={actionGrid}>
              <button onClick={() => navigate('/dismantle')} style={actionBtnStyle}>
                <Scissors size={18}/> Dismantle Car
              </button>
              <button onClick={() => navigate('/sales')} style={actionBtnStyle}>
                <ShoppingCart size={18}/> New Sale
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---
const headerSection = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' };
const searchContainer = { position: 'relative', width: '450px' };
const searchIcon = { position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' };
const searchInput = { width: '100%', padding: '16px 20px 16px 55px', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '15px', outline: 'none', backgroundColor: '#fff' };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' };
const contentLayout = { display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px', marginTop: '24px' };
const cardStyle = { backgroundColor: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };
const largeCard = { backgroundColor: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0' };
const smallCard = { backgroundColor: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' };
const cardTitle = { margin: 0, fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px', color: '#0f172a' };
const liveBadge = { backgroundColor: '#f0fdf4', color: '#22c55e', fontSize: '11px', fontWeight: '900', padding: '6px 12px', borderRadius: '8px' };
const streamList = { display: 'flex', flexDirection: 'column' };
const sideContainer = { display: 'flex', flexDirection: 'column', gap: '24px' };
const actionGrid = { display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginTop: '20px' };
const actionBtnStyle = { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' };
