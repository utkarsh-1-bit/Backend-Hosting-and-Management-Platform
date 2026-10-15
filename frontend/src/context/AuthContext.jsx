import { createContext, useContext, useState, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

// Default fallback demo credentials if backend server is not running locally
const DEMO_FALLBACK_USER = {
  id: 1,
  name: 'Utkarsh Shukla',
  email: 'utkarsh@hostex.dev',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('hostex_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const login = useCallback(async (email, password) => {
    try {
      // Connect to real Spring Boot backend /api/users/login
      const data = await authApi.login({ email, password });
      const userData = { id: data.id, name: data.name, email: data.email };
      localStorage.setItem('hostex_user', JSON.stringify(userData));
      localStorage.setItem('hostex_token', `session_${data.id}`);
      setUser(userData);
      setIsOfflineMode(false);
      return userData;
    } catch (err) {
      // If network error (backend not running locally), allow seamless local demo session
      const isNetworkError =
        err.message?.includes('Failed to fetch') ||
        err.message?.includes('NetworkError') ||
        err.message?.includes('Failed to connect') ||
        err.name === 'TypeError';

      if (isNetworkError) {
        console.warn('Backend server unreachable; starting in local preview mode.', err);
        const fallback = {
          ...DEMO_FALLBACK_USER,
          email: email || DEMO_FALLBACK_USER.email,
        };
        localStorage.setItem('hostex_user', JSON.stringify(fallback));
        localStorage.setItem('hostex_token', 'local_demo_token');
        setUser(fallback);
        setIsOfflineMode(true);
        return fallback;
      }
      throw err;
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      // Connect to real Spring Boot backend /api/users/register
      const data = await authApi.register({ name, email, password });
      const userData = { id: data.id, name: data.name, email: data.email };
      localStorage.setItem('hostex_user', JSON.stringify(userData));
      localStorage.setItem('hostex_token', `session_${data.id}`);
      setUser(userData);
      setIsOfflineMode(false);
      return userData;
    } catch (err) {
      const isNetworkError =
        err.message?.includes('Failed to fetch') ||
        err.message?.includes('NetworkError') ||
        err.message?.includes('Failed to connect') ||
        err.name === 'TypeError';

      if (isNetworkError) {
        console.warn('Backend server unreachable; registering in local preview mode.', err);
        const fallback = { id: Date.now(), name, email };
        localStorage.setItem('hostex_user', JSON.stringify(fallback));
        localStorage.setItem('hostex_token', 'local_demo_token');
        setUser(fallback);
        setIsOfflineMode(true);
        return fallback;
      }
      throw err;
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
