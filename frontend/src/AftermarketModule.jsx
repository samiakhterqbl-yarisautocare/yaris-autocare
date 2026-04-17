import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Plus,
  Search,
  X,
  Eye,
  Pencil,
  Package,
  AlertTriangle,
  MapPin,
  Tag,
  Layers,
  RefreshCw
} from 'lucide-react';

const API_URL = 'https://yaris-autocare-production.up.railway.app';

// ✅ FIX FOR IMAGES
const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${API_URL}${imageUrl}`;
};

const COLORS = {
  primary: '#ef4444',
  dark: '#0f172a',
  border: '#e2e8f0',
  bg: '#f8fafc',
  slate: '#64748b',
  success: '#166534',
  successBg: '#dcfce7',
  warning: '#92400e',
  warningBg: '#fef3c7',
  danger: '#991b1b',
  dangerBg: '#fee2e2',
  white: '#ffffff'
};

const AftermarketModule = () => {
  const navigate = useNavigate();
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/aftermarket/`);
      const items = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];
      setStock(items);
    } catch (error) {
      console.error('Failed to load aftermarket inventory:', error);
      alert('Failed to load aftermarket inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const getMainImage = (item) => {
    if (!Array.isArray(item.images) || item.images.length === 0) return null;
    return item.images.find((img) => img.is_main) || item.images[0];
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Aftermarket Inventory</h1>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={fetchInventory} style={secondaryBtn}>
            <RefreshCw size={16} />
            Refresh
          </button>

          <button onClick={() => navigate('/aftermarket/new')} style={primaryBtn}>
            <Plus size={18} />
            New Product
          </button>
        </div>
      </div>

      <div style={tableCard}>
        {loading ? (
          <div style={emptyState}>Loading...</div>
        ) : (
          stock.map((item) => {
            const mainImage = getMainImage(item);

            return (
              <div key={item.id} style={row}>
                <div style={thumbBox}>
                  {mainImage?.image ? (
                    <img
                      src={resolveImageUrl(mainImage.image)} // ✅ FIXED
                      alt={item.part_name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Package size={18} />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={name}>{item.part_name}</div>
                  <div style={sub}>SKU: {item.sku}</div>
                  <div style={sub}>
                    <MapPin size={12} /> {item.location}
                  </div>
                </div>

                <div style={actions}>
                  <button onClick={() => navigate(`/aftermarket/${item.id}`)} style={btn}>
                    <Eye size={14} /> View
                  </button>

                  <button onClick={() => navigate(`/aftermarket/edit/${item.id}`)} style={btnDark}>
                    <Pencil size={14} /> Edit
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AftermarketModule;
