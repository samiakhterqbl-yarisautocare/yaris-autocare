import React, { useState, useRef, useMemo } from 'react';
import axios from 'axios';
import {
  PlusCircle,
  Printer,
  CheckCircle,
  ArrowLeft,
  Camera,
  Trash2,
  Plus,
  Car,
  Tag,
  Package,
  Boxes,
  QrCode,
  Wrench,
  CheckCheck,
  ClipboardList,
} from 'lucide-react';
import QRCodeImport from 'react-qr-code';

const API_URL = 'https://yaris-autocare-production.up.railway.app';
const FRONTEND_URL = 'https://yaris-autocare.vercel.app';

const COLORS = {
  primary: '#ef4444',
  primaryDark: '#b91c1c',
  dark: '#0f172a',
  darkSoft: '#111827',
  text: '#1e293b',
  muted: '#64748b',
  soft: '#94a3b8',
  border: '#e2e8f0',
  borderSoft: '#eef2f7',
  bg: '#f8fafc',
  white: '#ffffff',
  success: '#166534',
  successBg: '#dcfce7',
};

const CATEGORY_MAP = {
  'Front Body': [
    'Front Bumper',
    'Bonnet',
    'Grille',
    'Headlight Left',
    'Headlight Right',
    'Front Fog Light L',
    'Front Fog Light R',
    'Front Guard L',
    'Front Guard R',
    'Radiator Support',
  ],
  'Engine Bay': [
    'Engine Assembly',
    'Alternator',
    'Starter Motor',
    'AC Compressor',
    'Radiator',
    'Condenser',
    'Radiator Fan Assembly',
    'Air Cleaner Box',
    'Throttle Body',
  ],
  Mechanical: [
    'Transmission',
    'Driveshaft L',
    'Driveshaft R',
    'Front Strut L',
    'Front Strut R',
    'Control Arm L',
    'Control Arm R',
    'Steering Rack',
  ],
  Doors: [
    'Front Door L',
    'Front Door R',
    'Rear Door L',
    'Rear Door R',
    'Mirror L',
    'Mirror R',
    'Window Glass FL',
    'Window Glass FR',
  ],
  Interior: [
    'Airbag Kit',
    'Steering Wheel',
    'Dashboard',
    'Instrument Cluster',
    'Clock Spring',
    'Front Seat L',
    'Front Seat R',
    'Rear Seat Set',
  ],
  'Rear Body': [
    'Rear Bumper',
    'Tail Light L',
    'Tail Light R',
    'Boot Lid',
    'Fuel Pump',
    'Fuel Tank',
    'Rear Axle',
    'Tow Bar',
  ],
};

const CATEGORIES = Object.keys(CATEGORY_MAP);

const QRCodeComponent =
  typeof QRCodeImport === 'function'
    ? QRCodeImport
    : QRCodeImport?.default || null;

export default function DismantleModule() {
  const [phase, setPhase] = useState('decision');
  const [loading, setLoading] = useState(false);
  const [carData, setCarData] = useState(null);
  const [selectedParts, setSelectedParts] = useState([]);
  const [createdParts, setCreatedParts] = useState([]);
  const [activeTab, setActiveTab] = useState(CATEGORIES[0]);
  const [imageFiles, setImageFiles] = useState([]);
  const [customPart, setCustomPart] = useState('');
  const fileInputRef = useRef(null);

  const [carForm, setCarForm] = useState({
    make: 'Toyota',
    model: '',
    year: '',
    color: '',
    vin: '',
    rego: '',
    notes: '',
  });

  const selectedCount = selectedParts.length;

  const activeCategoryParts = useMemo(() => CATEGORY_MAP[activeTab] || [], [activeTab]);

  const updateCarForm = (field, value) => {
    setCarForm((prev) => ({ ...prev, [field]: value }));
  };

  const inputStyle = {
    width: '100%',
    padding: '13px 14px',
    borderRadius: '12px',
    border: `1px solid ${COLORS.border}`,
    background: '#fff',
    fontSize: '14px',
    color: COLORS.text,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const handleImageSelect = (e) => {
    if (!e.target.files) return;
    setImageFiles((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  const removeImage = (indexToRemove) => {
    setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleCreateCar = async () => {
    if (!carForm.model || !carForm.year || !carForm.vin) {
      alert('Model, Year, and VIN are required.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      Object.entries(carForm).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value);
        }
      });

      imageFiles.forEach((file) => formData.append('images', file));

      const res = await axios.post(`${API_URL}/api/donor-cars/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setCarData(res.data);
      setPhase('checklist');
    } catch (err) {
      console.error('Create donor car error:', err?.response?.data || err);
      alert('Registration failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const togglePart = (name, category = activeTab) => {
    setSelectedParts((prev) => {
      const exists = prev.find((part) => part.name === name);
      if (exists) {
        return prev.filter((part) => part.name !== name);
      }
      return [...prev, { name, category }];
    });
  };

  const addCustomPart = () => {
    const trimmed = customPart.trim();
    if (!trimmed) return;

    const exists = selectedParts.find(
      (part) => part.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (exists) {
      alert('This part is already selected.');
      return;
    }

    setSelectedParts((prev) => [
      ...prev,
      { name: trimmed, category: activeTab, isCustom: true },
    ]);
    setCustomPart('');
  };

  const removeSelectedPart = (name) => {
    setSelectedParts((prev) => prev.filter((part) => part.name !== name));
  };

  const handleFinalizeDismantle = async () => {
    if (!carData?.id) {
      alert('Car record is missing.');
      return;
    }

    if (selectedParts.length === 0) {
      alert('Select at least one part.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        car_id: carData.id,
        parts: selectedParts.map((part) => ({
          part_name: part.name,
          category: part.category,
        })),
      };

      await axios.post(`${API_URL}/api/bulk-create/`, payload);

      const donorRes = await axios.get(`${API_URL}/api/donor-cars/${carData.id}/`);
      const donor = donorRes.data;

      const donorParts = Array.isArray(donor.parts) ? donor.parts : [];

      const matchedParts = donorParts.filter((p) =>
        selectedParts.some(
          (sp) =>
            sp.name?.toLowerCase() === p.part_name?.toLowerCase() &&
            sp.category?.toLowerCase() === p.category?.toLowerCase()
        )
      );

      setCreatedParts(matchedParts);
      setCarData(donor);
      setPhase('labels');
    } catch (err) {
      console.error('Bulk create error:', err?.response?.data || err);
      alert('Bulk creation failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  if (phase === 'decision') {
    return (
      <div style={pageWrap}>
        <div style={heroHeader}>
          <div>
            <div style={eyebrow}>Dismantle Workflow</div>
            <h1 style={pageTitle}>Dismantle Yard Registry</h1>
            <p style={pageSubtitle}>
              Register donor vehicles, select harvestable parts, and generate ready-to-print labels.
            </p>
          </div>

          <div style={versionBadge}>Production</div>
        </div>

        <div style={decisionGrid}>
          <button onClick={() => setPhase('registry')} style={decisionCard}>
            <div style={decisionIconWrap}>
              <PlusCircle size={34} color={COLORS.primary} />
            </div>
            <div style={decisionTitle}>Register New Donor</div>
            <div style={decisionText}>
              Create a donor vehicle record, upload photos, and move directly into the dismantle checklist.
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'registry') {
    return (
      <div style={pageWrap}>
        <button onClick={() => setPhase('decision')} style={backBtn}>
          <ArrowLeft size={16} />
          Back
        </button>

        <div style={heroHeader}>
          <div>
            <div style={eyebrow}>Step 1</div>
            <h1 style={pageTitle}>Donor Vehicle Registration</h1>
            <p style={pageSubtitle}>
              Add the donor vehicle details first. This keeps the dismantle process organized and traceable.
            </p>
          </div>
        </div>

        <div style={contentCard}>
          <div style={sectionTopRow}>
            <div style={sectionHeadingWrap}>
              <div style={sectionIconBox}>
                <Car size={18} color={COLORS.primary} />
              </div>
              <div>
                <div style={sectionHeading}>Vehicle Information</div>
                <div style={sectionSubheading}>Required details for stock creation and label generation</div>
              </div>
            </div>
          </div>

          <div style={formGrid}>
            <Field label="Make">
              <input
                style={inputStyle}
                value={carForm.make}
                onChange={(e) => updateCarForm('make', e.target.value)}
                placeholder="Make"
              />
            </Field>

            <Field label="Model">
              <input
                style={inputStyle}
                value={carForm.model}
                onChange={(e) => updateCarForm('model', e.target.value)}
                placeholder="Model"
              />
            </Field>

            <Field label="Year">
              <input
                style={inputStyle}
                value={carForm.year}
                onChange={(e) => updateCarForm('year', e.target.value)}
                placeholder="Year"
              />
            </Field>

            <Field label="VIN">
              <input
                style={inputStyle}
                value={carForm.vin}
                onChange={(e) => updateCarForm('vin', e.target.value.toUpperCase())}
                placeholder="VIN (17 chars)"
              />
            </Field>

            <Field label="Rego">
              <input
                style={inputStyle}
                value={carForm.rego}
                onChange={(e) => updateCarForm('rego', e.target.value.toUpperCase())}
                placeholder="Rego"
              />
            </Field>

            <Field label="Color">
              <input
                style={inputStyle}
                value={carForm.color}
                onChange={(e) => updateCarForm('color', e.target.value)}
                placeholder="Color"
              />
            </Field>

            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Damage / Internal Notes">
                <textarea
                  style={textareaStyle}
                  value={carForm.notes}
                  onChange={(e) => updateCarForm('notes', e.target.value)}
                  placeholder="Damage notes, condition remarks, salvage comments..."
                />
              </Field>
            </div>
          </div>

          <div style={imageSection}>
            <div style={sectionHeadingSmall}>Vehicle Photos</div>
            <div style={sectionSubheading}>Add overview images before starting dismantle</div>

            <div style={{ marginTop: '12px' }}>
              <button onClick={() => fileInputRef.current?.click()} style={softBtn}>
                <Camera size={17} />
                Upload Photos
              </button>

              <input
                type="file"
                multiple
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleImageSelect}
              />
            </div>

            {imageFiles.length > 0 && (
              <div style={imageGrid}>
                {imageFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} style={imageThumbCard}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      style={imageThumb}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      style={thumbDeleteBtn}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={actionBar}>
            <button
              onClick={handleCreateCar}
              disabled={loading}
              style={primaryBtn}
            >
              {loading ? 'Saving...' : 'Register & Continue'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'checklist') {
    return (
      <div style={pageWrap}>
        <div style={checklistHeaderCard}>
          <div style={checklistHeaderLeft}>
            <div style={eyebrowLight}>Step 2</div>
            <h2 style={checklistTitle}>
              {carData?.year} {carData?.make} {carData?.model}
            </h2>
            <div style={checklistMetaRow}>
              <InfoPill icon={<Tag size={13} />} text={`Stock: ${carData?.stock_number || '-'}`} />
              <InfoPill icon={<Boxes size={13} />} text={`${selectedCount} selected`} />
            </div>
          </div>

          <button
            onClick={handleFinalizeDismantle}
            disabled={loading}
            style={primaryBtn}
          >
            {loading ? 'Creating...' : `Generate Labels (${selectedParts.length})`}
          </button>
        </div>

        <div style={checklistLayout}>
          <div style={leftPanel}>
            <div style={contentCard}>
              <div style={sectionTopRow}>
                <div style={sectionHeadingWrap}>
                  <div style={sectionIconBox}>
                    <ClipboardList size={18} color={COLORS.primary} />
                  </div>
                  <div>
                    <div style={sectionHeading}>Part Categories</div>
                    <div style={sectionSubheading}>Choose a category, then select available parts</div>
                  </div>
                </div>
              </div>

              <div style={tabWrap}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    style={{
                      ...tabBtn,
                      ...(activeTab === cat ? tabBtnActive : {}),
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div style={customPartCard}>
                <div style={sectionHeadingSmall}>Add Custom Part</div>
                <div style={sectionSubheading}>Useful for uncommon or vehicle-specific components</div>

                <div style={customPartRow}>
                  <input
                    value={customPart}
                    onChange={(e) => setCustomPart(e.target.value)}
                    placeholder={`Enter custom part for ${activeTab}`}
                    style={{
                      ...inputStyle,
                      flex: 1,
                      minWidth: '220px',
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addCustomPart();
                    }}
                  />
                  <button onClick={addCustomPart} style={primaryBtnSmall}>
                    <Plus size={15} />
                    Add Custom
                  </button>
                </div>
              </div>

              <div style={partsGrid}>
                {activeCategoryParts.map((part) => {
                  const isSelected = selectedParts.some((p) => p.name === part);

                  return (
                    <button
                      key={part}
                      onClick={() => togglePart(part)}
                      style={{
                        ...partCard,
                        ...(isSelected ? partCardActive : {}),
                      }}
                    >
                      <span style={partLabel}>{part}</span>
                      {isSelected ? (
                        <CheckCircle size={18} color={COLORS.primary} />
                      ) : (
                        <div style={partCircle} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={rightPanel}>
            <div style={contentCard}>
              <div style={sectionTopRow}>
                <div style={sectionHeadingWrap}>
                  <div style={sectionIconBox}>
                    <CheckCheck size={18} color={COLORS.primary} />
                  </div>
                  <div>
                    <div style={sectionHeading}>Selected Parts</div>
                    <div style={sectionSubheading}>Review before generating labels</div>
                  </div>
                </div>
              </div>

              {selectedParts.length > 0 ? (
                <div style={selectedList}>
                  {selectedParts.map((part, index) => (
                    <div key={`${part.name}-${index}`} style={selectedPartRow}>
                      <div style={{ minWidth: 0 }}>
                        <div style={selectedPartName}>{part.name}</div>
                        <div style={selectedPartMeta}>{part.category}</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeSelectedPart(part.name)}
                        style={removeInlineBtn}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={emptyStateBox}>
                  <Package size={32} color="#94a3b8" />
                  <div style={emptyStateTitle}>No parts selected yet</div>
                  <div style={emptyStateText}>
                    Select parts from the current category to prepare dismantle labels.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'labels') {
    const labelParts = createdParts.length > 0 ? createdParts : [];

    return (
      <div style={pageWrap}>
        <style>
          {`
            @media print {
              body {
                margin: 0;
                padding: 0;
                background: #fff;
              }

              @page {
                size: 50mm 30mm;
                margin: 0;
              }

              .label-grid {
                display: block !important;
              }

              .print-label {
                width: 50mm !important;
                height: 30mm !important;
                page-break-after: always;
                break-after: page;
                margin: 0 !important;
                box-shadow: none !important;
              }

              .no-print {
                display: none !important;
              }
            }
          `}
        </style>

        <div style={heroHeader}>
          <div>
            <div style={eyebrow}>Step 3</div>
            <h1 style={pageTitle}>Labels Ready</h1>
            <p style={pageSubtitle}>
              Print labels now or move to the next donor vehicle.
            </p>
          </div>

          <div style={topButtonRow} className="no-print">
            <button onClick={() => window.print()} style={primaryBtn}>
              <Printer size={17} />
              Print All
            </button>

            <button onClick={() => window.location.reload()} style={softBtn}>
              Next Car
            </button>
          </div>
        </div>

        <div
          className="label-grid"
          style={labelGrid}
        >
          {labelParts.map((part, index) => {
            const qrValue = `${FRONTEND_URL}/used-parts/${part.id}`;
            const shortModel = `${carData?.year || ''} ${carData?.model || ''}`.trim();

            return (
              <div
                key={`${part.id}-${index}`}
                className="print-label"
                style={labelCard}
              >
                <div style={labelQrWrap}>
                  {QRCodeComponent ? (
                    <QRCodeComponent
                      size={52}
                      value={qrValue}
                      style={{ height: '14mm', width: '14mm' }}
                    />
                  ) : (
                    <div style={qrFallback}>
                      <QrCode size={16} />
                    </div>
                  )}
                </div>

                <div style={labelContent}>
                  <div style={labelStock}>{carData?.stock_number}</div>
                  <div style={labelPartName}>{part.part_name}</div>
                  <div style={labelMeta}>{shortModel}</div>
                  <div style={labelMeta}>{part.category}</div>
                </div>
              </div>
            );
          })}
        </div>

        {labelParts.length === 0 && (
          <div className="no-print" style={warningBox}>
            No created part IDs were found for labels. Check donor car detail API response.
          </div>
        )}
      </div>
    );
  }

  return null;
}

function Field({ label, children }) {
  return (
    <div>
      <label style={fieldLabel}>{label}</label>
      {children}
    </div>
  );
}

function InfoPill({ icon, text }) {
  return (
    <div style={infoPill}>
      {icon}
      <span>{text}</span>
    </div>
  );
}

const pageWrap = {
  padding: '24px',
  maxWidth: '1400px',
  margin: '0 auto',
  background: COLORS.bg,
  minHeight: '100vh',
};

const heroHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '18px',
  flexWrap: 'wrap',
  marginBottom: '18px',
};

const eyebrow = {
  fontSize: '11px',
  fontWeight: '800',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: COLORS.soft,
  marginBottom: '6px',
};

const eyebrowLight = {
  fontSize: '11px',
  fontWeight: '800',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#fecaca',
  marginBottom: '6px',
};

const pageTitle = {
  margin: 0,
  fontSize: '30px',
  fontWeight: '900',
  color: COLORS.dark,
  letterSpacing: '-0.03em',
};

const pageSubtitle = {
  margin: '8px 0 0',
  color: COLORS.muted,
  fontSize: '14px',
  lineHeight: 1.6,
  maxWidth: '760px',
};

const versionBadge = {
  borderRadius: '999px',
  padding: '8px 12px',
  border: `1px solid ${COLORS.border}`,
  background: '#fff',
  color: COLORS.dark,
  fontSize: '12px',
  fontWeight: '800',
};

const decisionGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 420px))',
  gap: '16px',
};

const decisionCard = {
  border: `1px solid ${COLORS.border}`,
  borderRadius: '22px',
  background: '#fff',
  padding: '26px',
  textAlign: 'left',
  cursor: 'pointer',
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
};

const decisionIconWrap = {
  width: '66px',
  height: '66px',
  borderRadius: '18px',
  background: '#fff5f5',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const decisionTitle = {
  marginTop: '16px',
  fontWeight: '900',
  fontSize: '18px',
  color: COLORS.dark,
};

const decisionText = {
  marginTop: '8px',
  fontSize: '14px',
  lineHeight: 1.7,
  color: COLORS.muted,
};

const backBtn = {
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  fontWeight: '800',
  marginBottom: '14px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  color: COLORS.muted,
};

const contentCard = {
  backgroundColor: '#fff',
  padding: '22px',
  borderRadius: '22px',
  border: `1px solid ${COLORS.border}`,
  boxShadow: '0 8px 26px rgba(15, 23, 42, 0.04)',
};

const sectionTopRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap',
  marginBottom: '18px',
};

const sectionHeadingWrap = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const sectionIconBox = {
  width: '42px',
  height: '42px',
  borderRadius: '14px',
  background: '#fff5f5',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const sectionHeading = {
  fontSize: '16px',
  fontWeight: '800',
  color: COLORS.dark,
};

const sectionHeadingSmall = {
  fontSize: '14px',
  fontWeight: '800',
  color: COLORS.dark,
};

const sectionSubheading = {
  marginTop: '4px',
  fontSize: '13px',
  color: COLORS.muted,
};

const formGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '16px',
};

const fieldLabel = {
  display: 'block',
  marginBottom: '8px',
  fontSize: '11px',
  fontWeight: '800',
  color: COLORS.soft,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const textareaStyle = {
  width: '100%',
  padding: '13px 14px',
  borderRadius: '12px',
  border: `1px solid ${COLORS.border}`,
  background: '#fff',
  fontSize: '14px',
  color: COLORS.text,
  outline: 'none',
  boxSizing: 'border-box',
  minHeight: '96px',
  resize: 'vertical',
  fontFamily: 'inherit',
};

const imageSection = {
  marginTop: '24px',
  paddingTop: '20px',
  borderTop: `1px solid ${COLORS.borderSoft}`,
};

const imageGrid = {
  display: 'flex',
  gap: '12px',
  marginTop: '14px',
  flexWrap: 'wrap',
};

const imageThumbCard = {
  position: 'relative',
  width: '92px',
  height: '92px',
  borderRadius: '14px',
  overflow: 'hidden',
  border: `1px solid ${COLORS.border}`,
  background: '#fff',
};

const imageThumb = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const thumbDeleteBtn = {
  position: 'absolute',
  top: '6px',
  right: '6px',
  width: '26px',
  height: '26px',
  borderRadius: '999px',
  border: 'none',
  backgroundColor: COLORS.primary,
  color: '#fff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const actionBar = {
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: '24px',
};

const primaryBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  backgroundColor: COLORS.dark,
  color: '#fff',
  padding: '12px 18px',
  borderRadius: '12px',
  border: 'none',
  fontWeight: '800',
  cursor: 'pointer',
  minHeight: '46px',
};

const primaryBtnSmall = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  backgroundColor: COLORS.primary,
  color: '#fff',
  padding: '12px 16px',
  borderRadius: '12px',
  border: 'none',
  fontWeight: '800',
  cursor: 'pointer',
  minHeight: '46px',
};

const softBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  backgroundColor: '#fff',
  color: COLORS.dark,
  padding: '12px 16px',
  borderRadius: '12px',
  border: `1px solid ${COLORS.border}`,
  fontWeight: '800',
  cursor: 'pointer',
};

const checklistHeaderCard = {
  background: `linear-gradient(135deg, ${COLORS.dark} 0%, ${COLORS.darkSoft} 100%)`,
  color: '#fff',
  borderRadius: '22px',
  padding: '22px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '18px',
  flexWrap: 'wrap',
  marginBottom: '18px',
};

const checklistHeaderLeft = {
  minWidth: 0,
};

const checklistTitle = {
  margin: 0,
  fontSize: '28px',
  fontWeight: '900',
  letterSpacing: '-0.03em',
};

const checklistMetaRow = {
  display: 'flex',
  gap: '10px',
  marginTop: '12px',
  flexWrap: 'wrap',
};

const infoPill = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 10px',
  borderRadius: '999px',
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.10)',
  color: '#e2e8f0',
  fontSize: '12px',
  fontWeight: '700',
};

const checklistLayout = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)',
  gap: '18px',
};

const leftPanel = {
  display: 'flex',
  flexDirection: 'column',
};

const rightPanel = {
  display: 'flex',
  flexDirection: 'column',
};

const tabWrap = {
  display: 'flex',
  gap: '10px',
  overflowX: 'auto',
  paddingBottom: '8px',
  marginBottom: '18px',
};

const tabBtn = {
  whiteSpace: 'nowrap',
  padding: '10px 14px',
  borderRadius: '12px',
  border: `1px solid ${COLORS.border}`,
  backgroundColor: '#fff',
  color: COLORS.muted,
  cursor: 'pointer',
  fontWeight: '700',
  fontSize: '13px',
};

const tabBtnActive = {
  backgroundColor: COLORS.dark,
  color: '#fff',
  border: `1px solid ${COLORS.dark}`,
};

const customPartCard = {
  background: '#f8fafc',
  border: `1px solid ${COLORS.border}`,
  borderRadius: '16px',
  padding: '16px',
  marginBottom: '18px',
};

const customPartRow = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  marginTop: '12px',
};

const partsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: '12px',
};

const partCard = {
  padding: '14px 16px',
  borderRadius: '14px',
  border: `1px solid ${COLORS.border}`,
  cursor: 'pointer',
  backgroundColor: '#fff',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  textAlign: 'left',
};

const partCardActive = {
  border: `2px solid ${COLORS.primary}`,
  background: '#fff5f5',
};

const partLabel = {
  fontWeight: '700',
  fontSize: '14px',
  color: COLORS.text,
};

const partCircle = {
  width: '16px',
  height: '16px',
  borderRadius: '999px',
  border: `2px solid ${COLORS.border}`,
  flexShrink: 0,
};

const selectedList = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const selectedPartRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '12px 14px',
  borderRadius: '14px',
  border: `1px solid ${COLORS.border}`,
  background: '#fff',
};

const selectedPartName = {
  fontSize: '14px',
  fontWeight: '800',
  color: COLORS.dark,
};

const selectedPartMeta = {
  fontSize: '12px',
  color: COLORS.muted,
  marginTop: '4px',
};

const removeInlineBtn = {
  width: '34px',
  height: '34px',
  borderRadius: '10px',
  border: '1px solid #fecaca',
  background: '#fff5f5',
  color: '#dc2626',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const emptyStateBox = {
  border: `1px dashed ${COLORS.border}`,
  borderRadius: '18px',
  padding: '28px 18px',
  textAlign: 'center',
  background: '#fcfdff',
};

const emptyStateTitle = {
  marginTop: '10px',
  fontWeight: '800',
  color: COLORS.dark,
};

const emptyStateText = {
  marginTop: '6px',
  color: COLORS.muted,
  fontSize: '13px',
  lineHeight: 1.6,
};

const topButtonRow = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
};

const labelGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
  gap: '15px',
};

const labelCard = {
  width: '50mm',
  height: '30mm',
  border: '1.5px solid #000',
  borderRadius: '4px',
  display: 'flex',
  gap: '2mm',
  alignItems: 'center',
  backgroundColor: '#fff',
  padding: '2mm',
  boxSizing: 'border-box',
  overflow: 'hidden',
};

const labelQrWrap = {
  width: '14mm',
  minWidth: '14mm',
  height: '14mm',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const qrFallback = {
  width: '14mm',
  height: '14mm',
  border: '1px solid #000',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '8px',
};

const labelContent = {
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  lineHeight: 1.1,
};

const labelStock = {
  fontSize: '9px',
  fontWeight: '900',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const labelPartName = {
  fontSize: '9px',
  fontWeight: '900',
  marginTop: '1mm',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

const labelMeta = {
  fontSize: '7px',
  marginTop: '1mm',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const warningBox = {
  marginTop: '20px',
  padding: '16px',
  borderRadius: '12px',
  backgroundColor: '#fff7ed',
  border: '1px solid #fdba74',
  color: '#9a3412',
  fontWeight: '700',
};
