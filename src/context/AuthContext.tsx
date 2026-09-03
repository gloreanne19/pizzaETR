'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthSession } from '@/types/api';

interface UserStats {
  cartCount: number;
  favoritesCount: number;
  ordersCount: number;
}

interface AuthContextType {
  user: AuthSession | null;
  admin: AuthSession | null;
  stats: UserStats;
  loading: boolean;
  loginUser: (identifier: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  registerUser: (name: string, email: string, pass: string, cpass: string) => Promise<{ success: boolean; message?: string }>;
  logoutUser: () => Promise<void>;
  loginAdmin: (name: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logoutAdmin: () => Promise<void>;
  refreshStats: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthSession | null>(null);
  const [admin, setAdmin] = useState<AuthSession | null>(null);
  const [stats, setStats] = useState<UserStats>({ cartCount: 0, favoritesCount: 0, ordersCount: 0 });
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          setUser(json.data.user);
          setStats(json.data.stats || { cartCount: 0, favoritesCount: 0, ordersCount: 0 });
        }
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    }
  };

  const fetchAdminProfile = async () => {
    try {
      const res = await fetch('/api/admin/auth/me');
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && json.data?.admin) {
          setAdmin({ id: json.data.admin.id, name: json.data.admin.name, role: 'admin' });
        }
      } else {
        setAdmin(null);
      }
    } catch (e) {
      setAdmin(null);
    }
  };

  useEffect(() => {
    Promise.all([fetchUserProfile(), fetchAdminProfile()]).finally(() => setLoading(false));
  }, []);

  const loginUser = async (identifier: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, pass }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        await fetchUserProfile();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Login error' };
    }
  };

  const registerUser = async (name: string, email: string, pass: string, cpass: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, pass, cpass }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        await fetchUserProfile();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Registration error' };
    }
  };

  const logoutUser = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setStats({ cartCount: 0, favoritesCount: 0, ordersCount: 0 });
    } catch (e) {
      console.error(e);
    }
  };

  const loginAdmin = async (name: string, pass: string) => {
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, pass }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        await fetchAdminProfile();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Admin login failed' };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Admin login error' };
    }
  };

  const logoutAdmin = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      setAdmin(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        stats,
        loading,
        loginUser,
        registerUser,
        logoutUser,
        loginAdmin,
        logoutAdmin,
        refreshStats: fetchUserProfile,
        refreshUser: fetchUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const defaultAuthValue: AuthContextType = {
  user: null,
  admin: null,
  stats: { cartCount: 0, favoritesCount: 0, ordersCount: 0 },
  loading: true,
  loginUser: async () => ({ success: false }),
  registerUser: async () => ({ success: false }),
  logoutUser: async () => { },
  loginAdmin: async () => ({ success: false }),
  logoutAdmin: async () => { },
  refreshStats: async () => { },
  refreshUser: async () => { },
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context || defaultAuthValue;
};

