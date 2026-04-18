import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Receipt,
  Search,
  Filter,
  Eye,
  Printer,
  RefreshCcw,
  CalendarDays,
  User,
  Car,
  CreditCard,
  FileText,
  Trash2,
} from 'lucide-react';

const API_URL = 'https://yaris-autocare-production.up.railway.app';

export default function InvoicesDashboard() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await axios.get(`${API_URL}/api/invoices/`);
      const data = Array.isArray(res.data) ? res.data : [];
      setInvoices(data);
    } catch (error) {
      console.error(error);
      setErrorMessage('Failed to load invoices.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async (invoice) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${invoice.invoice_number}? This cannot be undone.`
    );

    if (!confirmed) return;

    setActionLoadingId(invoice.id);
    setErrorMessage('');

    try {
      await axios.delete(`${API_URL}/api/invoices/${invoice.id}/`);
      setInvoices((prev) => prev.filter((item) => item.id !== invoice.id));
    } catch (error) {
      console.error(error);
      setErrorMessage('Failed to delete invoice.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const searchableText = [
        invoice.invoice_number,
        invoice.customer_name,
        invoice.customer_phone,
        invoice.rego,
        invoice.make,
        invoice.model,
        invoice.payment_status,
        invoice.invoice_type,
        invoice.notes,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = searchableText.includes(searchTerm.trim().toLowerCase());

      const matchesInvoiceType =
        invoiceTypeFilter === 'ALL' || invoice.invoice_type === invoiceTypeFilter;

      const matchesPaymentStatus =
        paymentStatusFilter === 'ALL' || invoice.payment_status === paymentStatusFilter;

      const matchesDate = checkDateMatch(invoice.created_at, dateFilter);

      return matchesSearch && matchesInvoiceType && matchesPaymentStatus && matchesDate;
    });
  }, [invoices, searchTerm, invoiceTypeFilter, paymentStatusFilter, dateFilter]);

  const stats = useMemo(() => {
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter((i) => i.payment_status === 'PAID').length;
    const unpaidInvoices = invoices.filter((i) => i.payment_status === 'UNPAID').length;
    const totalRevenue = invoices.reduce(
      (sum, invoice) => sum + (parseFloat(invoice.total_amount || 0) || 0),
      0
    );

    return {
      totalInvoices,
      paidInvoices,
      unpaidInvoices,
      totalRevenue,
    };
  }, [invoices]);

  const groupedInvoices = useMemo(() => {
    const groups = {
      Today: [],
      'Last 7 Days': [],
      'This Month': [],
      Older: [],
    };

    filteredInvoices.forEach((invoice) => {
      const group = getInvoiceGroup(invoice.created_at);
      groups[group].push(invoice);
    });

    return groups;
  }, [filteredInvoices]);

  const openInvoiceView = (invoiceId) => {
    window.open(`/sales/${invoiceId}`, '_blank');
  };

  const printInvoice = (invoiceId) => {
    window.open(`/sales/${invoiceId}?print=true`, '_blank');
  };

  return (
    <div style={pageWrap}>
      <div style={headerBar}>
        <div>
          <h1 style={mainTitle}>Invoices Dashboard</h1>
          <p style={subTitle}>
            View, search, manage and print all invoices from one place.
          </p>
        </div>

        <button type="button" style={refreshBtn} onClick={fetchInvoices}>
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      {!!errorMessage && <div style={errorBox}>{errorMessage}</div>}

      <div style={statsGrid}>
        <StatCard
          icon={<Receipt size={18} color="#ef4444" />}
          title="Total Invoices"
          value={stats.totalInvoices}
        />
        <StatCard
          icon={<CreditCard size={18} color="#16a34a" />}
          title="Paid Invoices"
          value={stats.paidInvoices}
        />
        <StatCard
          icon={<FileText size={18} color="#dc2626" />}
          title="Unpaid Invoices"
          value={stats.unpaidInvoices}
        />
        <StatCard
          icon={<CalendarDays size={18} color="#2563eb" />}
          title="Total Sales"
          value={`$${stats.totalRevenue.toFixed(2)}`}
        />
      </div>

      <div style={filterCard}>
        <div style={filterHeader}>
          <div style={filterTitleWrap}>
            <Filter size={18} color="#ef4444" />
            <h3 style={filterTitle}>Search & Filters</h3>
          </div>
        </div>

        <div style={filterGrid}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={label}>Search</label>
            <div style={inputWrap}>
              <Search size={15} style={inputIcon} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by invoice no, customer, phone, rego, make or model"
                style={inputWithIcon}
              />
            </div>
          </div>

          <div>
            <label style={label}>Invoice Type</label>
            <select
              value={invoiceTypeFilter}
              onChange={(e) => setInvoiceTypeFilter(e.target.value)}
              style={input}
            >
              <option value="ALL">All Types</option>
              <option value="CUSTOM">Custom Invoice</option>
              <option value="USED_PART">Used Part</option>
              <option value="AFTERMARKET">Aftermarket</option>
              <option value="DISMANTLE">Dismantle</option>
              <option value="SERVICING">Servicing</option>
              <option value="DIAGNOSTIC">Diagnostic</option>
              <option value="LABOUR">Labour</option>
              <option value="REPAIR">Mechanical Repair</option>
            </select>
          </div>

          <div>
            <label style={label}>Payment Status</label>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              style={input}
            >
              <option value="ALL">All Statuses</option>
              <option value="PAID">Paid</option>
              <option value="PARTIAL">Partial</option>
              <option value="UNPAID">Unpaid</option>
            </select>
          </div>

          <div>
            <label style={label}>Date Range</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={input}
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="LAST_7_DAYS">Last 7 Days</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="OLDER">Older</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={loadingCard}>Loading invoices...</div>
      ) : filteredInvoices.length === 0 ? (
        <div style={emptyCard}>No invoices found.</div>
      ) : (
        <div style={groupsWrap}>
          {Object.entries(groupedInvoices).map(([groupName, groupItems]) => {
            if (groupItems.length === 0) return null;

            return (
              <div key={groupName} style={groupCard}>
                <div style={groupHeader}>
                  <h2 style={groupTitle}>{groupName}</h2>
                  <span style={groupCount}>{groupItems.length}</span>
                </div>

                <div style={tableWrap}>
                  <table style={table}>
                    <thead>
                      <tr>
                        <th style={th}>Invoice</th>
                        <th style={th}>Customer</th>
                        <th style={th}>Vehicle</th>
                        <th style={th}>Type</th>
                        <th style={th}>Date</th>
                        <th style={th}>Total</th>
                        <th style={th}>Status</th>
                        <th style={th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupItems.map((invoice) => (
                        <tr key={invoice.id} style={tr}>
                          <td style={td}>
                            <div style={invoiceNo}>{invoice.invoice_number}</div>
                            <div style={subLine}>{invoice.customer_phone || 'No phone'}</div>
                          </td>

                          <td style={td}>
                            <div style={cellMain}>
                              <User size={14} />
                              <span>{invoice.customer_name || 'Walk-in Customer'}</span>
                            </div>
                          </td>

                          <td style={td}>
                            <div style={cellMain}>
                              <Car size={14} />
                              <span>
                                {invoice.rego || '-'}
                                {(invoice.make || invoice.model) &&
                                  ` • ${[invoice.make, invoice.model].filter(Boolean).join(' ')}`}
                              </span>
                            </div>
                          </td>

                          <td style={td}>
                            <span style={typeBadge}>{formatInvoiceType(invoice.invoice_type)}</span>
                          </td>

                          <td style={td}>
                            <div>{formatDate(invoice.created_at)}</div>
                            <div style={subLine}>{formatTime(invoice.created_at)}</div>
                          </td>

                          <td style={td}>
                            <strong>${parseFloat(invoice.total_amount || 0).toFixed(2)}</strong>
                          </td>

                          <td style={td}>
                            <span
                              style={{
                                ...statusBadge,
                                ...(invoice.payment_status === 'PAID'
                                  ? paidStyle
                                  : invoice.payment_status === 'PARTIAL'
                                  ? partialStyle
                                  : unpaidStyle),
                              }}
                            >
                              {invoice.payment_status}
                            </span>
                          </td>

                          <td style={td}>
                            <div style={actionWrap}>
                              <button
                                type="button"
                                style={viewBtn}
                                onClick={() => openInvoiceView(invoice.id)}
                              >
                                <Eye size={14} />
                                View
                              </button>

                              <button
                                type="button"
                                style={printBtn}
                                onClick={() => printInvoice(invoice.id)}
                              >
                                <Printer size={14} />
                                Print
                              </button>

                              <button
                                type="button"
                                style={deleteBtn}
                                onClick={() => handleDeleteInvoice(invoice)}
                                disabled={actionLoadingId === invoice.id}
                              >
                                <Trash2 size={14} />
                                {actionLoadingId === invoice.id ? 'Deleting...' : 'Delete'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div style={statCard}>
      <div style={statIcon}>{icon}</div>
      <div>
        <div style={statTitle}>{title}</div>
        <div style={statValue}>{value}</div>
      </div>
    </div>
  );
}

function formatInvoiceType(type) {
  if (!type) return '-';
  if (type === 'USED_PART') return 'Parts Sale';
  if (type === 'REPAIR') return 'Workshop Invoice';
  return type.replaceAll('_', ' ');
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

function formatTime(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function checkDateMatch(dateString, filter) {
  if (!dateString || filter === 'ALL') return true;

  const date = new Date(dateString);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  if (filter === 'TODAY') {
    return date >= startOfToday;
  }

  if (filter === 'LAST_7_DAYS') {
    return date >= sevenDaysAgo;
  }

  if (filter === 'THIS_MONTH') {
    return date >= startOfMonth;
  }

  if (filter === 'OLDER') {
    return date < startOfMonth;
  }

  return true;
}

function getInvoiceGroup(dateString) {
  if (!dateString) return 'Older';

  const date = new Date(dateString);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  if (date >= startOfToday) return 'Today';
  if (date >= sevenDaysAgo) return 'Last 7 Days';
  if (date >= startOfMonth) return 'This Month';
  return 'Older';
}

const pageWrap = {
  padding: '24px',
  background: '#f8fafc',
  minHeight: '100vh',
};

const headerBar = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
  flexWrap: 'wrap',
  marginBottom: '24px',
};

const mainTitle = {
  margin: 0,
  fontSize: '32px',
  fontWeight: 900,
  color: '#0f172a',
};

const subTitle = {
  margin: '8px 0 0',
  color: '#64748b',
  fontSize: '14px',
};

const refreshBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  border: 'none',
  background: '#111827',
  color: '#fff',
  borderRadius: '12px',
  padding: '12px 16px',
  fontWeight: 800,
  cursor: 'pointer',
};

const statsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '16px',
  marginBottom: '24px',
};

const statCard = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '20px',
  padding: '18px',
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
};

const statIcon = {
  width: '42px',
  height: '42px',
  borderRadius: '12px',
  background: '#fff5f5',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const statTitle = {
  fontSize: '12px',
  fontWeight: 800,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const statValue = {
  fontSize: '24px',
  fontWeight: 900,
  color: '#0f172a',
  marginTop: '4px',
};

const filterCard = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '24px',
  padding: '24px',
  marginBottom: '24px',
  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
};

const filterHeader = {
  marginBottom: '18px',
};

const filterTitleWrap = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const filterTitle = {
  margin: 0,
  fontSize: '18px',
  fontWeight: 800,
  color: '#0f172a',
};

const filterGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '16px',
};

const label = {
  display: 'block',
  marginBottom: '8px',
  fontSize: '12px',
  fontWeight: 800,
  color: '#64748b',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
};

const inputWrap = {
  position: 'relative',
};

const inputIcon = {
  position: 'absolute',
  left: '14px',
  top: '14px',
  color: '#94a3b8',
};

const input = {
  width: '100%',
  border: '1px solid #dbe3ee',
  borderRadius: '14px',
  fontSize: '14px',
  background: '#fff',
  color: '#0f172a',
  outline: 'none',
  boxSizing: 'border-box',
  padding: '13px 14px',
};

const inputWithIcon = {
  ...input,
  paddingLeft: '42px',
};

const loadingCard = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '20px',
  padding: '32px',
  textAlign: 'center',
  color: '#64748b',
  fontWeight: 700,
};

const emptyCard = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '20px',
  padding: '32px',
  textAlign: 'center',
  color: '#64748b',
  fontWeight: 700,
};

const groupsWrap = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
};

const groupCard = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '24px',
  padding: '20px',
  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
};

const groupHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '18px',
};

const groupTitle = {
  margin: 0,
  fontSize: '20px',
  fontWeight: 900,
  color: '#0f172a',
};

const groupCount = {
  background: '#111827',
  color: '#fff',
  borderRadius: '999px',
  padding: '6px 10px',
  fontSize: '12px',
  fontWeight: 800,
};

const tableWrap = {
  overflowX: 'auto',
};

const table = {
  width: '100%',
  borderCollapse: 'collapse',
  minWidth: '1180px',
};

const th = {
  textAlign: 'left',
  padding: '14px 12px',
  fontSize: '12px',
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  borderBottom: '1px solid #e2e8f0',
};

const tr = {
  borderBottom: '1px solid #eef2f7',
};

const td = {
  padding: '16px 12px',
  verticalAlign: 'middle',
  color: '#0f172a',
  fontSize: '14px',
};

const invoiceNo = {
  fontWeight: 900,
  color: '#111827',
};

const subLine = {
  fontSize: '12px',
  color: '#64748b',
  marginTop: '4px',
};

const cellMain = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const typeBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 10px',
  borderRadius: '999px',
  background: '#eff6ff',
  color: '#1d4ed8',
  fontSize: '12px',
  fontWeight: 800,
  textTransform: 'uppercase',
};

const statusBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6px 10px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: 800,
};

const paidStyle = {
  background: '#ecfdf5',
  color: '#166534',
};

const partialStyle = {
  background: '#fffbeb',
  color: '#b45309',
};

const unpaidStyle = {
  background: '#fff1f2',
  color: '#be123c',
};

const actionWrap = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
};

const viewBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1px solid #dbe3ee',
  background: '#fff',
  color: '#0f172a',
  fontWeight: 700,
  cursor: 'pointer',
};

const printBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '10px 12px',
  borderRadius: '10px',
  border: 'none',
  background: '#ef4444',
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
};

const deleteBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1px solid #fecaca',
  background: '#fff5f5',
  color: '#b91c1c',
  fontWeight: 700,
  cursor: 'pointer',
};

const errorBox = {
  marginBottom: '18px',
  background: '#fff1f2',
  border: '1px solid #fecdd3',
  color: '#be123c',
  padding: '14px 16px',
  borderRadius: '14px',
  fontWeight: 700,
};
