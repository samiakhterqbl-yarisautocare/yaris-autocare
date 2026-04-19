import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import api from './api';

const FRONTEND_URL = 'https://yaris-autocare.vercel.app';

export default function UsedPartLabelPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [part, setPart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPart = async () => {
    try {
      const res = await api.get(`/used-parts/${id}/`);
      setPart(res.data);
    } catch (err) {
      console.error(err);
      alert('Error loading label');
    } finally {
      setLoading(false);
    }
  };

  const listingUrl = useMemo(() => {
    return `${FRONTEND_URL}/used-parts/${id}/edit`;
  }, [id]);

  const qrImageUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=0&data=${encodeURIComponent(
      listingUrl
    )}`;
  }, [listingUrl]);

  const formatPrice = (value) => {
    const num = Number(value || 0);
    return `$${num.toFixed(2)}`;
  };

  const safeText = (value, fallback = '-') => {
    if (value === null || value === undefined || value === '') return fallback;
    return String(value);
  };

  const getPartNameStyle = (name) => {
    const text = safeText(name, '-');
    if (text.length > 30) return { fontSize: '6.5px', lineHeight: 1.05 };
    if (text.length > 22) return { fontSize: '7px', lineHeight: 1.05 };
    if (text.length > 16) return { fontSize: '7.5px', lineHeight: 1.05 };
    return { fontSize: '8px', lineHeight: 1.05 };
  };

  if (loading) return <div style={{ padding: 30 }}>Loading...</div>;
  if (!part) return <div style={{ padding: 30 }}>Label not found</div>;

  const labelContent = (
    <>
      <div style={qrCol}>
        <div style={qrWrap}>
          <img src={qrImageUrl} alt="QR Code" style={qrImg} />
        </div>
      </div>

      <div style={infoCol}>
        <div style={brand}>YARIS AUTOCARE</div>

        <div style={{ ...partName, ...getPartNameStyle(part.part_name) }}>
          {safeText(part.part_name)}
        </div>

        <div style={metaLine}>SKU: {safeText(part.sku)}</div>
        <div style={metaLine}>LOC: {safeText(part.location)}</div>
        <div style={metaLine}>GRADE: {safeText(part.grade)}</div>

        <div style={price}>{formatPrice(part.price)}</div>
      </div>
    </>
  );

  return (
    <div style={page}>
      <div style={toolbar} className="no-print">
        <button onClick={() => navigate(`/used-parts/${id}`)} style={backBtn}>
          <ArrowLeft size={16} />
          BACK
        </button>

        <button onClick={() => window.print()} style={printBtn}>
          <Printer size={16} />
          PRINT LABEL
        </button>
      </div>

      <div style={canvasWrap} className="no-print">
        <div style={previewCard}>
          <div style={previewLabelHolder}>
            <div id="label-50x30-preview" style={labelBox}>
              {labelContent}
            </div>
          </div>
        </div>
      </div>

      <div style={urlNote} className="no-print">
        QR opens: {listingUrl}
      </div>

      {/* Hidden print-only root */}
      <div id="print-root" aria-hidden="true">
        <div id="print-label" style={printShell}>
          <div id="label-50x30-print" style={labelBox}>
            {labelContent}
          </div>
        </div>
      </div>

      <style>{`
        html, body {
          margin: 0;
          padding: 0;
        }

        * {
          box-sizing: border-box;
        }

        #print-root {
          position: fixed;
          left: -99999px;
          top: 0;
          width: 50mm;
          height: 30mm;
          overflow: hidden;
          background: #fff;
        }

        @page {
          size: 50mm 30mm;
          margin: 0;
        }

        @media print {
          html, body {
            width: 50mm !important;
            height: 30mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            background: #fff !important;
          }

          body * {
            visibility: hidden !important;
          }

          .no-print {
            display: none !important;
          }

          #print-root,
          #print-root * {
            visibility: visible !important;
          }

          #print-root {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 50mm !important;
            height: 30mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            background: #fff !important;
          }

          #print-label,
          #label-50x30-print {
            width: 50mm !important;
            height: 30mm !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: #fff !important;
            overflow: hidden !important;
          }

          img {
            image-rendering: crisp-edges;
          }
        }
      `}</style>
    </div>
  );
}

const page = {
  padding: '24px',
  background: '#f8fafc',
  minHeight: '100vh',
};

const toolbar = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '20px',
};

const backBtn = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontWeight: '800',
  color: '#64748b',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const printBtn = {
  padding: '12px 16px',
  borderRadius: '12px',
  border: 'none',
  background: '#16a34a',
  color: '#fff',
  fontWeight: '800',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const canvasWrap = {
  display: 'flex',
  justifyContent: 'center',
};

const previewCard = {
  background: '#e2e8f0',
  padding: '24px',
  borderRadius: '20px',
};

const previewLabelHolder = {
  background: '#fff',
  padding: '8px',
  borderRadius: '12px',
  display: 'inline-block',
};

const printShell = {
  width: '50mm',
  height: '30mm',
  overflow: 'hidden',
  background: '#fff',
};

const labelBox = {
  width: '50mm',
  height: '30mm',
  background: '#fff',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'stretch',
  padding: '1.5mm',
  fontFamily: 'Arial, Helvetica, sans-serif',
  overflow: 'hidden',
};

const qrCol = {
  width: '15mm',
  minWidth: '15mm',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '1.5mm',
};

const qrWrap = {
  width: '14mm',
  height: '14mm',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
};

const qrImg = {
  width: '14mm',
  height: '14mm',
  display: 'block',
  objectFit: 'contain',
};

const infoCol = {
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  overflow: 'hidden',
};

const brand = {
  fontSize: '6px',
  fontWeight: '900',
  lineHeight: 1,
  letterSpacing: '0.2px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const partName = {
  fontWeight: '900',
  color: '#000',
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  wordBreak: 'break-word',
};

const metaLine = {
  fontSize: '6px',
  fontWeight: '700',
  lineHeight: 1,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const price = {
  fontSize: '9px',
  fontWeight: '900',
  lineHeight: 1,
  whiteSpace: 'nowrap',
};

const urlNote = {
  marginTop: '14px',
  fontSize: '13px',
  fontWeight: '700',
  color: '#475569',
};
