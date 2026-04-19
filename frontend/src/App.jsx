import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Scissors,
  Package,
  Wrench,
  ShoppingCart,
  Menu,
  X,
  ChevronRight,
  AlertTriangle,
  Settings,
  ExternalLink,
  Car,
  Receipt,
  LogOut,
  Phone,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from './LoginPage';
import { useAuth } from './AuthContext';
import logo from './assets/LOGO.jpeg';

// Lazy Load All Modules
const HomePage = lazy(() => import('./HomePage'));
const AftermarketModule = lazy(() => import('./AftermarketModule'));
const AftermarketDetailPage = lazy(() => import('./AftermarketDetailPage'));
const AftermarketNewPage = lazy(() => import('./AftermarketNewPage'));
const AftermarketEditPage = lazy(() => import('./AftermarketEditPage'));
const DismantleModule = lazy(() => import('./DismantleModule'));
const LowStockModule = lazy(() => import('./LowStockModule'));
const SalesModule = lazy(() => import('./SalesModule'));
const InvoicesDashboard = lazy(() => import('./InvoicesDashboard'));
const InvoiceDetail = lazy(() => import('./InvoiceDetail'));
const UsedPartsModule = lazy(() => import('./UsedPartsModule'));
const UsedPartAddPage = lazy(() => import('./UsedPartAddPage'));
const UsedPartDetailPage = lazy(() => import('./UsedPartDetailPage'));
const UsedPartEditPage = lazy(() => import('./UsedPartEditPage'));
const UsedPartLabelPage = lazy(() => import('./UsedPartLabelPage'));
const InventoryMasterModule = lazy(() => import('./InventoryMasterModule'));
const DonorCarDetailView = lazy(() => import('./DonorCarDetailView'));
const DismantlePartDetailPage = lazy(() => import('./DismantlePartDetailPage'));
const DismantlePartEditPage = lazy(() => import('./DismantlePartEditPage'));
const DismantleLabelsPage = lazy(() => import('./DismantleLabelsPage'));

const COLORS = {
  primary: '#ef4444',
  primaryDark: '#b91c1c',
  dark: '#0f172a',
  darkSoft: '#111827',
  sidebar: '#0f172a',
  sidebarSoft: '#172033',
  bg: '#f8fafc',
  border: '#e2e8f0',
  muted: '#64748b',
  white: '#ffffff',
};

const BUSINESS = {
  name: 'Yaris Autocare',
  phone: '0449 828 749',
  location: 'Legana, Tasmania',
  subtitle: 'Inventory & Workshop Control',
};

const DJANGO_ADMIN_URL = 'https://yaris-autocare-production.up.railway.app/admin/';

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

function AppRoutes() {
  const location = useLocation();
  const isInvoicePrintView = /^\/sales\/[^/]+$/.test(location.pathname);

  if (location.pathname === '/login') {
    return <LoginPage />;
  }

  if (isInvoicePrintView) {
    return (
      <ProtectedRoute>
        <Suspense fallback={<div style={{ padding: '40px', fontWeight: '700' }}>Loading Invoice...</div>}>
          <Routes>
            <Route path="/sales/:id" element={<InvoiceDetail />} />
          </Routes>
        </Suspense>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>
  );
}

function MainLayout() {
  const [isOpen, setIsOpen] = useState(true);
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const initials =
    `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.trim().toUpperCase() ||
    user?.username?.slice(0, 2)?.toUpperCase() ||
    'YA';

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    user?.username ||
    'Staff User';

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={layoutWrap}>
      <aside
        style={{
          ...sidebar,
          width: isOpen ? '280px' : '0px',
          minWidth: isOpen ? '280px' : '0px',
          padding: isOpen ? '0' : '0',
        }}
      >
        <div style={sidebarTop}>
          <Link to="/" style={brandLink}>
            <div style={brandWrap}>
              <img src={logo} alt="Yaris Autocare" style={logoStyle} />
              <div style={{ minWidth: 0 }}>
                <div style={brandTitle}>YARIS <span style={{ color: COLORS.primary }}>AUTOCARE</span></div>
                <div style={brandSubtitle}>{BUSINESS.subtitle}</div>
              </div>
            </div>
          </Link>
        </div>

        <nav style={navWrap}>
          <NavItem to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <NavItem to="/used-parts" icon={<Package size={18} />} label="Used Parts" />
          <NavItem to="/aftermarket" icon={<Wrench size={18} />} label="Aftermarket" />
          <NavItem to="/low-stock" icon={<AlertTriangle size={18} />} label="Low Stock" />
          <NavItem to="/dismantle" icon={<Scissors size={18} />} label="Dismantle Yard" />
          <NavItem to="/yard-master" icon={<Car size={18} />} label="Yard Master" />
          <NavItem to="/sales" icon={<ShoppingCart size={18} />} label="Create Sale / Invoice" />
          <NavItem to="/sales-dashboard" icon={<Receipt size={18} />} label="Invoices Dashboard" />
        </nav>

        <div style={sidebarBottom}>
          <div style={businessCard}>
            <div style={businessCardTitle}>Business Details</div>

            <div style={businessLine}>
              <Phone size={14} />
              <span>{BUSINESS.phone}</span>
            </div>

            <div style={businessLine}>
              <MapPin size={14} />
              <span>{BUSINESS.location}</span>
            </div>

            {isAdmin && (
              <a
                href={DJANGO_ADMIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={adminLink}
              >
                <ShieldCheck size={14} />
                <span style={{ flex: 1 }}>System Admin</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>

          <button onClick={handleLogout} style={logoutBtn}>
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      <div style={contentShell}>
        <header style={topbar}>
          <div style={topbarLeft}>
            <button onClick={() => setIsOpen(!isOpen)} style={menuBtn}>
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div>
              <div style={topbarTitle}>Yaris Autocare Inventory System</div>
              <div style={topbarSub}>Secure internal dashboard</div>
            </div>
          </div>

          <div style={topbarRight}>
            <div style={userInfo}>
              <div style={userRole}>{user?.role || 'STAFF'} ACCESS</div>
              <div style={userName}>{displayName}</div>
            </div>

            <div style={avatar}>{initials}</div>
          </div>
        </header>

        <main style={mainArea}>
          <Suspense fallback={<div style={{ fontWeight: '700' }}>Loading Module...</div>}>
            <Routes>
              <Route path="/" element={<HomePage />} />

              <Route path="/used-parts" element={<UsedPartsModule />} />
              <Route path="/used-parts/add" element={<UsedPartAddPage />} />
              <Route path="/used-parts/:id" element={<UsedPartDetailPage />} />
              <Route path="/used-parts/:id/edit" element={<UsedPartEditPage />} />
              <Route path="/used-parts/:id/label" element={<UsedPartLabelPage />} />

              <Route path="/aftermarket" element={<AftermarketModule />} />
              <Route path="/aftermarket/new" element={<AftermarketNewPage />} />
              <Route path="/aftermarket/edit/:id" element={<AftermarketEditPage />} />
              <Route path="/aftermarket/:id" element={<AftermarketDetailPage />} />

              <Route path="/dismantle" element={<DismantleModule />} />
              <Route path="/sales" element={<SalesModule />} />
              <Route path="/sales-dashboard" element={<InvoicesDashboard />} />
              <Route path="/low-stock" element={<LowStockModule />} />
              <Route path="/yard-master" element={<InventoryMasterModule />} />
              <Route path="/yard-master/:id" element={<DonorCarDetailView />} />
              <Route path="/yard-master/:id/labels" element={<DismantleLabelsPage />} />

              <Route path="/dismantle-parts/:id" element={<DismantlePartDetailPage />} />
              <Route path="/dismantle-parts/:id/edit" element={<DismantlePartEditPage />} />

              <Route path="*" element={<HomePage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function NavItem({ to, icon, label }) {
  const location = useLocation();

  const isActive =
    location.pathname === to ||
    (to === '/sales-dashboard' && location.pathname.startsWith('/sales/'));

  return (
    <Link
      to={to}
      style={{
        ...navItem,
        backgroundColor: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
        color: isActive ? '#ffffff' : '#cbd5e1',
        borderLeft: isActive ? `4px solid ${COLORS.primary}` : '4px solid transparent',
      }}
    >
      <div style={navItemLeft}>
        {icon}
        <span>{label}</span>
      </div>
      {isActive && <ChevronRight size={14} />}
    </Link>
  );
}

const layoutWrap = {
  display: 'flex',
  width: '100vw',
  height: '100vh',
  overflow: 'hidden',
  background: COLORS.bg,
};

const sidebar = {
  background: `linear-gradient(180deg, ${COLORS.sidebar} 0%, ${COLORS.sidebarSoft} 100%)`,
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.22s ease',
  overflow: 'hidden',
  color: '#fff',
  borderRight: '1px solid rgba(255,255,255,0.06)',
};

const sidebarTop = {
  padding: '20px 18px 16px',
  borderBottom: '1px solid rgba(255,255,255,0.07)',
};

const brandLink = {
  textDecoration: 'none',
  color: 'inherit',
};

const brandWrap = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const logoStyle = {
  width: '44px',
  height: '44px',
  borderRadius: '12px',
  objectFit: 'cover',
  border: '1px solid rgba(255,255,255,0.12)',
  background: '#fff',
};

const brandTitle = {
  fontSize: '20px',
  fontWeight: '900',
  color: '#fff',
  lineHeight: 1.1,
  letterSpacing: '-0.02em',
};

const brandSubtitle = {
  marginTop: '4px',
  fontSize: '11px',
  fontWeight: '700',
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const navWrap = {
  flex: 1,
  padding: '16px 0',
};

const navItem = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 20px',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '700',
};

const navItemLeft = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const sidebarBottom = {
  padding: '16px',
  borderTop: '1px solid rgba(255,255,255,0.07)',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const businessCard = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px',
  padding: '14px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const businessCardTitle = {
  fontSize: '12px',
  fontWeight: '900',
  color: '#fff',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const businessLine = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '13px',
  fontWeight: '600',
  color: '#cbd5e1',
};

const adminLink = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  textDecoration: 'none',
  color: '#fca5a5',
  fontSize: '13px',
  fontWeight: '800',
  marginTop: '4px',
};

const logoutBtn = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '12px 14px',
  borderRadius: '14px',
  border: 'none',
  background: '#ef4444',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: '800',
};

const contentShell = {
  flex: 1,
  minWidth: 0,
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
};

const topbar = {
  height: '76px',
  background: '#ffffffcc',
  backdropFilter: 'blur(8px)',
  borderBottom: `1px solid ${COLORS.border}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 24px',
};

const topbarLeft = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
};

const menuBtn = {
  background: '#fff',
  border: `1px solid ${COLORS.border}`,
  width: '42px',
  height: '42px',
  borderRadius: '12px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const topbarTitle = {
  fontSize: '16px',
  fontWeight: '900',
  color: '#0f172a',
};

const topbarSub = {
  fontSize: '12px',
  fontWeight: '700',
  color: '#94a3b8',
};

const topbarRight = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const userInfo = {
  textAlign: 'right',
};

const userRole = {
  fontSize: '11px',
  fontWeight: '900',
  color: '#0f172a',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const userName = {
  fontSize: '12px',
  color: '#64748b',
  fontWeight: '700',
};

const avatar = {
  width: '42px',
  height: '42px',
  borderRadius: '14px',
  background: '#0f172a',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '900',
};

const mainArea = {
  flex: 1,
  overflowY: 'auto',
  padding: '24px',
};
