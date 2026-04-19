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
    return `https://api.qrserver.com/v1/create-qr-code/?size=88x88&margin=0&data=${encodeURIComponent(
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
    if (text.length > 34) return '6.3px';
    if (text.length > 26) return '6.9px';
    if (text.length > 18) return '7.5px';
    return '8.2px';
  };

  if (loading) return <div style={{ padding: 30 }}>Loading...</div>;
  if (!part) return <div style={{ padding: 30 }}>Label not found</div>;

  const labelInner = (
    <>
      <div style={qrCol}>
        <div style={qrWrap}>
          <img src={qrImageUrl} alt="QR Code" style={qrImg} />
        </div>
      </div>

      <div style={textCol}>
        <div style={{ ...partName, fontSize: getNameFontSize(part.part_name) }}>
          {safeText(part.part_name)}
        </div>

        <div style={detailsWrap}>
          <div style={metaLine}>SKU: {safeText(part.sku)}</div>
          <div style={metaLine}>LOC: {safeText(part.location)}</div>
          <div style={metaLine}>GRADE: {safeText(part.grade)}</div>
        </div>

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
          <div style={labelBox}>{labelInner}</div>
        </div>
      </div>

      <div style={urlNote} className="no-print">
        QR opens: {listingUrl}
      </div>

      <div id="print-root" aria-hidden="true">
        <div id="print-label" style={printShell}>
          <div id="label-50x30-print" style={labelBox}>
            {labelInner}
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

const previewWrap = {
  display: 'flex',
  justifyContent: 'center',
};

const previewCard = {
  background: '#e2e8f0',
  padding: '16px',
  borderRadius: '16px',
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
  alignItems: 'flex-start',
  paddingTop: '3.2mm',
  paddingRight: '2.2mm',
  paddingBottom: '2.2mm',
  paddingLeft: '3.6mm',
  fontFamily: 'Arial, Helvetica, sans-serif',
  overflow: 'hidden',
};

const qrCol = {
  width: '10.8mm',
  minWidth: '10.8mm',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  marginRight: '1.7mm',
  marginTop: '0.2mm',
};

const qrWrap = {
  width: '9.5mm',
  height: '9.5mm',
  overflow: 'hidden',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const qrImg = {
  width: '9.5mm',
  height: '9.5mm',
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
  gap: '0.55mm',
  paddingTop: '0.1mm',
};

const partName = {
  fontWeight: '900',
  color: '#000',
  lineHeight: 1,
  margin: 0,
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  wordBreak: 'break-word',
};

const detailsWrap = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.15mm',
  marginTop: '0.1mm',
};

const metaLine = {
  fontSize: '6.7px',
  fontWeight: '800',
  lineHeight: 1,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  margin: 0,
};

const price = {
  fontSize: '8.8px',
  fontWeight: '900',
  lineHeight: 1,
  whiteSpace: 'nowrap',
  marginTop: '0.6mm',
};

const urlNote = {
  marginTop: '14px',
  fontSize: '13px',
  fontWeight: '700',
  color: '#475569',
};
