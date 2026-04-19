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
    return `https://api.qrserver.com/v1/create-qr-code/?size=96x96&margin=0&data=${encodeURIComponent(
      listingUrl
    )}`;
  }, [listingUrl]);

  const safeText = (value, fallback = '-') => {
    if (value === null || value === undefined || value === '') return fallback;
    return String(value);
  };

  const formatPrice = (value) => {
    const num = Number(value || 0);
    return `$${num.toFixed(2)}`;
  };

  const getNameFontSize = (name) => {
    const text = safeText(name, '-');
    if (text.length > 34) return '6.4px';
    if (text.length > 24) return '7px';
    if (text.length > 16) return '7.8px';
    return '8.6px';
  };

  if (loading) return <div style={{ padding: 30 }}>Loading...</div>;
  if (!part) return <div style={{ padding: 30 }}>Label not found</div>;

  const labelInner = (
    <>
      <div style={qrCol}>
        <img src={qrImageUrl} alt="QR" style={qrImg} />
      </div>

      <div style={textCol}>
        <div style={{ ...partName, fontSize: getNameFontSize(part.part_name) }}>
          {safeText(part.part_name)}
        </div>

        <div style={sku}>SKU: {safeText(part.sku)}</div>

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

      <div style={previewWrap} className="no-print">
        <div style={previewCard}>
          <div style={previewScaleWrap}>
            <div style={labelBox}>{labelInner}</div>
          </div>
        </div>
      </div>

      <div style={urlNote} className="no-print">
        QR opens: {listingUrl}
      </div>

      <div id="print-root" aria-hidden="true">
        <div id="label-50x30-print" style={labelBox}>
          {labelInner}
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

          #label-50x30-print {
            width: 50mm !important;
            height: 30mm !important;
            margin: 0 !important;
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

const previewWrap = {
  display: 'flex',
  justifyContent: 'center',
};

const previewCard = {
  background: '#e2e8f0',
  padding: '20px',
  borderRadius: '16px',
};

const previewScaleWrap = {
  transform: 'scale(4)',
  transformOrigin: 'top left',
  width: '50mm',
  height: '30mm',
};

const labelBox = {
  width: '50mm',
  height: '30mm',
  display: 'flex',
  alignItems: 'flex-start',
  paddingTop: '3.2mm',
  paddingRight: '2.2mm',
  paddingBottom: '2.2mm',
  paddingLeft: '3.6mm',
  fontFamily: 'Arial, Helvetica, sans-serif',
  background: '#fff',
  overflow: 'hidden',
};

const qrCol = {
  width: '10mm',
  minWidth: '10mm',
  marginRight: '2mm',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
};

const qrImg = {
  width: '9mm',
  height: '9mm',
  display: 'block',
  objectFit: 'contain',
};

const textCol = {
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
};

const partName = {
  fontWeight: '900',
  lineHeight: 1,
  margin: 0,
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  wordBreak: 'break-word',
};

const sku = {
  fontSize: '7px',
  fontWeight: '700',
  lineHeight: 1,
  marginTop: '0.3mm',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const price = {
  fontSize: '10px',
  fontWeight: '900',
  lineHeight: 1,
  marginTop: '0.6mm',
  whiteSpace: 'nowrap',
};

const urlNote = {
  marginTop: '14px',
  fontSize: '13px',
  fontWeight: '700',
  color: '#475569',
};
