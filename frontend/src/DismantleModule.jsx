import React, { useState, useRef } from 'react';
import axios from 'axios';
import {
  PlusCircle,
  Printer,
  CheckCircle,
  ArrowLeft,
  Camera,
  Trash2,
  Plus,
} from 'lucide-react';
import QRCodeImport from 'react-qr-code';

const API_URL = 'https://yaris-autocare-production.up.railway.app';

const COLORS = {
  primary: '#ef4444',
  dark: '#0f172a',
  border: '#e2e8f0',
  bg: '#f8fafc',
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

  const inputStyle = {
    padding: '12px',
    borderRadius: '8px',
    border: `1px solid ${COLORS.border}`,
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

      console.log('Bulk create payload:', payload);

      await axios.post(`${API_URL}/api/bulk-create/`, payload);
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
      <div style={{ padding: '40px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ fontSize: '28px', fontWeight: '900' }}>
            Dismantle Yard Registry
          </h2>
          <span
            style={{
              fontSize: '12px',
              color: '#94a3b8',
              fontWeight: 'bold',
              backgroundColor: '#f1f5f9',
              padding: '4px 10px',
              borderRadius: '20px',
            }}
          >
            v1.2 - PROD
          </span>
        </div>

        <button
          onClick={() => setPhase('registry')}
          style={{
            marginTop: '20px',
            padding: '40px',
            borderRadius: '20px',
            border: `1px solid ${COLORS.border}`,
            cursor: 'pointer',
            backgroundColor: '#fff',
            textAlign: 'left',
          }}
        >
          <PlusCircle size={40} color={COLORS.primary} />
          <div
            style={{ fontWeight: '900', marginTop: '10px', fontSize: '18px' }}
          >
            REGISTER NEW DONOR
          </div>
        </button>
      </div>
    );
  }

  if (phase === 'registry') {
    return (
      <div style={{ padding: '40px' }}>
        <button
          onClick={() => setPhase('decision')}
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontWeight: '800',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <ArrowLeft size={16} />
          BACK
        </button>

        <div
          style={{
            backgroundColor: '#fff',
            padding: '40px',
            borderRadius: '20px',
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
            }}
          >
            <input
              style={inputStyle}
              value={carForm.make}
              onChange={(e) =>
                setCarForm((prev) => ({ ...prev, make: e.target.value }))
              }
              placeholder="Make"
            />
            <input
              style={inputStyle}
              value={carForm.model}
              onChange={(e) =>
                setCarForm((prev) => ({ ...prev, model: e.target.value }))
              }
              placeholder="Model"
            />
            <input
              style={inputStyle}
              value={carForm.year}
              onChange={(e) =>
                setCarForm((prev) => ({ ...prev, year: e.target.value }))
              }
              placeholder="Year"
            />
            <input
              style={inputStyle}
              value={carForm.vin}
              onChange={(e) =>
                setCarForm((prev) => ({
                  ...prev,
                  vin: e.target.value.toUpperCase(),
                }))
              }
              placeholder="VIN (17 chars)"
            />
            <input
              style={inputStyle}
              value={carForm.rego}
              onChange={(e) =>
                setCarForm((prev) => ({
                  ...prev,
                  rego: e.target.value.toUpperCase(),
                }))
              }
              placeholder="Rego"
            />
            <input
              style={inputStyle}
              value={carForm.color}
              onChange={(e) =>
                setCarForm((prev) => ({ ...prev, color: e.target.value }))
              }
              placeholder="Color"
            />

            <textarea
              style={{
                gridColumn: '1 / -1',
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${COLORS.border}`,
                height: '80px',
              }}
              value={carForm.notes}
              onChange={(e) =>
                setCarForm((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Damage notes..."
            />

            <div style={{ gridColumn: '1 / -1' }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f1f5f9',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Camera size={18} />
                PHOTOS
              </button>

              <input
                type="file"
                multiple
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleImageSelect}
              />

              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '10px',
                  flexWrap: 'wrap',
                }}
              >
                {imageFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} style={{ position: 'relative' }}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                      }}
                    />
                    <button
                      onClick={() => removeImage(index)}
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: COLORS.primary,
                        color: '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleCreateCar}
            disabled={loading}
            style={{
              marginTop: '20px',
              backgroundColor: COLORS.dark,
              color: '#fff',
              padding: '12px 30px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '800',
              cursor: 'pointer',
            }}
          >
            {loading ? 'SAVING...' : 'REGISTER & HARVEST'}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'checklist') {
    return (
      <div style={{ padding: '40px' }}>
        <div
          style={{
            backgroundColor: COLORS.dark,
            color: '#fff',
            padding: '20px',
            borderRadius: '15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>
              {carData?.year} {carData?.model}
            </h2>
            <span>Stock: {carData?.stock_number}</span>
          </div>

          <button
            onClick={handleFinalizeDismantle}
            disabled={loading}
            style={{
              backgroundColor: COLORS.primary,
              color: '#fff',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '800',
              cursor: 'pointer',
            }}
          >
            {loading ? 'CREATING...' : `GENERATE LABELS (${selectedParts.length})`}
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            margin: '20px 0',
            overflowX: 'auto',
            paddingBottom: '10px',
          }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              style={{
                whiteSpace: 'nowrap',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === cat ? COLORS.dark : '#fff',
                color: activeTab === cat ? '#fff' : '#64748b',
                cursor: 'pointer',
                fontWeight: '700',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div
          style={{
            backgroundColor: '#fff',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              fontWeight: '800',
              marginBottom: '10px',
              fontSize: '14px',
            }}
          >
            Add custom part to: {activeTab}
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              value={customPart}
              onChange={(e) => setCustomPart(e.target.value)}
              placeholder="Enter custom part name"
              style={{
                ...inputStyle,
                flex: 1,
                minWidth: '240px',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addCustomPart();
              }}
            />
            <button
              onClick={addCustomPart}
              style={{
                backgroundColor: COLORS.primary,
                color: '#fff',
                padding: '12px 18px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Plus size={16} />
              ADD CUSTOM
            </button>
          </div>
        </div>

        {selectedParts.length > 0 && (
          <div
            style={{
              backgroundColor: '#fff',
              border: `1px solid ${COLORS.border}`,
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '20px',
            }}
          >
            <div style={{ fontWeight: '800', marginBottom: '12px' }}>
              Selected Parts ({selectedParts.length})
            </div>

            <div
              style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              {selectedParts.map((part, index) => (
                <div
                  key={`${part.name}-${index}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '999px',
                    backgroundColor: '#f8fafc',
                    border: `1px solid ${COLORS.border}`,
                    fontSize: '13px',
                    fontWeight: '700',
                  }}
                >
                  <span>{part.name}</span>
                  <span style={{ color: '#64748b', fontWeight: '600' }}>
                    ({part.category})
                  </span>
                  <button
                    onClick={() => removeSelectedPart(part.name)}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: COLORS.primary,
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '10px',
          }}
        >
          {CATEGORY_MAP[activeTab].map((part) => {
            const isSelected = selectedParts.some((p) => p.name === part);

            return (
              <div
                key={part}
                onClick={() => togglePart(part)}
                style={{
                  padding: '15px',
                  borderRadius: '12px',
                  border: `2px solid ${isSelected ? COLORS.primary : COLORS.border}`,
                  cursor: 'pointer',
                  backgroundColor: '#fff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: '700', fontSize: '14px' }}>{part}</span>
                {isSelected && <CheckCircle size={18} color={COLORS.primary} />}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (phase === 'labels') {
    return (
      <div style={{ padding: '40px' }}>
        <style>
          {`
            @media print {
              body {
                margin: 0;
                padding: 0;
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

        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '20px',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <h2 style={{ fontWeight: '900' }}>Labels Ready</h2>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => window.print()}
              style={{
                backgroundColor: COLORS.dark,
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Printer size={18} />
              PRINT ALL
            </button>

            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: `1px solid ${COLORS.border}`,
                cursor: 'pointer',
              }}
            >
              NEXT CAR
            </button>
          </div>
        </div>

        <div
          className="label-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '15px',
          }}
        >
          {selectedParts.map((part, index) => {
            const qrValue = `${carData?.stock_number || 'UNKNOWN'}-${String(
              part.name || ''
            ).toUpperCase()}`;

            const shortModel = `${carData?.year || ''} ${carData?.model || ''}`.trim();

            return (
              <div
                key={`${part.name}-${index}`}
                className="print-label"
                style={{
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
                }}
              >
                <div
                  style={{
                    width: '14mm',
                    minWidth: '14mm',
                    height: '14mm',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {QRCodeComponent ? (
                    <QRCodeComponent
                      size={52}
                      value={qrValue}
                      style={{ height: '14mm', width: '14mm' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '14mm',
                        height: '14mm',
                        border: '1px solid #000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '8px',
                      }}
                    >
                      QR
                    </div>
                  )}
                </div>

                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    lineHeight: 1.1,
                  }}
                >
                  <div
                    style={{
                      fontSize: '9px',
                      fontWeight: '900',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {carData?.stock_number}
                  </div>

                  <div
                    style={{
                      fontSize: '9px',
                      fontWeight: '900',
                      marginTop: '1mm',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {part.name}
                  </div>

                  <div
                    style={{
                      fontSize: '7px',
                      marginTop: '1mm',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {shortModel}
                  </div>

                  <div
                    style={{
                      fontSize: '7px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {part.category}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
