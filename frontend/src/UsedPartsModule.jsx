import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Plus,
  Search,
  Package,
  Filter,
  ArrowRight,
  Tag,
  MapPin,
  Car,
  Layers,
  Wrench,
  Zap,
  Disc,
  Wind,
  Eye,
  Grid3X3,
  Rows3,
} from 'lucide-react';

const API_URL = 'https://yaris-autocare-production.up.railway.app';

const CATEGORY_OPTIONS = [
  { name: 'All', icon: <Package size={18} />, slug: 'All' },
  { name: 'Engine', icon: <Car size={18} />, slug: 'Engine' },
  { name: 'Transmission', icon: <Layers size={18} />, slug: 'Transmission' },
  { name: 'Suspension', icon: <Disc size={18} />, slug: 'Suspension' },
  { name: 'Steering', icon: <Wrench size={18} />, slug: 'Steering' },
  { name: 'Brakes', icon: <Disc size={18} />, slug: 'Brakes' },
  { name: 'Electrical', icon: <Zap size={18} />, slug: 'Electrical' },
  { name: 'Lighting', icon: <Zap size={18} />, slug: 'Lighting' },
  { name: 'Interior', icon: <Wind size={18} />, slug: 'Interior' },
  { name: 'Exterior', icon: <Car size={18} />, slug: 'Exterior' },
  { name: 'Body Panels', icon: <Car size={18} />, slug: 'Body Panels' },
  { name: 'Cooling', icon: <Wind size={18} />, slug: 'Cooling' },
  { name: 'Fuel System', icon: <Wrench size={18} />, slug: 'Fuel System' },
  { name: 'Exhaust', icon: <Wrench size={18} />, slug: 'Exhaust' },
  { name: 'Wheels & Tyres', icon: <Disc size={18} />, slug: 'Wheels & Tyres' },
  { name: 'Doors & Windows', icon: <Layers size={18} />, slug: 'Doors & Windows' },
  { name: 'Mirrors', icon: <Layers size={18} />, slug: 'Mirrors' },
  { name: 'AC & Heating', icon: <Wind size={18} />, slug: 'AC & Heating' },
  { name: 'Sensors', icon: <Zap size={18} />, slug: 'Sensors' },
  { name: 'ECU / Modules', icon: <Zap size={18} />, slug: 'ECU / Modules' },
  { name: 'Accessories', icon: <Tag size={18} />, slug: 'Accessories' },
  { name: 'Other', icon: <Package size={18} />, slug: 'Other' },
];

const SALE_STATUS_OPTIONS = ['All', 'AVAILABLE', 'RESERVED', 'SOLD', 'REMOVED', 'DAMAGED', 'HOLD'];
const USAGE_TYPE_OPTIONS = ['All', 'FOR_SALE', 'INTERNAL_USE'];
const GRADE_OPTIONS = ['All', 'A', 'B', 'C', 'D'];

export default function UsedPartsModule() {
  const navigate = useNavigate();

  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    sale_status: 'All',
    usage_type: 'All',
    grade: 'All',
    make: '',
    model: '',
    location: '',
  });

  useEffect(() => {
    fetchParts();
  }, [filters]);

  const fetchParts = async () => {
    setLoading(true);
    try {
      const params = {};

      if (filters.search.trim()) params.search = filters.search.trim();
      if (filters.category !== 'All') params.category = filters.category;
      if (filters.sale_status !== 'All') params.sale_status = filters.sale_status;
      if (filters.usage_type !== 'All') params.usage_type = filters.usage_type;
      if (filters.grade !== 'All') params.grade = filters.grade;
      if (filters.make.trim()) params.make = filters.make.trim();
      if (filters.model.trim()) params.model = filters.model.trim();
      if (filters.location.trim()) params.location = filters.location.trim();

      const res = await axios.get(`${API_URL}/api/used-parts/`, { params });
      setParts(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching used parts:', error);
      setParts([]);
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    const total = parts.length;
    const available = parts.filter((item) => item.sale_status === 'AVAILABLE').length;
    const sold = parts.filter((item) => item.sale_status === 'SOLD').length;
    const reserved = parts.filter((item) => item.sale_status === 'RESERVED').length;
    const internal = parts.filter((item) => item.usage_type === 'INTERNAL_USE').length;

    return { total, available, sold, reserved, internal };
  }, [parts]);

  const resetFilters = () => {
    setFilters({
      search: '',
      category: 'All',
      sale_status: 'All',
      usage_type: 'All',
      grade: 'All',
      make: '',
      model: '',
      location: '',
    });
  };

  const getMainImage = (part) => {
    if (!part.images || !part.images.length) return null;
    return part.images.find((img) => img.is_main)?.image || part.images[0]?.image || null;
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return statusAvailable;
      case 'SOLD':
        return statusSold;
      case 'RESERVED':
        return statusReserved;
      case 'DAMAGED':
        return statusDamaged;
      case 'HOLD':
        return statusHold;
      default:
        return statusDefault;
    }
  };

  const formatPrice = (value) => {
    const num = parseFloat(value || 0);
    return `$${num.toFixed(2)}`;
  };

  return (
    <div style={page}>
      <div style={headerRow}>
        <div>
          <h1 style={pageTitle}>Used Parts Inventory</h1>
          <p style={pageSubtitle}>
            Manage individual used parts with photos, grading, pricing and stock status.
          </p>
        </div>

        <button onClick={() => navigate('/used-parts/add')} style={addBtn}>
          <Plus size={18} />
          ADD USED PART
        </button>
      </div>

      <div style={summaryGrid}>
        <SummaryCard title="Total Parts" value={summary.total} />
        <SummaryCard title="Available" value={summary.available} />
        <SummaryCard title="Sold" value={summary.sold} />
        <SummaryCard title="Reserved" value={summary.reserved} />
        <SummaryCard title="Internal Use" value={summary.internal} />
      </div>

      <div style={toolbar}>
        <div style={searchWrap}>
          <Search size={18} style={searchIcon} />
          <input
            type="text"
            placeholder="Search by name, SKU, label, QR, make, model, notes..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            style={searchInput}
          />
        </div>

        <div style={toolbarRight}>
          <div style={viewToggle}>
            <button
              type="button"
              style={viewMode === 'grid' ? activeViewBtn : viewBtn}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              type="button"
              style={viewMode === 'list' ? activeViewBtn : viewBtn}
              onClick={() => setViewMode('list')}
            >
              <Rows3 size={16} />
            </button>
          </div>

          <button onClick={() => setShowFilters(!showFilters)} style={filterBtn}>
            <Filter size={18} />
            {showFilters ? 'HIDE FILTERS' : 'SHOW FILTERS'}
          </button>
        </div>
      </div>

      {showFilters && (
        <div style={filtersCard}>
          <div style={filtersGrid}>
            <div style={fieldGroup}>
              <label style={label}>Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                style={input}
              >
                {CATEGORY_OPTIONS.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={fieldGroup}>
              <label style={label}>Sale Status</label>
              <select
                value={filters.sale_status}
                onChange={(e) => setFilters({ ...filters, sale_status: e.target.value })}
                style={input}
              >
                {SALE_STATUS_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div style={fieldGroup}>
              <label style={label}>Usage Type</label>
              <select
                value={filters.usage_type}
                onChange={(e) => setFilters({ ...filters, usage_type: e.target.value })}
                style={input}
              >
                {USAGE_TYPE_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div style={fieldGroup}>
              <label style={label}>Grade</label>
              <select
                value={filters.grade}
                onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
                style={input}
              >
                {GRADE_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div style={fieldGroup}>
              <label style={label}>Make</label>
              <input
                type="text"
                value={filters.make}
                onChange={(e) => setFilters({ ...filters, make: e.target.value })}
                style={input}
                placeholder="e.g. Toyota"
              />
            </div>

            <div style={fieldGroup}>
              <label style={label}>Model</label>
              <input
                type="text"
                value={filters.model}
                onChange={(e) => setFilters({ ...filters, model: e.target.value })}
                style={input}
                placeholder="e.g. Yaris"
              />
            </div>

            <div style={fieldGroup}>
              <label style={label}>Location</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                style={input}
                placeholder="e.g. Shelf A1"
              />
            </div>
          </div>

          <div style={filterActionRow}>
            <button onClick={resetFilters} style={clearBtn}>
              RESET FILTERS
            </button>
          </div>
        </div>
      )}

      <div style={sectionHeader}>
        <h2 style={sectionTitle}>Browse by Category</h2>
      </div>

      <div style={categoryGrid}>
        {CATEGORY_OPTIONS.filter((item) => item.slug !== 'All').map((item) => (
          <button
            key={item.slug}
            onClick={() => setFilters({ ...filters, category: item.slug })}
            style={filters.category === item.slug ? activeCategoryCard : categoryCard}
          >
            <div style={categoryIconWrap}>{item.icon}</div>
            <div style={categoryTextWrap}>
              <div style={categoryTitle}>{item.name}</div>
              <div style={categorySubtext}>Filter inventory</div>
            </div>
            <ArrowRight size={16} />
          </button>
        ))}
      </div>

      <div style={sectionHeaderRow}>
        <h2 style={sectionTitle}>Parts ({parts.length})</h2>
      </div>

      {loading ? (
        <div style={emptyStateCard}>Loading used parts...</div>
      ) : parts.length === 0 ? (
        <div style={emptyStateCard}>
          <Package size={34} />
          <h3 style={emptyTitle}>No used parts found</h3>
          <p style={emptyText}>Try changing filters or add your first used part.</p>
          <button onClick={() => navigate('/used-parts/add')} style={addBtnSmall}>
            <Plus size={16} />
            ADD USED PART
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={compactGrid}>
          {parts.map((part) => {
            const imageUrl = getMainImage(part);

            return (
              <div
                key={part.id}
                style={compactCard}
                onClick={() => navigate(`/used-parts/${part.id}`)}
              >
                <div style={compactThumbWrap}>
                  {imageUrl ? (
                    <img src={imageUrl} alt={part.part_name} style={compactThumb} />
                  ) : (
                    <div style={compactPlaceholder}>
                      <Package size={22} />
                    </div>
                  )}
                </div>

                <div style={compactBody}>
                  <div style={compactTop}>
                    <span style={smallCategoryBadge}>{part.category || 'Other'}</span>
                    <span style={getStatusBadgeStyle(part.sale_status)}>
                      {part.sale_status || 'AVAILABLE'}
                    </span>
                  </div>

                  <div style={compactName}>{part.part_name}</div>

                  <div style={compactMeta}>
                    <div style={metaLine}>
                      <Tag size={13} />
                      <span>{part.sku || 'No SKU'}</span>
                    </div>

                    {(part.make || part.model) && (
                      <div style={metaLine}>
                        <Car size={13} />
                        <span>{[part.make, part.model].filter(Boolean).join(' ')}</span>
                      </div>
                    )}

                    {part.location && (
                      <div style={metaLine}>
                        <MapPin size={13} />
                        <span>{part.location}</span>
                      </div>
                    )}
                  </div>

                  <div style={compactFooter}>
                    <div style={compactPrice}>{formatPrice(part.price)}</div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/used-parts/${part.id}`);
                      }}
                      style={openMiniBtn}
                    >
                      <Eye size={14} />
                      OPEN
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={listWrap}>
          {parts.map((part) => {
            const imageUrl = getMainImage(part);

            return (
              <div
                key={part.id}
                style={listCard}
                onClick={() => navigate(`/used-parts/${part.id}`)}
              >
                <div style={listThumbWrap}>
                  {imageUrl ? (
                    <img src={imageUrl} alt={part.part_name} style={listThumb} />
                  ) : (
                    <div style={listPlaceholder}>
                      <Package size={20} />
                    </div>
                  )}
                </div>

                <div style={listMain}>
                  <div style={listHeader}>
                    <div style={listName}>{part.part_name}</div>
                    <div style={listBadges}>
                      <span style={smallCategoryBadge}>{part.category || 'Other'}</span>
                      <span style={getStatusBadgeStyle(part.sale_status)}>
                        {part.sale_status || 'AVAILABLE'}
                      </span>
                    </div>
                  </div>

                  <div style={listMetaRow}>
                    <span style={listMetaItem}>
                      <Tag size={13} />
                      {part.sku || 'No SKU'}
                    </span>

                    {(part.make || part.model) && (
                      <span style={listMetaItem}>
                        <Car size={13} />
                        {[part.make, part.model, part.variant].filter(Boolean).join(' ')}
                      </span>
                    )}

                    {part.location && (
                      <span style={listMetaItem}>
                        <MapPin size={13} />
                        {part.location}
                      </span>
                    )}

                    {part.grade && (
                      <span style={listMetaItem}>
                        Grade {part.grade}
                      </span>
                    )}
                  </div>
                </div>

                <div style={listSide}>
                  <div style={listPrice}>{formatPrice(part.price)}</div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/used-parts/${part.id}`);
                    }}
                    style={openMiniBtn}
                  >
                    <Eye size={14} />
                    OPEN
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div style={summaryCard}>
      <div style={summaryTitle}>{title}</div>
      <div style={summaryValue}>{value}</div>
    </div>
  );
}

const page = {
  padding: '32px',
};

const headerRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '24px',
  flexWrap: 'wrap',
};

const pageTitle = {
  margin: 0,
  fontSize: '32px',
  fontWeight: '900',
  color: '#0f172a',
};

const pageSubtitle = {
  marginTop: '8px',
  color: '#64748b',
  fontWeight: '500',
};

const addBtn = {
  backgroundColor: '#ef4444',
  color: '#fff',
  border: 'none',
  padding: '14px 20px',
  borderRadius: '14px',
  fontWeight: '800',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const addBtnSmall = {
  backgroundColor: '#ef4444',
  color: '#fff',
  border: 'none',
  padding: '12px 16px',
  borderRadius: '12px',
  fontWeight: '800',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
};

const summaryGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: '16px',
  marginBottom: '24px',
};

const summaryCard = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '20px',
  padding: '18px',
};

const summaryTitle = {
  fontSize: '13px',
  fontWeight: '800',
  color: '#64748b',
  marginBottom: '8px',
};

const summaryValue = {
  fontSize: '30px',
  fontWeight: '900',
  color: '#0f172a',
};

const toolbar = {
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
  marginBottom: '20px',
  flexWrap: 'wrap',
};

const toolbarRight = {
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
  flexWrap: 'wrap',
};

const searchWrap = {
  position: 'relative',
  flex: 1,
  minWidth: '280px',
};

const searchIcon = {
  position: 'absolute',
  left: '16px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#94a3b8',
};

const searchInput = {
  width: '100%',
  padding: '14px 16px 14px 46px',
  borderRadius: '14px',
  border: '1px solid #e2e8f0',
  background: '#fff',
  fontSize: '14px',
  outline: 'none',
};

const viewToggle = {
  display: 'flex',
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '14px',
  padding: '4px',
  gap: '4px',
};

const viewBtn = {
  width: '40px',
  height: '40px',
  borderRadius: '10px',
  border: 'none',
  background: 'transparent',
  color: '#475569',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const activeViewBtn = {
  ...viewBtn,
  background: '#0f172a',
  color: '#fff',
};

const filterBtn = {
  padding: '14px 16px',
  borderRadius: '14px',
  border: '1px solid #e2e8f0',
  background: '#fff',
  fontWeight: '800',
  color: '#334155',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const filtersCard = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '20px',
  padding: '20px',
  marginBottom: '24px',
};

const filtersGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '14px',
};

const fieldGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const label = {
  fontSize: '13px',
  fontWeight: '800',
  color: '#334155',
};

const input = {
  padding: '12px 14px',
  borderRadius: '12px',
  border: '1px solid #cbd5e1',
  outline: 'none',
  fontSize: '14px',
  background: '#fff',
};

const filterActionRow = {
  marginTop: '16px',
  display: 'flex',
  justifyContent: 'flex-end',
};

const clearBtn = {
  padding: '12px 14px',
  borderRadius: '12px',
  border: '1px solid #cbd5e1',
  background: '#fff',
  color: '#334155',
  fontWeight: '800',
  cursor: 'pointer',
};

const sectionHeader = {
  marginBottom: '12px',
};

const sectionHeaderRow = {
  marginBottom: '14px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const sectionTitle = {
  fontSize: '18px',
  fontWeight: '900',
  color: '#0f172a',
  margin: 0,
};

const categoryGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '14px',
  marginBottom: '24px',
};

const categoryCard = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '18px',
  padding: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  cursor: 'pointer',
};

const activeCategoryCard = {
  ...categoryCard,
  border: '1px solid #ef4444',
  boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.08)',
};

const categoryIconWrap = {
  width: '40px',
  height: '40px',
  borderRadius: '12px',
  background: '#0f172a',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const categoryTextWrap = {
  flex: 1,
  textAlign: 'left',
};

const categoryTitle = {
  fontSize: '14px',
  fontWeight: '800',
  color: '#0f172a',
};

const categorySubtext = {
  fontSize: '12px',
  color: '#64748b',
  marginTop: '4px',
};

const compactGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
  gap: '16px',
};

const compactCard = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '18px',
  overflow: 'hidden',
  cursor: 'pointer',
  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
};

const compactThumbWrap = {
  height: '130px',
  background: '#f8fafc',
  borderBottom: '1px solid #f1f5f9',
};

const compactThumb = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const compactPlaceholder = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#94a3b8',
};

const compactBody = {
  padding: '14px',
};

const compactTop = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '10px',
};

const smallCategoryBadge = {
  padding: '4px 9px',
  borderRadius: '999px',
  background: '#f1f5f9',
  color: '#475569',
  fontWeight: '800',
  fontSize: '10px',
  whiteSpace: 'nowrap',
};

const compactName = {
  fontSize: '17px',
  fontWeight: '900',
  color: '#0f172a',
  marginBottom: '10px',
  lineHeight: 1.2,
  minHeight: '40px',
};

const compactMeta = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const metaLine = {
  display: 'flex',
  alignItems: 'center',
  gap: '7px',
  color: '#64748b',
  fontSize: '12px',
  fontWeight: '600',
};

const compactFooter = {
  marginTop: '14px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const compactPrice = {
  fontSize: '20px',
  color: '#16a34a',
  fontWeight: '900',
};

const listWrap = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const listCard = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '18px',
  padding: '14px',
  display: 'grid',
  gridTemplateColumns: '92px 1fr auto',
  gap: '16px',
  alignItems: 'center',
  cursor: 'pointer',
};

const listThumbWrap = {
  width: '92px',
  height: '76px',
  borderRadius: '12px',
  overflow: 'hidden',
  background: '#f8fafc',
  border: '1px solid #f1f5f9',
};

const listThumb = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const listPlaceholder = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#94a3b8',
};

const listMain = {
  minWidth: 0,
};

const listHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '12px',
  flexWrap: 'wrap',
};

const listName = {
  fontSize: '18px',
  fontWeight: '900',
  color: '#0f172a',
  lineHeight: 1.2,
};

const listBadges = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
};

const listMetaRow = {
  display: 'flex',
  gap: '16px',
  flexWrap: 'wrap',
  marginTop: '10px',
};

const listMetaItem = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12px',
  color: '#64748b',
  fontWeight: '600',
};

const listSide = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: '10px',
};

const listPrice = {
  fontSize: '22px',
  color: '#16a34a',
  fontWeight: '900',
};

const statusBase = {
  padding: '4px 9px',
  borderRadius: '999px',
  fontWeight: '800',
  fontSize: '10px',
  whiteSpace: 'nowrap',
};

const statusAvailable = {
  ...statusBase,
  background: '#dcfce7',
  color: '#166534',
};

const statusSold = {
  ...statusBase,
  background: '#fee2e2',
  color: '#b91c1c',
};

const statusReserved = {
  ...statusBase,
  background: '#fef3c7',
  color: '#92400e',
};

const statusDamaged = {
  ...statusBase,
  background: '#e5e7eb',
  color: '#374151',
};

const statusHold = {
  ...statusBase,
  background: '#ede9fe',
  color: '#6d28d9',
};

const statusDefault = {
  ...statusBase,
  background: '#f1f5f9',
  color: '#475569',
};

const openMiniBtn = {
  padding: '9px 12px',
  borderRadius: '10px',
  border: 'none',
  background: '#0f172a',
  color: '#fff',
  fontWeight: '800',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12px',
};

const emptyStateCard = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '20px',
  padding: '40px 24px',
  textAlign: 'center',
  color: '#64748b',
};

const emptyTitle = {
  fontSize: '20px',
  fontWeight: '900',
  color: '#0f172a',
  margin: '12px 0 8px 0',
};

const emptyText = {
  marginBottom: '18px',
};
