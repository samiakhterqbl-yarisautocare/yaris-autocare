import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, TrendingUp, Package, AlertTriangle, 
  ArrowUpRight, Car, Search, Zap, Clock 
} from 'lucide-react';

const API_URL = 'https://yaris-autocare-production.up.railway.app';

const StatCard = ({ title, val, trend, icon, color }) => (
  <div style={cardStyle}>
    <div style={{display: 'flex', justifyContent: 'space-between'}}>
      <div style={{backgroundColor: color + '22', color: color, padding: '10px', borderRadius: '12px'}}>{icon}</div>
      <div style={{fontSize: '12px', color: '#22c55e', fontWeight: '700', display: 'flex', alignItems: 'center'}}>{trend} <ArrowUpRight size={14}/></div>
    </div>
    <div style={{marginTop: '20px'}}>
      <div style={{fontSize: '13px', color: '#64748b', fontWeight: '600'}}>{title}</div>
      <div style={{fontSize: '28px', fontWeight: '900', color: '#0f172a'}}>{val}</div>
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

  // Fetch real-time yard data from Railway
  useEffect(() => {
    axios.get(`${API_URL}/api/summary/`)
      .then(res => setSummary(res.data))
      .catch(err => console.error("Summary fetch failed", err));
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (searchTerm) {
      navigate(`/used-parts?search=${searchTerm}`);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      {/* 1. TOP WELCOME & QUICK SEARCH */}
      <div style={headerSection}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Yard Control Panel</h2>
          <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>Yaris Autocare Legana - Live Business Overview</p>
        </div>

        <form onSubmit={handleQuickSearch} style={searchContainer}>
          <Search size={18} style={searchIcon} />
          <input 
            type="text" 
            placeholder="Quick search parts or stock #..." 
            style={searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
      </div>

      {/* 2. LIVE STATS GRID */}
      <div style={grid}>
        <StatCard 
          title="Monthly Revenue" 
          val={`$${summary.total_revenue.toLocaleString()}`} 
          trend="+12%" 
          icon={<BarChart3/>} 
          color="#22c55e" 
        />
        <StatCard 
          title="Used Inventory" 
          val={summary.used_parts_count} 
          trend="In Stock" 
          icon={<Package/>} 
          color="#0f172a" 
        />
        <StatCard 
          title="Aftermarket New" 
          val={summary.aftermarket_count} 
          trend="Active" 
          icon={<Zap/>} 
          color="#3b82f6" 
        />
        <StatCard 
          title="Low Stock Alerts" 
          val={summary.low_stock_alerts} 
          trend="Critical" 
          icon={<AlertTriangle/>} 
          color="#ef4444" 
        />
      </div>

      {/* 3. ACTIVITY FEED & QUICK ACTIONS */}
      <div style={bottomGrid}>
        <div style={activityCard}>
          <div style={cardHeader}>
            <h3 style={cardTitle}><Clock size={18} /> Yard Activity Stream</h3>
            <span style={liveBadge}>LIVE SYNC</span>
          </div>
          <div style={streamContainer}>
            <div style={streamItem}>
               <div style={dot}></div>
               <p style={streamText}><b>New Salvage:</b> 2011 Yaris Alternator added to Stock #YAR-99</p>
               <small style={timeText}>2 mins ago</small>
            </div>
            <div style={streamItem}>
               <div style={dot}></div>
               <p style={streamText}><b>Sale Processed:</b> Invoice INV-2026-104 ($245.00)</p>
               <small style={timeText}>15 mins ago</small>
            </div>
          </div>
        </div>

        {/* 4. DONOR CAR QUICK STATUS */}
        <div style={activityCard}>
          <div style={cardHeader}>
            <h3 style={cardTitle}><Car size={18} /> Donor Car Status</h3>
          </div>
          <div style={donorList}>
             <p style={{fontSize: '13px', color: '#64748b', textAlign: 'center', marginTop: '30px'}}>
               Connect a donor car in the Dismantle Yard to see salvage progress here.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---
const headerSection = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' };
const searchContainer = { position: 'relative', width: '350px' };
const searchIcon = { position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' };
const searchInput = { width: '100%', padding: '12px 15px 12px 45px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', backgroundColor: '#fff' };

const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' };
const bottomGrid = { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '30px' };

const activityCard = { backgroundColor: '#fff', padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const cardTitle = { margin: 0, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a' };
const liveBadge = { backgroundColor: '#f0fdf4', color: '#22c55e', fontSize: '10px', fontWeight: '900', padding: '4px 8px', borderRadius: '6px' };

const streamContainer = { display: 'flex', flexDirection: 'column', gap: '15px' };
const streamItem = { display: 'flex', alignItems: 'center', gap: '15px', paddingBottom: '15px', borderBottom: '1px solid #f8fafc' };
const dot = { width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#cbd5e1' };
const streamText = { margin: 0, fontSize: '13px', color: '#1e293b', flex: 1 };
const timeText = { color: '#94a3b8', fontSize: '11px' };
const donorList = { height: '150px' };

const cardStyle = { backgroundColor: '#fff', padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' };
