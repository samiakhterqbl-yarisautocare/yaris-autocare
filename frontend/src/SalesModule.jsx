import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Receipt,
  User,
  Phone,
  Mail,
  MapPin,
  Car,
  FileText,
  Wrench,
  Plus,
  Trash2,
  Save,
  Building2,
  Hash,
  CreditCard,
  StickyNote,
  CalendarDays,
  Eye,
  LayoutList,
  ChevronDown,
} from 'lucide-react';

const API_URL = 'https://yaris-autocare-production.up.railway.app';

const invoiceTypeOptions = [
  { value: 'CUSTOM', label: 'Custom Invoice' },
  { value: 'USED_PART', label: 'Used Part Sale' },
  { value: 'AFTERMARKET', label: 'Aftermarket Part Sale' },
  { value: 'DISMANTLE', label: 'Dismantle Part Sale' },
  { value: 'SERVICING', label: 'Servicing' },
  { value: 'DIAGNOSTIC', label: 'Diagnostic' },
  { value: 'LABOUR', label: 'Labour' },
  { value: 'REPAIR', label: 'Mechanical Repair' },
];

const paymentMethodOptions = [
  'Cash',
  'Bank Transfer',
  'Card',
  'EFTPOS',
  'Pending',
];

const serviceTemplateOptions = [
  { value: 'CUSTOM', label: 'Custom Service' },
  { value: 'REGULAR', label: 'Regular Service' },
  { value: 'MAJOR', label: 'Major Service' },
];

const createBlankItem = () => ({
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

const majorServiceTemplate = [
  'Oil filter replacement',
  'Engine oil change',
  'New Sumpplug washer',
  'Top-ups (brake, power steering, coolant & windscreen washer fluid)',
  'Safety checks (Underbody components, Brakes, Globes, horn & tyre pressure)',
  'Check globes',
  'Check hoses',
  'Check drive belt',
  'Battery load test',
  'Check engine oil leaks',
  'Check transmission oil leaks',
  'Check transmission cooler pipes',
  'Check engine mounts & transmission mounts',
  'Check exhaust',
  'Check drive shafts',
  'Check front shock absorbers',
  'Check rear shock absorbers',
  'Check ball joints & tie rods',
  'Check suspension bushes',
  'Check tyre pressure',
  'Check front brake pads & rotors',
];

const regularServiceTemplate = [
  'Oil filter replacement',
  'Engine oil change',
  'New Sumpplug washer',
  'Top-ups (brake, power steering, coolant & windscreen washer fluid)',
  'Safety checks (Underbody components, Brakes, Globes, horn & tyre pressure)',
  'Check globes',
  'Check hoses',
  'Check drive belt',
  'Battery load test',
  'Check tyre pressure',
  'Check front brake pads & rotors',
];

export default function SalesModule() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [invoiceType, setInvoiceType] = useState('CUSTOM');
  const [serviceTemplateType, setServiceTemplateType] = useState('CUSTOM');

  const [customer, setCustomer] = useState({
    customer_name: 'Walk-in Customer',
    customer_phone: '',
    customer_email: '',
    customer_address: '',
    customer_company: '',
    customer_abn: '',
  });

  const [vehicle, setVehicle] = useState({
    rego: '',
    make: '',
    model: '',
    year: '',
    vin: '',
    odometer: '',
  });

  const [serviceDetail, setServiceDetail] = useState({
    service_at_km: '',
    next_service_at_km: '',
    next_service_date: '',
    oil_grade: '',
    service_notes: '',
    recommendations: '',
  });

  const [payment, setPayment] = useState({
    paid_amount: '',
    payment_method: 'Cash',
    notes: '',
  });

  const [items, setItems] = useState([createBlankItem()]);
  const [createdInvoice, setCreatedInvoice] = useState(null);

  const isServicing = invoiceType === 'SERVICING';

  const lineItemsWithTotals = useMemo(() => {
    return items.map((item) => {
      const qty = parseFloat(item.quantity || 0) || 0;
      const unitPrice = parseFloat(item.unit_price || 0) || 0;
      const discount = parseFloat(item.discount || 0) || 0;
      const lineTotal = Math.max((qty * unitPrice) - discount, 0);
      return { ...item, lineTotal };
    });
  }, [items]);

  const subtotal = useMemo(
    () => lineItemsWithTotals.reduce((sum, item) => sum + item.lineTotal, 0),
    [lineItemsWithTotals]
  );

  const gstAmount = useMemo(
    () =>
      lineItemsWithTotals.reduce((sum, item) => {
        if (!item.gst_included) return sum;
        return sum + item.lineTotal / 11;
      }, 0),
    [lineItemsWithTotals]
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

  const updateItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addItemRow = () => {
    setItems((prev) => [...prev, createBlankItem()]);
  };

  const removeItemRow = (index) => {
    if (items.length === 1) {
      setItems([createBlankItem()]);
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const buildTemplateRows = (templateItems) =>
    templateItems.map((text) => ({
      item_type: 'SERVICE',
      source_type: 'MANUAL',
      source_id: null,
      name: text,
      description: '',
      quantity: 1,
      unit_price: 0,
      discount: 0,
      gst_included: true,
    }));

  const applyServiceTemplate = (templateType) => {
    setServiceTemplateType(templateType);

    if (templateType === 'MAJOR') {
      setItems(buildTemplateRows(majorServiceTemplate));
      return;
    }

    if (templateType === 'REGULAR') {
      setItems(buildTemplateRows(regularServiceTemplate));
      return;
    }

    setItems([createBlankItem()]);
  };

  const handleInvoiceTypeChange = (value) => {
    setInvoiceType(value);

    if (value !== 'SERVICING') {
      setServiceTemplateType('CUSTOM');
    }
  };

  const resetForm = () => {
    setInvoiceType('CUSTOM');
    setServiceTemplateType('CUSTOM');
    setCustomer({
      customer_name: 'Walk-in Customer',
      customer_phone: '',
      customer_email: '',
      customer_address: '',
      customer_company: '',
      customer_abn: '',
    });
    setVehicle({
      rego: '',
      make: '',
      model: '',
      year: '',
      vin: '',
      odometer: '',
    });
    setServiceDetail({
      service_at_km: '',
      next_service_at_km: '',
      next_service_date: '',
      oil_grade: '',
      service_notes: '',
      recommendations: '',
    });
    setPayment({
      paid_amount: '',
      payment_method: 'Cash',
      notes: '',
    });
    setItems([createBlankItem()]);
    setCreatedInvoice(null);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const validateBeforeSubmit = () => {
    if (!customer.customer_name.trim()) {
      return 'Customer name is required.';
    }

    const validItems = items.filter(
      (item) => item.name.trim() && (parseFloat(item.quantity || 0) || 0) > 0
    );

    if (validItems.length === 0) {
      return 'Please add at least one valid invoice item.';
    }

    if (isServicing) {
      if (!serviceDetail.service_at_km) {
        return 'Service At KM is required for servicing.';
      }
      if (!serviceDetail.next_service_at_km) {
        return 'Next Service At KM is required for servicing.';
      }
      if (!serviceDetail.next_service_date) {
        return 'Next Service Date is required for servicing.';
      }
    }

    return null;
  };

  const buildPayload = () => {
    const validItems = items
      .filter((item) => item.name.trim() && (parseFloat(item.quantity || 0) || 0) > 0)
      .map((item) => ({
        item_type: item.item_type || 'MANUAL',
        source_type: item.source_type || 'MANUAL',
        source_id: item.source_id ? parseInt(item.source_id, 10) : null,
        name: item.name.trim(),
        description: item.description?.trim() || '',
        quantity: parseFloat(item.quantity || 0) || 1,
        unit_price: parseFloat(item.unit_price || 0) || 0,
        discount: parseFloat(item.discount || 0) || 0,
        gst_included: !!item.gst_included,
      }));

    const notesWithServiceTemplate =
      isServicing && serviceTemplateType !== 'CUSTOM'
        ? `${payment.notes || ''}${payment.notes ? '\n\n' : ''}Service Template: ${serviceTemplateType}`
        : payment.notes || '';

    const payload = {
      invoice_type: invoiceType,

      customer_name: customer.customer_name || 'Walk-in Customer',
      customer_phone: customer.customer_phone || '',
      customer_email: customer.customer_email || '',
      customer_address: customer.customer_address || '',
      customer_company: customer.customer_company || '',
      customer_abn: customer.customer_abn || '',

      rego: vehicle.rego || '',
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year ? parseInt(vehicle.year, 10) : null,
      vin: vehicle.vin || '',
      odometer: vehicle.odometer ? parseInt(vehicle.odometer, 10) : null,

      paid_amount: parseFloat(payment.paid_amount || 0) || 0,
      payment_method: payment.payment_method || '',
      notes: notesWithServiceTemplate,

      items: validItems,
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
        oil_grade: serviceDetail.oil_grade || '',
        service_notes: serviceDetail.service_notes || '',
        recommendations: serviceDetail.recommendations || '',
      };
    }

    return payload;
  };

  const handleCreateInvoice = async () => {
    setSuccessMessage('');
    setErrorMessage('');

    const validationError = validateBeforeSubmit();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setLoading(true);

    try {
      const payload = buildPayload();
      const res = await axios.post(`${API_URL}/api/invoices/`, payload);
      setCreatedInvoice(res.data);
      setSuccessMessage(`Invoice ${res.data.invoice_number} created successfully.`);
    } catch (error) {
      console.error(error);
      const apiError =
        error?.response?.data
          ? JSON.stringify(error.response.data)
          : 'Error creating invoice.';
      setErrorMessage(apiError);
    } finally {
      setLoading(false);
    }
  };

  const goToInvoice = () => {
    if (!createdInvoice?.id) return;
    navigate(`/sales/${createdInvoice.id}`);
  };

  const goToDashboard = () => {
    navigate('/sales-dashboard');
  };

  return (
    <div style={pageWrap}>
      <div style={headerBar}>
        <div>
          <h1 style={mainTitle}>Universal Sales & Invoice Module</h1>
          <p style={subTitle}>
            Create professional invoices for parts, servicing, diagnostics, labour and workshop jobs.
          </p>
        </div>

        <div style={headerActions}>
          <button type="button" style={headerSecondaryBtn} onClick={goToDashboard}>
            <LayoutList size={16} />
            Invoices Dashboard
          </button>
          <div style={headerBadge}>
            <Receipt size={18} />
            <span>Yaris Autocare</span>
          </div>
        </div>
      </div>

      {!!successMessage && (
        <div style={successBox}>
          <div>{successMessage}</div>
          {createdInvoice?.id && (
            <div style={successActions}>
              <button type="button" style={successActionBtn} onClick={goToInvoice}>
                <Eye size={15} />
                View Invoice
              </button>
              <button type="button" style={successActionBtnAlt} onClick={goToDashboard}>
                <LayoutList size={15} />
                Open Dashboard
              </button>
            </div>
          )}
        </div>
      )}

      {!!errorMessage && <div style={errorBox}>{errorMessage}</div>}

      <div style={responsiveGrid}>
        <div style={leftColumn}>
          <SectionCard
            title="Invoice Type"
            icon={<FileText size={18} color="#ef4444" />}
          >
            <div style={fieldGrid2}>
              <div>
                <label style={label}>Select Invoice Type</label>
                <select
                  value={invoiceType}
                  onChange={(e) => handleInvoiceTypeChange(e.target.value)}
                  style={input}
                >
                  {invoiceTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={invoiceTypePreview}>
                <div style={invoiceTypePill}>{invoiceType.replaceAll('_', ' ')}</div>
                <div style={invoiceTypeText}>
                  Use this module for parts, labour, diagnostics, repairs and service invoices.
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Customer Details"
            icon={<User size={18} color="#ef4444" />}
          >
            <div style={fieldGrid2}>
              <InputField
                icon={<User size={15} />}
                labelText="Customer Name"
                value={customer.customer_name}
                onChange={(e) => updateCustomer('customer_name', e.target.value)}
                placeholder="Walk-in Customer"
              />
              <InputField
                icon={<Phone size={15} />}
                labelText="Phone"
                value={customer.customer_phone}
                onChange={(e) => updateCustomer('customer_phone', e.target.value)}
                placeholder="04xxxxxxxx"
              />
              <InputField
                icon={<Mail size={15} />}
                labelText="Email"
                value={customer.customer_email}
                onChange={(e) => updateCustomer('customer_email', e.target.value)}
                placeholder="customer@email.com"
              />
              <InputField
                icon={<Building2 size={15} />}
                labelText="Company"
                value={customer.customer_company}
                onChange={(e) => updateCustomer('customer_company', e.target.value)}
                placeholder="Business name"
              />
              <InputField
                icon={<Hash size={15} />}
                labelText="ABN"
                value={customer.customer_abn}
                onChange={(e) => updateCustomer('customer_abn', e.target.value)}
                placeholder="ABN"
              />
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={label}>Address</label>
                <div style={inputWrap}>
                  <MapPin size={15} style={inputIcon} />
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

          <SectionCard
            title="Vehicle / Job Details"
            icon={<Car size={18} color="#ef4444" />}
          >
            <div style={fieldGrid3}>
              <InputField
                icon={<Car size={15} />}
                labelText="Rego"
                value={vehicle.rego}
                onChange={(e) => updateVehicle('rego', e.target.value)}
                placeholder="ABC123"
              />
              <InputField
                icon={<Car size={15} />}
                labelText="Make"
                value={vehicle.make}
                onChange={(e) => updateVehicle('make', e.target.value)}
                placeholder="Toyota"
              />
              <InputField
                icon={<Car size={15} />}
                labelText="Model"
                value={vehicle.model}
                onChange={(e) => updateVehicle('model', e.target.value)}
                placeholder="Yaris"
              />
              <InputField
                icon={<Hash size={15} />}
                labelText="Year"
                value={vehicle.year}
                onChange={(e) => updateVehicle('year', e.target.value)}
                placeholder="2014"
                type="number"
              />
              <InputField
                icon={<Hash size={15} />}
                labelText="VIN"
                value={vehicle.vin}
                onChange={(e) => updateVehicle('vin', e.target.value)}
                placeholder="Vehicle VIN"
              />
              <InputField
                icon={<Hash size={15} />}
                labelText="Odometer"
                value={vehicle.odometer}
                onChange={(e) => updateVehicle('odometer', e.target.value)}
                placeholder="62585"
                type="number"
              />
            </div>
          </SectionCard>

          {isServicing && (
            <SectionCard
              title="Service Details"
              icon={<Wrench size={18} color="#ef4444" />}
              actions={
                <div style={serviceActionBar}>
                  <div style={serviceTemplateSelectWrap}>
                    <label style={miniInlineLabel}>Template</label>
                    <div style={serviceTemplateDropdownWrap}>
                      <ChevronDown size={14} style={serviceTemplateDropdownIcon} />
                      <select
                        value={serviceTemplateType}
                        onChange={(e) => applyServiceTemplate(e.target.value)}
                        style={serviceTemplateSelect}
                      >
                        {serviceTemplateOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              }
            >
              <div style={fieldGrid3}>
                <InputField
                  icon={<Hash size={15} />}
                  labelText="Service At KM"
                  value={serviceDetail.service_at_km}
                  onChange={(e) => updateServiceDetail('service_at_km', e.target.value)}
                  placeholder="62585"
                  type="number"
                />
                <InputField
                  icon={<Hash size={15} />}
                  labelText="Next Service At KM"
                  value={serviceDetail.next_service_at_km}
                  onChange={(e) => updateServiceDetail('next_service_at_km', e.target.value)}
                  placeholder="72585"
                  type="number"
                />
                <InputField
                  icon={<CalendarDays size={15} />}
                  labelText="Next Service Date"
                  value={serviceDetail.next_service_date}
                  onChange={(e) => updateServiceDetail('next_service_date', e.target.value)}
                  type="date"
                />
                <InputField
                  icon={<Wrench size={15} />}
                  labelText="Oil Grade"
                  value={serviceDetail.oil_grade}
                  onChange={(e) => updateServiceDetail('oil_grade', e.target.value)}
                  placeholder="5W-30"
                />

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={label}>Service Notes</label>
                  <div style={inputWrap}>
                    <StickyNote size={15} style={inputIcon} />
                    <textarea
                      value={serviceDetail.service_notes}
                      onChange={(e) => updateServiceDetail('service_notes', e.target.value)}
                      placeholder="Write service notes..."
                      style={textarea}
                      rows={3}
                    />
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={label}>Recommendations</label>
                  <div style={inputWrap}>
                    <StickyNote size={15} style={inputIcon} />
                    <textarea
                      value={serviceDetail.recommendations}
                      onChange={(e) => updateServiceDetail('recommendations', e.target.value)}
                      placeholder="Write recommendations for next visit..."
                      style={textarea}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          <SectionCard
            title={isServicing ? 'Service Items / Checklist' : 'Invoice Items'}
            icon={<Receipt size={18} color="#ef4444" />}
            actions={
              <button type="button" style={addBtn} onClick={addItemRow}>
                <Plus size={15} />
                Add Item
              </button>
            }
          >
            <div style={itemsWrap}>
              {lineItemsWithTotals.map((item, index) => (
                <div key={index} style={itemCard}>
                  <div style={itemRowTop}>
                    <div style={itemRowTitle}>Line Item #{index + 1}</div>
                    <button
                      type="button"
                      style={removeBtn}
                      onClick={() => removeItemRow(index)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div style={fieldGrid3}>
                    <div>
                      <label style={label}>Item Type</label>
                      <select
                        value={item.item_type}
                        onChange={(e) => updateItem(index, 'item_type', e.target.value)}
                        style={input}
                      >
                        <option value="MANUAL">Manual</option>
                        <option value="SERVICE">Service</option>
                        <option value="LABOUR">Labour</option>
                        <option value="STOCK">Stock</option>
                      </select>
                    </div>

                    <div>
                      <label style={label}>Source Type</label>
                      <select
                        value={item.source_type}
                        onChange={(e) => updateItem(index, 'source_type', e.target.value)}
                        style={input}
                      >
                        <option value="MANUAL">Manual</option>
                        <option value="USED_PART">Used Part</option>
                        <option value="AFTERMARKET">Aftermarket</option>
                        <option value="DISMANTLE">Dismantle</option>
                      </select>
                    </div>

                    <InputField
                      labelText="Source ID (optional)"
                      value={item.source_id || ''}
                      onChange={(e) => updateItem(index, 'source_id', e.target.value)}
                      placeholder="Stock item id"
                      type="number"
                    />

                    <div style={{ gridColumn: '1 / -1' }}>
                      <InputField
                        labelText="Item / Service Name"
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        placeholder="Enter item or service name"
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={label}>Description</label>
                      <textarea
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Optional line description"
                        style={textareaPlain}
                        rows={2}
                      />
                    </div>

                    <InputField
                      labelText="Quantity"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      placeholder="1"
                      type="number"
                    />
                    <InputField
                      labelText="Unit Price"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                      placeholder="0.00"
                      type="number"
                    />
                    <InputField
                      labelText="Discount"
                      value={item.discount}
                      onChange={(e) => updateItem(index, 'discount', e.target.value)}
                      placeholder="0.00"
                      type="number"
                    />

                    <div>
                      <label style={label}>GST Included</label>
                      <select
                        value={item.gst_included ? 'yes' : 'no'}
                        onChange={(e) =>
                          updateItem(index, 'gst_included', e.target.value === 'yes')
                        }
                        style={input}
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>

                    <div style={lineTotalBox}>
                      <div style={lineTotalLabel}>Line Total</div>
                      <div style={lineTotalValue}>${item.lineTotal.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div style={rightColumn}>
          <SectionCard
            title="Payment & Notes"
            icon={<CreditCard size={18} color="#ef4444" />}
          >
            <div style={fieldGrid1}>
              <InputField
                labelText="Paid Amount"
                value={payment.paid_amount}
                onChange={(e) => updatePayment('paid_amount', e.target.value)}
                placeholder="0.00"
                type="number"
              />

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
                <label style={label}>Internal / Invoice Notes</label>
                <textarea
                  value={payment.notes}
                  onChange={(e) => updatePayment('notes', e.target.value)}
                  placeholder="Write any notes here..."
                  style={textareaPlain}
                  rows={4}
                />
              </div>
            </div>
          </SectionCard>

          <div style={summaryCard}>
            <div style={summarySmall}>INVOICE SUMMARY</div>
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
              <strong>${(parseFloat(payment.paid_amount || 0) || 0).toFixed(2)}</strong>
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
              style={checkoutBtn}
              onClick={handleCreateInvoice}
              disabled={loading}
            >
              <Save size={18} />
              {loading ? 'Creating Invoice...' : 'Create Invoice'}
            </button>

            <button type="button" style={dashboardBtn} onClick={goToDashboard}>
              <LayoutList size={16} />
              Open Invoices Dashboard
            </button>

            <button type="button" style={resetBtn} onClick={resetForm}>
              Reset Form
            </button>
          </div>

          {createdInvoice && (
            <SectionCard
              title="Last Created Invoice"
              icon={<Receipt size={18} color="#ef4444" />}
            >
              <div style={invoicePreviewCard}>
                <div style={previewRow}>
                  <span>Invoice Number</span>
                  <strong>{createdInvoice.invoice_number}</strong>
                </div>
                <div style={previewRow}>
                  <span>Customer</span>
                  <strong>{createdInvoice.customer_name}</strong>
                </div>
                <div style={previewRow}>
                  <span>Type</span>
                  <strong>{createdInvoice.invoice_type}</strong>
                </div>
                <div style={previewRow}>
                  <span>Total</span>
                  <strong>${parseFloat(createdInvoice.total_amount || 0).toFixed(2)}</strong>
                </div>
                <div style={previewRow}>
                  <span>Paid</span>
                  <strong>${parseFloat(createdInvoice.paid_amount || 0).toFixed(2)}</strong>
                </div>
                <div style={previewRow}>
                  <span>Balance</span>
                  <strong>${parseFloat(createdInvoice.balance_due || 0).toFixed(2)}</strong>
                </div>

                <div style={previewActionWrap}>
                  <button type="button" style={previewPrimaryBtn} onClick={goToInvoice}>
                    <Eye size={15} />
                    View Invoice
                  </button>
                  <button type="button" style={previewSecondaryBtn} onClick={goToDashboard}>
                    <LayoutList size={15} />
                    Dashboard
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

const pageWrap = {
  padding: '24px',
  background: '#f8fafc',
  minHeight: '100vh',
};

const headerBar = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '20px',
  flexWrap: 'wrap',
  marginBottom: '24px',
};

const headerActions = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap',
};

const headerSecondaryBtn = {
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

const headerBadge = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: '#111827',
  color: '#fff',
  borderRadius: '999px',
  padding: '10px 16px',
  fontWeight: 700,
};

const responsiveGrid = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.45fr) minmax(320px, 0.75fr)',
  gap: '24px',
};

const leftColumn = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
};

const rightColumn = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
};

const cardStyle = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '24px',
  padding: '24px',
  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.05)',
};

const sectionHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap',
  marginBottom: '18px',
};

const sectionTitleWrap = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const sectionTitle = {
  margin: 0,
  fontSize: '18px',
  fontWeight: 800,
  color: '#0f172a',
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

const miniInlineLabel = {
  fontSize: '11px',
  fontWeight: 800,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const fieldGrid1 = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '16px',
};

const fieldGrid2 = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '16px',
};

const fieldGrid3 = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '16px',
};

const inputWrap = {
  position: 'relative',
};

const inputIcon = {
  position: 'absolute',
  left: '14px',
  top: '14px',
  color: '#94a3b8',
  display: 'flex',
  alignItems: 'center',
};

const sharedInputStyle = {
  width: '100%',
  border: '1px solid #dbe3ee',
  borderRadius: '14px',
  fontSize: '14px',
  background: '#fff',
  color: '#0f172a',
  outline: 'none',
  boxSizing: 'border-box',
};

const input = {
  ...sharedInputStyle,
  padding: '13px 14px',
};

const inputBare = {
  ...sharedInputStyle,
  padding: '13px 14px',
};

const inputWithIcon = {
  ...sharedInputStyle,
  padding: '13px 14px 13px 42px',
};

const textarea = {
  ...sharedInputStyle,
  padding: '13px 14px 13px 42px',
  minHeight: '96px',
  resize: 'vertical',
  fontFamily: 'inherit',
};

const textareaPlain = {
  ...sharedInputStyle,
  padding: '13px 14px',
  minHeight: '84px',
  resize: 'vertical',
  fontFamily: 'inherit',
};

const invoiceTypePreview = {
  background: 'linear-gradient(135deg, #111827, #1f2937)',
  color: '#fff',
  borderRadius: '18px',
  padding: '18px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};

const invoiceTypePill = {
  display: 'inline-flex',
  alignSelf: 'flex-start',
  padding: '6px 10px',
  borderRadius: '999px',
  background: '#ef4444',
  color: '#fff',
  fontSize: '11px',
  fontWeight: 800,
  marginBottom: '10px',
};

const invoiceTypeText = {
  fontSize: '13px',
  lineHeight: 1.5,
  color: '#cbd5e1',
};

const serviceActionBar = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap',
};

const serviceTemplateSelectWrap = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const serviceTemplateDropdownWrap = {
  position: 'relative',
};

const serviceTemplateDropdownIcon = {
  position: 'absolute',
  right: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#64748b',
  pointerEvents: 'none',
};

const serviceTemplateSelect = {
  border: '1px solid #fecaca',
  background: '#fff5f5',
  color: '#dc2626',
  borderRadius: '12px',
  padding: '10px 34px 10px 12px',
  fontWeight: 800,
  cursor: 'pointer',
  appearance: 'none',
};

const addBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  border: 'none',
  background: '#ef4444',
  color: '#fff',
  borderRadius: '12px',
  padding: '11px 14px',
  fontWeight: 800,
  cursor: 'pointer',
};

const itemsWrap = {
  display: 'flex',
  flexDirection: 'column',
  gap: '18px',
};

const itemCard = {
  border: '1px solid #e2e8f0',
  borderRadius: '20px',
  padding: '18px',
  background: '#fcfcfd',
};

const itemRowTop = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '16px',
};

const itemRowTitle = {
  fontSize: '14px',
  fontWeight: 900,
  color: '#111827',
};

const removeBtn = {
  width: '38px',
  height: '38px',
  borderRadius: '10px',
  border: '1px solid #fecaca',
  background: '#fff5f5',
  color: '#dc2626',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

const lineTotalBox = {
  borderRadius: '16px',
  background: '#111827',
  color: '#fff',
  padding: '14px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};

const lineTotalLabel = {
  fontSize: '11px',
  color: '#94a3b8',
  textTransform: 'uppercase',
  fontWeight: 700,
};

const lineTotalValue = {
  fontSize: '24px',
  fontWeight: 900,
  marginTop: '6px',
};

const summaryCard = {
  background: '#0f172a',
  color: '#fff',
  borderRadius: '24px',
  padding: '24px',
  boxShadow: '0 15px 35px rgba(15, 23, 42, 0.2)',
};

const summarySmall = {
  fontSize: '12px',
  letterSpacing: '0.08em',
  color: '#94a3b8',
  fontWeight: 800,
  marginBottom: '18px',
};

const summaryRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 0',
  borderBottom: '1px solid rgba(148, 163, 184, 0.16)',
  fontSize: '14px',
};

const summaryRowTotal = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 0 10px',
  fontSize: '18px',
  fontWeight: 900,
};

const summaryRowBalance = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 0 18px',
  fontSize: '16px',
  color: '#fca5a5',
  fontWeight: 900,
};

const checkoutBtn = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '10px',
  padding: '16px',
  background: '#ef4444',
  color: '#fff',
  border: 'none',
  borderRadius: '14px',
  fontWeight: 900,
  fontSize: '15px',
  cursor: 'pointer',
  marginTop: '8px',
};

const dashboardBtn = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '10px',
  padding: '14px',
  marginTop: '10px',
  background: '#fff',
  color: '#0f172a',
  border: '1px solid rgba(203, 213, 225, 0.25)',
  borderRadius: '14px',
  fontWeight: 800,
  cursor: 'pointer',
};

const resetBtn = {
  width: '100%',
  padding: '14px',
  marginTop: '10px',
  background: 'transparent',
  color: '#cbd5e1',
  border: '1px solid rgba(203, 213, 225, 0.25)',
  borderRadius: '14px',
  fontWeight: 800,
  cursor: 'pointer',
};

const invoicePreviewCard = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  border: '1px solid #e2e8f0',
  borderRadius: '18px',
  padding: '16px',
  background: '#f8fafc',
};

const previewRow = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '16px',
  fontSize: '14px',
  color: '#334155',
};

const previewActionWrap = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  marginTop: '8px',
};

const previewPrimaryBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  border: 'none',
  background: '#ef4444',
  color: '#fff',
  borderRadius: '12px',
  padding: '11px 14px',
  fontWeight: 800,
  cursor: 'pointer',
};

const previewSecondaryBtn = {
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

const successBox = {
  marginBottom: '18px',
  background: '#ecfdf5',
  border: '1px solid #bbf7d0',
  color: '#166534',
  padding: '14px 16px',
  borderRadius: '14px',
  fontWeight: 700,
};

const successActions = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  marginTop: '12px',
};

const successActionBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  border: 'none',
  background: '#16a34a',
  color: '#fff',
  borderRadius: '10px',
  padding: '10px 12px',
  fontWeight: 800,
  cursor: 'pointer',
};

const successActionBtnAlt = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  border: '1px solid #86efac',
  background: '#fff',
  color: '#166534',
  borderRadius: '10px',
  padding: '10px 12px',
  fontWeight: 800,
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
