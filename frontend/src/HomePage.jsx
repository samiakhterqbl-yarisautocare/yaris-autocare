import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, Package, AlertTriangle, 
  ArrowUpRight, Car, Search, Zap, Clock, 
  Scissors, ShoppingCart 
} from 'lucide-react';

const API_URL = 'https://yaris-autocare-production.up.railway.app';

export default function HomePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [summary, setSummary] = useState({
    total_revenue: 0, used_parts_count: 0, aftermarket_count: 0, low_stock_alerts: 0
  });

  useEffect(() => {
    axios.get(`${API_URL}/api/summary/`)
      .then(res => setSummary(res.data))
      .catch(err => console.error("Summary fetch failed", err));
  }, []);

  return (
    <div style={dashboardContainer}>
      {/* SECTION 1: SYSTEM HEADER */}
      <div style={pageHeader}>
        <div>
          <h2 style={titleStyle}>System Dashboard</h2>
          <div style={breadcrumb}>Legana Terminal &gt; Overview</div>
        </div>
        <div style={searchBox}>
          <Search size={16} style={searchIcon}/>
          <input 
            style={searchInput} 
            placeholder="Search stock, parts, or VIN..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* SECTION 2: HIGH-DENSITY METRICS */}
      <div style={statsGrid}>
        <MetricCard title="MTD REVENUE" val={`$${summary.total_revenue}`} color="#22c55e" icon={<BarChart3 size={20}/>} />
        <MetricCard title="USED INVENTORY" val={summary.used_parts_count} color="#0f172a" icon={<Package size={20}/>} />
        <MetricCard title="AFTERMARKET" val={summary.aftermarket_count} color="#3b82f6" icon={<Zap size={20}/>} />
        <MetricCard title="STOCK ALERTS" val={summary.low_stock_alerts} color="#ef4444" icon={<AlertTriangle size={20}/>} />
      </div>

      {/* SECTION 3: WORKFLOW AREA */}
      <div style={workflowGrid}>
        {/* Activity Table - Industrial Look */}
        <div style={panel}>
          <div style={panelHeader}>
            <div style={panelTitle}><Clock size={16}/> SYSTEM ACTIVITY LOG</div>
            <div style={statusBadge}>LIVE SYNC</div>
          </div>
          <div style={logList}>
            <LogItem label="INVENTORY" msg="New Salvage: 2011 Yaris Alternator added" time="2m ago" />
            <LogItem label="SALES" msg="Invoice INV-2026-104 processed" time="15m ago" />
            <LogItem label="SYSTEM" msg="Database integrity check complete" time="1h ago" />
          </div>
        </div>

        {/* Quick Command Center */}
        <div style={panel}>
          <div style={panelHeader}><div style={panelTitle}><Car size={16}/> TERMINAL COMMANDS</div></div>
          <div style={commandGrid}>
            <button onClick={() => navigate('/dismantle')} style={cmdBtn}>
              <Scissors size={18}/> START DISMANTLE
            </button>
            <button onClick={() => navigate('/sales')} style={cmdBtn}>
              <ShoppingCart size={18}/> OPEN POS / SALES
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const MetricCard = ({ title, val, color, icon }) => (
  <div style={{...panel, padding: '20px'}}>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <div style={{fontSize: '11px', fontWeight: '800', color: '#64748b', letterSpacing: '0.5px'}}>{title}</div>
      <div style={{color: color}}>{icon}</div>
    </div>
    <div style={{fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '10px'}}>{val}</div>
  </div>
);

const LogItem = ({ label, msg, time }) => (
  <div style={logRow}>
    <span style={logLabel}>{label}</span>
    <span style={logMsg}>{msg}</span>
    <span style={logTime}>{time}</span>
  </div>
);

// --- INDUSTRIAL DESIGN STYLES ---
const dashboardContainer = { display: 'flex', flexDirection: 'column', gap: '24px' };
const pageHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' };
const titleStyle = { margin: 0, fontSize: '24px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' };
const breadcrumb = { fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginTop: '4px' };
const searchBox = { position: 'relative', width: '320px' };
const searchIcon = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' };
const searchInput = { width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none' };

const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' };
const workflowGrid = { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' };

const panel = { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' };
const panelHeader = { padding: '15px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fcfdfe' };
const panelTitle = { fontSize: '12px', fontWeight: '900', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' };
const statusBadge = { fontSize: '9px', fontWeight: '900', color: '#22c55e', backgroundColor: '#f0fdf4', padding: '4px 8px', borderRadius: '4px' };

const logList = { display: 'flex', flexDirection: 'column' };
const logRow = { display: 'flex', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #f8fafc', gap: '15px' };
const logLabel = { fontSize: '9px', fontWeight: '900', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '3px', color: '#64748b' };
const logMsg = { fontSize: '13px', color: '#1e293b', flex: 1 };
const logTime = { fontSize: '11px', color: '#94a3b8' };

const commandGrid = { padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' };
const cmdBtn = { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', textAlign: 'left', fontSize: '13px' };
