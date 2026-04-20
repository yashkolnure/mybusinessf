'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router  = useRouter();
  const [user,    setUser]    = useState(null);
  const [business,setBusiness]= useState(null);
  const [loading, setLoading] = useState(true);

  // ── Hydrate from token on mount ─────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const token = Cookies.get('accessToken');
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await authApi.getMe();
        setUser(data.data);
        setBusiness(data.data.business);
        if (typeof window !== 'undefined') window.__accessToken = token;
      } catch {
        Cookies.remove('accessToken');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login({ email, password });
    const { user: u, accessToken } = data.data;
    Cookies.set('accessToken', accessToken, { expires: 1/96, sameSite: 'strict' });
    if (typeof window !== 'undefined') window.__accessToken = accessToken;
    setUser(u);
    setBusiness(u.business);
    return u;
  }, []);

  // ── Register ─────────────────────────────────────────────────────────────
  const register = useCallback(async (formData) => {
    const { data } = await authApi.register(formData);
    const { user: u, accessToken } = data.data;
    Cookies.set('accessToken', accessToken, { expires: 1/96, sameSite: 'strict' });
    if (typeof window !== 'undefined') window.__accessToken = accessToken;
    setUser(u);
    setBusiness(u.business);
    return u;
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch (_) {}
    Cookies.remove('accessToken');
    if (typeof window !== 'undefined') delete window.__accessToken;
    setUser(null);
    setBusiness(null);
    router.push('/login');
  }, [router]);

  // ── Permission check ──────────────────────────────────────────────────────
  const can = useCallback((module, action) => {
    if (!user) return false;
    if (['SUPER_ADMIN', 'ADMIN'].includes(user.role)) return true;
    const perm = user.permissions?.find((p) => p.module === module);
    return perm?.actions?.includes(action) ?? false;
  }, [user]);

  const hasRole = useCallback((...roles) => {
    return user ? roles.includes(user.role) : false;
  }, [user]);

  // ── Refresh user data ────────────────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authApi.getMe();
      setUser(data.data);
      setBusiness(data.data.business);
    } catch (_) {}
  }, []);

  const value = {
    user,
    business,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    can,
    hasRole,
    refreshUser,
    currencySymbol: business?.currencySymbol || '₹',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
