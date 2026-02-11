'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authFetch } from './auth-fetch';
import { clearTokens, getAccessToken, getApiBaseUrl, setTokens } from './auth';

export interface AuthUser {
  id: number;
  name?: string | null;
  email?: string | null;
  mobile?: string | null;
  isVerified?: boolean;
  loginCount?: number;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name?: string;
  email: string;
  password: string;
  mobile: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<{ success: boolean; message?: string }>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async () => {
    const response = await authFetch('/users/me');
    if (!response.ok) {
      clearTokens();
      setUser(null);
      return;
    }
    const data = await response.json();
    if (data?.user) {
      setUser(data.user);
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    refreshProfile()
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (payload: LoginPayload) => {
    const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return { success: false, message: data?.message || 'Login failed' };
    }

    const data = await response.json();
    if (data?.tokens?.accessToken) {
      setTokens(data.tokens.accessToken, data.tokens.refreshToken, data.tokens.expiresIn);
      setUser(data.user || null);
      return { success: true };
    }

    return { success: false, message: 'Login failed' };
  };

  const register = async (payload: RegisterPayload) => {
    const response = await fetch(`${getApiBaseUrl()}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return { success: false, message: data?.message || 'Registration failed' };
    }

    const data = await response.json();
    if (data?.tokens?.accessToken) {
      setTokens(data.tokens.accessToken, data.tokens.refreshToken, data.tokens.expiresIn);
      setUser(data.user || null);
      return { success: true };
    }

    return { success: false, message: 'Registration failed' };
  };

  const logout = async () => {
    const accessToken = getAccessToken();
    if (accessToken) {
      await fetch(`${getApiBaseUrl()}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }).catch(() => undefined);
    }

    clearTokens();
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    isLoading,
    login,
    register,
    logout,
    refreshProfile
  }), [user, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
