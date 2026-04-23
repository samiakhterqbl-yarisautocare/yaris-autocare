import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Plus,
  Search,
  X,
  Eye,
  Pencil,
  Package,
  MapPin,
  RefreshCw,
  Trash2,
} from 'lucide-react';

const API_URL = 'https://yaris-autocare-production.up.railway.app';

const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  return `${API_URL}${imageUrl}`;
};

const COLORS = {
  primary: '#ef4444',
  dark: '#0f172a',
  text: '#1e293b',
  muted: '#64748b',
  soft: '#94a3b8',
  border: '#e2e8f0',
  borderSoft: '#edf2f7',
  bg: '#f8fafc',
  white: '#ffffff',
  success: '#166534',
  successBg: '#dcfce7',
  warning: '#92400e',
  warningBg: '#fef3c7',
  danger: '#991b1b',
  dangerBg: '#fee2e2',
};

const CATEGORY_OPTIONS = [
  'All Categories',
  'Oil Filters',
  'Air Filters',
  'Cabin Filters',
  'Fuel Filters',
  'Brake Pads',
  'Brake Rotors',
  'Spark Plugs',
  'Ignition Coils',
  'Wiper Blades',
  'Bulbs',
  'Sensors',
  'Suspension',
  'Cooling',
  'Belts',
  'Batteries',
  'Fluids',
  'Accessories',
  'Other',
];

const STATUS_OPTIONS = [
  'All Statuses',
  'Available',
  'Out of Stock',
  'Inactive',
];

const SORT_OPTIONS = [
  { value: 'name_asc', label: 'Name A-Z' },
  { value: 'name_desc', label: 'Name Z-A' },
  { value: 'qty_low_high', label: 'Qty Low-High' },
  { value: 'qty_high_low', label: 'Qty High-Low' },
  { value: 'price_low_high', label: 'Price Low-High' },
  { value: 'price_high_low', label: 'Price High-Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
];

const AftermarketModule = () => {
  const navigate = useNavigate();

  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [supplierFilter, setSupplierFilter] = useState('All Suppliers');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('name_asc');

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/aftermarket/`);
      const items = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];
      setStock(items);
    } catch (error) {
      console.error('Failed to load aftermarket inventory:', error);
      alert('Failed to load aftermarket inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const supplierOptions = useMemo(() => {
    const uniqueSuppliers = Array.from(
      new Set(
        stock
          .map((item) => item.supplier)
          .filter((value) => value && String(value).trim() !== '')
      )
    ).sort((a, b) => a.localeCompare(b));

    return ['All Suppliers', ...uniqueSuppliers];
  }, [stock]);

  const filteredStock = useMemo(() => {
    let items = [...stock];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      items = items.filter((item) =>
        [
          item.part_name,
          item.sku,
          item.label_id,
          item.category,
          item.location,
          item.supplier,
          item.description,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term))
      );
    }

    if (categoryFilter !== 'All Categories') {
      items = items.filter((item) => item.category === categoryFilter);
    }

    if (statusFilter !== 'All Statuses') {
      items = items.filter((item) => item.status === statusFilter);
    }

    if (supplierFilter !== 'All Suppliers') {
      items = items.filter((item) => item.supplier === supplierFilter);
    }

    if (lowStockOnly) {
      items = items.filter(
        (item) => (Number(item.quantity) || 0) <= (Number(item.min_stock_level) || 0)
      );
    }

    switch (sortBy) {
      case 'name_desc':
        items.sort((a, b) => (b.part_name || '').localeCompare(a.part_name || ''));
        break;
      case 'qty_low_high':
        items.sort((a, b) => (Number(a.quantity) || 0) - (Number(b.quantity) || 0));
        break;
      case 'qty_high_low':
        items.sort((a, b) => (Number(b.quantity) || 0) - (Number(a.quantity) || 0));
        break;
      case 'price_low_high':
        items.sort((a, b) => (Number(a.sale_price) || 0) - (Number(b.sale_price) || 0));
        break;
      case 'price_high_low':
        items.sort((a, b) => (Number(b.sale_price) || 0) - (Number(a.sale_price) || 0));
        break;
      case 'newest':
        items.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        break;
      case 'oldest':
        items.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
        break;
      case 'name_asc':
      default:
        items.sort((a, b) => (a.part_name || '').localeCompare(b.part_name || ''));
        break;
    }

    return items;
  }, [
    stock,
    searchTerm,
    categoryFilter,
    statusFilter,
    supplierFilter,
    lowStockOnly,
    sortBy,
  ]);

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All Categories');
    setStatusFilter('All Statuses');
    setSupplierFilter('All Suppliers');
    setLowStockOnly(false);
    setSortBy('name_asc');
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Delete this product?\n\n${item.part_name || 'Unnamed Product'}`
    );
    if (!confirmed) return;

    try {
      setDeletingId(item.id);
      await axios.delete(`${API_URL}/api/aftermarket/${item.id}/`);
      setStock((prev) => prev.filter((x) => x.id !== item.id));
    } catch (error) {
      console.error('Failed to delete aftermarket item:', error?.response?.data || error);
      alert('Delete failed. Check backend delete endpoint/permissions.');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (item) => {
    const qty = Number(item.quantity) || 0;
    const min = Number(item.min_stock_level) || 0;

    if (qty <= 0) {
      return { label: 'Out of Stock', bg: COLORS.dangerBg, color: COLORS.danger };
    }
    if (qty <= min) {
      return { label: 'Low Stock', bg: COLORS.warningBg, color: COLORS.warning };
    }
    return {
      label: item.status || 'Available',
      bg: COLORS.successBg,
      color: COLORS.success,
    };
  };

  const getMainImage = (item) => {
    if (!Array.isArray(item.images) || item.images.length === 0) return null;
    return item.images.find((img) => img.is_main) || item.images[0];
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Aftermarket Inventory</h1>
          <p style={subtitleStyle}>
            Clean stock view for products, pricing, suppliers and quantity control.
          </p>
        </div>

        <div style={headerActions}>
          <button onClick={fetchInventory} style={secondaryBtn}>
            <RefreshCw size={15} />
            Refresh
          </button>
          <button onClick={() => navigate('/aftermarket/new')} style={primaryBtn}>
            <Plus size={16} />
            New Product
          </button>
        </div>
      </div>

      <div style={filterCard}>
        <div style={searchWrap}>
          <Search size={16} style={searchIcon} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by product, SKU, label, category, supplier, description or location"
            style={searchInput}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={clearBtn}>
              <X size={15} />
            </button>
          )}
        </div>

        <div style={filtersGrid}>
          <FilterSelect
            label="Category"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={CATEGORY_OPTIONS}
          />
          <FilterSelect
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
          />
          <FilterSelect
            label="Supplier"
            value={supplierFilter}
            onChange={setSupplierFilter}
            options={supplierOptions}
          />
          <FilterSelect
            label="Sort By"
            value={sortBy}
            onChange={setSortBy}
            options={SORT_OPTIONS.map((x) => x.value)}
            labelsMap={Object.fromEntries(SORT_OPTIONS.map((x) => [x.value, x.label]))}
          />
        </div>

        <div style={filterFooter}>
          <label style={checkboxWrap}>
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
            />
            <span>Low stock only</span>
          </label>

          <button onClick={resetFilters} style={secondaryBtnSmall}>
            Reset Filters
          </button>
        </div>
      </div>

      <div style={sectionTop}>
        <div style={resultsText}>
          {loading ? 'Loading...' : `${filteredStock.length} products`}
        </div>
      </div>

      <div style={tableCard}>
        <div style={tableHeader}>
          <div style={{ width: '74px' }}>Image</div>
          <div style={{ flex: 2.3 }}>Product</div>
          <div style={{ flex: 1.05 }}>Category</div>
          <div style={{ flex: 1 }}>Supplier</div>
          <div style={{ flex: 0.8 }}>Qty</div>
          <div style={{ flex: 0.95 }}>Price</div>
          <div style={{ flex: 0.95 }}>Status</div>
          <div style={{ width: '230px', textAlign: 'right' }}>Actions</div>
        </div>

        {loading ? (
          <div style={emptyState}>Loading inventory...</div>
        ) : filteredStock.length === 0 ? (
          <div style={emptyState}>No products found for the selected filters.</div>
        ) : (
          filteredStock.map((item) => {
            const badge = getStatusBadge(item);
            const mainImage = getMainImage(item);

            return (
              <div key={item.id} style={tableRow}>
                <div style={{ width: '74px' }}>
                  <div style={thumbBox}>
                    {mainImage?.image ? (
                      <img
                        src={resolveImageUrl(mainImage.image)}
                        alt={item.part_name}
                        style={thumbImage}
                      />
                    ) : (
                      <Package size={16} color={COLORS.soft} />
                    )}
                  </div>
                </div>

                <div style={{ flex: 2.3, minWidth: 0 }}>
                  <div style={productName}>{item.part_name}</div>
                  <div style={subRow}>SKU: {item.sku || '-'}</div>
                  <div style={subRow}>Label: {item.label_id || '-'}</div>
                  <div style={subRow}>
                    <MapPin size={11} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                    {item.location || 'No location'}
                  </div>
                </div>

                <div style={{ flex: 1.05 }}>
                  <div style={cellText}>{item.category || '-'}</div>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={cellText}>{item.supplier || '-'}</div>
                </div>

                <div style={{ flex: 0.8 }}>
                  <div
                    style={{
                      ...qtyText,
                      color:
                        (Number(item.quantity) || 0) <= (Number(item.min_stock_level) || 0)
                          ? COLORS.primary
                          : COLORS.text,
                    }}
                  >
                    {item.quantity ?? 0}
                  </div>
                  <div style={tinyNote}>Min {item.min_stock_level ?? 0}</div>
                </div>

                <div style={{ flex: 0.95 }}>
                  <div style={priceText}>${Number(item.sale_price || 0).toFixed(2)}</div>
                  <div style={tinyNote}>Cost ${Number(item.cost_price || 0).toFixed(2)}</div>
                </div>

                <div style={{ flex: 0.95 }}>
                  <span
                    style={{
                      ...statusBadge,
                      backgroundColor: badge.bg,
                      color: badge.color,
                    }}
                  >
                    {badge.label}
                  </span>
                </div>

                <div style={{ width: '230px', textAlign: 'right' }}>
                  <div style={actionsWrap}>
                    <button
                      onClick={() => navigate(`/aftermarket/${item.id}`)}
                      style={actionBtn}
                    >
                      <Eye size={13} />
                      View
                    </button>

                    <button
                      onClick={() => navigate(`/aftermarket/edit/${item.id}`)}
                      style={actionBtnDark}
                    >
                      <Pencil size={13} />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(item)}
                      disabled={deletingId === item.id}
                      style={{
                        ...deleteBtn,
                        opacity: deletingId === item.id ? 0.7 : 1,
                        cursor: deletingId === item.id ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <Trash2 size={13} />
                      {deletingId === item.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const FilterSelect = ({ label, value, onChange, options, labelsMap = {} }) => (
  <div>
    <label style={filterLabel}>{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} style={selectStyle}>
      {options.map((option) => (
        <option key={option} value={option}>
          {labelsMap[option] || option}
        </option>
      ))}
    </select>
  </div>
);

const pageStyle = {
  padding: '22px',
  backgroundColor: COLORS.bg,
  minHeight: '100vh',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  gap: '18px',
  marginBottom: '18px',
  flexWrap: 'wrap',
};

const headerActions = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
};

const titleStyle = {
  margin: 0,
  fontSize: '24px',
  fontWeight: '800',
  color: COLORS.dark,
  letterSpacing: '-0.03em',
};

const subtitleStyle = {
  margin: '6px 0 0 0',
  fontSize: '13px',
  color: COLORS.muted,
};

const filterCard = {
  backgroundColor: '#fff',
  border: `1px solid ${COLORS.border}`,
  borderRadius: '18px',
  padding: '16px',
  marginBottom: '14px',
};

const searchWrap = {
  position: 'relative',
  marginBottom: '14px',
};

const searchIcon = {
  position: 'absolute',
  left: '14px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: COLORS.soft,
};

const searchInput = {
  width: '100%',
  padding: '12px 40px 12px 42px',
  borderRadius: '12px',
  border: `1px solid ${COLORS.border}`,
  outline: 'none',
  fontSize: '13px',
  boxSizing: 'border-box',
};

const clearBtn = {
  position: 'absolute',
  right: '10px',
  top: '50%',
  transform: 'translateY(-50%)',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  color: COLORS.soft,
};

const filtersGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: '12px',
  marginBottom: '12px',
};

const filterLabel = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '10px',
  fontWeight: '700',
  color: COLORS.soft,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const selectStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '10px',
  border: `1px solid ${COLORS.border}`,
  outline: 'none',
  fontSize: '13px',
  backgroundColor: '#fff',
};

const filterFooter = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  flexWrap: 'wrap',
};

const checkboxWrap = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '13px',
  color: COLORS.text,
  fontWeight: '600',
};

const sectionTop = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
};

const resultsText = {
  fontSize: '12px',
  color: COLORS.muted,
  fontWeight: '600',
};

const tableCard = {
  backgroundColor: '#fff',
  border: `1px solid ${COLORS.border}`,
  borderRadius: '18px',
  overflow: 'hidden',
};

const tableHeader = {
  display: 'flex',
  gap: '12px',
  padding: '13px 16px',
  backgroundColor: '#f8fafc',
  color: COLORS.soft,
  fontSize: '10px',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  borderBottom: `1px solid ${COLORS.border}`,
};

const tableRow = {
  display: 'flex',
  gap: '12px',
  padding: '14px 16px',
  borderBottom: `1px solid ${COLORS.borderSoft}`,
  alignItems: 'center',
};

const thumbBox = {
  width: '54px',
  height: '54px',
  borderRadius: '12px',
  border: `1px solid ${COLORS.border}`,
  backgroundColor: '#f8fafc',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const thumbImage = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const productName = {
  fontSize: '14px',
  fontWeight: '700',
  color: COLORS.text,
  marginBottom: '4px',
  lineHeight: 1.25,
};

const subRow = {
  fontSize: '11px',
  color: COLORS.muted,
  marginBottom: '2px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const cellText = {
  fontSize: '13px',
  fontWeight: '600',
  color: COLORS.text,
};

const qtyText = {
  fontSize: '18px',
  fontWeight: '700',
  lineHeight: 1.1,
};

const tinyNote = {
  fontSize: '10px',
  color: COLORS.soft,
  marginTop: '4px',
};

const priceText = {
  fontSize: '15px',
  fontWeight: '700',
  color: COLORS.text,
};

const statusBadge = {
  display: 'inline-block',
  padding: '6px 9px',
  borderRadius: '999px',
  fontSize: '10px',
  fontWeight: '700',
};

const actionsWrap = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '8px',
  flexWrap: 'wrap',
};

const actionBtn = {
  border: `1px solid ${COLORS.border}`,
  backgroundColor: '#fff',
  color: COLORS.text,
  padding: '8px 10px',
  borderRadius: '10px',
  fontSize: '12px',
  fontWeight: '700',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
};

const actionBtnDark = {
  border: 'none',
  backgroundColor: COLORS.dark,
  color: '#fff',
  padding: '8px 10px',
  borderRadius: '10px',
  fontSize: '12px',
  fontWeight: '700',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
};

const deleteBtn = {
  border: '1px solid #fecaca',
  backgroundColor: '#fff5f5',
  color: '#dc2626',
  padding: '8px 10px',
  borderRadius: '10px',
  fontSize: '12px',
  fontWeight: '700',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
};

const primaryBtn = {
  border: 'none',
  backgroundColor: COLORS.primary,
  color: '#fff',
  padding: '10px 14px',
  borderRadius: '12px',
  fontSize: '13px',
  fontWeight: '700',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const secondaryBtn = {
  border: `1px solid ${COLORS.border}`,
  backgroundColor: '#fff',
  color: COLORS.text,
  padding: '10px 13px',
  borderRadius: '12px',
  fontSize: '13px',
  fontWeight: '700',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const secondaryBtnSmall = {
  border: `1px solid ${COLORS.border}`,
  backgroundColor: '#fff',
  color: COLORS.text,
  padding: '9px 12px',
  borderRadius: '10px',
  fontSize: '12px',
  fontWeight: '700',
  cursor: 'pointer',
};

const emptyState = {
  padding: '34px',
  textAlign: 'center',
  color: COLORS.muted,
  fontWeight: '600',
  fontSize: '13px',
};

export default AftermarketModule;
