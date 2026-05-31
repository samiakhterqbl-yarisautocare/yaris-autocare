import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Printer,
  ArrowLeft,
  MessageCircle,
  Send,
} from 'lucide-react';

const API_URL = 'https://yaris-autocare-production.up.railway.app';
const FRONTEND_URL = 'https://yaris-autocare.vercel.app';

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
  const [emailSending, setEmailSending] = useState(false);

  useEffect(() => {
    fetchInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId]);

  useEffect(() => {
    if (invoice && shouldAutoPrint) {
      const timer = setTimeout(() => window.print(), 500);
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
    const notes = String(invoice?.notes || '').toUpperCase();
    if (notes.includes('SERVICE TYPE: MAJOR')) return 'Major Service';
    if (notes.includes('SERVICE TYPE: REGULAR')) return 'Regular Service';
    return '';
  }, [invoice]);

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

    return raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .filter(
        (line) =>
          !line.toUpperCase().startsWith('DOCUMENT TYPE:') &&
          !line.toUpperCase().startsWith('SERVICE TYPE:')
      )
      .join('\n');
  }, [invoice]);

  const serviceItems = useMemo(() => {
    if (invoice?.invoice_type !== 'SERVICING') return [];
    return items.filter((item) => item.item_type === 'SERVICE' || item.source_type === 'MANUAL');
  }, [invoice, items]);

  const extraItems = useMemo(() => {
    if (invoice?.invoice_type !== 'SERVICING') return items;
    return items.filter((item) => !(item.item_type === 'SERVICE' || item.source_type === 'MANUAL'));
  }, [invoice, items]);

  const serviceChecklistText = useMemo(() => {
    if (!serviceItems.length) return '';
    return serviceItems[0]?.description || '';
  }, [serviceItems]);

  const openWhatsApp = () => {
    const phone = String(invoice?.customer_phone || '').replace(/\D/g, '');
    if (!phone) {
      alert('Customer phone is missing.');
      return;
    }

    const fullNumber = phone.startsWith('61')
      ? phone
      : phone.startsWith('0')
        ? `61${phone.slice(1)}`
        : phone;

    const invoiceLink = `${FRONTEND_URL}/sales/${invoiceId}`;

    const message = `Hi ${invoice?.customer_name || ''},

Your ${documentLabel.toLowerCase()} ${invoice?.invoice_number || ''} from Yaris Autocare is ready.

Total: $${formatMoney(invoice?.total_amount)}
Balance Due: $${formatMoney(invoice?.balance_due)}

View here:
${invoiceLink}

Thank you,
Yaris Autocare
0449 828 749`;

    window.open(`https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleSendEmail = async () => {
    if (!invoice?.customer_email?.trim()) {
      alert('Customer email is missing.');
      return;
    }

    try {
      setEmailSending(true);
      await axios.post(`${API_URL}/api/invoices/${invoiceId}/send-email/`, {
        email: invoice.customer_email.trim(),
      });
      alert('Invoice sent to customer email.');
    } catch (error) {
      console.error(error?.response?.data || error);
      alert(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        'Failed to send email.'
      );
    } finally {
      setEmailSending(false);
    }
  };

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

  const visibleItems = invoice.invoice_type === 'SERVICING' ? extraItems : items;

  return (
    <div style={pageWrap}>
      <style>{printStyles}</style>

      <div style={topBar} className="no-print">
        <button type="button" style={backBtn} onClick={() => window.history.back()}>
          <ArrowLeft size={15} />
          Back
        </button>

        <div style={topBarRight}>
          <button type="button" style={secondaryBtn} onClick={fetchInvoice}>
            Refresh
          </button>

          <button type="button" style={secondaryBtn} onClick={openWhatsApp}>
            <MessageCircle size={15} />
            WhatsApp
          </button>

          <button
            type="button"
            style={secondaryBtn}
            onClick={handleSendEmail}
            disabled={emailSending}
          >
            <Send size={15} />
            {emailSending ? 'Sending...' : 'Email'}
          </button>

          <button type="button" style={printBtn} onClick={() => window.print()}>
            <Printer size={15} />
            Print / PDF
          </button>
        </div>
      </div>

      <main className="invoice-page" style={documentWrap}>
        <PrintHeader />

        <section style={documentMetaRow}>
          <div>
            <div style={docTypeTitle}>{documentLabel}</div>
            <div style={mutedText}>Document prepared for customer record</div>
          </div>

          <div style={metaBlock}>
            <InfoLine label="Document No" value={invoice.invoice_number} />
            <InfoLine label="Date" value={formatDate(invoice.created_at)} />
            <InfoLine label="Time" value={formatTime(invoice.created_at)} />
            <InfoLine label="Type" value={formatInvoiceType(invoice.invoice_type)} />
          </div>
        </section>

        <section style={detailsGrid}>
          <div style={plainPanel}>
            <SectionTitle title="Bill To" />
            <SimpleRow label="Customer" value={invoice.customer_name || '-'} />
            <SimpleRow label="Phone" value={invoice.customer_phone || '-'} />
            <SimpleRow label="Email" value={invoice.customer_email || '-'} />
            <SimpleRow label="Address" value={invoice.customer_address || '-'} multiline />
          </div>

          {showVehicleSection && (
            <div style={plainPanel}>
              <SectionTitle title="Vehicle" />
              <SimpleRow label="Rego" value={invoice.rego || '-'} />
              <SimpleRow label="Make" value={invoice.make || '-'} />
              <SimpleRow label="Model" value={invoice.model || '-'} />
              <SimpleRow label="VIN" value={invoice.vin || '-'} />
              <SimpleRow
                label="Odometer"
                value={invoice.odometer ? `${invoice.odometer} km` : '-'}
              />
            </div>
          )}
        </section>

        {invoice.invoice_type === 'SERVICING' && (
          <section style={sectionBlock}>
            <SectionTitle
              title={`Service Details${serviceTemplateType ? ` - ${serviceTemplateType}` : ''}`}
            />

            <div style={serviceGrid}>
              <SimpleStat
                label="Service At KM"
                value={serviceDetail?.service_at_km ? `${serviceDetail.service_at_km} km` : '-'}
              />
              <SimpleStat
                label="Next Service At KM"
                value={serviceDetail?.next_service_at_km ? `${serviceDetail.next_service_at_km} km` : '-'}
              />
              <SimpleStat
                label="Next Service Date"
                value={serviceDetail?.next_service_date ? formatPlainDate(serviceDetail.next_service_date) : '-'}
              />
            </div>

            {serviceChecklistText && (
              <div style={{ marginTop: 10 }}>
                <SectionTitle title="Service Checklist" small />
                <div style={notesBox}>{serviceChecklistText}</div>
              </div>
            )}

            {serviceDetail?.service_notes && (
              <div style={{ marginTop: 10 }}>
                <SectionTitle title="Service Notes" small />
                <div style={notesBox}>{serviceDetail.service_notes}</div>
              </div>
            )}
          </section>
        )}

        {(invoice.invoice_type !== 'SERVICING' || visibleItems.length > 0) && (
          <section style={sectionBlock}>
            <SectionTitle
              title={
                invoice.invoice_type === 'SERVICING'
                  ? 'Extra Items'
                  : invoice.invoice_type === 'USED_PART'
                    ? 'Parts Details'
                    : 'Invoice Details'
              }
            />

            <table style={table}>
              <thead>
                <tr>
                  <th style={thNo}>#</th>
                  <th style={thDesc}>Description</th>
                  <th style={th}>Type</th>
                  <th style={th}>Qty</th>
                  <th style={th}>Amount</th>
                  <th style={th}>Discount</th>
                  <th style={th}>Total</th>
                </tr>
              </thead>

              <tbody>
                {visibleItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={emptyTd}>No items.</td>
                  </tr>
                ) : (
                  visibleItems.map((item, index) => (
                    <tr key={item.id || index}>
                      <td style={tdNo}>{index + 1}</td>
                      <td style={tdDesc}>
                        <div style={descMain}>{item.name || '-'}</div>
                        {item.description ? <div style={descSub}>{item.description}</div> : null}
                      </td>
                      <td style={td}>{formatSmallType(item.item_type || item.source_type || 'ITEM')}</td>
                      <td style={td}>{formatQty(item.quantity)}</td>
                      <td style={td}>${formatMoney(item.unit_price)}</td>
                      <td style={td}>${formatMoney(item.discount)}</td>
                      <td style={tdStrong}>${formatMoney(item.line_total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        )}

        {filteredNotes && (
          <section style={sectionBlock}>
            <SectionTitle title="Notes" />
            <div style={notesBox}>{filteredNotes}</div>
          </section>
        )}

        <section className="invoice-footer-block" style={footerGrid}>
          <div style={paymentBox}>
            <SectionTitle title="Payment Details" small />
            <SimpleText label="Bank" value="ANZ Pty. Ltd." />
            <SimpleText label="Account Name" value="Pyramid Enterprises AU Pty Ltd" />
            <SimpleText label="BSB" value="013270" />
            <SimpleText label="Account No" value="430088057" />
            <div style={smallNote}>Please email remittance to info@yarisautocare.com.au</div>
          </div>

          <div style={totalsBox}>
            <TotalRow label="Subtotal" value={`$${formatMoney(invoice.subtotal)}`} />
            <TotalRow label="GST Included" value={`$${formatMoney(invoice.gst_amount)}`} />
            <TotalRow label="Paid Amount" value={`$${formatMoney(invoice.paid_amount)}`} />
            <TotalRow label="Payment Method" value={invoice.payment_method || '-'} />
            <TotalRowBig label="Total Amount" value={`$${formatMoney(invoice.total_amount)}`} />
            <TotalRowBig label="Balance Due" value={`$${formatMoney(invoice.balance_due)}`} danger />
          </div>
        </section>

        <div style={bottomNote}>
          Thank you for your business. Please contact Yaris Autocare on 0449 828 749 for any invoice enquiries.
        </div>
      </main>
    </div>
  );
}

function PrintHeader() {
  return (
    <header style={headerWrap}>
      <div style={brandRow}>
        <div style={brandName}>
          YARIS <span style={{ color: '#b91c1c' }}>AUTOCARE</span>
        </div>
        <div style={businessMeta}>
          <div>Operated by Pyramid Enterprises AU Pty Ltd</div>
          <div>Car Rental • Mechanical Services • Auto Parts</div>
        </div>
      </div>

      <div style={contactStrip}>
        <div>
          <strong>Address:</strong> 16 Legana Park Drive, Legana TAS 7277
        </div>
        <div>
          <strong>Phone:</strong> 0449 828 749
        </div>
        <div>
          <strong>Web:</strong> www.yarisautocare.com.au
        </div>
      </div>

      <div style={abnStrip}>
        ABN: 91 650 944 157 &nbsp; | &nbsp;
        Accreditation No: 419296067 &nbsp; | &nbsp;
        LMVT Licence: 6130
      </div>
    </header>
  );
}

function SectionTitle({ title, small = false }) {
  return (
    <div
      style={{
        ...sectionTitleStyle,
        ...(small ? { fontSize: 13, marginBottom: 6 } : {}),
      }}
    >
      {title}
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <div style={infoLine}>
      <span>{label}:</span>
      <strong>{value || '-'}</strong>
    </div>
  );
}

function SimpleRow({ label, value, multiline = false }) {
  return (
    <div style={{ ...simpleRow, ...(multiline ? { alignItems: 'start' } : {}) }}>
      <div style={simpleLabel}>{label}</div>
      <div style={{ ...simpleValue, ...(multiline ? { whiteSpace: 'pre-wrap' } : {}) }}>
        {value}
      </div>
    </div>
  );
}

function SimpleText({ label, value }) {
  return (
    <div style={simpleText}>
      <strong>{label}:</strong> {value}
    </div>
  );
}

function SimpleStat({ label, value }) {
  return (
    <div style={statBox}>
      <div style={statLabel}>{label}</div>
      <div style={statValue}>{value}</div>
    </div>
  );
}

function TotalRow({ label, value }) {
  return (
    <div style={totalRow}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TotalRowBig({ label, value, danger = false }) {
  return (
    <div style={{ ...totalRowBig, ...(danger ? { color: '#b91c1c' } : {}) }}>
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
  return String(type).replaceAll('_', ' ');
}

function formatSmallType(type) {
  if (!type) return 'ITEM';
  return String(type).replaceAll('_', ' ');
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
  background: '#e5e7eb',
  minHeight: '100vh',
  padding: 24,
};

const topBar = {
  maxWidth: 900,
  margin: '0 auto 16px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  flexWrap: 'wrap',
};

const topBarRight = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  flexWrap: 'wrap',
};

const baseBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  border: '1px solid #d1d5db',
  background: '#fff',
  color: '#111827',
  borderRadius: 8,
  padding: '9px 13px',
  fontWeight: 700,
  cursor: 'pointer',
};

const backBtn = { ...baseBtn };
const secondaryBtn = { ...baseBtn };

const printBtn = {
  ...baseBtn,
  border: '1px solid #111827',
  background: '#111827',
  color: '#fff',
};

const documentWrap = {
  maxWidth: 900,
  margin: '0 auto',
  background: '#fff',
  padding: '24px 28px 28px',
  boxShadow: '0 12px 30px rgba(0,0,0,0.10)',
  color: '#111827',
  fontFamily: 'Arial, Helvetica, sans-serif',
};

const headerWrap = {
  borderBottom: '2px solid #111827',
  paddingBottom: 12,
  marginBottom: 18,
};

const brandRow = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 20,
  alignItems: 'flex-start',
};

const brandName = {
  fontSize: 30,
  fontWeight: 900,
  letterSpacing: '0.03em',
  lineHeight: 1,
};

const businessMeta = {
  textAlign: 'right',
  fontSize: 12,
  lineHeight: 1.5,
  color: '#374151',
};

const contactStrip = {
  marginTop: 12,
  display: 'grid',
  gridTemplateColumns: '1.7fr 0.8fr 1fr',
  gap: 12,
  fontSize: 12,
  color: '#111827',
};

const abnStrip = {
  marginTop: 10,
  paddingTop: 8,
  borderTop: '1px solid #d1d5db',
  fontSize: 12,
  fontWeight: 700,
  textAlign: 'center',
};

const documentMetaRow = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 20,
  marginBottom: 18,
};

const docTypeTitle = {
  fontSize: 25,
  fontWeight: 900,
  letterSpacing: '0.04em',
};

const mutedText = {
  marginTop: 4,
  fontSize: 12,
  color: '#6b7280',
};

const metaBlock = {
  minWidth: 260,
  fontSize: 12,
};

const infoLine = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 20,
  padding: '3px 0',
  borderBottom: '1px solid #e5e7eb',
};

const detailsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 18,
  marginBottom: 16,
};

const plainPanel = {
  border: '1px solid #d1d5db',
  padding: 12,
  breakInside: 'avoid',
  pageBreakInside: 'avoid',
};

const sectionBlock = {
  marginBottom: 16,
  breakInside: 'avoid',
  pageBreakInside: 'avoid',
};

const sectionTitleStyle = {
  fontSize: 15,
  fontWeight: 900,
  color: '#111827',
  marginBottom: 8,
  paddingBottom: 5,
  borderBottom: '1px solid #d1d5db',
  textTransform: 'uppercase',
  letterSpacing: '0.02em',
};

const simpleRow = {
  display: 'grid',
  gridTemplateColumns: '110px 1fr',
  gap: 8,
  padding: '4px 0',
  borderBottom: '1px solid #f3f4f6',
};

const simpleLabel = {
  fontWeight: 800,
  color: '#374151',
  fontSize: 11,
  textTransform: 'uppercase',
};

const simpleValue = {
  color: '#111827',
  fontSize: 12,
};

const simpleText = {
  fontSize: 12,
  lineHeight: 1.55,
};

const serviceGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: 10,
};

const statBox = {
  border: '1px solid #d1d5db',
  padding: 10,
};

const statLabel = {
  fontSize: 11,
  fontWeight: 800,
  color: '#4b5563',
  textTransform: 'uppercase',
};

const statValue = {
  marginTop: 4,
  fontSize: 13,
  fontWeight: 800,
  color: '#111827',
};

const notesBox = {
  border: '1px solid #d1d5db',
  padding: 10,
  whiteSpace: 'pre-wrap',
  lineHeight: 1.45,
  fontSize: 12,
  color: '#111827',
  breakInside: 'avoid',
  pageBreakInside: 'avoid',
};

const table = {
  width: '100%',
  borderCollapse: 'collapse',
  border: '1px solid #111827',
  fontSize: 12,
};

const thNo = {
  border: '1px solid #111827',
  padding: '7px 6px',
  textAlign: 'center',
  fontSize: 11,
  fontWeight: 900,
  width: 36,
};

const thDesc = {
  border: '1px solid #111827',
  padding: '7px 6px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 900,
};

const th = {
  border: '1px solid #111827',
  padding: '7px 6px',
  textAlign: 'center',
  fontSize: 11,
  fontWeight: 900,
};

const tdNo = {
  border: '1px solid #d1d5db',
  padding: '7px 6px',
  textAlign: 'center',
  verticalAlign: 'top',
  fontSize: 12,
};

const td = {
  border: '1px solid #d1d5db',
  padding: '7px 6px',
  textAlign: 'center',
  verticalAlign: 'top',
  fontSize: 12,
};

const tdDesc = {
  border: '1px solid #d1d5db',
  padding: '7px 6px',
  textAlign: 'left',
  verticalAlign: 'top',
  fontSize: 12,
};

const tdStrong = {
  ...td,
  fontWeight: 900,
};

const emptyTd = {
  border: '1px solid #d1d5db',
  padding: 14,
  textAlign: 'center',
  color: '#6b7280',
};

const descMain = {
  fontWeight: 800,
  color: '#111827',
};

const descSub = {
  marginTop: 3,
  color: '#374151',
  whiteSpace: 'pre-wrap',
  fontSize: 11,
  lineHeight: 1.35,
};

const footerGrid = {
  display: 'grid',
  gridTemplateColumns: '1.1fr 0.9fr',
  gap: 16,
  marginTop: 18,
  breakInside: 'avoid',
  pageBreakInside: 'avoid',
};

const paymentBox = {
  border: '1px solid #d1d5db',
  padding: 12,
  breakInside: 'avoid',
  pageBreakInside: 'avoid',
};

const totalsBox = {
  border: '1px solid #111827',
  padding: 12,
  breakInside: 'avoid',
  pageBreakInside: 'avoid',
};

const smallNote = {
  marginTop: 8,
  fontSize: 11,
  color: '#374151',
};

const totalRow = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  padding: '6px 0',
  borderBottom: '1px solid #e5e7eb',
  fontSize: 12,
};

const totalRowBig = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  padding: '9px 0 4px',
  fontSize: 15,
  fontWeight: 900,
  color: '#111827',
};

const bottomNote = {
  marginTop: 16,
  paddingTop: 10,
  borderTop: '1px solid #d1d5db',
  fontSize: 11,
  color: '#4b5563',
  textAlign: 'center',
};

const loadingCard = {
  maxWidth: 900,
  margin: '0 auto',
  background: '#fff',
  padding: 30,
  textAlign: 'center',
  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
};

const errorCard = {
  maxWidth: 900,
  margin: '0 auto',
  background: '#fff',
  border: '1px solid #fecdd3',
  padding: 20,
  color: '#be123c',
  fontWeight: 700,
};

const printStyles = `
  @media (max-width: 768px) {
    .invoice-page {
      padding: 18px !important;
    }
  }

  @media print {
    @page {
      size: A4;
      margin: 10mm;
    }

    html,
    body {
      background: #fff !important;
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
    }

    body * {
      visibility: hidden !important;
    }

    .invoice-page,
    .invoice-page * {
      visibility: visible !important;
    }

    .no-print {
      display: none !important;
    }

    .invoice-page {
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      width: 190mm !important;
      max-width: 190mm !important;
      margin: 0 auto !important;
      padding: 0 !important;
      box-shadow: none !important;
      background: #fff !important;
      color: #000 !important;
      font-size: 11px !important;
    }

    * {
      -webkit-print-color-adjust: economy !important;
      print-color-adjust: economy !important;
    }

    table {
      page-break-inside: auto !important;
      break-inside: auto !important;
    }

    thead {
      display: table-header-group !important;
    }

    tr {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    .invoice-footer-block {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
  }
`;
