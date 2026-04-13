import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, Package, AlertTriangle, 
  ArrowUpRight, Car, Search, Zap, Clock, TrendingUp
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
      {/* 1. HEADER ROW */}
      <div style={headerSection}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-1px' }}>Yard Control Panel</h2>
          <p style={{ color: '#64748b', fontSize: '16px', marginTop: '5px' }}>Live terminal for Yaris Autocare Legana</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); navigate(`/used-parts?search=${searchTerm}`); }} style={searchContainer}>
          <Search size={20} style={searchIcon} />
          <input 
            type="text" 
            placeholder="Search parts, stock #, or VIN..." 
            style={searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
      </div>

      {/* 2. STATS GRID - Responsive & Full Width */}
      <div style={statsGrid}>
        <StatCard 
          title="Revenue (MTD)" 
          val={`$${summary.total_revenue.toLocaleString()}`} 
          trend="+12.5%" 
          subtitle="vs last month"
          icon={<BarChart3 size={24}/>} 
          color="#22c55e" 
        />
        <StatCard 
          title="Used Inventory" 
          val={summary.used_parts_count} 
          trend="Healthy" 
          subtitle="Active listings"
          icon={<Package size={24}/>} 
          color="#0f172a" 
        />
        <StatCard 
          title="Aftermarket" 
          val={summary.aftermarket_count} 
          trend="Online" 
          subtitle="Ready to ship"
          icon={<Zap size={24}/>} 
          color="#3b82f6" 
        />
        <StatCard 
          title="Alerts" 
          val={summary.low_stock_alerts} 
          trend="Critical" 
          subtitle="Needs restock"
          icon={<AlertTriangle size={24}/>} 
          color="#ef4444" 
        />
      </div>

      {/* 3. LOWER CONTENT AREA */}
      <div style={contentLayout}>
        {/* Activity Feed */}
        <div style={largeCard}>
          <div style={cardHeader}>
            <h3 style={cardTitle}><Clock size={20} color="#64748b" /> Live Activity Stream</h3>
            <span style={liveBadge}>REAL-TIME SYNC</span>
          </div>
          <div style={streamList}>
            <ActivityItem bold="New Salvage" text="2011 Yaris Alternator added to Stock #YAR-99" time="2 mins ago" />
            <ActivityItem bold="Sale" text="Invoice INV-2026-104 processed for $245.00" time="15 mins ago" />
            <ActivityItem bold="Low Stock" text="Brake Pads (Aftermarket) reached critical level" time="1 hr ago" />
          </div>
        </div>

        {/* Side Actions */}
        <div style={sideContainer}>
          <div style={smallCard}>
            <h3 style={cardTitle}><Car size={20} color="#64748b" /> Quick Actions</h3>
            <div style={actionGrid}>
              <ActionButton label="Dismantle Car" icon={<Scissors size={18}/>} onClick={() => navigate('/dismantle')} />
              <ActionButton label="New Sale" icon={<ShoppingCart size={18}/>} onClick={() => navigate('/sales')} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components
const ActivityItem = ({ bold, text, time }) => (
  <div style={streamRow}>
    <div style={statusDot}></div>
    <div style={{flex: 1}}>
      <p style={{margin: 0, fontSize: '14px', color: '#1e293b'}}><strong>{bold}:</strong> {text}</p>
      <span style={{fontSize: '12px', color: '#94a3b8'}}>{time}</span>
    </div>
  </div>
);

const ActionButton = ({ label, icon, onClick }) => (
  <button onClick={onClick} style={actionBtnStyle}>
    {icon} {label}
  </button>
);

// Styles
const headerSection = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' };
const searchContainer = { position: 'relative', width: '450px' };
const searchIcon = { position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' };
const searchInput = { width: '100%', padding: '16px 20px 16px 55px', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '15px', outline: 'none', backgroundColor: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' };

const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' };
const contentLayout = { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginTop: '24px' };

const cardStyle = { backgroundColor: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };
const largeCard = { backgroundColor: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0' };
const smallCard = { backgroundColor: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' };
const cardTitle = { margin: 0, fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px', color: '#0f172a' };
const liveBadge = { backgroundColor: '#f0fdf4', color: '#22c55e', fontSize: '11px', fontWeight: '900', padding: '6px 12px', borderRadius: '8px' };

const streamList = { display: 'flex', flexDirection: 'column', gap: '5px' };
const streamRow = { display: 'flex', gap: '20px', padding: '20px 0', borderBottom: '1px solid #f8fafc' };
const statusDot = { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', marginTop: '6px' };

const sideContainer = { display: 'flex', flexDirection: 'column', gap: '24px' };
const actionGrid = { display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginTop: '20px' };
const actionBtnStyle = { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' };
