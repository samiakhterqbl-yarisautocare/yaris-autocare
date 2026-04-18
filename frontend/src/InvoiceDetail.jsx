import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Receipt,
  User,
  Phone,
  Mail,
  MapPin,
  Car,
  CalendarDays,
  StickyNote,
  Wrench,
  Hash,
  Printer,
  ArrowLeft,
  FileText,
  Building2,
} from 'lucide-react';

const API_URL = 'https://yaris-autocare-production.up.railway.app';

export default function InvoiceDetail() {
  const invoiceId = useMemo(() => {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    return pathParts[pathParts.length - 1];
  }, []);

  const shouldAutoPrint = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('print') === 'true';
  }, []);

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId]);

  useEffect(() => {
    if (invoice && shouldAutoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [invoice, shouldAutoPrint]);

  const fetchInvoice = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await axios.get(`${API_URL}/api/invoices/${invoiceId}/`);
      setInvoice(res.data);
    } catch (error) {
      console.error(error);
      setErrorMessage('Failed to load invoice details.');
    } finally {
      setLoading(false);
    }
  };

  const items = useMemo(() => {
    if (!invoice?.items || !Array.isArray(invoice.items)) return [];
    return invoice.items;
  }, [invoice]);

  const serviceDetail = invoice?.service_detail || null;

  const documentLabel = useMemo(() => {
    const notes = String(invoice?.notes || '').toUpperCase();
    return notes.includes('DOCUMENT TYPE: QUOTE') ? 'QUOTE' : 'TAX INVOICE';
  }, [invoice]);

  const serviceTemplateType = useMemo(() => {
    if (!invoice || invoice.invoice_type !== 'SERVICING') return '';

    const itemNames = items.map((item) => (item.name || '').toLowerCase());

    const majorTemplate = [
      'oil filter replacement',
      'engine oil change',
      'new sumpplug washer',
      'new sump plug washer',
      'top-ups (brake, power steering, coolant & windscreen washer fluid)',
      'safety checks (underbody components, brakes, globes, horn & tyre pressure)',
      'check globes',
      'check hoses',
      'check drive belt',
      'battery load test',
      'check engine oil leaks',
      'check transmission oil leaks',
      'check transmission cooler pipes',
      'check engine mounts & transmission mounts',
      'check exhaust',
      'check drive shafts',
      'check front shock absorbers',
      'check rear shock absorbers',
      'check ball joints & tie rods',
      'check suspension bushes',
      'check tyre pressure',
      'check front brake pads & rotors',
    ];

    const matches = majorTemplate.filter((line) => itemNames.includes(line)).length;

    if (matches >= 12) return 'Major Service';
    if (matches >= 5) return 'Regular Service';
    return 'Custom Service';
  }, [invoice, items]);

  const showVehicleSection = useMemo(() => {
    if (!invoice) return false;
    if (invoice.invoice_type === 'USED_PART') return false;
    return Boolean(
      invoice.rego ||
        invoice.make ||
        invoice.model ||
        invoice.year ||
        invoice.vin ||
        invoice.odometer
    );
  }, [invoice]);

  const filteredNotes = useMemo(() => {
    const raw = String(invoice?.notes || '').trim();
    if (!raw) return '';

    const lines = raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .filter(
        (line) =>
          !line.toUpperCase().startsWith('DOCUMENT TYPE:') &&
          !line.toUpperCase().startsWith('SERVICE TYPE:')
      );

    return lines.join('\n\n');
  }, [invoice]);

  if (loading) {
    return (
      <div style={pageWrap}>
        <div style={loadingCard}>Loading document...</div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div style={pageWrap}>
        <div style={errorCard}>{errorMessage}</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div style={pageWrap}>
        <div style={errorCard}>Document not found.</div>
      </div>
    );
  }

  return (
    <div style={pageWrap}>
      <style>{printStyles}</style>

      <div style={topBar} className="no-print">
        <div style={topBarLeft}>
          <button type="button" style={backBtn} onClick={() => window.history.back()}>
            <ArrowLeft size={16} />
            Back
          </button>
        </div>

        <div style={topBarRight}>
          <button type="button" style={secondaryBtn} onClick={fetchInvoice}>
            Refresh
          </button>
          <button type="button" style={printBtn} onClick={() => window.print()}>
            <Printer size={16} />
            Print / Save PDF
          </button>
        </div>
      </div>

      <div style={invoicePaper} className="print-area">
        <div style={invoiceHeader}>
          <div style={brandBlock}>
            <div style={logoBox}>YA</div>
            <div>
              <h1 style={brandTitle}>YARIS AUTOCARE</h1>
              <div style={brandSub}>Car Rental • Mechanical Services • Auto Parts</div>
              <div style={brandMeta}>Pyramid Enterprises AU Pty Ltd</div>
            </div>
          </div>

          <div style={invoiceMetaCard}>
            <div style={docBadge}>
              <Receipt size={15} />
              <span>{documentLabel}</span>
            </div>

            <div style={metaRow}>
              <span style={metaLabel}>Document No</span>
              <strong style={metaValue}>{invoice.invoice_number}</strong>
            </div>
            <div style={metaRow}>
              <span style={metaLabel}>Date</span>
              <strong style={metaValue}>{formatDate(invoice.created_at)}</strong>
            </div>
            <div style={metaRow}>
              <span style={metaLabel}>Time</span>
              <strong style={metaValue}>{formatTime(invoice.created_at)}</strong>
            </div>
            <div style={metaRow}>
              <span style={metaLabel}>Type</span>
              <strong style={metaValue}>{formatInvoiceType(invoice.invoice_type)}</strong>
            </div>
            <div style={metaRowLast}>
              <span style={metaLabel}>Status</span>
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
            </div>
          </div>
        </div>

        <div style={businessStrip}>
          <div>16 Legana Park Drive, Legana TAS 7277</div>
          <div>0449 828 749</div>
          <div>info@yarisautocare.com.au</div>
          <div>www.yarisautocare.com.au</div>
        </div>

        <div
          style={{
            ...gridTwo,
            gridTemplateColumns: showVehicleSection
              ? 'repeat(2, minmax(0, 1fr))'
              : 'minmax(0, 1fr)',
          }}
        >
          <InfoCard title="Customer Details" icon={<User size={16} color="#ef4444" />}>
            <DetailRow icon={<User size={14} />} label="Customer" value={invoice.customer_name || '-'} />
            <DetailRow icon={<Phone size={14} />} label="Phone" value={invoice.customer_phone || '-'} />
            <DetailRow icon={<Mail size={14} />} label="Email" value={invoice.customer_email || '-'} />
            {invoice.customer_company ? (
              <DetailRow
                icon={<Building2 size={14} />}
                label="Company"
                value={invoice.customer_company}
              />
            ) : null}
            {invoice.customer_abn ? (
              <DetailRow icon={<Hash size={14} />} label="ABN" value={invoice.customer_abn} />
            ) : null}
            <DetailRow
              icon={<MapPin size={14} />}
              label="Address"
              value={invoice.customer_address || '-'}
              multiline
            />
          </InfoCard>

          {showVehicleSection && (
            <InfoCard title="Car Details" icon={<Car size={16} color="#ef4444" />}>
              <DetailRow icon={<Car size={14} />} label="Rego" value={invoice.rego || '-'} />
              <DetailRow icon={<Car size={14} />} label="Make" value={invoice.make || '-'} />
              <DetailRow icon={<Car size={14} />} label="Model" value={invoice.model || '-'} />
              {invoice.year ? (
                <DetailRow
                  icon={<CalendarDays size={14} />}
                  label="Year"
                  value={invoice.year}
                />
              ) : null}
              <DetailRow icon={<Hash size={14} />} label="VIN" value={invoice.vin || '-'} />
              <DetailRow
                icon={<Hash size={14} />}
                label="Odometer"
                value={invoice.odometer ? `${invoice.odometer} km` : '-'}
              />
            </InfoCard>
          )}
        </div>

        {invoice.invoice_type === 'SERVICING' && (
          <div style={serviceSection}>
            <div style={sectionHead}>
              <div style={sectionHeadLeft}>
                <Wrench size={18} color="#ef4444" />
                <h2 style={sectionTitle}>Service Details</h2>
              </div>
              {!!serviceTemplateType && <div style={serviceTypeBadge}>{serviceTemplateType}</div>}
            </div>

            <div style={gridThree}>
              <ServiceStat
                title="Service At KM"
                value={serviceDetail?.service_at_km ? `${serviceDetail.service_at_km} km` : '-'}
              />
              <ServiceStat
                title="Next Service At KM"
                value={
                  serviceDetail?.next_service_at_km
                    ? `${serviceDetail.next_service_at_km} km`
                    : '-'
                }
              />
              <ServiceStat
                title="Next Service Date"
                value={serviceDetail?.next_service_date ? formatPlainDate(serviceDetail.next_service_date) : '-'}
              />
              <ServiceStat title="Oil Grade" value={serviceDetail?.oil_grade || '-'} />
            </div>

            {serviceDetail?.service_notes && (
              <div style={{ marginTop: '20px' }}>
                <InfoCard title="Service Notes" icon={<StickyNote size={16} color="#ef4444" />} compact>
                  <div style={notesText}>{serviceDetail.service_notes}</div>
                </InfoCard>
              </div>
            )}
          </div>
        )}

        <div style={itemsSection}>
          <div style={sectionHead}>
            <div style={sectionHeadLeft}>
              <Receipt size={18} color="#ef4444" />
              <h2 style={sectionTitle}>
                {invoice.invoice_type === 'SERVICING'
                  ? 'Service Details'
                  : invoice.invoice_type === 'USED_PART'
                  ? 'Parts Details'
                  : 'Invoice Details'}
              </h2>
            </div>
          </div>

          <div style={tableWrap}>
            <table style={itemsTable}>
              <thead>
                <tr>
                  <th style={thNo}>#</th>
                  <th style={th}>Description</th>
                  <th style={th}>Type</th>
                  <th style={th}>Qty</th>
                  <th style={th}>Amount</th>
                  <th style={th}>Discount</th>
                  <th style={th}>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td style={tdEmpty} colSpan={7}>
                      No items found.
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={item.id || index} style={tr}>
                      <td style={tdNo}>{index + 1}</td>
                      <td style={tdDescription}>
                        <div style={itemName}>{item.name || '-'}</div>
                        {item.description ? (
                          <div style={itemDescription}>{item.description}</div>
                        ) : null}
                      </td>
                      <td style={td}>
                        <span style={smallBadge}>
                          {formatSmallType(item.item_type || item.source_type || 'ITEM')}
                        </span>
                      </td>
                      <td style={td}>{formatQty(item.quantity)}</td>
                      <td style={td}>${formatMoney(item.unit_price)}</td>
                      <td style={td}>${formatMoney(item.discount)}</td>
                      <td style={tdStrong}>${formatMoney(item.line_total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {filteredNotes && (
          <div style={notesBlock}>
            <div style={sectionHead}>
              <div style={sectionHeadLeft}>
                <StickyNote size={18} color="#ef4444" />
                <h2 style={sectionTitle}>Notes</h2>
              </div>
            </div>
            <div style={notesText}>{filteredNotes}</div>
          </div>
        )}

        <div style={bottomArea}>
          <div style={bottomLeft}>
            <div style={footerCard}>
              <div style={footerTitle}>Payment Details</div>
              <div style={footerText}>Bank: ANZ Pty. Ltd.</div>
              <div style={footerText}>Account Name: Pyramid Enterprises AU Pty Ltd</div>
              <div style={footerText}>BSB: 013270</div>
              <div style={footerText}>Account No: 430088057</div>
              <div style={footerText}>Please email the remittance to info@yarisautocare.com.au</div>
            </div>
          </div>

          <div style={bottomRight}>
            <div style={summaryCard}>
              <SummaryRow label="Subtotal" value={`$${formatMoney(invoice.subtotal)}`} />
              <SummaryRow label="GST Included" value={`$${formatMoney(invoice.gst_amount)}`} />
              <SummaryRow label="Paid Amount" value={`$${formatMoney(invoice.paid_amount)}`} />
              <SummaryRow label="Payment Method" value={invoice.payment_method || '-'} />
              <SummaryRowTotal label="Total Amount" value={`$${formatMoney(invoice.total_amount)}`} />
              <SummaryRowBalance label="Balance Due" value={`$${formatMoney(invoice.balance_due)}`} />
            </div>
          </div>
        </div>

        <div style={printFooter}>
          <div>Thank you for choosing Yaris Autocare.</div>
          <div>This document was generated from the Yaris Autocare Inventory System.</div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, icon, children, compact = false }) {
  return (
    <div style={{ ...infoCard, ...(compact ? compactInfoCard : {}) }}>
      <div style={infoCardHeader}>
        <div style={sectionHeadLeft}>
          {icon}
          <h3 style={infoCardTitle}>{title}</h3>
        </div>
      </div>
      {children}
    </div>
  );
}

function DetailRow({ icon, label, value, multiline = false }) {
  return (
    <div style={{ ...detailRow, ...(multiline ? detailRowMultiline : {}) }}>
      <div style={detailLabelWrap}>
        {icon}
        <span style={detailLabel}>{label}</span>
      </div>
      <div style={{ ...detailValue, ...(multiline ? detailValueMultiline : {}) }}>
        {value}
      </div>
    </div>
  );
}

function ServiceStat({ title, value }) {
  return (
    <div style={serviceStatCard}>
      <div style={serviceStatTitle}>{title}</div>
      <div style={serviceStatValue}>{value}</div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div style={summaryRow}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SummaryRowTotal({ label, value }) {
  return (
    <div style={summaryRowTotal}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SummaryRowBalance({ label, value }) {
  return (
    <div style={summaryRowBalance}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatMoney(value) {
  return (parseFloat(value || 0) || 0).toFixed(2);
}

function formatQty(value) {
  const qty = parseFloat(value || 0) || 0;
  return Number.isInteger(qty) ? qty : qty.toFixed(2);
}

function formatInvoiceType(type) {
  if (!type) return 'Invoice';
  if (type === 'USED_PART') return 'Parts Sale';
  if (type === 'REPAIR') return 'Workshop Invoice';
  return type.replaceAll('_', ' ');
}

function formatSmallType(type) {
  if (!type) return 'ITEM';
  return type.replaceAll('_', ' ');
}

function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString();
}

function formatTime(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatPlainDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString();
}

const pageWrap = {
  background: '#f8fafc',
  minHeight: '100vh',
  padding: '24px',
};

const topBar = {
  maxWidth: '1180px',
  margin: '0 auto 18px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
  flexWrap: 'wrap',
};

const topBarLeft = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const topBarRight = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  flexWrap: 'wrap',
};

const backBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  border: '1px solid #dbe3ee',
  background: '#fff',
  color: '#0f172a',
  borderRadius: '12px',
  padding: '11px 14px',
  fontWeight: 800,
  cursor: 'pointer',
};

const secondaryBtn = {
  border: '1px solid #dbe3ee',
  background: '#fff',
  color: '#0f172a',
  borderRadius: '12px',
  padding: '11px 14px',
  fontWeight: 800,
  cursor: 'pointer',
};

const printBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  border: 'none',
  background: '#ef4444',
  color: '#fff',
  borderRadius: '12px',
  padding: '11px 16px',
  fontWeight: 900,
  cursor: 'pointer',
};

const invoicePaper = {
  maxWidth: '1180px',
  margin: '0 auto',
  background: '#fff',
  borderRadius: '28px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)',
  overflow: 'hidden',
};

const invoiceHeader = {
  display: 'grid',
  gridTemplateColumns: '1.45fr 0.85fr',
  gap: '18px',
  padding: '28px',
  background: 'linear-gradient(135deg, #0f172a 0%, #111827 55%, #1f2937 100%)',
  color: '#fff',
};

const brandBlock = {
  display: 'flex',
  alignItems: 'center',
  gap: '18px',
  minWidth: 0,
};

const logoBox = {
  width: '74px',
  height: '74px',
  borderRadius: '18px',
  background: '#ef4444',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 900,
  fontSize: '28px',
  letterSpacing: '0.04em',
  flexShrink: 0,
};

const brandTitle = {
  margin: 0,
  fontSize: '34px',
  fontWeight: 900,
  lineHeight: 1,
};

const brandSub = {
  marginTop: '8px',
  color: '#cbd5e1',
  fontSize: '14px',
  fontWeight: 600,
};

const brandMeta = {
  marginTop: '6px',
  color: '#94a3b8',
  fontSize: '13px',
};

const invoiceMetaCard = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '20px',
  padding: '18px',
  backdropFilter: 'blur(6px)',
};

const docBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  background: '#ef4444',
  color: '#fff',
  borderRadius: '999px',
  padding: '7px 12px',
  fontSize: '12px',
  fontWeight: 900,
  textTransform: 'uppercase',
  marginBottom: '14px',
};

const metaRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  padding: '8px 0',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
};

const metaRowLast = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  padding: '8px 0 0',
};

const metaLabel = {
  color: '#cbd5e1',
  fontSize: '13px',
};

const metaValue = {
  color: '#fff',
  fontSize: '14px',
};

const businessStrip = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: '12px',
  padding: '16px 28px',
  background: '#fff5f5',
  color: '#7f1d1d',
  fontWeight: 700,
  fontSize: '13px',
  borderBottom: '1px solid #fecaca',
};

const gridTwo = {
  display: 'grid',
  gap: '20px',
  padding: '24px 28px 0',
};

const gridThree = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: '14px',
  marginTop: '18px',
};

const infoCard = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '22px',
  padding: '20px',
};

const compactInfoCard = {
  padding: '18px',
};

const infoCardHeader = {
  marginBottom: '14px',
};

const infoCardTitle = {
  margin: 0,
  fontSize: '18px',
  fontWeight: 900,
  color: '#0f172a',
};

const detailRow = {
  display: 'grid',
  gridTemplateColumns: '190px 1fr',
  gap: '12px',
  alignItems: 'center',
  padding: '10px 0',
  borderBottom: '1px solid #f1f5f9',
};

const detailRowMultiline = {
  alignItems: 'start',
};

const detailLabelWrap = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: '#64748b',
  fontSize: '13px',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
};

const detailLabel = {
  lineHeight: 1.3,
};

const detailValue = {
  color: '#111827',
  fontWeight: 700,
  fontSize: '14px',
  textAlign: 'right',
};

const detailValueMultiline = {
  textAlign: 'left',
  lineHeight: 1.6,
  whiteSpace: 'pre-wrap',
};

const serviceSection = {
  padding: '24px 28px 0',
};

const sectionHead = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap',
  marginBottom: '14px',
};

const sectionHeadLeft = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const sectionTitle = {
  margin: 0,
  fontSize: '20px',
  fontWeight: 900,
  color: '#0f172a',
};

const serviceTypeBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '8px 12px',
  borderRadius: '999px',
  background: '#111827',
  color: '#fff',
  fontWeight: 800,
  fontSize: '12px',
  textTransform: 'uppercase',
};

const serviceStatCard = {
  border: '1px solid #e2e8f0',
  borderRadius: '18px',
  padding: '16px',
  background: '#f8fafc',
};

const serviceStatTitle = {
  fontSize: '12px',
  color: '#64748b',
  textTransform: 'uppercase',
  fontWeight: 800,
  letterSpacing: '0.04em',
};

const serviceStatValue = {
  marginTop: '8px',
  fontSize: '20px',
  fontWeight: 900,
  color: '#111827',
};

const itemsSection = {
  padding: '28px',
};

const tableWrap = {
  overflowX: 'auto',
  border: '1px solid #e2e8f0',
  borderRadius: '20px',
};

const itemsTable = {
  width: '100%',
  borderCollapse: 'collapse',
  minWidth: '860px',
  background: '#fff',
};

const thNo = {
  textAlign: 'center',
  width: '60px',
  padding: '14px 16px',
  fontSize: '12px',
  fontWeight: 900,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  borderBottom: '1px solid #e2e8f0',
  background: '#f8fafc',
};

const th = {
  textAlign: 'left',
  padding: '14px 16px',
  fontSize: '12px',
  fontWeight: 900,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  borderBottom: '1px solid #e2e8f0',
  background: '#f8fafc',
};

const tr = {
  borderBottom: '1px solid #eef2f7',
};

const tdNo = {
  padding: '15px 16px',
  fontSize: '14px',
  color: '#0f172a',
  textAlign: 'center',
  verticalAlign: 'top',
};

const td = {
  padding: '15px 16px',
  fontSize: '14px',
  color: '#0f172a',
  verticalAlign: 'top',
};

const tdDescription = {
  padding: '15px 16px',
  fontSize: '14px',
  color: '#0f172a',
  verticalAlign: 'top',
  minWidth: '280px',
};

const tdStrong = {
  ...td,
  fontWeight: 900,
  color: '#111827',
};

const tdEmpty = {
  padding: '24px 16px',
  textAlign: 'center',
  color: '#64748b',
  fontWeight: 700,
};

const itemName = {
  fontWeight: 800,
  color: '#111827',
};

const itemDescription = {
  marginTop: '4px',
  color: '#64748b',
  lineHeight: 1.5,
  fontSize: '13px',
  whiteSpace: 'pre-wrap',
};

const smallBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 10px',
  borderRadius: '999px',
  background: '#eff6ff',
  color: '#1d4ed8',
  fontSize: '11px',
  fontWeight: 800,
  textTransform: 'uppercase',
};

const notesBlock = {
  padding: '0 28px 28px',
};

const notesText = {
  border: '1px solid #e2e8f0',
  background: '#f8fafc',
  borderRadius: '18px',
  padding: '16px',
  color: '#334155',
  lineHeight: 1.7,
  whiteSpace: 'pre-wrap',
  fontSize: '14px',
};

const bottomArea = {
  display: 'grid',
  gridTemplateColumns: '1.1fr 0.9fr',
  gap: '20px',
  padding: '0 28px 28px',
};

const bottomLeft = {
  minWidth: 0,
};

const bottomRight = {
  minWidth: 0,
};

const footerCard = {
  borderRadius: '22px',
  padding: '20px',
  background: '#111827',
  color: '#fff',
  height: '100%',
};

const footerTitle = {
  fontSize: '16px',
  fontWeight: 900,
  marginBottom: '10px',
};

const footerText = {
  color: '#cbd5e1',
  lineHeight: 1.8,
  fontSize: '14px',
};

const summaryCard = {
  borderRadius: '22px',
  padding: '20px',
  background: '#fff5f5',
  border: '1px solid #fecaca',
};

const summaryRow = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '10px 0',
  borderBottom: '1px solid #fee2e2',
  color: '#334155',
  fontSize: '14px',
};

const summaryRowTotal = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '16px 0 10px',
  color: '#111827',
  fontSize: '18px',
  fontWeight: 900,
};

const summaryRowBalance = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '8px 0 0',
  color: '#b91c1c',
  fontSize: '18px',
  fontWeight: 900,
};

const printFooter = {
  padding: '18px 28px 28px',
  borderTop: '1px solid #e2e8f0',
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  flexWrap: 'wrap',
  color: '#64748b',
  fontSize: '13px',
};

const statusBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6px 10px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: 900,
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

const loadingCard = {
  maxWidth: '1180px',
  margin: '0 auto',
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '20px',
  padding: '40px',
  textAlign: 'center',
  color: '#64748b',
  fontWeight: 700,
};

const errorCard = {
  maxWidth: '1180px',
  margin: '0 auto',
  background: '#fff1f2',
  border: '1px solid #fecdd3',
  borderRadius: '20px',
  padding: '24px',
  color: '#be123c',
  fontWeight: 700,
};

const printStyles = `
  @media (max-width: 1100px) {
    .print-area {
      border-radius: 22px !important;
    }
  }

  @media (max-width: 980px) {
    .print-area {
      border-radius: 18px !important;
    }
  }

  @media (max-width: 900px) {
    .no-print {
      flex-direction: column !important;
      align-items: stretch !important;
    }
  }

  @media (max-width: 860px) {
    .print-area {
      overflow: hidden !important;
    }
  }

  @media print {
    html, body {
      width: 100%;
      background: #fff !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      margin: 0 !important;
      padding: 0 !important;
    }

    body * {
      visibility: hidden !important;
    }

    .print-area,
    .print-area * {
      visibility: visible !important;
    }

    .no-print {
      display: none !important;
    }

    .print-area {
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      border: none !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      overflow: visible !important;
      background: #fff !important;
    }

    @page {
      size: A4;
      margin: 10mm;
    }
  }
`;
