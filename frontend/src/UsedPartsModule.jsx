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

  return (
    <div style={page}>
      <div style={headerRow}>
        <div>
          <h1 style={pageTitle}>Used Parts Inventory</h1>
          <p style={pageSubtitle}>
            Manage individual used parts with photos, grading, pricing, and stock status.
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

        <button onClick={() => setShowFilters(!showFilters)} style={filterBtn}>
          <Filter size={18} />
          {showFilters ? 'HIDE FILTERS' : 'SHOW FILTERS'}
        </button>
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

      <div style={sectionHeader}>
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
        <div style={partsGrid}>
          {parts.map((part) => {
            const imageUrl = getMainImage(part);

            return (
              <div
                key={part.id}
                style={partCard}
                onClick={() => navigate(`/used-parts/${part.id}`)}
              >
                <div style={imageWrap}>
                  {imageUrl ? (
                    <img src={imageUrl} alt={part.part_name} style={partImage} />
                  ) : (
                    <div style={imagePlaceholder}>
                      <Package size={28} />
                    </div>
                  )}
                </div>

                <div style={cardBody}>
                  <div style={cardTopRow}>
                    <span style={partCategoryBadge}>{part.category || 'Other'}</span>
                    <span style={getStatusBadgeStyle(part.sale_status)}>
                      {part.sale_status || 'AVAILABLE'}
                    </span>
                  </div>

                  <h3 style={partName}>{part.part_name}</h3>

                  <div style={metaRow}>
                    <Tag size={14} />
                    <span>{part.sku || 'No SKU'}</span>
                  </div>

                  {(part.make || part.model) && (
                    <div style={metaRow}>
                      <Car size={14} />
                      <span>
                        {[part.make, part.model, part.variant].filter(Boolean).join(' ')}
                      </span>
                    </div>
                  )}

                  {part.location && (
                    <div style={metaRow}>
                      <MapPin size={14} />
                      <span>{part.location}</span>
                    </div>
                  )}

                  <div style={cardFooter}>
                    <div>
                      <div style={priceLabel}>Price</div>
                      <div style={priceValue}>${part.price ?? '0.00'}</div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/used-parts/${part.id}`);
                      }}
                      style={viewBtn}
                    >
                      OPEN
                    </button>
                  </div>
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

const partsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '18px',
};

const partCard = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '20px',
  overflow: 'hidden',
  cursor: 'pointer',
};

const imageWrap = {
  height: '190px',
  background: '#f8fafc',
};

const partImage = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const imagePlaceholder = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#94a3b8',
};

const cardBody = {
  padding: '18px',
};

const cardTopRow = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '10px',
  alignItems: 'center',
  marginBottom: '12px',
};

const partCategoryBadge = {
  padding: '5px 10px',
  borderRadius: '999px',
  background: '#f1f5f9',
  color: '#475569',
  fontWeight: '800',
  fontSize: '11px',
};

const statusBase = {
  padding: '5px 10px',
  borderRadius: '999px',
  fontWeight: '800',
  fontSize: '11px',
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

const partName = {
  fontSize: '18px',
  fontWeight: '900',
  color: '#0f172a',
  margin: '0 0 12px 0',
};

const metaRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: '#64748b',
  fontSize: '13px',
  fontWeight: '600',
  marginBottom: '8px',
};

const cardFooter = {
  marginTop: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const priceLabel = {
  fontSize: '12px',
  color: '#64748b',
  fontWeight: '700',
};

const priceValue = {
  fontSize: '20px',
  color: '#16a34a',
  fontWeight: '900',
};

const viewBtn = {
  padding: '10px 14px',
  borderRadius: '12px',
  border: 'none',
  background: '#0f172a',
  color: '#fff',
  fontWeight: '800',
  cursor: 'pointer',
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
