import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function ModulePlaceholder({ title }) {
  return (
    <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--text-primary)' }}>{title} Module</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        This module will be enabled in an upcoming deployment slice.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication routes */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />

          {/* Authenticated Dashboard & Management routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="applications" element={<ModulePlaceholder title="Applications" />} />
            <Route path="applications/:id" element={<ModulePlaceholder title="Application Details" />} />
            <Route path="jobs" element={<ModulePlaceholder title="Workload Jobs" />} />
            <Route path="scheduler" element={<ModulePlaceholder title="Scheduler" />} />
            <Route path="logs" element={<ModulePlaceholder title="Logs" />} />
            <Route path="settings" element={<ModulePlaceholder title="Settings" />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
