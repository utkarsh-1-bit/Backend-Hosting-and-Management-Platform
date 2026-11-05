import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem('hostex_user');
      return stored && sessionStorage.getItem('hostex_token') ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const persistSession = useCallback((data) => {
    const userData = { id: data.id, name: data.name, email: data.email };
    sessionStorage.setItem('hostex_user', JSON.stringify(userData));
    sessionStorage.setItem('hostex_token', data.token);
    setUser(userData);
    return userData;
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password });
    return persistSession(data);
  }, [persistSession]);

  const register = useCallback(async (name, email, password) => {
    const data = await authApi.register({ name, email, password });
    return persistSession(data);
  }, [persistSession]);

  const logout = useCallback(() => {
    sessionStorage.removeItem('hostex_user');
    sessionStorage.removeItem('hostex_token');
    setUser(null);
  }, []);

  useEffect(() => {
    window.addEventListener('hostex:unauthorized', logout);
    return () => window.removeEventListener('hostex:unauthorized', logout);
  }, [logout]);

  const contextValue = useMemo(() => ({
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }), [user, login, register, logout]);

  return (
    <AuthContext.Provider
      value={contextValue}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
