import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Package,
  AlertTriangle,
  Car,
  Search,
  Zap,
  Clock3,
  Scissors,
  ShoppingCart,
  Receipt,
  ChevronRight,
  Activity,
  Boxes,
  Wrench,
  ArrowRight,
} from 'lucide-react';
import api from './api';

export default function HomePage() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [summary, setSummary] = useState({
    total_revenue: 0,
    used_parts_count: 0,
    aftermarket_count: 0,
    low_stock_alerts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/summary/')
      .then((res) => setSummary(res.data))
      .catch((err) => console.error('Summary fetch failed', err))
      .finally(() => setLoading(false));
  }, []);

  const quickSearchTarget = useMemo(() => {
    const q = searchTerm.trim();
    if (!q) return null;
    return `/used-parts?search=${encodeURIComponent(q)}`;
  }, [searchTerm]);

  const handleSearch = () => {
    if (!quickSearchTarget) return;
    navigate(quickSearchTarget);
  };

  return (
    <div style={page}>
      <div style={hero}>
        <div style={heroLeft}>
          <div style={eyebrow}>YARIS AUTOCARE INVENTORY SYSTEM</div>
          <h1 style={heroTitle}>Control Center</h1>
          <div style={heroSub}>
            Manage inventory, dismantle flow, sales, labels, and stock movement from one place.
          </div>

          <div style={heroActions}>
            <button onClick={() => navigate('/used-parts')} style={primaryBtn}>
              <Package size={16} />
              Open Used Parts
            </button>

            <button onClick={() => navigate('/sales')} style={secondaryBtn}>
              <ShoppingCart size={16} />
              Create Sale
            </button>
          </div>
        </div>

        <div style={heroRight}>
          <div style={searchCard}>
            <div style={searchLabel}>Quick Search</div>
            <div style={searchInputWrap}>
              <Search size={16} style={searchIcon} />
              <input
                style={searchInput}
                placeholder="Search stock, part name, SKU, label, VIN..."
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
      </div>

      <div style={statsGrid}>
        <MetricCard
          title="Total Revenue"
          value={loading ? '...' : `$${Number(summary.total_revenue || 0).toLocaleString()}`}
          helpText="All recorded invoices"
          icon={<BarChart3 size={20} />}
          accent="#22c55e"
        />
        <MetricCard
          title="Used Inventory"
          value={loading ? '...' : Number(summary.used_parts_count || 0).toLocaleString()}
          helpText="Used parts currently tracked"
          icon={<Package size={20} />}
          accent="#0f172a"
        />
        <MetricCard
          title="Aftermarket"
          value={loading ? '...' : Number(summary.aftermarket_count || 0).toLocaleString()}
          helpText="Aftermarket items in stock"
          icon={<Zap size={20} />}
          accent="#2563eb"
        />
        <MetricCard
          title="Low Stock Alerts"
          value={loading ? '...' : Number(summary.low_stock_alerts || 0).toLocaleString()}
          helpText="Items needing attention"
          icon={<AlertTriangle size={20} />}
          accent="#ef4444"
        />
      </div>

      <div style={mainGrid}>
        <div style={leftColumn}>
          <SectionCard
            title="Operations"
            icon={<Activity size={16} />}
            rightLabel="Daily workflow"
          >
            <div style={actionGrid}>
              <ActionCard
                title="Used Parts"
                desc="View, edit, print labels, and manage individual used stock."
                icon={<Package size={18} />}
                onClick={() => navigate('/used-parts')}
              />
              <ActionCard
                title="Aftermarket"
                desc="Manage aftermarket stock, pricing, and low-stock replenishment."
                icon={<Wrench size={18} />}
                onClick={() => navigate('/aftermarket')}
              />
              <ActionCard
                title="Dismantle Yard"
                desc="Process dismantle vehicles and generate parts quickly."
                icon={<Scissors size={18} />}
                onClick={() => navigate('/dismantle')}
              />
              <ActionCard
                title="Yard Master"
                desc="Control donor cars, labels, and dismantle inventory overview."
                icon={<Car size={18} />}
                onClick={() => navigate('/yard-master')}
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Sales & Records"
            icon={<Receipt size={16} />}
            rightLabel="Front desk"
          >
            <div style={actionGrid}>
              <ActionCard
                title="Create Sale / Invoice"
                desc="Build invoices from used parts, aftermarket stock, or manual items."
                icon={<ShoppingCart size={18} />}
                onClick={() => navigate('/sales')}
              />
              <ActionCard
                title="Invoices Dashboard"
                desc="Review previous invoices and print customer paperwork."
                icon={<Receipt size={18} />}
                onClick={() => navigate('/sales-dashboard')}
              />
              <ActionCard
                title="Low Stock Monitor"
                desc="Check parts that need restocking before they become unavailable."
                icon={<AlertTriangle size={18} />}
                onClick={() => navigate('/low-stock')}
              />
              <ActionCard
                title="Inventory Overview"
                desc="Jump into live stock modules and continue current work."
                icon={<Boxes size={18} />}
                onClick={() => navigate('/used-parts')}
              />
            </div>
          </SectionCard>
        </div>

        <div style={rightColumn}>
          <SectionCard
            title="Live Activity"
            icon={<Clock3 size={16} />}
            rightLabel="Overview"
          >
            <div style={activityList}>
              <ActivityRow
                label="INVENTORY"
                text={`Used inventory currently tracked: ${summary.used_parts_count || 0}`}
              />
              <ActivityRow
                label="AFTERMARKET"
                text={`Aftermarket items tracked: ${summary.aftermarket_count || 0}`}
              />
              <ActivityRow
                label="ALERTS"
                text={`Low stock warnings: ${summary.low_stock_alerts || 0}`}
              />
              <ActivityRow
                label="REVENUE"
                text={`Recorded invoice revenue: $${Number(summary.total_revenue || 0).toLocaleString()}`}
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Quick Commands"
            icon={<ChevronRight size={16} />}
            rightLabel="Fast access"
          >
            <div style={quickCmdList}>
              <button onClick={() => navigate('/dismantle')} style={quickCmdBtnDark}>
                <Scissors size={17} />
                Start Dismantle Process
              </button>

              <button onClick={() => navigate('/used-parts/add')} style={quickCmdBtn}>
                <Package size={17} />
                Add Used Part
              </button>

              <button onClick={() => navigate('/aftermarket/new')} style={quickCmdBtn}>
                <Zap size={17} />
                Add Aftermarket Item
              </button>

              <button onClick={() => navigate('/sales')} style={quickCmdBtn}>
                <ShoppingCart size={17} />
                Open POS / Sales
              </button>
            </div>
          </SectionCard>

          <SectionCard
            title="System Notes"
            icon={<BarChart3 size={16} />}
            rightLabel="Status"
          >
            <div style={notesBox}>
              <div style={noteLine}>
                This dashboard is now connected through the authenticated API client.
              </div>
              <div style={noteLine}>
                After login, protected pages and QR edit pages can use token-based access properly.
              </div>
              <div style={noteLine}>
                Next recommended step: convert remaining modules from plain axios to the shared API client.
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, helpText, icon, accent }) {
  return (
    <div style={metricCard}>
      <div style={metricTop}>
        <div>
          <div style={metricTitle}>{title}</div>
          <div style={metricValue}>{value}</div>
          <div style={metricHelp}>{helpText}</div>
        </div>

        <div style={{ ...metricIconWrap, color: accent }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, icon, rightLabel, children }) {
  return (
    <div style={sectionCard}>
      <div style={sectionHeader}>
        <div style={sectionTitle}>
          {icon}
          {title}
        </div>
        <div style={sectionRightLabel}>{rightLabel}</div>
      </div>
      <div style={sectionBody}>{children}</div>
    </div>
  );
}

function ActionCard({ title, desc, icon, onClick }) {
  return (
    <button onClick={onClick} style={actionCard}>
      <div style={actionIconWrap}>{icon}</div>
      <div style={actionTextWrap}>
        <div style={actionTitle}>{title}</div>
        <div style={actionDesc}>{desc}</div>
      </div>
      <ChevronRight size={16} style={{ color: '#94a3b8' }} />
    </button>
  );
}

function ActivityRow({ label, text }) {
  return (
    <div style={activityRow}>
      <div style={activityLabel}>{label}</div>
      <div style={activityText}>{text}</div>
    </div>
  );
}

const page = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
};

const hero = {
  display: 'grid',
  gridTemplateColumns: '1.4fr 0.9fr',
  gap: '20px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 55%, #fff1f2 100%)',
  border: '1px solid #e2e8f0',
  borderRadius: '24px',
  padding: '24px',
};

const heroLeft = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};

const eyebrow = {
  fontSize: '11px',
  fontWeight: '900',
  color: '#ef4444',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: '10px',
};

const heroTitle = {
  margin: 0,
  fontSize: '34px',
  fontWeight: '900',
  color: '#0f172a',
  letterSpacing: '-0.03em',
};

const heroSub = {
  marginTop: '10px',
  fontSize: '14px',
  lineHeight: 1.6,
  color: '#475569',
  maxWidth: '680px',
  fontWeight: '600',
};

const heroActions = {
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

const heroRight = {
  display: 'flex',
  alignItems: 'stretch',
};

const searchCard = {
  width: '100%',
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '20px',
  padding: '18px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: '12px',
};

const searchLabel = {
  fontSize: '12px',
  fontWeight: '900',
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const searchInputWrap = {
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

const statsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '18px',
};

const metricCard = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '20px',
  padding: '20px',
};

const metricTop = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '12px',
};

const metricTitle = {
  fontSize: '12px',
  fontWeight: '900',
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const metricValue = {
  marginTop: '10px',
  fontSize: '30px',
  fontWeight: '900',
  color: '#0f172a',
  letterSpacing: '-0.03em',
};

const metricHelp = {
  marginTop: '8px',
  fontSize: '12px',
  fontWeight: '700',
  color: '#94a3b8',
};

const metricIconWrap = {
  width: '42px',
  height: '42px',
  borderRadius: '14px',
  background: '#f8fafc',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const mainGrid = {
  display: 'grid',
  gridTemplateColumns: '1.55fr 1fr',
  gap: '20px',
};

const leftColumn = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
};

const rightColumn = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
};

const sectionCard = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '20px',
  overflow: 'hidden',
};

const sectionHeader = {
  padding: '16px 20px',
  borderBottom: '1px solid #f1f5f9',
  background: '#fcfdfe',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const sectionTitle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '14px',
  fontWeight: '900',
  color: '#0f172a',
};

const sectionRightLabel = {
  fontSize: '11px',
  fontWeight: '800',
  color: '#94a3b8',
  textTransform: 'uppercase',
};

const sectionBody = {
  padding: '20px',
};

const actionGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '14px',
};

const actionCard = {
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

const actionIconWrap = {
  width: '42px',
  height: '42px',
  borderRadius: '14px',
  background: '#f8fafc',
  color: '#0f172a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const actionTextWrap = {
  flex: 1,
  minWidth: 0,
};

const actionTitle = {
  fontSize: '14px',
  fontWeight: '900',
  color: '#0f172a',
};

const actionDesc = {
  marginTop: '4px',
  fontSize: '12px',
  lineHeight: 1.5,
  color: '#64748b',
  fontWeight: '600',
};

const activityList = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const activityRow = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  border: '1px solid #f1f5f9',
  background: '#f8fafc',
  borderRadius: '14px',
  padding: '12px 14px',
};

const activityLabel = {
  fontSize: '10px',
  fontWeight: '900',
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const activityText = {
  fontSize: '13px',
  fontWeight: '700',
  color: '#0f172a',
};

const quickCmdList = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const quickCmdBtnDark = {
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
  textAlign: 'left',
  fontSize: '13px',
};

const quickCmdBtn = {
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
  textAlign: 'left',
  fontSize: '13px',
};

const notesBox = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const noteLine = {
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '14px',
  padding: '12px 14px',
  fontSize: '13px',
  lineHeight: 1.6,
  color: '#475569',
  fontWeight: '600',
};
