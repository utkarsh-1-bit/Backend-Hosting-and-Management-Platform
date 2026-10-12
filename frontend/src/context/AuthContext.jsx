import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

// Mock user for demo purposes - remove when connecting to real backend
const MOCK_USERS = [
  { id: 1, name: 'Utkarsh Shukla', email: 'utkarsh@hostex.dev', password: 'password' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('hostex_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email, password) => {
    // When backend is live, replace with: const data = await authApi.login({ email, password });
    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!found) {
      throw new Error('Invalid email or password');
    }
    const userData = { id: found.id, name: found.name, email: found.email };
    localStorage.setItem('hostex_user', JSON.stringify(userData));
    localStorage.setItem('hostex_token', 'mock-jwt-token');
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (name, email, password) => {
    // When backend is live, replace with: const data = await authApi.register({ name, email, password });
    const userData = { id: Date.now(), name, email };
    localStorage.setItem('hostex_user', JSON.stringify(userData));
    localStorage.setItem('hostex_token', 'mock-jwt-token');
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('hostex_user');
    localStorage.removeItem('hostex_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
