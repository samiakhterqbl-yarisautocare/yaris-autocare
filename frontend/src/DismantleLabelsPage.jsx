import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Printer, Tag } from 'lucide-react';
import QRCodeImport from 'react-qr-code';

const API_URL = 'https://yaris-autocare-production.up.railway.app';

const QRCodeComponent =
  typeof QRCodeImport === 'function'
    ? QRCodeImport
    : QRCodeImport?.default || null;

export default function DismantleLabelsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCar();
  }, [id]);

  const fetchCar = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/donor-cars/${id}/`);
      setCar(res.data);
    } catch (err) {
      console.error('Failed to fetch donor car for labels:', err);
      setCar(null);
    } finally {
      setLoading(false);
    }
  };

  const FRONTEND_URL =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://yaris-autocare.vercel.app';

  const parts = useMemo(() => {
    const rawParts = Array.isArray(car?.parts) ? car.parts : [];
    const q = search.trim().toLowerCase();

    if (!q) return rawParts;

    return rawParts.filter((part) => {
      const name = part.part_name?.toLowerCase() || '';
      const category = part.category?.toLowerCase() || '';
      const labelId = part.label_id?.toLowerCase() || '';
      const status = part.status?.toLowerCase() || '';
      return (
        name.includes(q) ||
        category.includes(q) ||
        labelId.includes(q) ||
        status.includes(q)
      );
    });
  }, [car, search]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ padding: '32px' }}>
        <div style={infoBox}>Loading labels...</div>
      </div>
    );
  }

  if (!car) {
    return (
      <div style={{ padding: '32px' }}>
        <button onClick={() => navigate(-1)} style={backBtn}>
          <ArrowLeft size={16} />
          BACK
        </button>
        <div style={infoBox}>Donor car not found.</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', animation: 'fadeIn 0.3s ease' }}>
      <style>
        {`
          @media print {
            @page {
              size: 50mm 30mm;
              margin: 0;
            }

            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #fff !important;
            }

            body * {
              visibility: hidden !important;
            }

            #labels-print-root,
            #labels-print-root * {
              visibility: visible !important;
            }

            #labels-print-root {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }

            .label-grid {
              display: block !important;
              margin: 0 !important;
              padding: 0 !important;
            }

            .print-label {
              width: 50mm !important;
              height: 30mm !important;
              page-break-after: always !important;
              break-after: page !important;
              margin: 0 !important;
              box-shadow: none !important;
              border-radius: 0 !important;
            }
          }
        `}
      </style>

      <div className="no-print">
        <button onClick={() => navigate(-1)} style={backBtn}>
          <ArrowLeft size={16} />
          BACK
        </button>

        <div style={hero}>
          <div>
            <div style={eyebrow}>LABEL REPRINT CENTER</div>
            <h1 style={heroTitle}>
              {car.year} {car.make} {car.model}
            </h1>
            <div style={heroSub}>
              Stock: {car.stock_number || 'N/A'} • {parts.length} Labels Ready
            </div>
          </div>

          <button onClick={handlePrint} style={printBtn}>
            <Printer size={16} />
            PRINT ALL LABELS
          </button>
        </div>

        <div style={toolbar}>
          <div style={searchWrap}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search part, category, status, label..."
              style={searchInput}
            />
          </div>

          <div style={summaryPill}>
            <Tag size={15} />
            {parts.length} matching labels
          </div>
        </div>
      </div>

      <div id="labels-print-root">
        <div
          className="label-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '16px',
          }}
        >
          {parts.map((part, index) => {
            const qrValue = `${FRONTEND_URL}/dismantle-parts/${part.id}/edit`;
            const shortModel = `${car.year || ''} ${car.make || ''} ${car.model || ''}`.trim();

            return (
              <div
                key={`${part.id}-${index}`}
                className="print-label"
                style={labelCard}
                title={qrValue}
              >
                <div style={qrBox}>
                  {QRCodeComponent ? (
                    <QRCodeComponent
                      size={52}
                      value={qrValue}
                      style={{ width: '14mm', height: '14mm' }}
                    />
                  ) : (
                    <div style={qrFallback}>QR</div>
                  )}
                </div>

                <div style={labelContent}>
                  <div style={stockLine}>{car.stock_number || 'NO STOCK'}</div>

                  <div style={partLine}>
                    {part.part_name || 'Unnamed Part'}
                  </div>

                  <div style={metaLine}>{shortModel}</div>
                  <div style={metaLine}>{part.category || 'No Category'}</div>
                  <div style={metaLine}>
                    {part.label_id || `ID-${part.id}`} • {part.status || 'Available'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {parts.length === 0 && (
        <div className="no-print" style={infoBox}>
          No labels found for this donor car.
        </div>
      )}
    </div>
  );
}

const backBtn = {
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  fontWeight: '800',
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  color: '#475569',
};

const hero = {
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  border: '1px solid #e2e8f0',
  borderRadius: '22px',
  padding: '22px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '20px',
  flexWrap: 'wrap',
  marginBottom: '18px',
};

const eyebrow = {
  fontSize: '12px',
  fontWeight: '900',
  color: '#94a3b8',
  textTransform: 'uppercase',
  marginBottom: '8px',
};

const heroTitle = {
  margin: 0,
  fontSize: '28px',
  fontWeight: '900',
  color: '#0f172a',
};

const heroSub = {
  marginTop: '8px',
  color: '#64748b',
  fontWeight: '700',
};

const printBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  background: '#0f172a',
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  padding: '12px 18px',
  fontWeight: '800',
  cursor: 'pointer',
};

const toolbar = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap',
  marginBottom: '18px',
};

const searchWrap = {
  width: '360px',
  maxWidth: '100%',
};

const searchInput = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  outline: 'none',
  boxSizing: 'border-box',
  fontSize: '14px',
  background: '#fff',
};

const summaryPill = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 14px',
  borderRadius: '999px',
  border: '1px solid #e2e8f0',
  background: '#fff',
  fontWeight: '800',
  color: '#334155',
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

const qrBox = {
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

const stockLine = {
  fontSize: '9px',
  fontWeight: '900',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const partLine = {
  fontSize: '9px',
  fontWeight: '900',
  marginTop: '1mm',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

const metaLine = {
  fontSize: '7px',
  marginTop: '1mm',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const infoBox = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '16px',
  padding: '24px',
  color: '#64748b',
  fontWeight: '700',
};
