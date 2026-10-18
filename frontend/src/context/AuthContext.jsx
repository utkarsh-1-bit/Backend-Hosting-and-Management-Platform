import { createContext, useContext, useState, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

const DEMO_FALLBACK_USER = {
  id: 1,
  name: 'Shawn Developer',
  email: 'developer@hostex.io',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('hostex_user');
      return stored ? JSON.parse(stored) : DEMO_FALLBACK_USER; // Default to active session for instant testing
    } catch {
      return DEMO_FALLBACK_USER;
    }
  });

  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const login = useCallback(async (email, password) => {
    try {
      const res = await authApi.login({ email, password });
      const rawUser = res?.data || res;
      const userData = {
        id: rawUser.id || 1,
        name: rawUser.name || email.split('@')[0] || 'Developer',
        email: rawUser.email || email,
      };
      localStorage.setItem('hostex_user', JSON.stringify(userData));
      localStorage.setItem('hostex_token', `session_${userData.id}`);
      setUser(userData);
      setIsOfflineMode(res?.source === 'fallback');
      return userData;
    } catch (err) {
      console.warn('Login fallback triggered:', err.message);
      const fallback = {
        id: 1,
        name: email ? email.split('@')[0] : 'Developer',
        email: email || DEMO_FALLBACK_USER.email,
      };
      localStorage.setItem('hostex_user', JSON.stringify(fallback));
      localStorage.setItem('hostex_token', 'local_demo_token');
      setUser(fallback);
      setIsOfflineMode(true);
      return fallback;
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const res = await authApi.register({ name, email, password });
      const rawUser = res?.data || res;
      const userData = {
        id: rawUser.id || Date.now(),
        name: rawUser.name || name,
        email: rawUser.email || email,
      };
      localStorage.setItem('hostex_user', JSON.stringify(userData));
      localStorage.setItem('hostex_token', `session_${userData.id}`);
      setUser(userData);
      setIsOfflineMode(res?.source === 'fallback');
      return userData;
    } catch (err) {
      console.warn('Register fallback triggered:', err.message);
      const fallback = { id: Date.now(), name, email };
      localStorage.setItem('hostex_user', JSON.stringify(fallback));
      localStorage.setItem('hostex_token', 'local_demo_token');
      setUser(fallback);
      setIsOfflineMode(true);
      return fallback;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('hostex_user');
    localStorage.removeItem('hostex_token');
    setUser(null);
    setIsOfflineMode(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isOfflineMode,
      }}
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
