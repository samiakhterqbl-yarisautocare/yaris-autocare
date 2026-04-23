import React, { useState, Suspense, lazy, useEffect } from 'react';
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
  ExternalLink,
  Car,
  Receipt,
  LogOut,
  Phone,
  MapPin,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
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
const MOBILE_BREAKPOINT = 1024;

const NAV_ITEMS = [
  { to: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/used-parts', icon: <Package size={18} />, label: 'Used Parts' },
  { to: '/aftermarket', icon: <Wrench size={18} />, label: 'Aftermarket' },
  { to: '/low-stock', icon: <AlertTriangle size={18} />, label: 'Low Stock' },
  { to: '/dismantle', icon: <Scissors size={18} />, label: 'Dismantle Yard' },
  { to: '/yard-master', icon: <Car size={18} />, label: 'Yard Master' },
  { to: '/sales', icon: <ShoppingCart size={18} />, label: 'Create Sale / Invoice' },
  { to: '/sales-dashboard', icon: <Receipt size={18} />, label: 'Invoices Dashboard' },
];

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
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= MOBILE_BREAKPOINT);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);

      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  useEffect(() => {
    document.body.style.overflow = isMobile && isSidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isSidebarOpen]);

  const initials =
    `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.trim().toUpperCase() ||
    user?.username?.slice(0, 2)?.toUpperCase() ||
    'YA';

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    user?.username ||
    'Staff User';

  const activeTitle = getPageTitle(location.pathname);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen((prev) => !prev);
      return;
    }
    setIsDesktopCollapsed((prev) => !prev);
  };

  const closeSidebar = () => {
    if (isMobile) setIsSidebarOpen(false);
  };

  const desktopSidebarWidth = isDesktopCollapsed ? 92 : 280;
  const actualSidebarWidth = isMobile ? 0 : desktopSidebarWidth;

  return (
    <div style={layoutWrap}>
      {isMobile && isSidebarOpen && (
        <div style={mobileOverlay} onClick={closeSidebar} />
      )}

      <aside
        style={{
          ...sidebar,
          ...(isMobile
            ? {
                ...sidebarMobile,
                transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
              }
            : {
                width: `${actualSidebarWidth}px`,
                minWidth: `${actualSidebarWidth}px`,
              }),
        }}
      >
        <div style={sidebarTop}>
          <Link to="/" style={brandLink} onClick={closeSidebar}>
            <div style={brandWrap}>
              <img src={logo} alt="Yaris Autocare" style={logoStyle} />
              {!isDesktopCollapsed || isMobile ? (
                <div style={{ minWidth: 0 }}>
                  <div style={brandTitle}>
                    YARIS <span style={{ color: COLORS.primary }}>AUTOCARE</span>
                  </div>
                  <div style={brandSubtitle}>{BUSINESS.subtitle}</div>
                </div>
              ) : null}
            </div>
          </Link>

          {isMobile && (
            <button onClick={closeSidebar} style={mobileCloseBtn}>
              <X size={18} />
            </button>
          )}
        </div>

        <nav style={navWrap}>
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              collapsed={!isMobile && isDesktopCollapsed}
              onNavigate={closeSidebar}
            />
          ))}
        </nav>

        <div style={sidebarBottom}>
          {!isDesktopCollapsed || isMobile ? (
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
          ) : (
            <div style={collapsedBottomWrap}>
              {isAdmin && (
                <a
                  href={DJANGO_ADMIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={collapsedIconBtn}
                  title="System Admin"
                >
                  <ShieldCheck size={16} />
                </a>
              )}
            </div>
          )}

          <button
            onClick={handleLogout}
            style={{
              ...logoutBtn,
              ...(isDesktopCollapsed && !isMobile ? collapsedLogoutBtn : {}),
            }}
            title="Log Out"
          >
            <LogOut size={16} />
            {(!isDesktopCollapsed || isMobile) && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      <div style={contentShell}>
        <header style={topbar}>
          <div style={topbarLeft}>
            <button onClick={toggleSidebar} style={menuBtn}>
              {isMobile ? (
                isSidebarOpen ? <X size={20} /> : <Menu size={20} />
              ) : isDesktopCollapsed ? (
                <PanelLeftOpen size={18} />
              ) : (
                <PanelLeftClose size={18} />
              )}
            </button>

            <div style={{ minWidth: 0 }}>
              <div style={topbarTitle}>{activeTitle}</div>
              <div style={topbarSub}>Yaris Autocare Inventory System</div>
            </div>
          </div>

          <div style={topbarRight}>
            {!isMobile && (
              <div style={topbarPills}>
                <QuickLink to="/used-parts" label="Used Parts" />
                <QuickLink to="/aftermarket" label="Aftermarket" />
                <QuickLink to="/sales" label="New Invoice" />
              </div>
            )}

            <div style={userInfo}>
              <div style={userRole}>{user?.role || 'STAFF'} ACCESS</div>
              <div style={userName}>{displayName}</div>
            </div>

            <div style={avatar}>{initials}</div>
          </div>
        </header>

        {isMobile && (
          <div style={mobileQuickNav}>
            <QuickLink to="/" label="Dashboard" compact />
            <QuickLink to="/used-parts" label="Used Parts" compact />
            <QuickLink to="/aftermarket" label="Aftermarket" compact />
            <QuickLink to="/sales" label="Invoice" compact />
          </div>
        )}

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

function QuickLink({ to, label, compact = false }) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      style={{
        ...quickLink,
        ...(compact ? quickLinkCompact : {}),
        background: active ? '#fee2e2' : '#fff',
        color: active ? '#b91c1c' : '#334155',
        border: active ? '1px solid #fecaca' : `1px solid ${COLORS.border}`,
      }}
    >
      {label}
    </Link>
  );
}

function NavItem({ to, icon, label, collapsed = false, onNavigate }) {
  const location = useLocation();

  const isActive =
    location.pathname === to ||
    (to === '/sales-dashboard' && location.pathname.startsWith('/sales/'));

  return (
    <Link
      to={to}
      onClick={onNavigate}
      title={collapsed ? label : ''}
      style={{
        ...navItem,
        justifyContent: collapsed ? 'center' : 'space-between',
        backgroundColor: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
        color: isActive ? '#ffffff' : '#cbd5e1',
        borderLeft: isActive ? `4px solid ${COLORS.primary}` : '4px solid transparent',
        padding: collapsed ? '14px 10px' : '14px 20px',
      }}
    >
      <div
        style={{
          ...navItemLeft,
          justifyContent: collapsed ? 'center' : 'flex-start',
          width: '100%',
        }}
      >
        {icon}
        {!collapsed && <span>{label}</span>}
      </div>
      {!collapsed && isActive && <ChevronRight size={14} />}
    </Link>
  );
}

function getPageTitle(pathname) {
  if (pathname.startsWith('/used-parts')) return 'Used Parts';
  if (pathname.startsWith('/aftermarket')) return 'Aftermarket';
  if (pathname.startsWith('/low-stock')) return 'Low Stock';
  if (pathname.startsWith('/dismantle')) return 'Dismantle Yard';
  if (pathname.startsWith('/yard-master')) return 'Yard Master';
  if (pathname.startsWith('/sales-dashboard')) return 'Invoices Dashboard';
  if (pathname.startsWith('/sales')) return 'Create Sale / Invoice';
  return 'Dashboard';
}

const layoutWrap = {
  display: 'flex',
  width: '100vw',
  height: '100vh',
  overflow: 'hidden',
  background: COLORS.bg,
  position: 'relative',
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
  zIndex: 40,
};

const sidebarMobile = {
  position: 'fixed',
  left: 0,
  top: 0,
  width: '290px',
  minWidth: '290px',
  maxWidth: '82vw',
  boxShadow: '0 18px 60px rgba(0,0,0,0.35)',
};

const mobileOverlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.52)',
  zIndex: 30,
};

const sidebarTop = {
  padding: '20px 18px 16px',
  borderBottom: '1px solid rgba(255,255,255,0.07)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '10px',
};

const brandLink = {
  textDecoration: 'none',
  color: 'inherit',
  flex: 1,
  minWidth: 0,
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
  flexShrink: 0,
};

const brandTitle = {
  fontSize: '20px',
  fontWeight: '900',
  color: '#fff',
  lineHeight: 1.1,
  letterSpacing: '-0.02em',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const brandSubtitle = {
  marginTop: '4px',
  fontSize: '11px',
  fontWeight: '700',
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const mobileCloseBtn = {
  width: '38px',
  height: '38px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.06)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
};

const navWrap = {
  flex: 1,
  padding: '16px 0',
  overflowY: 'auto',
};

const navItem = {
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '700',
  transition: 'all 0.16s ease',
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

const collapsedBottomWrap = {
  display: 'flex',
  justifyContent: 'center',
};

const collapsedIconBtn = {
  width: '48px',
  height: '48px',
  borderRadius: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  color: '#fca5a5',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
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

const collapsedLogoutBtn = {
  padding: '12px',
};

const contentShell = {
  flex: 1,
  minWidth: 0,
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
};

const topbar = {
  minHeight: '76px',
  background: '#ffffffcc',
  backdropFilter: 'blur(8px)',
  borderBottom: `1px solid ${COLORS.border}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 20px',
  gap: '12px',
  flexWrap: 'wrap',
};

const topbarLeft = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  minWidth: 0,
  flex: '1 1 280px',
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
  flexShrink: 0,
};

const topbarTitle = {
  fontSize: '16px',
  fontWeight: '900',
  color: '#0f172a',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
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
  marginLeft: 'auto',
  flexWrap: 'wrap',
};

const topbarPills = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap',
};

const quickLink = {
  textDecoration: 'none',
  padding: '9px 12px',
  borderRadius: '999px',
  fontWeight: '700',
  fontSize: '12px',
  whiteSpace: 'nowrap',
};

const quickLinkCompact = {
  padding: '8px 11px',
  fontSize: '11px',
};

const mobileQuickNav = {
  display: 'flex',
  gap: '8px',
  padding: '10px 16px',
  borderBottom: `1px solid ${COLORS.border}`,
  background: '#fff',
  overflowX: 'auto',
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
  flexShrink: 0,
};

const mainArea = {
  flex: 1,
  overflowY: 'auto',
  padding: '24px',
};
