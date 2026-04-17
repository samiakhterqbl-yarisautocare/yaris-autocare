import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'react-qr-code';
import { ArrowLeft, Printer } from 'lucide-react';

const API_URL = 'https://yaris-autocare-production.up.railway.app';

export default function UsedPartLabelPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [part, setPart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPart();
  }, [id]);

  const fetchPart = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/used-parts/${id}/`);
      setPart(res.data);
    } catch (err) {
      console.error(err);
      alert('Error loading label');
    } finally {
      setLoading(false);
    }
  };

  const qrValue = useMemo(() => {
    if (!part) return '';
    return part.qr_code_value || part.label_id || part.sku || `USED-PART-${part.id}`;
  }, [part]);

  const mainImage = useMemo(() => {
    if (!part?.images?.length) return null;
    return part.images.find((i) => i.is_main)?.image || part.images[0]?.image || null;
  }, [part]);

  if (loading) return <div style={{ padding: 30 }}>Loading...</div>;
  if (!part) return <div style={{ padding: 30 }}>Label not found</div>;

  return (
    <div style={page}>
      <div style={toolbar}>
        <button onClick={() => navigate(`/used-parts/${id}`)} style={backBtn}>
          <ArrowLeft size={16} />
          BACK
        </button>

        <button onClick={() => window.print()} style={printBtn}>
          <Printer size={16} />
          PRINT LABEL
        </button>
      </div>

      <div style={canvasWrap}>
        <div id="label-50x30" style={labelBox}>
          <div style={left}>
            <div style={brand}>YARIS AUTOCARE</div>
            <div style={partName}>{part.part_name || '-'}</div>
            <div style={smallLine}>SKU: {part.sku || '-'}</div>
            <div style={smallLine}>LOC: {part.location || '-'}</div>
            <div style={smallLine}>GRADE: {part.grade || '-'}</div>
            <div style={price}>${part.price || '0'}</div>
          </div>

          <div style={right}>
            <div style={qrWrap}>
              <QRCode value={qrValue} size={62} />
            </div>
          </div>
        </div>
      </div>

      {mainImage && (
        <div style={previewNote}>
          <img src={mainImage} alt="" style={thumb} />
          <span>Main image preview</span>
        </div>
      )}

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }

          #label-50x30, #label-50x30 * {
            visibility: visible;
          }

          #label-50x30 {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            box-shadow: none !important;
            border: none !important;
          }

          @page {
            size: 50mm 30mm;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}

const page = {
  padding: '24px',
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
  padding: '24px',
  background: '#f8fafc',
  borderRadius: '20px',
  display: 'flex',
  justifyContent: 'center',
};

const labelBox = {
  width: '50mm',
  height: '30mm',
  background: '#fff',
  border: '1px solid #000',
  boxSizing: 'border-box',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'stretch',
  padding: '2mm',
  fontFamily: 'Arial, sans-serif',
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
};

const left = {
  width: '66%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  paddingRight: '2mm',
  overflow: 'hidden',
};

const right = {
  width: '34%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const brand = {
  fontSize: '7px',
  fontWeight: '900',
  lineHeight: 1.1,
};

const partName = {
  fontSize: '8px',
  fontWeight: '900',
  lineHeight: 1.1,
  wordBreak: 'break-word',
  overflow: 'hidden',
};

const smallLine = {
  fontSize: '6px',
  fontWeight: '700',
  lineHeight: 1.1,
  wordBreak: 'break-word',
};

const price = {
  fontSize: '10px',
  fontWeight: '900',
  color: '#000',
  lineHeight: 1,
};

const qrWrap = {
  background: '#fff',
  padding: '1mm',
};

const previewNote = {
  marginTop: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  color: '#64748b',
  fontWeight: '700',
};

const thumb = {
  width: '48px',
  height: '48px',
  objectFit: 'cover',
  borderRadius: '10px',
  border: '1px solid #e2e8f0',
};
