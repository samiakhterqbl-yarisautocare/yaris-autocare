import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Receipt,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Car,
  Hash,
  CalendarDays,
  StickyNote,
  Plus,
  Trash2,
  Save,
  Eye,
  LayoutList,
  Wrench,
  Package,
  Settings,
  Send,
  MessageCircle,
  CheckCircle2,
} from 'lucide-react';

const API_URL = 'https://yaris-autocare-production.up.railway.app';
const FRONTEND_URL = 'https://yaris-autocare.vercel.app';

const documentTypeOptions = [
  { value: 'INVOICE', label: 'Tax Invoice' },
  { value: 'QUOTE', label: 'Quote' },
];

const jobTypeOptions = [
  { value: 'SERVICING', label: 'Servicing' },
  { value: 'PARTS_SALE', label: 'Parts Sale' },
  { value: 'WORKSHOP', label: 'Workshop Invoice' },
];

const serviceTypeOptions = [
  { value: 'REGULAR', label: 'Regular Service' },
  { value: 'MAJOR', label: 'Major Service' },
];

const paymentMethodOptions = ['Cash', 'Bank Transfer', 'Card', 'EFTPOS', 'Pending'];

const regularServiceTemplate = `Regular Service Includes:
• Engine oil & oil filter replacement
• New sump plug washer
• Fluid top-ups (coolant, brake, washer, power steering)
• Safety inspection (brakes, tyres, suspension, lights)
• Battery test
• Basic mechanical inspection`;

const majorServiceTemplate = `Major Service Includes:
• Engine oil & oil filter replacement
• New sump plug washer
• Full fluid inspection & top-ups
• Full safety inspection
• Suspension, bushes, mounts inspection
• Brake system check
• Engine & transmission leak check
• Exhaust & driveline inspection`;

const createBlankRow = () => ({
  item_type: 'MANUAL',
  source_type: 'MANUAL',
  source_id: null,
  name: '',
  description: '',
  quantity: 1,
  unit_price: '',
  discount: 0,
  gst_included: true,
});

const createServiceRow = (type) => ({
  item_type: 'SERVICE',
  source_type: 'MANUAL',
  source_id: null,
  name: type === 'MAJOR' ? 'Major Service' : 'Regular Service',
  description: type === 'MAJOR' ? majorServiceTemplate : regularServiceTemplate,
  quantity: 1,
  unit_price: '',
  discount: 0,
  gst_included: true,
});

const COLORS = {
  primary: '#ef4444',
  dark: '#0f172a',
  text: '#1e293b',
  muted: '#64748b',
  soft: '#94a3b8',
  border: '#e2e8f0',
  borderSoft: '#eef2f7',
  bg: '#f8fafc',
  card: '#ffffff',
  success: '#166534',
  successBg: '#ecfdf5',
  danger: '#be123c',
  dangerBg: '#fff1f2',
};

export default function SalesModule() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [createdInvoice, setCreatedInvoice] = useState(null);

  const [documentType, setDocumentType] = useState('INVOICE');
  const [jobType, setJobType] = useState('SERVICING');
  const [serviceType, setServiceType] = useState('REGULAR');

  const [customer, setCustomer] = useState({
    customer_name: 'Walk-in Customer',
    customer_phone: '',
    customer_email: '',
    customer_address: '',
  });

  const [vehicle, setVehicle] = useState({
    rego: '',
    make: '',
    model: '',
    vin: '',
    odometer: '',
  });

  const [serviceDetail, setServiceDetail] = useState({
    service_at_km: '',
    next_service_at_km: '',
    next_service_date: '',
    notes: '',
  });

  const [payment, setPayment] = useState({
    paid_amount: '',
    payment_method: 'Cash',
    notes: '',
  });

  const [rows, setRows] = useState([createServiceRow('REGULAR')]);

  const showVehicleDetails = jobType === 'SERVICING' || jobType === 'WORKSHOP';
  const isServicing = jobType === 'SERVICING';
  const isPartsSale = jobType === 'PARTS_SALE';
  const isWorkshop = jobType === 'WORKSHOP';

  const lineItems = useMemo(() => {
    return rows.map((row) => {
      const qty = parseFloat(row.quantity || 0) || 0;
      const unit = parseFloat(row.unit_price || 0) || 0;
      const discount = parseFloat(row.discount || 0) || 0;
      const lineTotal = Math.max(qty * unit - discount, 0);
      return { ...row, lineTotal };
    });
  }, [rows]);

  const subtotal = useMemo(
    () => lineItems.reduce((sum, row) => sum + row.lineTotal, 0),
    [lineItems]
  );

  const gstAmount = useMemo(
    () =>
      lineItems.reduce((sum, row) => {
        if (!row.gst_included) return sum;
        return sum + row.lineTotal / 11;
      }, 0),
    [lineItems]
  );

  const totalAmount = subtotal;

  const balanceDue = useMemo(() => {
    const paid = parseFloat(payment.paid_amount || 0) || 0;
    return Math.max(totalAmount - paid, 0);
  }, [payment.paid_amount, totalAmount]);

  const updateCustomer = (field, value) => {
    setCustomer((prev) => ({ ...prev, [field]: value }));
  };

  const updateVehicle = (field, value) => {
    setVehicle((prev) => ({ ...prev, [field]: value }));
  };

  const updateServiceDetail = (field, value) => {
    setServiceDetail((prev) => ({ ...prev, [field]: value }));
  };

  const updatePayment = (field, value) => {
    setPayment((prev) => ({ ...prev, [field]: value }));
  };

  const updateRow = (index, field, value) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () => {
    setRows((prev) => [...prev, createBlankRow()]);
  };

  const removeRow = (index) => {
    if (rows.length === 1) {
      if (isServicing) {
        setRows([createServiceRow(serviceType)]);
      } else {
        setRows([createBlankRow()]);
      }
      return;
    }
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleJobTypeChange = (value) => {
    setJobType(value);
    setSuccessMessage('');
    setErrorMessage('');
    setCreatedInvoice(null);

    if (value === 'SERVICING') {
      setServiceType('REGULAR');
      setRows([createServiceRow('REGULAR')]);
    } else {
      setRows([createBlankRow()]);
    }
  };

  const handleServiceTypeChange = (value) => {
    setServiceType(value);
    setRows([createServiceRow(value)]);
  };

  const validateForm = () => {
    if (!customer.customer_name.trim()) {
      return 'Customer name is required.';
    }

    const validRows = rows.filter(
      (row) => row.name.trim() && (parseFloat(row.quantity || 0) || 0) > 0
    );

    if (validRows.length === 0) {
      return 'Please add at least one valid row.';
    }

    if (isServicing) {
      if (!serviceDetail.service_at_km) return 'Service At KM is required.';
      if (!serviceDetail.next_service_at_km) return 'Next Service At KM is required.';
      if (!serviceDetail.next_service_date) return 'Next Service Date is required.';
    }

    return null;
  };

  const buildPayload = () => {
    const validRows = rows
      .filter((row) => row.name.trim() && (parseFloat(row.quantity || 0) || 0) > 0)
      .map((row) => ({
        item_type: row.item_type || 'MANUAL',
        source_type: row.source_type || 'MANUAL',
        source_id: row.source_id || null,
        name: row.name.trim(),
        description: row.description?.trim() || '',
        quantity: parseFloat(row.quantity || 0) || 1,
        unit_price: parseFloat(row.unit_price || 0) || 0,
        discount: parseFloat(row.discount || 0) || 0,
        gst_included: !!row.gst_included,
      }));

    let invoiceType = 'CUSTOM';
    if (isServicing) invoiceType = 'SERVICING';
    if (isWorkshop) invoiceType = 'REPAIR';
    if (isPartsSale) invoiceType = 'USED_PART';

    const combinedNotes = [
      documentType === 'QUOTE' ? 'Document Type: QUOTE' : 'Document Type: TAX INVOICE',
      isServicing ? `Service Type: ${serviceType}` : '',
      payment.notes,
    ]
      .filter(Boolean)
      .join('\n\n');

    const payload = {
      invoice_type: invoiceType,

      customer_name: customer.customer_name || 'Walk-in Customer',
      customer_phone: customer.customer_phone || '',
      customer_email: customer.customer_email || '',
      customer_address: customer.customer_address || '',
      customer_company: '',
      customer_abn: '',

      rego: showVehicleDetails ? vehicle.rego || '' : '',
      make: showVehicleDetails ? vehicle.make || '' : '',
      model: showVehicleDetails ? vehicle.model || '' : '',
      year: null,
      vin: showVehicleDetails ? vehicle.vin || '' : '',
      odometer:
        showVehicleDetails && vehicle.odometer
          ? parseInt(vehicle.odometer, 10)
          : null,

      paid_amount: documentType === 'QUOTE' ? 0 : parseFloat(payment.paid_amount || 0) || 0,
      payment_method: payment.payment_method || '',
      notes: combinedNotes,

      items: validRows,
    };

    if (isServicing) {
      payload.service_detail = {
        service_at_km: serviceDetail.service_at_km
          ? parseInt(serviceDetail.service_at_km, 10)
          : null,
        next_service_at_km: serviceDetail.next_service_at_km
          ? parseInt(serviceDetail.next_service_at_km, 10)
          : null,
        next_service_date: serviceDetail.next_service_date || null,
        oil_grade: '',
        service_notes: serviceDetail.notes || '',
        recommendations: '',
      };
    }

    return payload;
  };

  const handleCreateDocument = async () => {
    setSuccessMessage('');
    setErrorMessage('');

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setLoading(true);

    try {
      const payload = buildPayload();
      const res = await axios.post(`${API_URL}/api/invoices/`, payload);
      setCreatedInvoice(res.data);
      setSuccessMessage(
        `${documentType === 'QUOTE' ? 'Quote' : 'Tax Invoice'} ${res.data.invoice_number} created successfully.`
      );
    } catch (error) {
      console.error(error);
      const apiError =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        JSON.stringify(error?.response?.data || {}) ||
        'Error creating document.';
      setErrorMessage(apiError);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    const invoiceId = createdInvoice?.id;
    if (!invoiceId) return;

    if (!customer.customer_email?.trim()) {
      alert('Customer email is required.');
      return;
    }

    try {
      setEmailSending(true);
      await axios.post(`${API_URL}/api/invoices/${invoiceId}/send-email/`, {
        email: customer.customer_email.trim(),
      });
      alert('Invoice sent to customer email.');
    } catch (err) {
      console.error(err?.response?.data || err);
      alert(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          'Failed to send email. Check backend endpoint.'
      );
    } finally {
      setEmailSending(false);
    }
  };

  const goToInvoice = () => {
    if (!createdInvoice?.id) return;
    navigate(`/sales/${createdInvoice.id}`);
  };

  const goToDashboard = () => {
    navigate('/sales-dashboard');
  };

  const openWhatsApp = () => {
    const phone = String(customer.customer_phone || '').replace(/\D/g, '');
    if (!phone) {
      alert('Customer phone is required for WhatsApp.');
      return;
    }

    if (!createdInvoice?.id) {
      alert('Create invoice first.');
      return;
    }

    const fullNumber = phone.startsWith('61')
      ? phone
      : phone.startsWith('0')
      ? `61${phone.slice(1)}`
      : phone;

    const docNumber = createdInvoice?.invoice_number || 'your document';
    const invoiceLink = `${FRONTEND_URL}/sales/${createdInvoice.id}`;
    const message = `Hi ${customer.customer_name || ''},

Your ${documentType === 'QUOTE' ? 'quote' : 'invoice'} from Yaris Autocare is ready.

Document No: ${docNumber}

View here:
${invoiceLink}

Thank you,
Yaris Autocare`;

    window.open(`https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const resetForm = () => {
    setDocumentType('INVOICE');
    setJobType('SERVICING');
    setServiceType('REGULAR');
    setCustomer({
      customer_name: 'Walk-in Customer',
      customer_phone: '',
      customer_email: '',
      customer_address: '',
    });
    setVehicle({
      rego: '',
      make: '',
      model: '',
      vin: '',
      odometer: '',
    });
    setServiceDetail({
      service_at_km: '',
      next_service_at_km: '',
      next_service_date: '',
      notes: '',
    });
    setPayment({
      paid_amount: '',
      payment_method: 'Cash',
      notes: '',
    });
    setRows([createServiceRow('REGULAR')]);
    setCreatedInvoice(null);
    setSuccessMessage('');
    setErrorMessage('');
  };

  return (
    <div style={pageWrap}>
      <div style={headerBar}>
        <div>
          <h1 style={mainTitle}>Invoice Creator</h1>
          <p style={subTitle}>
            Premium quick-create workflow for servicing, workshop jobs and parts sales.
          </p>
        </div>

        <div style={headerActions}>
          <button type="button" style={headerSecondaryBtn} onClick={goToDashboard}>
            <LayoutList size={15} />
            Dashboard
          </button>
          <div style={headerBadge}>
            <Receipt size={16} />
            <span>Yaris Autocare</span>
          </div>
        </div>
      </div>

      {!!successMessage && (
        <div style={successBox}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
          {createdInvoice?.id && (
            <div style={successActions}>
              <button type="button" style={successActionBtn} onClick={goToInvoice}>
                <Eye size={14} />
                View
              </button>
              <button type="button" style={successActionBtnAlt} onClick={openWhatsApp}>
                <MessageCircle size={14} />
                WhatsApp
              </button>
              <button
                type="button"
                style={successActionBtnAlt}
                onClick={handleSendEmail}
                disabled={emailSending}
              >
                <Send size={14} />
                {emailSending ? 'Sending...' : 'Email'}
              </button>
            </div>
          )}
        </div>
      )}

      {!!errorMessage && <div style={errorBox}>{errorMessage}</div>}

      <div style={layoutGrid}>
        <div style={mainColumn}>
          <SectionCard title="Document Type" icon={<FileText size={16} color="#ef4444" />}>
            <div style={choiceGrid2}>
              {documentTypeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDocumentType(option.value)}
                  style={{
                    ...choiceBtn,
                    ...(documentType === option.value ? choiceBtnActive : {}),
                  }}
                >
                  <div style={choiceBtnTitle}>{option.label}</div>
                  <div style={choiceBtnText}>
                    {option.value === 'INVOICE' ? 'Final billing document' : 'Save as quotation'}
                  </div>
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Job Type" icon={<Settings size={16} color="#ef4444" />}>
            <div style={choiceGrid3}>
              {jobTypeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleJobTypeChange(option.value)}
                  style={{
                    ...choiceBtn,
                    ...(jobType === option.value ? choiceBtnActive : {}),
                  }}
                >
                  <div style={choiceBtnTitle}>{option.label}</div>
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Customer Details" icon={<User size={16} color="#ef4444" />}>
            <div style={fieldGrid2}>
              <InputField
                icon={<User size={14} />}
                labelText="Customer Name"
                value={customer.customer_name}
                onChange={(e) => updateCustomer('customer_name', e.target.value)}
                placeholder="Walk-in Customer"
              />
              <InputField
                icon={<Phone size={14} />}
                labelText="Phone"
                value={customer.customer_phone}
                onChange={(e) => updateCustomer('customer_phone', e.target.value)}
                placeholder="04xxxxxxxx"
              />
              <InputField
                icon={<Mail size={14} />}
                labelText="Email"
                value={customer.customer_email}
                onChange={(e) => updateCustomer('customer_email', e.target.value)}
                placeholder="customer@email.com"
              />
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={label}>Address</label>
                <div style={inputWrap}>
                  <MapPin size={14} style={inputIcon} />
                  <textarea
                    value={customer.customer_address}
                    onChange={(e) => updateCustomer('customer_address', e.target.value)}
                    placeholder="Customer address"
                    style={textarea}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          {showVehicleDetails && (
            <SectionCard title="Vehicle Details" icon={<Car size={16} color="#ef4444" />}>
              <div style={fieldGrid3}>
                <InputField
                  icon={<Car size={14} />}
                  labelText="Rego"
                  value={vehicle.rego}
                  onChange={(e) => updateVehicle('rego', e.target.value)}
                  placeholder="ABC123"
                />
                <InputField
                  icon={<Car size={14} />}
                  labelText="Make"
                  value={vehicle.make}
                  onChange={(e) => updateVehicle('make', e.target.value)}
                  placeholder="Toyota"
                />
                <InputField
                  icon={<Car size={14} />}
                  labelText="Model"
                  value={vehicle.model}
                  onChange={(e) => updateVehicle('model', e.target.value)}
                  placeholder="Yaris"
                />
                <InputField
                  icon={<Hash size={14} />}
                  labelText="VIN"
                  value={vehicle.vin}
                  onChange={(e) => updateVehicle('vin', e.target.value)}
                  placeholder="Vehicle VIN"
                />
                <InputField
                  icon={<Hash size={14} />}
                  labelText="Odometer"
                  value={vehicle.odometer}
                  onChange={(e) => updateVehicle('odometer', e.target.value)}
                  placeholder="62585"
                  type="number"
                />
              </div>
            </SectionCard>
          )}

          {isServicing && (
            <SectionCard title="Service Details" icon={<Wrench size={16} color="#ef4444" />}>
              <div style={fieldGrid4}>
                <div>
                  <label style={label}>Service Type</label>
                  <select
                    value={serviceType}
                    onChange={(e) => handleServiceTypeChange(e.target.value)}
                    style={input}
                  >
                    {serviceTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <InputField
                  icon={<Hash size={14} />}
                  labelText="Service At KM"
                  value={serviceDetail.service_at_km}
                  onChange={(e) => updateServiceDetail('service_at_km', e.target.value)}
                  placeholder="62585"
                  type="number"
                />
                <InputField
                  icon={<Hash size={14} />}
                  labelText="Next Service At KM"
                  value={serviceDetail.next_service_at_km}
                  onChange={(e) => updateServiceDetail('next_service_at_km', e.target.value)}
                  placeholder="72585"
                  type="number"
                />
                <InputField
                  icon={<CalendarDays size={14} />}
                  labelText="Next Service Date"
                  value={serviceDetail.next_service_date}
                  onChange={(e) => updateServiceDetail('next_service_date', e.target.value)}
                  type="date"
                />
              </div>

              <div style={{ marginTop: '14px' }}>
                <label style={label}>Service Notes</label>
                <div style={inputWrap}>
                  <StickyNote size={14} style={inputIcon} />
                  <textarea
                    value={serviceDetail.notes}
                    onChange={(e) => updateServiceDetail('notes', e.target.value)}
                    placeholder="Extra service notes"
                    style={textarea}
                    rows={3}
                  />
                </div>
              </div>
            </SectionCard>
          )}

          <SectionCard
            title={
              isServicing
                ? 'Invoice Items'
                : isPartsSale
                ? 'Parts Rows'
                : 'Workshop Rows'
            }
            icon={
              isPartsSale ? (
                <Package size={16} color="#ef4444" />
              ) : isWorkshop ? (
                <Wrench size={16} color="#ef4444" />
              ) : (
                <Receipt size={16} color="#ef4444" />
              )
            }
            actions={
              <button type="button" style={addBtn} onClick={addRow}>
                <Plus size={14} />
                Add Row
              </button>
            }
          >
            <div style={rowsWrap}>
              {lineItems.map((row, index) => (
                <div key={index} style={rowCard}>
                  <div style={rowTop}>
                    <div style={rowTitle}>
                      {isServicing && index === 0 ? 'Primary Service Row' : `Row ${index + 1}`}
                    </div>
                    <button type="button" style={removeBtn} onClick={() => removeRow(index)}>
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div style={fieldGridCompact}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <InputField
                        labelText="Title"
                        value={row.name}
                        onChange={(e) => updateRow(index, 'name', e.target.value)}
                        placeholder="Description"
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={label}>
                        {isServicing && index === 0 ? 'Checklist / Description' : 'Details'}
                      </label>
                      <textarea
                        value={row.description}
                        onChange={(e) => updateRow(index, 'description', e.target.value)}
                        placeholder="Extra details"
                        style={textareaPlain}
                        rows={isServicing && index === 0 ? 7 : 3}
                      />
                    </div>

                    <InputField
                      labelText="Qty"
                      value={row.quantity}
                      onChange={(e) => updateRow(index, 'quantity', e.target.value)}
                      placeholder="1"
                      type="number"
                    />
                    <InputField
                      labelText="Amount"
                      value={row.unit_price}
                      onChange={(e) => updateRow(index, 'unit_price', e.target.value)}
                      placeholder="0.00"
                      type="number"
                    />
                    <InputField
                      labelText="Discount"
                      value={row.discount}
                      onChange={(e) => updateRow(index, 'discount', e.target.value)}
                      placeholder="0.00"
                      type="number"
                    />

                    <div>
                      <label style={label}>GST</label>
                      <select
                        value={row.gst_included ? 'yes' : 'no'}
                        onChange={(e) => updateRow(index, 'gst_included', e.target.value === 'yes')}
                        style={input}
                      >
                        <option value="yes">Included</option>
                        <option value="no">No GST</option>
                      </select>
                    </div>
                  </div>

                  <div style={lineTotalInline}>
                    <span>Line Total</span>
                    <strong>${row.lineTotal.toFixed(2)}</strong>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div style={sideColumn}>
          <SectionCard title="Payment & Notes" icon={<Receipt size={16} color="#ef4444" />}>
            <div style={fieldGrid1}>
              {documentType === 'INVOICE' && (
                <InputField
                  labelText="Paid Amount"
                  value={payment.paid_amount}
                  onChange={(e) => updatePayment('paid_amount', e.target.value)}
                  placeholder="0.00"
                  type="number"
                />
              )}

              <div>
                <label style={label}>Payment Method</label>
                <select
                  value={payment.payment_method}
                  onChange={(e) => updatePayment('payment_method', e.target.value)}
                  style={input}
                >
                  {paymentMethodOptions.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={label}>Document Notes</label>
                <textarea
                  value={payment.notes}
                  onChange={(e) => updatePayment('notes', e.target.value)}
                  placeholder="Any extra note"
                  style={textareaPlain}
                  rows={4}
                />
              </div>
            </div>
          </SectionCard>

          <div style={summaryCard}>
            <div style={summaryDocType}>
              {documentType === 'QUOTE' ? 'QUOTE' : 'TAX INVOICE'}
            </div>

            <div style={summaryJobType}>
              {jobType === 'SERVICING'
                ? `${serviceType === 'MAJOR' ? 'Major' : 'Regular'} Service`
                : jobType === 'PARTS_SALE'
                ? 'Parts Sale'
                : 'Workshop Invoice'}
            </div>

            <div style={summaryRow}>
              <span>Subtotal</span>
              <strong>${subtotal.toFixed(2)}</strong>
            </div>
            <div style={summaryRow}>
              <span>GST Included</span>
              <strong>${gstAmount.toFixed(2)}</strong>
            </div>
            <div style={summaryRow}>
              <span>Paid</span>
              <strong>
                $
                {documentType === 'QUOTE'
                  ? '0.00'
                  : (parseFloat(payment.paid_amount || 0) || 0).toFixed(2)}
              </strong>
            </div>
            <div style={summaryRowTotal}>
              <span>Total</span>
              <strong>${totalAmount.toFixed(2)}</strong>
            </div>
            <div style={summaryRowBalance}>
              <span>Balance Due</span>
              <strong>${balanceDue.toFixed(2)}</strong>
            </div>

            <button
              type="button"
              style={primaryBtn}
              onClick={handleCreateDocument}
              disabled={loading}
            >
              <Save size={16} />
              {loading ? 'Saving...' : documentType === 'QUOTE' ? 'Create Quote' : 'Create Invoice'}
            </button>

            <button type="button" style={secondaryBtn} onClick={goToDashboard}>
              <LayoutList size={15} />
              Open Dashboard
            </button>

            <button type="button" style={ghostBtn} onClick={resetForm}>
              Reset Form
            </button>
          </div>

          {createdInvoice && (
            <SectionCard title="Last Created Document" icon={<FileText size={16} color="#ef4444" />}>
              <div style={previewCard}>
                <PreviewRow label="Number" value={createdInvoice.invoice_number} />
                <PreviewRow label="Customer" value={createdInvoice.customer_name} />
                <PreviewRow
                  label="Total"
                  value={`$${parseFloat(createdInvoice.total_amount || 0).toFixed(2)}`}
                />
                <div style={previewActions}>
                  <button type="button" style={previewPrimaryBtn} onClick={goToInvoice}>
                    <Eye size={14} />
                    View
                  </button>
                  <button type="button" style={previewSecondaryBtn} onClick={openWhatsApp}>
                    <MessageCircle size={14} />
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    style={previewSecondaryBtn}
                    onClick={handleSendEmail}
                    disabled={emailSending}
                  >
                    <Send size={14} />
                    Email
                  </button>
                </div>
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, icon, children, actions }) {
  return (
    <div style={cardStyle}>
      <div style={sectionHeader}>
        <div style={sectionTitleWrap}>
          {icon}
          <h3 style={sectionTitle}>{title}</h3>
        </div>
        {actions ? <div>{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}

function InputField({
  labelText,
  icon,
  value,
  onChange,
  placeholder,
  type = 'text',
}) {
  return (
    <div>
      <label style={label}>{labelText}</label>
      <div style={inputWrap}>
        {icon ? <span style={inputIcon}>{icon}</span> : null}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={icon ? inputWithIcon : inputBare}
        />
      </div>
    </div>
  );
}

function PreviewRow({ label, value }) {
  return (
    <div style={previewRow}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const pageWrap = {
  padding: '22px',
  background: COLORS.bg,
  minHeight: '100vh',
};

const headerBar = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '18px',
  flexWrap: 'wrap',
  marginBottom: '18px',
};

const headerActions = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  flexWrap: 'wrap',
};

const mainTitle = {
  margin: 0,
  fontSize: '26px',
  fontWeight: 800,
  color: COLORS.dark,
  letterSpacing: '-0.03em',
};

const subTitle = {
  margin: '6px 0 0',
  color: COLORS.muted,
  fontSize: '13px',
};

const headerSecondaryBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  border: '1px solid #dbe3ee',
  background: '#fff',
  color: COLORS.dark,
  borderRadius: '12px',
  padding: '10px 13px',
  fontWeight: 700,
  fontSize: '13px',
  cursor: 'pointer',
};

const headerBadge = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: COLORS.dark,
  color: '#fff',
  borderRadius: '999px',
  padding: '9px 14px',
  fontWeight: 700,
  fontSize: '13px',
};

const layoutGrid = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 0.8fr)',
  gap: '18px',
};

const mainColumn = {
  display: 'flex',
  flexDirection: 'column',
  gap: '18px',
};

const sideColumn = {
  display: 'flex',
  flexDirection: 'column',
  gap: '18px',
};

const cardStyle = {
  background: COLORS.card,
  border: '1px solid #e2e8f0',
  borderRadius: '20px',
  padding: '18px',
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
};

const sectionHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap',
  marginBottom: '14px',
};

const sectionTitleWrap = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const sectionTitle = {
  margin: 0,
  fontSize: '15px',
  fontWeight: 700,
  color: COLORS.dark,
};

const choiceGrid2 = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '12px',
};

const choiceGrid3 = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '12px',
};

const choiceBtn = {
  textAlign: 'left',
  border: '1px solid #e2e8f0',
  background: '#fff',
  borderRadius: '16px',
  padding: '16px',
  cursor: 'pointer',
};

const choiceBtnActive = {
  border: '1px solid #ef4444',
  background: '#fff5f5',
  boxShadow: '0 0 0 3px rgba(239,68,68,0.06)',
};

const choiceBtnTitle = {
  fontSize: '14px',
  fontWeight: 700,
  color: '#111827',
};

const choiceBtnText = {
  fontSize: '12px',
  color: COLORS.muted,
  marginTop: '5px',
};

const label = {
  display: 'block',
  marginBottom: '7px',
  fontSize: '11px',
  fontWeight: 700,
  color: COLORS.soft,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
};

const fieldGrid1 = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '14px',
};

const fieldGrid2 = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '14px',
};

const fieldGrid3 = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '14px',
};

const fieldGrid4 = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
  gap: '14px',
};

const fieldGridCompact = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: '14px',
};

const inputWrap = {
  position: 'relative',
};

const inputIcon = {
  position: 'absolute',
  left: '12px',
  top: '12px',
  color: COLORS.soft,
  display: 'flex',
  alignItems: 'center',
};

const sharedInputStyle = {
  width: '100%',
  border: '1px solid #dbe3ee',
  borderRadius: '12px',
  fontSize: '13px',
  background: '#fff',
  color: COLORS.dark,
  outline: 'none',
  boxSizing: 'border-box',
};

const input = {
  ...sharedInputStyle,
  padding: '11px 12px',
};

const inputBare = {
  ...sharedInputStyle,
  padding: '11px 12px',
};

const inputWithIcon = {
  ...sharedInputStyle,
  padding: '11px 12px 11px 38px',
};

const textarea = {
  ...sharedInputStyle,
  padding: '11px 12px 11px 38px',
  minHeight: '90px',
  resize: 'vertical',
  fontFamily: 'inherit',
};

const textareaPlain = {
  ...sharedInputStyle,
  padding: '11px 12px',
  minHeight: '84px',
  resize: 'vertical',
  fontFamily: 'inherit',
};

const addBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  border: 'none',
  background: COLORS.primary,
  color: '#fff',
  borderRadius: '10px',
  padding: '9px 12px',
  fontWeight: 700,
  fontSize: '12px',
  cursor: 'pointer',
};

const rowsWrap = {
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
};

const rowCard = {
  border: '1px solid #e2e8f0',
  borderRadius: '16px',
  padding: '14px',
  background: '#fcfcfd',
};

const rowTop = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '12px',
};

const rowTitle = {
  fontSize: '13px',
  fontWeight: 700,
  color: '#111827',
};

const removeBtn = {
  width: '34px',
  height: '34px',
  borderRadius: '10px',
  border: '1px solid #fecaca',
  background: '#fff5f5',
  color: '#dc2626',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

const lineTotalInline = {
  marginTop: '12px',
  borderTop: `1px solid ${COLORS.borderSoft}`,
  paddingTop: '10px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '13px',
  color: COLORS.muted,
};

const summaryCard = {
  background: COLORS.dark,
  color: '#fff',
  borderRadius: '20px',
  padding: '18px',
  boxShadow: '0 14px 30px rgba(15, 23, 42, 0.16)',
};

const summaryDocType = {
  fontSize: '11px',
  letterSpacing: '0.08em',
  color: '#fca5a5',
  fontWeight: 800,
  marginBottom: '6px',
};

const summaryJobType = {
  fontSize: '16px',
  fontWeight: 800,
  marginBottom: '14px',
};

const summaryRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '9px 0',
  borderBottom: '1px solid rgba(148, 163, 184, 0.16)',
  fontSize: '13px',
};

const summaryRowTotal = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '14px 0 8px',
  fontSize: '17px',
  fontWeight: 800,
};

const summaryRowBalance = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '6px 0 14px',
  fontSize: '15px',
  color: '#fca5a5',
  fontWeight: 800,
};

const primaryBtn = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
  padding: '14px',
  background: COLORS.primary,
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  fontWeight: 800,
  fontSize: '14px',
  cursor: 'pointer',
  marginTop: '6px',
};

const secondaryBtn = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
  padding: '12px',
  marginTop: '10px',
  background: '#fff',
  color: COLORS.dark,
  border: '1px solid rgba(203, 213, 225, 0.25)',
  borderRadius: '12px',
  fontWeight: 700,
  cursor: 'pointer',
};

const ghostBtn = {
  width: '100%',
  padding: '12px',
  marginTop: '10px',
  background: 'transparent',
  color: '#cbd5e1',
  border: '1px solid rgba(203, 213, 225, 0.25)',
  borderRadius: '12px',
  fontWeight: 700,
  cursor: 'pointer',
};

const previewCard = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  border: '1px solid #e2e8f0',
  borderRadius: '14px',
  padding: '14px',
  background: '#f8fafc',
};

const previewRow = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '14px',
  fontSize: '13px',
  color: '#334155',
};

const previewActions = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
  marginTop: '6px',
};

const previewPrimaryBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  border: 'none',
  background: COLORS.primary,
  color: '#fff',
  borderRadius: '10px',
  padding: '10px 12px',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: '12px',
};

const previewSecondaryBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  border: '1px solid #dbe3ee',
  background: '#fff',
  color: COLORS.dark,
  borderRadius: '10px',
  padding: '10px 12px',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: '12px',
};

const successBox = {
  marginBottom: '16px',
  background: COLORS.successBg,
  border: '1px solid #bbf7d0',
  color: COLORS.success,
  padding: '12px 14px',
  borderRadius: '14px',
  fontWeight: 700,
};

const successActions = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
  marginTop: '10px',
};

const successActionBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  border: 'none',
  background: '#16a34a',
  color: '#fff',
  borderRadius: '10px',
  padding: '9px 11px',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: '12px',
};

const successActionBtnAlt = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  border: '1px solid #86efac',
  background: '#fff',
  color: '#166534',
  borderRadius: '10px',
  padding: '9px 11px',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: '12px',
};

const errorBox = {
  marginBottom: '16px',
  background: COLORS.dangerBg,
  border: '1px solid #fecdd3',
  color: COLORS.danger,
  padding: '12px 14px',
  borderRadius: '14px',
  fontWeight: 700,
};
