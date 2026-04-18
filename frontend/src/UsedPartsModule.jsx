import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Plus,
  Search,
  Package,
  Filter,
  Tag,
  MapPin,
  Car,
  Layers,
  Wrench,
  Zap,
  Disc,
  Wind,
  Eye,
  X,
} from 'lucide-react';

const API_URL = 'https://yaris-autocare-production.up.railway.app';

const CATEGORY_OPTIONS = [
  { name: 'All', icon: <Package size={16} />, slug: 'All' },
  { name: 'Engine', icon: <Car size={16} />, slug: 'Engine' },
  { name: 'Transmission', icon: <Layers size={16} />, slug: 'Transmission' },
  { name: 'Suspension', icon: <Disc size={16} />, slug: 'Suspension' },
  { name: 'Steering', icon: <Wrench size={16} />, slug: 'Steering' },
  { name: 'Brakes', icon: <Disc size={16} />, slug: 'Brakes' },
  { name: 'Electrical', icon: <Zap size={16} />, slug: 'Electrical' },
  { name: 'Lighting', icon: <Zap size={16} />, slug: 'Lighting' },
  { name: 'Interior', icon: <Wind size={16} />, slug: 'Interior' },
  { name: 'Exterior', icon: <Car size={16} />, slug: 'Exterior' },
  { name: 'Body Panels', icon: <Car size={16} />, slug: 'Body Panels' },
  { name: 'Cooling', icon: <Wind size={16} />, slug: 'Cooling' },
  { name: 'Fuel System', icon: <Wrench size={16} />, slug: 'Fuel System' },
  { name: 'Exhaust', icon: <Wrench size={16} />, slug: 'Exhaust' },
  { name: 'Wheels & Tyres', icon: <Disc size={16} />, slug: 'Wheels & Tyres' },
  { name: 'Doors & Windows', icon: <Layers size={16} />, slug: 'Doors & Windows' },
  { name: 'Mirrors', icon: <Layers size={16} />, slug: 'Mirrors' },
  { name: 'AC & Heating', icon: <Wind size={16} />, slug: 'AC & Heating' },
  { name: 'Sensors', icon: <Zap size={16} />, slug: 'Sensors' },
  { name: 'ECU / Modules', icon: <Zap size={16} />, slug: 'ECU / Modules' },
  { name: 'Accessories', icon: <Tag size={16} />, slug: 'Accessories' },
  { name: 'Other', icon: <Package size={16} />, slug: 'Other' },
];

const SALE_STATUS_OPTIONS = ['All', 'AVAILABLE', 'RESERVED', 'SOLD', 'REMOVED', 'DAMAGED', 'HOLD'];
const USAGE_TYPE_OPTIONS = ['All', 'FOR_SALE', 'INTERNAL_USE'];
const GRADE_OPTIONS = ['All', 'A', 'B', 'C', 'D'];

export default function UsedPartsModule() {
  const navigate = useNavigate();

  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

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

  const activeFilterCount = useMemo(() => {
    return [
      filters.category !== 'All',
      filters.sale_status !== 'All',
      filters.usage_type !== 'All',
      filters.grade !== 'All',
      !!filters.make.trim(),
      !!filters.model.trim(),
      !!filters.location.trim(),
    ].filter(Boolean).length;
  }, [filters]);

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
        <SummaryCard title="Available" value={summary.available} accent="#16a34a" />
        <SummaryCard title="Sold" value={summary.sold} accent="#dc2626" />
        <SummaryCard title="Reserved" value={summary.reserved} accent="#d97706" />
        <SummaryCard title="Internal Use" value={summary.internal} accent="#475569" />
      </div>

      <div style={toolbarCard}>
        <div style={toolbarTop}>
          <div style={searchWrap}>
            <Search size={18} style={searchIcon} />
            <input
              type="text"
              placeholder="Search by name, SKU, make, model, location, notes..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              style={searchInput}
            />
          </div>

          <div style={toolbarButtons}>
            <button onClick={() => setShowFilters(!showFilters)} style={filterBtn}>
              <Filter size={16} />
              {showFilters ? 'HIDE FILTERS' : 'SHOW FILTERS'}
              {activeFilterCount > 0 ? <span style={filterCount}>{activeFilterCount}</span> : null}
            </button>
          </div>
        </div>

        <div style={chipWrap}>
          {CATEGORY_OPTIONS.map((item) => (
            <button
              key={item.slug}
              onClick={() => setFilters({ ...filters, category: item.slug })}
              style={filters.category === item.slug ? activeChip : categoryChip}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </div>

        {showFilters && (
          <div style={filtersPanel}>
            <div style={filtersGrid}>
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
                  placeholder="e.g. A1B3"
                />
              </div>
            </div>

            <div style={filterActionRow}>
              <button onClick={resetFilters} style={clearBtn}>
                <X size={14} />
                RESET FILTERS
              </button>
            </div>
          </div>
        )}
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
      ) : (
        <div style={tableCard}>
          <div style={tableWrap}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={thPart}>Part</th>
                  <th style={th}>SKU / Label</th>
                  <th style={th}>Fitment</th>
                  <th style={th}>Location</th>
                  <th style={th}>Grade</th>
                  <th style={th}>Status</th>
                  <th style={thPrice}>Price</th>
                  <th style={thAction}>Action</th>
                </tr>
              </thead>
              <tbody>
                {parts.map((part) => {
                  const imageUrl = getMainImage(part);

                  return (
                    <tr
                      key={part.id}
                      style={tr}
                      onClick={() => navigate(`/used-parts/${part.id}`)}
                    >
                      <td style={tdPart}>
                        <div style={partCell}>
                          <div style={thumbWrap}>
                            {imageUrl ? (
                              <img src={imageUrl} alt={part.part_name} style={thumb} />
                            ) : (
                              <div style={thumbPlaceholder}>
                                <Package size={18} />
                              </div>
                            )}
                          </div>

                          <div style={partInfo}>
                            <div style={partName}>{part.part_name}</div>
                            <div style={partSubRow}>
                              <span style={smallCategoryBadge}>{part.category || 'Other'}</span>
                              {part.part_number ? (
                                <span style={mutedMini}>PN: {part.part_number}</span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={td}>
                        <div style={monoText}>{part.sku || '-'}</div>
                        <div style={mutedMini}>{part.label_id || '-'}</div>
                      </td>

                      <td style={td}>
                        <div style={fitmentWrap}>
                          <span style={inlineMeta}>
                            <Car size={13} />
                            {[part.make, part.model, part.variant].filter(Boolean).join(' ') || '-'}
                          </span>
                          {(part.year_from || part.year_to) && (
                            <span style={mutedMini}>
                              {part.year_from || ''}{part.year_to ? ` - ${part.year_to}` : ''}
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={td}>
                        <div style={inlineMeta}>
                          <MapPin size={13} />
                          {part.location || '-'}
                        </div>
                        {part.shelf_code ? <div style={mutedMini}>{part.shelf_code}</div> : null}
                      </td>

                      <td style={td}>
                        <div style={gradeBadge}>Grade {part.grade || '-'}</div>
                      </td>

                      <td style={td}>
                        <span style={getStatusBadgeStyle(part.sale_status)}>
                          {part.sale_status || 'AVAILABLE'}
                        </span>
                      </td>

                      <td style={tdPrice}>{formatPrice(part.price)}</td>

                      <td style={tdAction}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/used-parts/${part.id}`);
                          }}
                          style={openBtn}
                        >
                          <Eye size={14} />
                          Open
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, accent = '#0f172a' }) {
  return (
    <div style={summaryCard}>
      <div style={summaryTitle}>{title}</div>
      <div style={{ ...summaryValue, color: accent }}>{value}</div>
    </div>
  );
}

const page = {
  padding: '28px',
};

const headerRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '22px',
  flexWrap: 'wrap',
};

const pageTitle = {
  margin: 0,
  fontSize: '30px',
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
  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
  gap: '14px',
  marginBottom: '20px',
};

const summaryCard = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '18px',
  padding: '18px',
};

const summaryTitle = {
  fontSize: '12px',
  fontWeight: '800',
  color: '#64748b',
  marginBottom: '8px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const summaryValue = {
  fontSize: '30px',
  fontWeight: '900',
};

const toolbarCard = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '22px',
  padding: '18px',
  marginBottom: '22px',
};

const toolbarTop = {
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
  flexWrap: 'wrap',
};

const toolbarButtons = {
  display: 'flex',
  gap: '10px',
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

const filterCount = {
  minWidth: '20px',
  height: '20px',
  borderRadius: '999px',
  background: '#0f172a',
  color: '#fff',
  fontSize: '11px',
  fontWeight: '800',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const chipWrap = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  marginTop: '14px',
};

const categoryChip = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 12px',
  borderRadius: '999px',
  border: '1px solid #e2e8f0',
  background: '#fff',
  color: '#334155',
  fontWeight: '700',
  cursor: 'pointer',
  fontSize: '13px',
};

const activeChip = {
  ...categoryChip,
  background: '#0f172a',
  color: '#fff',
  border: '1px solid #0f172a',
};

const filtersPanel = {
  marginTop: '16px',
  borderTop: '1px solid #e2e8f0',
  paddingTop: '16px',
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
  fontSize: '12px',
  fontWeight: '800',
  color: '#334155',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
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
  padding: '11px 14px',
  borderRadius: '12px',
  border: '1px solid #cbd5e1',
  background: '#fff',
  color: '#334155',
  fontWeight: '800',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
};

const sectionHeaderRow = {
  marginBottom: '12px',
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

const tableCard = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '22px',
  overflow: 'hidden',
};

const tableWrap = {
  overflowX: 'auto',
};

const table = {
  width: '100%',
  borderCollapse: 'collapse',
  minWidth: '1200px',
};

const thBase = {
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: '800',
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  padding: '14px 16px',
  background: '#f8fafc',
  borderBottom: '1px solid #e2e8f0',
};

const thPart = {
  ...thBase,
  minWidth: '300px',
};

const th = {
  ...thBase,
};

const thPrice = {
  ...thBase,
  textAlign: 'right',
  minWidth: '110px',
};

const thAction = {
  ...thBase,
  textAlign: 'center',
  minWidth: '120px',
};

const tr = {
  cursor: 'pointer',
  borderBottom: '1px solid #eef2f7',
};

const tdBase = {
  padding: '14px 16px',
  verticalAlign: 'middle',
  fontSize: '14px',
  color: '#0f172a',
};

const tdPart = {
  ...tdBase,
};

const td = {
  ...tdBase,
};

const tdPrice = {
  ...tdBase,
  textAlign: 'right',
  fontWeight: '900',
  fontSize: '20px',
  color: '#16a34a',
};

const tdAction = {
  ...tdBase,
  textAlign: 'center',
};

const partCell = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
};

const thumbWrap = {
  width: '78px',
  height: '62px',
  borderRadius: '12px',
  overflow: 'hidden',
  background: '#f8fafc',
  border: '1px solid #f1f5f9',
  flexShrink: 0,
};

const thumb = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const thumbPlaceholder = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#94a3b8',
};

const partInfo = {
  minWidth: 0,
};

const partName = {
  fontSize: '18px',
  fontWeight: '900',
  color: '#0f172a',
  lineHeight: 1.2,
};

const partSubRow = {
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  flexWrap: 'wrap',
  marginTop: '6px',
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

const mutedMini = {
  fontSize: '12px',
  color: '#64748b',
  fontWeight: '600',
};

const monoText = {
  fontWeight: '800',
  color: '#0f172a',
};

const fitmentWrap = {
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
};

const inlineMeta = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  color: '#334155',
  fontWeight: '700',
};

const gradeBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 10px',
  borderRadius: '999px',
  background: '#eff6ff',
  color: '#1d4ed8',
  fontWeight: '800',
  fontSize: '12px',
};

const statusBase = {
  padding: '6px 10px',
  borderRadius: '999px',
  fontWeight: '800',
  fontSize: '11px',
  whiteSpace: 'nowrap',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
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

const openBtn = {
  padding: '10px 14px',
  borderRadius: '12px',
  border: 'none',
  background: '#0f172a',
  color: '#fff',
  fontWeight: '800',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
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
