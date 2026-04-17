import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Edit, Printer, FileText } from 'lucide-react';

const API_URL = 'https://yaris-autocare-production.up.railway.app';

export default function UsedPartDetailPage() {
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
      alert('Error loading part');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={page}>Loading...</div>;
  if (!part) return <div style={page}>Not found</div>;

  const mainImage =
    part.images?.find((i) => i.is_main)?.image ||
    part.images?.[0]?.image ||
    null;

  return (
    <div style={page}>
      <button onClick={() => navigate('/used-parts')} style={backBtn}>
        <ArrowLeft size={16} /> BACK
      </button>

      <div style={card}>
        <div style={header}>
          <h1>{part.part_name}</h1>
          <div style={actions}>
            <button onClick={() => navigate(`/used-parts/${id}/edit`)} style={editBtn}>
              <Edit size={16} /> EDIT
            </button>

            <button onClick={() => navigate(`/used-parts/${id}/label`)} style={printBtn}>
              <Printer size={16} /> PRINT LABEL
            </button>

            <button onClick={() => alert('PDF NEXT STEP')} style={pdfBtn}>
              <FileText size={16} /> PDF
            </button>
          </div>
        </div>

        {mainImage && <img src={mainImage} alt="" style={image} />}

        <div style={grid}>
          <Info label="SKU" value={part.sku} />
          <Info label="Label ID" value={part.label_id} />
          <Info label="QR Value" value={part.qr_code_value} />
          <Info label="Category" value={part.category} />
          <Info label="Make" value={part.make} />
          <Info label="Model" value={part.model} />
          <Info label="Variant" value={part.variant} />
          <Info label="Price" value={`$${part.price}`} />
          <Info label="Location" value={part.location} />
          <Info label="Shelf" value={part.shelf_code} />
          <Info label="Grade" value={part.grade} />
          <Info label="Condition" value={part.condition} />
          <Info label="Status" value={part.sale_status} />
        </div>
      </div>
    </div>
  );
}

const Info = ({ label, value }) => (
  <div>
    <strong>{label}</strong>
    <div>{value || '-'}</div>
  </div>
);

const page = { padding: 30 };
const card = { background: '#fff', padding: 20, borderRadius: 20 };
const header = { display: 'flex', justifyContent: 'space-between' };
const actions = { display: 'flex', gap: 10 };
const image = { width: '100%', maxHeight: 300, objectFit: 'cover', marginTop: 20 };
const grid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginTop: 20 };
const backBtn = { marginBottom: 20 };

const editBtn = { padding: 10, background: '#0f172a', color: '#fff' };
const printBtn = { padding: 10, background: '#16a34a', color: '#fff' };
const pdfBtn = { padding: 10, background: '#ef4444', color: '#fff' };
