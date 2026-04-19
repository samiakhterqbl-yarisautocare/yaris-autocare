import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LockKeyhole, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from './AuthContext';
import logo from './assets/LOGO.jpeg';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const nextPath = searchParams.get('next') || '/';

  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await login(loginValue, password);
      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.non_field_errors?.[0] ||
        err?.response?.data?.detail ||
        'Invalid username/email or password.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={page}>
      <div style={card}>
        
        {/* LOGO SECTION */}
        <div style={logoWrap}>
          <img src={logo} alt="Yaris Autocare" style={logoImg} />
          <div>
            <div style={brandTop}>YARIS AUTOCARE</div>
            <div style={brandBottom}>Inventory System</div>
          </div>
        </div>

        <h1 style={title}>Staff Login</h1>
        <div style={subtitle}>
          Login to access inventory, sales and system tools.
        </div>

        <form onSubmit={handleSubmit} style={form}>
          <div style={fieldWrap}>
            <User size={16} style={iconStyle} />
            <input
              style={input}
              placeholder="Username or email"
              value={loginValue}
              onChange={(e) => setLoginValue(e.target.value)}
            />
          </div>

          <div style={fieldWrap}>
            <LockKeyhole size={16} style={iconStyle} />
            <input
              style={input}
              placeholder="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={toggleBtn}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && <div style={errorBox}>{error}</div>}

          <button type="submit" style={submitBtn} disabled={submitting}>
            {submitting ? 'Signing in...' : 'Login'}
          </button>
        </form>

        {/* FOOTER */}
        <div style={footer}>
          <div>📞 0449 828 749</div>
          <div>📍 Legana, Tasmania</div>
        </div>
      </div>
    </div>
  );
}

// Styles

const page = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #0f172a 0%, #111827 60%, #7f1d1d 100%)',
  padding: '24px',
};

const card = {
  width: '100%',
  maxWidth: '420px',
  background: '#fff',
  borderRadius: '24px',
  padding: '32px',
  boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
};

const logoWrap = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '20px',
};

const logoImg = {
  width: '50px',
  height: '50px',
  borderRadius: '12px',
  objectFit: 'cover',
  border: '1px solid #e2e8f0',
};

const brandTop = {
  fontSize: '16px',
  fontWeight: '900',
  color: '#0f172a',
};

const brandBottom = {
  fontSize: '12px',
  fontWeight: '800',
  color: '#64748b',
};

const title = {
  fontSize: '26px',
  fontWeight: '900',
  marginBottom: '6px',
};

const subtitle = {
  marginBottom: '20px',
  color: '#64748b',
  fontWeight: '600',
};

const form = {
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
};

const fieldWrap = {
  position: 'relative',
};

const iconStyle = {
  position: 'absolute',
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#94a3b8',
};

const input = {
  width: '100%',
  padding: '14px 40px',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
};

const toggleBtn = {
  position: 'absolute',
  right: '10px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
};

const submitBtn = {
  marginTop: '10px',
  background: '#0f172a',
  color: '#fff',
  padding: '14px',
  borderRadius: '12px',
  border: 'none',
  fontWeight: '800',
  cursor: 'pointer',
};

const errorBox = {
  background: '#fee2e2',
  padding: '10px',
  borderRadius: '10px',
  color: '#b91c1c',
  fontWeight: '700',
};

const footer = {
  marginTop: '20px',
  fontSize: '12px',
  color: '#64748b',
  display: 'flex',
  justifyContent: 'space-between',
};
