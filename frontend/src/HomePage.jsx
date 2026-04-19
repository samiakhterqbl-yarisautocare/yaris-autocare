import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Package,
  AlertTriangle,
  Search,
  Zap,
  Scissors,
  ShoppingCart,
  Receipt,
  Car,
  ArrowRight,
  Boxes,
  Activity,
  ChevronRight,
} from 'lucide-react';
import api from './api';
import { useAuth } from './AuthContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { loading: authLoading, isAuthenticated, user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [summary, setSummary] = useState({
    total_revenue: 0,
    used_parts_count: 0,
    aftermarket_count: 0,
    low_stock_alerts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) return;

    setLoading(true);

    api
      .get('/summary/')
      .then((res) => setSummary(res.data))
      .catch((err) => console.error('Summary fetch failed', err))
      .finally(() => setLoading(false));
  }, [authLoading, isAuthenticated]);

  const quickSearchTarget = useMemo(() => {
    const q = searchTerm.trim();
    if (!q) return null;
    return `/used-parts?search=${encodeURIComponent(q)}`;
  }, [searchTerm]);

  const handleSearch = () => {
    if (!quickSearchTarget) return;
    navigate(quickSearchTarget);
  };

  if (authLoading) {
    return <div style={{ padding: '30px', fontWeight: '800' }}>Loading system...</div>;
  }

  return (
    <div style={page}>
      <div style={topHero}>
        <div style={heroLeft}>
          <div style={heroEyebrow}>YARIS AUTOCARE INVENTORY</div>
          <h1 style={heroTitle}>Welcome back{user?.first_name ? `, ${user.first_name}` : ''}</h1>
          <div style={heroSubtitle}>
            Manage used parts, aftermarket stock, dismantle flow, invoices, and low stock from one clean dashboard.
          </div>

          <div style={heroButtons}>
            <button onClick={() => navigate('/used-parts')} style={primaryBtn}>
              <Package size={16} />
              Used Parts
            </button>

            <button onClick={() => navigate('/sales')} style={secondaryBtn}>
              <ShoppingCart size={16} />
              Create Sale
            </button>
          </div>
        </div>

        <div style={searchPanel}>
          <div style={searchPanelTitle}>Quick Search</div>
          <div style={searchWrap}>
            <Search size={16} style={searchIcon} />
            <input
              style={searchInput}
              placeholder="Search part name, SKU, label, stock..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
            />
          </div>
          <button onClick={handleSearch} style={searchBtn}>
            Search Inventory
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      <div style={kpiGrid}>
        <KpiCard
          title="Revenue"
          value={loading ? '...' : `$${Number(summary.total_revenue || 0).toLocaleString()}`}
          icon={<BarChart3 size={18} />}
          accent="#16a34a"
        />
        <KpiCard
          title="Used Parts"
          value={loading ? '...' : Number(summary.used_parts_count || 0).toLocaleString()}
          icon={<Package size={18} />}
          accent="#0f172a"
        />
        <KpiCard
          title="Aftermarket"
          value={loading ? '...' : Number(summary.aftermarket_count || 0).toLocaleString()}
          icon={<Zap size={18} />}
          accent="#2563eb"
        />
        <KpiCard
          title="Low Stock"
          value={loading ? '...' : Number(summary.low_stock_alerts || 0).toLocaleString()}
          icon={<AlertTriangle size={18} />}
          accent="#ef4444"
        />
      </div>

      <div style={contentGrid}>
        <div style={mainColumn}>
          <Panel
            title="Quick Actions"
            subtitle="Most-used daily actions"
            icon={<Activity size={16} />}
          >
            <div style={actionGrid}>
              <ActionTile
                title="Used Parts"
                desc="View, edit and manage individual used stock."
                icon={<Package size={18} />}
                onClick={() => navigate('/used-parts')}
              />
              <ActionTile
                title="Aftermarket"
                desc="Manage aftermarket products and stock levels."
                icon={<Zap size={18} />}
                onClick={() => navigate('/aftermarket')}
              />
              <ActionTile
                title="Dismantle Yard"
                desc="Process dismantle cars and create parts."
                icon={<Scissors size={18} />}
                onClick={() => navigate('/dismantle')}
              />
              <ActionTile
                title="Yard Master"
                desc="Review donor vehicles and label control."
                icon={<Car size={18} />}
                onClick={() => navigate('/yard-master')}
              />
              <ActionTile
                title="Create Sale"
                desc="Open POS and build invoice quickly."
                icon={<ShoppingCart size={18} />}
                onClick={() => navigate('/sales')}
              />
              <ActionTile
                title="Invoices"
                desc="Review and re-open previous invoices."
                icon={<Receipt size={18} />}
                onClick={() => navigate('/sales-dashboard')}
              />
            </div>
          </Panel>
        </div>

        <div style={sideColumn}>
          <Panel
            title="System Snapshot"
            subtitle="Current business totals"
            icon={<Boxes size={16} />}
          >
            <div style={snapshotList}>
              <SnapshotRow
                label="Used inventory"
                value={loading ? '...' : summary.used_parts_count}
              />
              <SnapshotRow
                label="Aftermarket items"
                value={loading ? '...' : summary.aftermarket_count}
              />
              <SnapshotRow
                label="Low stock warnings"
                value={loading ? '...' : summary.low_stock_alerts}
              />
              <SnapshotRow
                label="Invoice revenue"
                value={loading ? '...' : `$${Number(summary.total_revenue || 0).toLocaleString()}`}
              />
            </div>
          </Panel>

          <Panel
            title="Shortcuts"
            subtitle="Fast access"
            icon={<ChevronRight size={16} />}
          >
            <div style={shortcutList}>
              <button onClick={() => navigate('/dismantle')} style={darkShortcut}>
                <Scissors size={16} />
                Start Dismantle Process
              </button>
              <button onClick={() => navigate('/used-parts/add')} style={lightShortcut}>
                <Package size={16} />
                Add Used Part
              </button>
              <button onClick={() => navigate('/aftermarket/new')} style={lightShortcut}>
                <Zap size={16} />
                Add Aftermarket Item
              </button>
              <button onClick={() => navigate('/low-stock')} style={lightShortcut}>
                <AlertTriangle size={16} />
                View Low Stock
              </button>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon, accent }) {
  return (
    <div style={kpiCard}>
      <div style={kpiTop}>
        <div>
          <div style={kpiTitle}>{title}</div>
          <div style={kpiValue}>{value}</div>
        </div>
        <div style={{ ...kpiIconWrap, color: accent }}>{icon}</div>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, icon, children }) {
  return (
    <div style={panel}>
      <div style={panelHeader}>
        <div>
          <div style={panelTitle}>
            {icon}
            {title}
          </div>
          <div style={panelSubtitle}>{subtitle}</div>
        </div>
      </div>
      <div style={panelBody}>{children}</div>
    </div>
  );
}

function ActionTile({ title, desc, icon, onClick }) {
  return (
    <button onClick={onClick} style={actionTile}>
      <div style={tileIconWrap}>{icon}</div>
      <div style={tileContent}>
        <div style={tileTitle}>{title}</div>
        <div style={tileDesc}>{desc}</div>
      </div>
      <ChevronRight size={16} style={{ color: '#94a3b8' }} />
    </button>
  );
}

function SnapshotRow({ label, value }) {
  return (
    <div style={snapshotRow}>
      <div style={snapshotLabel}>{label}</div>
      <div style={snapshotValue}>{value}</div>
    </div>
  );
}

const page = {
  display: 'flex',
  flexDirection: 'column',
  gap: '22px',
};

const topHero = {
  display: 'grid',
  gridTemplateColumns: '1.3fr 0.8fr',
  gap: '18px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 60%, #fff1f2 100%)',
  border: '1px solid #e2e8f0',
  borderRadius: '22px',
  padding: '24px',
};

const heroLeft = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};

const heroEyebrow = {
  fontSize: '11px',
  fontWeight: '900',
  color: '#ef4444',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: '8px',
};

const heroTitle = {
  margin: 0,
  fontSize: '34px',
  fontWeight: '900',
  color: '#0f172a',
  letterSpacing: '-0.03em',
};

const heroSubtitle = {
  marginTop: '10px',
  fontSize: '14px',
  lineHeight: 1.6,
  color: '#475569',
  fontWeight: '600',
  maxWidth: '680px',
};

const heroButtons = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap',
  marginTop: '20px',
};

const primaryBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '13px 18px',
  borderRadius: '14px',
  border: 'none',
  background: '#0f172a',
  color: '#fff',
  fontWeight: '800',
  cursor: 'pointer',
};

const secondaryBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '13px 18px',
  borderRadius: '14px',
  border: '1px solid #cbd5e1',
  background: '#fff',
  color: '#0f172a',
  fontWeight: '800',
  cursor: 'pointer',
};

const searchPanel = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '20px',
  padding: '18px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: '12px',
};

const searchPanelTitle = {
  fontSize: '12px',
  fontWeight: '900',
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const searchWrap = {
  position: 'relative',
};

const searchIcon = {
  position: 'absolute',
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#94a3b8',
};

const searchInput = {
  width: '100%',
  padding: '12px 14px 12px 38px',
  borderRadius: '14px',
  border: '1px solid #e2e8f0',
  outline: 'none',
  fontSize: '14px',
  boxSizing: 'border-box',
};

const searchBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  border: 'none',
  background: '#ef4444',
  color: '#fff',
  borderRadius: '14px',
  padding: '12px 16px',
  fontWeight: '800',
  cursor: 'pointer',
};

const kpiGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '16px',
};

const kpiCard = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '18px',
  padding: '18px',
};

const kpiTop = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '12px',
};

const kpiTitle = {
  fontSize: '12px',
  fontWeight: '900',
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const kpiValue = {
  marginTop: '10px',
  fontSize: '32px',
  fontWeight: '900',
  color: '#0f172a',
  letterSpacing: '-0.03em',
};

const kpiIconWrap = {
  width: '42px',
  height: '42px',
  borderRadius: '14px',
  background: '#f8fafc',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const contentGrid = {
  display: 'grid',
  gridTemplateColumns: '1.5fr 0.9fr',
  gap: '18px',
};

const mainColumn = {
  display: 'flex',
  flexDirection: 'column',
};

const sideColumn = {
  display: 'flex',
  flexDirection: 'column',
  gap: '18px',
};

const panel = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '20px',
  overflow: 'hidden',
};

const panelHeader = {
  padding: '16px 20px',
  borderBottom: '1px solid #f1f5f9',
  background: '#fcfdfe',
};

const panelTitle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '15px',
  fontWeight: '900',
  color: '#0f172a',
};

const panelSubtitle = {
  marginTop: '4px',
  fontSize: '12px',
  fontWeight: '700',
  color: '#94a3b8',
};

const panelBody = {
  padding: '18px',
};

const actionGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '14px',
};

const actionTile = {
  border: '1px solid #e2e8f0',
  background: '#fff',
  borderRadius: '18px',
  padding: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  textAlign: 'left',
  cursor: 'pointer',
};

const tileIconWrap = {
  width: '44px',
  height: '44px',
  borderRadius: '14px',
  background: '#f8fafc',
  color: '#0f172a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const tileContent = {
  flex: 1,
  minWidth: 0,
};

const tileTitle = {
  fontSize: '15px',
  fontWeight: '900',
  color: '#0f172a',
};

const tileDesc = {
  marginTop: '4px',
  fontSize: '12px',
  lineHeight: 1.5,
  color: '#64748b',
  fontWeight: '600',
};

const snapshotList = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const snapshotRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '10px',
  padding: '14px 16px',
  borderRadius: '14px',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
};

const snapshotLabel = {
  fontSize: '13px',
  fontWeight: '700',
  color: '#475569',
};

const snapshotValue = {
  fontSize: '16px',
  fontWeight: '900',
  color: '#0f172a',
};

const shortcutList = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const darkShortcut = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '14px 16px',
  backgroundColor: '#0f172a',
  color: '#fff',
  border: 'none',
  borderRadius: '14px',
  fontWeight: '800',
  cursor: 'pointer',
  fontSize: '13px',
};

const lightShortcut = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '14px 16px',
  backgroundColor: '#fff',
  color: '#0f172a',
  border: '1px solid #e2e8f0',
  borderRadius: '14px',
  fontWeight: '800',
  cursor: 'pointer',
  fontSize: '13px',
};
