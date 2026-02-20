import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { setToken, removeToken } from '../lib/api';
import { Profile, UserRole } from '../lib/types';

interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string, unitKerja?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get<Profile>('/auth/me');
      if (res.data) {
        setProfile(res.data);
        setUser({ id: res.data.id, email: res.data.email, role: res.data.role });
      }
    } catch {
      removeToken();
      setUser(null);
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    const token = localStorage.getItem('pustakaplus_token');
    if (token) {
      fetchProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchProfile]);

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      const res = await api.post<{ token: string; user: Profile }>('/auth/login', { email, password });
      if (res.data?.token) {
        setToken(res.data.token);
        setProfile(res.data.user);
        setUser({ id: res.data.user.id, email: res.data.user.email, role: res.data.user.role });
      }
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Login gagal.') };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    unitKerja?: string
  ): Promise<{ error: Error | null }> => {
    try {
      const res = await api.post<{ token: string; user: Profile }>('/auth/register', {
        email,
        password,
        name,
        unitKerja,
      });
      if (res.data?.token) {
        setToken(res.data.token);
        setProfile(res.data.user);
        setUser({ id: res.data.user.id, email: res.data.user.email, role: res.data.user.role });
      }
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Registrasi gagal.') };
    }
  };

  const signOut = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore logout error
    } finally {
      removeToken();
      setUser(null);
      setProfile(null);
    }
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!profile) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(profile.role);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
