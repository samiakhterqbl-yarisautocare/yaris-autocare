import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from './api';
import {
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
  clearAuth,
} from './auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(!!getToken());

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setLoading(false);
      return;
    }

    api.get('/auth/me/')
      .then((res) => {
        setUser(res.data);
        setStoredUser(res.data);
      })
      .catch(() => {
        clearAuth();
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (loginValue, password) => {
    const res = await api.post('/auth/login/', {
      login: loginValue,
      password,
    });

    setToken(res.data.token);
    setStoredUser(res.data.user);
    setUser(res.data.user);

    return res.data.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout/');
    } catch (error) {
      // ignore logout API errors, still clear local auth
    }

    clearAuth();
    setUser(null);
  };

  const value = useMemo(() => {
    return {
      user,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'ADMIN' || user?.is_superuser,
      isStaff: user?.role === 'STAFF' || user?.role === 'ADMIN' || user?.is_superuser,
      login,
      logout,
    };
  }, [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
