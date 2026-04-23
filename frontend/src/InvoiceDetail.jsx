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

View here:
${invoiceLink}

Thank you,
Yaris Autocare`;

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
          'Failed to send email. Backend endpoint is required.'
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

      <div style={documentWrap} className="print-area">
        <table className="print-shell" style={printShellTable}>
          <thead>
            <tr>
              <td style={printShellCell}>
                <PrintHeader />
              </td>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td style={printShellCell}>
                <div style={documentMetaRow}>
                  <div style={docTypeTitle}>{documentLabel}</div>
                  <div style={metaBlock}>
                    <div><strong>Document No:</strong> {invoice.invoice_number}</div>
                    <div><strong>Date:</strong> {formatDate(invoice.created_at)}</div>
                    <div><strong>Time:</strong> {formatTime(invoice.created_at)}</div>
                    <div><strong>Type:</strong> {formatInvoiceType(invoice.invoice_type)}</div>
                  </div>
                </div>

                <div style={detailsGrid}>
                  <div>
                    <SectionTitle title="Customer Details" />
                    <SimpleRow label="Customer" value={invoice.customer_name || '-'} />
                    <SimpleRow label="Phone" value={invoice.customer_phone || '-'} />
                    <SimpleRow label="Email" value={invoice.customer_email || '-'} />
                    <SimpleRow label="Address" value={invoice.customer_address || '-'} multiline />
                  </div>

                  {showVehicleSection && (
                    <div>
                      <SectionTitle title="Vehicle Details" />
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
                </div>

                {invoice.invoice_type === 'SERVICING' && (
                  <div style={sectionBlock}>
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
                      <div style={{ marginTop: '14px' }}>
                        <SectionTitle title="Service Checklist" small />
                        <div style={checklistBox}>{serviceChecklistText}</div>
                      </div>
                    )}

                    {serviceDetail?.service_notes && (
                      <div style={{ marginTop: '12px' }}>
                        <SectionTitle title="Service Notes" small />
                        <div style={notesBox}>{serviceDetail.service_notes}</div>
                      </div>
                    )}
                  </div>
                )}

                {(invoice.invoice_type !== 'SERVICING' || extraItems.length > 0) && (
                  <div style={sectionBlock}>
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
                        {(invoice.invoice_type === 'SERVICING' ? extraItems : items).length === 0 ? (
                          <tr>
                            <td colSpan={7} style={emptyTd}>No extra items.</td>
                          </tr>
                        ) : (
                          (invoice.invoice_type === 'SERVICING' ? extraItems : items).map((item, index) => (
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
                  </div>
                )}

                {filteredNotes && (
                  <div style={sectionBlock}>
                    <SectionTitle title="Notes" />
                    <div style={notesBox}>{filteredNotes}</div>
                  </div>
                )}

                <div style={footerGrid}>
                  <div style={paymentBox}>
                    <div style={footerHeading}>Payment Details</div>
                    <div>Bank: ANZ Pty. Ltd.</div>
                    <div>Account Name: Pyramid Enterprises AU Pty Ltd</div>
                    <div>BSB: 013270</div>
                    <div>Account No: 430088057</div>
                    <div>Please email the remittance to info@yarisautocare.com.au</div>
                  </div>

                  <div style={totalsBox}>
                    <TotalRow label="Subtotal" value={`$${formatMoney(invoice.subtotal)}`} />
                    <TotalRow label="GST Included" value={`$${formatMoney(invoice.gst_amount)}`} />
                    <TotalRow label="Paid Amount" value={`$${formatMoney(invoice.paid_amount)}`} />
                    <TotalRow label="Payment Method" value={invoice.payment_method || '-'} />
                    <TotalRowBig label="Total Amount" value={`$${formatMoney(invoice.total_amount)}`} />
                    <TotalRowBig label="Balance Due" value={`$${formatMoney(invoice.balance_due)}`} danger />
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PrintHeader() {
  return (
    <div style={headerWrap}>
      <div style={logoArea}>
        <img
          src="/image.png"
          alt="Yaris Autocare"
          style={logoImage}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div style={brandFallback}>
          YARIS <span style={{ color: '#d62828' }}>AUTOCARE</span>
        </div>
        <div style={operatedText}>Operated by Pyramid Enterprises AU Pty Ltd</div>
        <div style={serviceLine}>Car Rental • Mechanical Services • Auto Parts</div>
      </div>

      <div style={contactStrip}>
        <div style={contactCol}>
          <div style={contactLabel}>Address:</div>
          <div>16 Legana Park Drive, Legana TAS 7277</div>
        </div>
        <div style={contactColMiddle}>
          <div style={contactLabel}>Phone:</div>
          <div>0449 828 749</div>
        </div>
        <div style={contactColRight}>
          <div>www.yarisautocare.com.au</div>
        </div>
      </div>

      <div style={abnStrip}>
        <span>ABN: 91 650 944 157</span>
        <span>|</span>
        <span>Accreditation No: 419296067</span>
        <span>|</span>
        <span>LMVT Licence: 6130</span>
      </div>
    </div>
  );
}

function SectionTitle({ title, small = false }) {
  return (
    <div
      style={{
        ...sectionTitleStyle,
        ...(small ? { fontSize: '15px', marginBottom: '8px' } : {}),
      }}
    >
      {title}
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
  background: '#f3f4f6',
  minHeight: '100vh',
  padding: '24px',
};

const topBar = {
  maxWidth: '900px',
  margin: '0 auto 16px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap',
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
  border: '1px solid #d1d5db',
  background: '#fff',
  color: '#111827',
  borderRadius: '10px',
  padding: '10px 14px',
  fontWeight: 700,
  cursor: 'pointer',
};

const secondaryBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  border: '1px solid #d1d5db',
  background: '#fff',
  color: '#111827',
  borderRadius: '10px',
  padding: '10px 14px',
  fontWeight: 700,
  cursor: 'pointer',
};

const printBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  border: 'none',
  background: '#d62828',
  color: '#fff',
  borderRadius: '10px',
  padding: '10px 14px',
  fontWeight: 800,
  cursor: 'pointer',
};

const documentWrap = {
  maxWidth: '900px',
  margin: '0 auto',
  background: '#fff',
  padding: '26px 26px 32px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
};

const printShellTable = {
  width: '100%',
  borderCollapse: 'collapse',
};

const printShellCell = {
  padding: 0,
  verticalAlign: 'top',
};

const headerWrap = {
  textAlign: 'center',
  marginBottom: '18px',
};

const logoArea = {
  textAlign: 'center',
};

const logoImage = {
  maxWidth: '100%',
  width: '720px',
  height: 'auto',
  display: 'block',
  margin: '0 auto',
};

const brandFallback = {
  fontSize: '34px',
  fontWeight: 900,
  color: '#111827',
};

const operatedText = {
  fontSize: '14px',
  marginTop: '6px',
  color: '#374151',
};

const serviceLine = {
  fontSize: '15px',
  marginTop: '8px',
  color: '#374151',
};

const contactStrip = {
  marginTop: '14px',
  borderTop: '2px solid #d62828',
  borderBottom: '1px solid #d1d5db',
  padding: '12px 10px',
  display: 'grid',
  gridTemplateColumns: '1.4fr 1fr 1fr',
  gap: '12px',
  alignItems: 'center',
  textAlign: 'left',
  fontSize: '14px',
};

const contactCol = {
  borderRight: '1px solid #d1d5db',
  paddingRight: '10px',
};

const contactColMiddle = {
  borderRight: '1px solid #d1d5db',
  paddingRight: '10px',
};

const contactColRight = {
  textAlign: 'left',
};

const contactLabel = {
  fontWeight: 800,
  display: 'inline',
  marginRight: '6px',
};

const abnStrip = {
  display: 'flex',
  justifyContent: 'center',
  gap: '10px',
  flexWrap: 'wrap',
  padding: '8px 0 0',
  fontSize: '14px',
  fontWeight: 700,
  color: '#374151',
};

const documentMetaRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '16px',
  marginTop: '18px',
  marginBottom: '18px',
  flexWrap: 'wrap',
};

const docTypeTitle = {
  fontSize: '28px',
  fontWeight: 900,
  color: '#111827',
  letterSpacing: '0.03em',
};

const metaBlock = {
  fontSize: '14px',
  lineHeight: 1.8,
  textAlign: 'right',
  color: '#111827',
};

const detailsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '24px',
  marginBottom: '18px',
};

const sectionBlock = {
  marginBottom: '18px',
  pageBreakInside: 'avoid',
  breakInside: 'avoid',
};

const sectionTitleStyle = {
  fontSize: '18px',
  fontWeight: 900,
  color: '#111827',
  marginBottom: '10px',
  borderBottom: '1px solid #d1d5db',
  paddingBottom: '6px',
};

const simpleRow = {
  display: 'grid',
  gridTemplateColumns: '140px 1fr',
  gap: '10px',
  padding: '7px 0',
  borderBottom: '1px solid #f3f4f6',
};

const simpleLabel = {
  fontWeight: 800,
  color: '#374151',
  textTransform: 'uppercase',
  fontSize: '13px',
};

const simpleValue = {
  color: '#111827',
  fontSize: '14px',
};

const serviceGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '12px',
};

const statBox = {
  border: '1px solid #d1d5db',
  padding: '12px',
};

const statLabel = {
  fontSize: '12px',
  fontWeight: 800,
  color: '#6b7280',
  textTransform: 'uppercase',
};

const statValue = {
  marginTop: '6px',
  fontSize: '16px',
  fontWeight: 800,
  color: '#111827',
};

const notesBox = {
  border: '1px solid #d1d5db',
  padding: '12px',
  whiteSpace: 'pre-wrap',
  lineHeight: 1.7,
  fontSize: '14px',
  color: '#111827',
};

const checklistBox = {
  border: '1px solid #d1d5db',
  background: '#fafafa',
  padding: '12px',
  whiteSpace: 'pre-wrap',
  lineHeight: 1.7,
  fontSize: '14px',
  color: '#111827',
};

const table = {
  width: '100%',
  borderCollapse: 'collapse',
  border: '1px solid #d1d5db',
};

const thNo = {
  border: '1px solid #d1d5db',
  padding: '10px 8px',
  textAlign: 'center',
  background: '#f3f4f6',
  fontSize: '12px',
  fontWeight: 800,
  width: '50px',
};

const thDesc = {
  border: '1px solid #d1d5db',
  padding: '10px 8px',
  textAlign: 'left',
  background: '#f3f4f6',
  fontSize: '12px',
  fontWeight: 800,
};

const th = {
  border: '1px solid #d1d5db',
  padding: '10px 8px',
  textAlign: 'center',
  background: '#f3f4f6',
  fontSize: '12px',
  fontWeight: 800,
};

const tdNo = {
  border: '1px solid #d1d5db',
  padding: '10px 8px',
  textAlign: 'center',
  verticalAlign: 'top',
  fontSize: '14px',
};

const td = {
  border: '1px solid #d1d5db',
  padding: '10px 8px',
  textAlign: 'center',
  verticalAlign: 'top',
  fontSize: '14px',
};

const tdDesc = {
  border: '1px solid #d1d5db',
  padding: '10px 8px',
  textAlign: 'left',
  verticalAlign: 'top',
  fontSize: '14px',
};

const tdStrong = {
  ...td,
  fontWeight: 900,
};

const emptyTd = {
  border: '1px solid #d1d5db',
  padding: '16px',
  textAlign: 'center',
  color: '#6b7280',
};

const descMain = {
  fontWeight: 800,
  color: '#111827',
};

const descSub = {
  marginTop: '4px',
  color: '#4b5563',
  whiteSpace: 'pre-wrap',
  fontSize: '13px',
};

const footerGrid = {
  display: 'grid',
  gridTemplateColumns: '1.1fr 0.9fr',
  gap: '20px',
  marginTop: '24px',
};

const paymentBox = {
  background: '#0f172a',
  color: '#fff',
  padding: '18px',
  lineHeight: 1.8,
  fontSize: '14px',
};

const footerHeading = {
  fontSize: '18px',
  fontWeight: 900,
  marginBottom: '10px',
};

const totalsBox = {
  border: '1px solid #fecaca',
  background: '#fff5f5',
  padding: '18px',
};

const totalRow = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '10px 0',
  borderBottom: '1px solid #fee2e2',
  fontSize: '14px',
};

const totalRowBig = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '14px 0 6px',
  fontSize: '18px',
  fontWeight: 900,
  color: '#111827',
};

const loadingCard = {
  maxWidth: '900px',
  margin: '0 auto',
  background: '#fff',
  padding: '30px',
  textAlign: 'center',
  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
};

const errorCard = {
  maxWidth: '900px',
  margin: '0 auto',
  background: '#fff1f2',
  border: '1px solid #fecdd3',
  padding: '20px',
  color: '#be123c',
  fontWeight: 700,
};

const printStyles = `
  @media (max-width: 900px) {
    .print-area {
      padding: 18px !important;
    }
  }

  @media (max-width: 768px) {
    .print-area {
      padding: 14px !important;
    }
  }

  @media print {
    html, body {
      width: 100%;
      background: #fff !important;
      margin: 0 !important;
      padding: 0 !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
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
      padding: 8mm !important;
      box-shadow: none !important;
      border: none !important;
      background: #fff !important;
    }

    .print-shell {
      width: 100% !important;
      border-collapse: collapse !important;
    }

    .print-shell thead {
      display: table-header-group !important;
    }

    .print-shell tfoot {
      display: table-footer-group !important;
    }

    table {
      page-break-inside: auto;
    }

    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }

    td, th {
      page-break-inside: avoid;
    }

    @page {
      size: A4;
      margin: 8mm;
    }
  }
`;
