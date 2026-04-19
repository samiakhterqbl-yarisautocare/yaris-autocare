import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LockKeyhole, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from './AuthContext';

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
        err?.response?.data?.login?.[0] ||
        'Login failed. Please check username/email and password.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={page}>
      <div style={card}>
        <div style={logoWrap}>
          <div style={logoBox}>Y</div>
          <div>
            <div style={brandTop}>YARIS</div>
            <div style={brandBottom}>AUTOCARE INVENTORY</div>
          </div>
        </div>

        <h1 style={title}>Staff Login</h1>
        <div style={subtitle}>
          Login with username or email to access the system.
        </div>

        <form onSubmit={handleSubmit} style={form}>
          <div style={fieldWrap}>
            <User size={16} style={iconStyle} />
            <input
              style={input}
              placeholder="Username or email"
              value={loginValue}
              onChange={(e) => setLoginValue(e.target.value)}
              autoComplete="username"
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
              autoComplete="current-password"
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
  background: 'linear-gradient(135deg, #0f172a 0%, #111827 55%, #7f1d1d 100%)',
  padding: '24px',
};

const card = {
  width: '100%',
  maxWidth: '420px',
  background: '#fff',
  borderRadius: '24px',
  padding: '32px',
  boxShadow: '0 25px 50px rgba(0,0,0,0.18)',
};

const logoWrap = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '22px',
};

const logoBox = {
  width: '50px',
  height: '50px',
  borderRadius: '14px',
  background: '#ef4444',
  color: '#fff',
  fontWeight: '900',
  fontSize: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
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
  margin: '0 0 6px 0',
  fontSize: '28px',
  fontWeight: '900',
  color: '#0f172a',
};

const subtitle = {
  marginBottom: '24px',
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
  display: 'flex',
  alignItems: 'center',
};

const iconStyle = {
  position: 'absolute',
  left: '14px',
  color: '#94a3b8',
};

const input = {
  width: '100%',
  padding: '14px 44px 14px 42px',
  borderRadius: '14px',
  border: '1px solid #e2e8f0',
  outline: 'none',
  fontSize: '14px',
  boxSizing: 'border-box',
};

const toggleBtn = {
  position: 'absolute',
  right: '12px',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  color: '#64748b',
};

const submitBtn = {
  marginTop: '8px',
  background: '#0f172a',
  color: '#fff',
  border: 'none',
  borderRadius: '14px',
  padding: '14px 18px',
  fontWeight: '800',
  fontSize: '15px',
  cursor: 'pointer',
};

const errorBox = {
  background: '#fef2f2',
  color: '#b91c1c',
  border: '1px solid #fecaca',
  padding: '12px 14px',
  borderRadius: '12px',
  fontWeight: '700',
  fontSize: '13px',
};
