import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Edit,
  Printer,
  FileText,
  Package,
  Tag,
  MapPin,
  Car,
  ShieldCheck,
  ClipboardList,
  Image as ImageIcon,
  FolderCog,
} from 'lucide-react';

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
      console.error(err);
      alert('Error loading part');
    } finally {
      setLoading(false);
    }
  };

  const mainImage = useMemo(() => {
    if (!part?.images?.length) return null;
    return part.images.find((i) => i.is_main)?.image || part.images[0]?.image || null;
  }, [part]);

  const qrValue = useMemo(() => {
    if (!part) return '';
    return part.qr_code_value || part.label_id || part.sku || `USED-PART-${part.id}`;
  }, [part]);

  const qrImageUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrValue)}`;
  }, [qrValue]);

  const handleDownloadPdf = () => {
    if (!part) return;

    const photoHtml = part.images?.length
      ? part.images
          .map(
            (img) => `
              <div style="width: 160px; height: 120px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <img src="${img.image}" style="width:100%;height:100%;object-fit:cover;" />
              </div>
            `
          )
          .join('')
      : '<div style="color:#64748b;">No photos uploaded</div>';

    const html = `
      <html>
        <head>
          <title>${part.part_name} - PDF</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 24px;
              color: #0f172a;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 12px;
              margin-bottom: 24px;
            }
            .title {
              font-size: 28px;
              font-weight: 800;
            }
            .sub {
              color: #64748b;
              margin-top: 4px;
            }
            .section {
              margin-bottom: 24px;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 16px;
            }
            .section h3 {
              margin: 0 0 14px 0;
              font-size: 18px;
            }
            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px 20px;
            }
            .item strong {
              display: block;
              font-size: 12px;
              color: #64748b;
              margin-bottom: 4px;
              text-transform: uppercase;
            }
            .item div {
              font-size: 14px;
              font-weight: 600;
            }
            .photos {
              display: flex;
              flex-wrap: wrap;
              gap: 12px;
            }
            .main-image {
              width: 100%;
              max-height: 300px;
              object-fit: cover;
              border-radius: 12px;
              margin-top: 8px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #64748b;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">Yaris Autocare - Used Part Details</div>
              <div class="sub">${part.part_name}</div>
            </div>
            <div>
              <strong>QR Value:</strong><br/>
              ${qrValue}
            </div>
          </div>

          ${
            mainImage
              ? `<div class="section">
                  <h3>Main Photo</h3>
                  <img src="${mainImage}" class="main-image" />
                 </div>`
              : ''
          }

          <div class="section">
            <h3>Basic Information</h3>
            <div class="grid">
              <div class="item"><strong>Part Name</strong><div>${part.part_name || '-'}</div></div>
              <div class="item"><strong>Part Number</strong><div>${part.part_number || '-'}</div></div>
              <div class="item"><strong>Category</strong><div>${part.category || '-'}</div></div>
              <div class="item"><strong>Subcategory</strong><div>${part.subcategory || '-'}</div></div>
              <div class="item"><strong>Description</strong><div>${part.description || '-'}</div></div>
              <div class="item"><strong>Usage Type</strong><div>${part.usage_type || '-'}</div></div>
            </div>
          </div>

          <div class="section">
            <h3>Vehicle Compatibility</h3>
            <div class="grid">
              <div class="item"><strong>Make</strong><div>${part.make || '-'}</div></div>
              <div class="item"><strong>Model</strong><div>${part.model || '-'}</div></div>
              <div class="item"><strong>Variant</strong><div>${part.variant || '-'}</div></div>
              <div class="item"><strong>Year From</strong><div>${part.year_from || '-'}</div></div>
              <div class="item"><strong>Year To</strong><div>${part.year_to || '-'}</div></div>
            </div>
          </div>

          <div class="section">
            <h3>Condition & Stock</h3>
            <div class="grid">
              <div class="item"><strong>Grade</strong><div>${part.grade || '-'}</div></div>
              <div class="item"><strong>Rating</strong><div>${part.rating || '-'}</div></div>
              <div class="item"><strong>Condition</strong><div>${part.condition || '-'}</div></div>
              <div class="item"><strong>Condition Notes</strong><div>${part.condition_notes || '-'}</div></div>
              <div class="item"><strong>Sale Status</strong><div>${part.sale_status || '-'}</div></div>
              <div class="item"><strong>Price</strong><div>$${part.price || '0'}</div></div>
              <div class="item"><strong>Cost Price</strong><div>$${part.cost_price || '0'}</div></div>
              <div class="item"><strong>Quantity</strong><div>${part.quantity || '0'}</div></div>
              <div class="item"><strong>Location</strong><div>${part.location || '-'}</div></div>
              <div class="item"><strong>Shelf Code</strong><div>${part.shelf_code || '-'}</div></div>
            </div>
          </div>

          <div class="section">
            <h3>System Information</h3>
            <div class="grid">
              <div class="item"><strong>SKU</strong><div>${part.sku || '-'}</div></div>
              <div class="item"><strong>Label ID</strong><div>${part.label_id || '-'}</div></div>
              <div class="item"><strong>QR Value</strong><div>${part.qr_code_value || '-'}</div></div>
              <div class="item"><strong>Created</strong><div>${part.created_at ? new Date(part.created_at).toLocaleString() : '-'}</div></div>
              <div class="item"><strong>Updated</strong><div>${part.updated_at ? new Date(part.updated_at).toLocaleString() : '-'}</div></div>
              <div class="item"><strong>Sold At</strong><div>${part.sold_at ? new Date(part.sold_at).toLocaleString() : '-'}</div></div>
            </div>
          </div>

          <div class="section">
            <h3>Notes</h3>
            <div class="grid">
              <div class="item"><strong>Public Notes</strong><div>${part.public_notes || '-'}</div></div>
              <div class="item"><strong>Internal Notes</strong><div>${part.internal_notes || '-'}</div></div>
            </div>
          </div>

          <div class="section">
            <h3>Photos</h3>
            <div class="photos">${photoHtml}</div>
          </div>

          <div class="footer">
            Generated from Yaris Autocare Used Parts Module
          </div>
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (!win) {
      alert('Popup blocked. Please allow popups for PDF preview.');
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  };

  if (loading) return <div style={page}>Loading...</div>;
  if (!part) return <div style={page}>Not found</div>;

  return (
    <div style={page}>
      <button onClick={() => navigate('/used-parts')} style={backBtn}>
        <ArrowLeft size={16} /> BACK
      </button>

      <div style={heroCard}>
        <div style={heroLeft}>
          <div style={mainImageWrap}>
            {mainImage ? (
              <img src={mainImage} alt={part.part_name} style={mainImageStyle} />
            ) : (
              <div style={imagePlaceholder}>
                <Package size={34} />
              </div>
            )}
          </div>

          <div style={heroInfo}>
            <div style={badgeRow}>
              <span style={categoryBadge}>{part.category || 'Other'}</span>
              <span style={statusBadge}>{part.sale_status || 'AVAILABLE'}</span>
            </div>

            <h1 style={title}>{part.part_name}</h1>
            <p style={subtitle}>
              {[
                part.make,
                part.model,
                part.variant,
                part.year_from && part.year_to ? `(${part.year_from} - ${part.year_to})` : '',
              ]
                .filter(Boolean)
                .join(' ')}
            </p>

            <div style={heroMetaGrid}>
              <MetaChip icon={<Tag size={14} />} text={`SKU: ${part.sku || '-'}`} />
              <MetaChip icon={<ClipboardList size={14} />} text={`Label: ${part.label_id || '-'}`} />
              <MetaChip icon={<MapPin size={14} />} text={`Location: ${part.location || '-'}`} />
              <MetaChip icon={<ShieldCheck size={14} />} text={`Grade: ${part.grade || '-'}`} />
            </div>
          </div>
        </div>

        <div style={heroActions}>
          <button onClick={() => navigate(`/used-parts/${id}/edit`)} style={darkBtn}>
            <Edit size={16} /> EDIT
          </button>

          <button onClick={() => navigate(`/used-parts/${id}/label`)} style={greenBtn}>
            <Printer size={16} /> PRINT LABEL
          </button>

          <button onClick={handleDownloadPdf} style={redBtn}>
            <FileText size={16} /> PDF
          </button>
        </div>
      </div>

      <div style={contentGrid}>
        <div style={leftColumn}>
          <Section icon={<FolderCog size={18} />} title="Basic Information">
            <InfoGrid>
              <Info label="Part Name" value={part.part_name} />
              <Info label="Part Number" value={part.part_number} />
              <Info label="Category" value={part.category} />
              <Info label="Subcategory" value={part.subcategory} />
              <Info label="Description" value={part.description} wide />
              <Info label="Usage Type" value={part.usage_type} />
              <Info label="Is Active" value={part.is_active ? 'Yes' : 'No'} />
            </InfoGrid>
          </Section>

          <Section icon={<Car size={18} />} title="Vehicle Compatibility">
            <InfoGrid>
              <Info label="Make" value={part.make} />
              <Info label="Model" value={part.model} />
              <Info label="Variant" value={part.variant} />
              <Info label="Year From" value={part.year_from} />
              <Info label="Year To" value={part.year_to} />
            </InfoGrid>
          </Section>

          <Section icon={<ShieldCheck size={18} />} title="Condition & Stock">
            <InfoGrid>
              <Info label="Grade" value={part.grade} />
              <Info label="Rating" value={part.rating} />
              <Info label="Condition" value={part.condition} />
              <Info label="Condition Notes" value={part.condition_notes} wide />
              <Info label="Sale Status" value={part.sale_status} />
              <Info label="Price" value={`$${part.price || '0'}`} />
              <Info label="Cost Price" value={`$${part.cost_price || '0'}`} />
              <Info label="Quantity" value={part.quantity} />
              <Info label="Location" value={part.location} />
              <Info label="Shelf Code" value={part.shelf_code} />
            </InfoGrid>
          </Section>

          <Section icon={<ClipboardList size={18} />} title="Notes">
            <InfoGrid>
              <Info label="Public Notes" value={part.public_notes} wide />
              <Info label="Internal Notes" value={part.internal_notes} wide />
            </InfoGrid>
          </Section>

          <Section icon={<ImageIcon size={18} />} title={`Photos (${part.images?.length || 0})`}>
            {part.images?.length ? (
              <div style={galleryGrid}>
                {part.images.map((img) => (
                  <div
                    key={img.id}
                    style={galleryCard}
                    onClick={() => window.open(img.image, '_blank')}
                    title="Click to view full image"
                  >
                    <img src={img.image} alt="" style={galleryImage} />
                    {img.is_main && <div style={mainTag}>MAIN</div>}
                  </div>
                ))}
              </div>
            ) : (
              <div style={emptyBox}>No photos uploaded</div>
            )}
          </Section>
        </div>

        <div style={rightColumn}>
          <Section icon={<Tag size={18} />} title="System IDs">
            <div style={stackInfo}>
              <StackItem label="SKU" value={part.sku} />
              <StackItem label="Label ID" value={part.label_id} />
              <StackItem label="QR Value" value={part.qr_code_value} />
              <StackItem label="Created" value={part.created_at ? new Date(part.created_at).toLocaleString() : '-'} />
              <StackItem label="Updated" value={part.updated_at ? new Date(part.updated_at).toLocaleString() : '-'} />
              <StackItem label="Sold At" value={part.sold_at ? new Date(part.sold_at).toLocaleString() : '-'} />
            </div>
          </Section>

          <Section icon={<Printer size={18} />} title="QR Preview">
            <div style={qrCard}>
              <div style={qrImageWrap}>
                <img src={qrImageUrl} alt="QR Code" style={qrImage} />
              </div>
              <div style={qrText}>{qrValue}</div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div style={sectionCard}>
      <div style={sectionHeader}>
        <div style={sectionIcon}>{icon}</div>
        <h2 style={sectionTitle}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function InfoGrid({ children }) {
  return <div style={infoGrid}>{children}</div>;
}

function Info({ label, value, wide = false }) {
  return (
    <div style={wide ? infoCardWide : infoCard}>
      <div style={infoLabel}>{label}</div>
      <div style={infoValue}>{value || '-'}</div>
    </div>
  );
}

function StackItem({ label, value }) {
  return (
    <div style={stackItem}>
      <div style={stackLabel}>{label}</div>
      <div style={stackValue}>{value || '-'}</div>
    </div>
  );
}

function MetaChip({ icon, text }) {
  return (
    <div style={metaChip}>
      {icon}
      <span>{text}</span>
    </div>
  );
}

const page = { padding: '32px' };
const backBtn = {
  marginBottom: '18px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontWeight: '800',
  color: '#64748b',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};
const heroCard = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '24px',
  padding: '24px',
  display: 'flex',
  justifyContent: 'space-between',
  gap: '20px',
  flexWrap: 'wrap',
  marginBottom: '24px',
};
const heroLeft = { display: 'flex', gap: '20px', flexWrap: 'wrap', flex: 1 };
const mainImageWrap = {
  width: '220px',
  height: '220px',
  borderRadius: '20px',
  overflow: 'hidden',
  border: '1px solid #e2e8f0',
  background: '#f8fafc',
  flexShrink: 0,
};
const mainImageStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const imagePlaceholder = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#94a3b8',
};
const heroInfo = { flex: 1, minWidth: '280px' };
const badgeRow = { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' };
const categoryBadge = {
  padding: '7px 12px',
  borderRadius: '999px',
  background: '#f1f5f9',
  color: '#334155',
  fontWeight: '800',
  fontSize: '12px',
};
const statusBadge = {
  padding: '7px 12px',
  borderRadius: '999px',
  background: '#dcfce7',
  color: '#166534',
  fontWeight: '800',
  fontSize: '12px',
};
const title = { margin: 0, fontSize: '34px', fontWeight: '900', color: '#0f172a' };
const subtitle = { color: '#64748b', marginTop: '8px', fontWeight: '600' };
const heroMetaGrid = { display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '18px' };
const metaChip = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 12px',
  borderRadius: '12px',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  color: '#334155',
  fontWeight: '700',
  fontSize: '13px',
};
const heroActions = { display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '180px' };
const actionBtnBase = {
  padding: '14px 16px',
  borderRadius: '14px',
  border: 'none',
  color: '#fff',
  fontWeight: '800',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
};
const darkBtn = { ...actionBtnBase, background: '#0f172a' };
const greenBtn = { ...actionBtnBase, background: '#16a34a' };
const redBtn = { ...actionBtnBase, background: '#ef4444' };
const contentGrid = { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' };
const leftColumn = { display: 'flex', flexDirection: 'column', gap: '24px' };
const rightColumn = { display: 'flex', flexDirection: 'column', gap: '24px' };
const sectionCard = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '24px',
  padding: '24px',
};
const sectionHeader = { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' };
const sectionIcon = {
  width: '40px',
  height: '40px',
  borderRadius: '12px',
  background: '#0f172a',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
const sectionTitle = { margin: 0, fontSize: '18px', fontWeight: '900', color: '#0f172a' };
const infoGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' };
const infoCard = {
  padding: '14px',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  background: '#fafafa',
};
const infoCardWide = { ...infoCard, gridColumn: '1 / -1' };
const infoLabel = {
  fontSize: '12px',
  fontWeight: '800',
  color: '#64748b',
  marginBottom: '6px',
  textTransform: 'uppercase',
};
const infoValue = {
  fontSize: '14px',
  fontWeight: '700',
  color: '#0f172a',
  wordBreak: 'break-word',
};
const galleryGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
  gap: '14px',
};
const galleryCard = {
  position: 'relative',
  borderRadius: '16px',
  overflow: 'hidden',
  border: '1px solid #e2e8f0',
  height: '150px',
  cursor: 'pointer',
};
const galleryImage = { width: '100%', height: '100%', objectFit: 'cover' };
const mainTag = {
  position: 'absolute',
  top: '8px',
  left: '8px',
  background: '#0f172a',
  color: '#fff',
  padding: '5px 8px',
  borderRadius: '8px',
  fontSize: '11px',
  fontWeight: '800',
};
const emptyBox = {
  padding: '24px',
  borderRadius: '16px',
  border: '1px dashed #cbd5e1',
  textAlign: 'center',
  color: '#94a3b8',
  fontWeight: '700',
};
const stackInfo = { display: 'flex', flexDirection: 'column', gap: '12px' };
const stackItem = {
  padding: '14px',
  borderRadius: '14px',
  border: '1px solid #e2e8f0',
  background: '#fafafa',
};
const stackLabel = {
  fontSize: '12px',
  fontWeight: '800',
  color: '#64748b',
  marginBottom: '6px',
  textTransform: 'uppercase',
};
const stackValue = {
  fontSize: '14px',
  fontWeight: '700',
  color: '#0f172a',
  wordBreak: 'break-word',
};
const qrCard = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  padding: '20px',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  background: '#fafafa',
};
const qrImageWrap = {
  background: '#fff',
  padding: '12px',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
};
const qrImage = {
  width: '180px',
  height: '180px',
  objectFit: 'contain',
  display: 'block',
};
const qrText = {
  fontWeight: '700',
  color: '#334155',
  textAlign: 'center',
  wordBreak: 'break-word',
};
