import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { systemApi } from '../services/api';
import {
  Settings,
  Server,
  Shield,
  Activity,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Zap,
  Save,
  Database,
  Trash2,
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [testingConnection, setTestingConnection] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);
  const [apiUrl, setApiUrl] = useState('http://localhost:8080');
  const [saved, setSaved] = useState(false);

  const testBackend = async () => {
    setTestingConnection(true);
    const res = await systemApi.checkHealth();
    setHealthStatus(res);
    setTestingConnection(false);
  };

  useEffect(() => {
    testBackend();
  }, []);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleResetCache = () => {
    if (window.confirm('Reset all local workspace simulations and reload defaults?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div style={{ maxWidth: 880 }}>
      <div className="services-header">
        <div className="services-title-group">
          <h1>Settings &amp; Environment</h1>
          <p>Configure backend API endpoints, Docker runtime settings, and platform preferences.</p>
        </div>
      </div>

      {/* Spring Boot Backend Diagnostic Card */}
      <div className="render-card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Server size={20} className="text-mint" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>
              Spring Boot Backend Link
            </h3>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={testBackend} disabled={testingConnection}>
            <RotateCcw size={13} className={testingConnection ? 'spinning' : ''} />
            <span>Test Connection</span>
          </button>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
          HosteX links directly to the Spring Boot REST backend running on port 8080 (via Vite reverse proxy).
        </p>

        {healthStatus && (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 8,
              background: healthStatus.online ? 'rgba(70, 227, 183, 0.08)' : 'rgba(245, 158, 11, 0.08)',
              border: `1px solid ${healthStatus.online ? 'var(--mint-border)' : 'rgba(245, 158, 11, 0.3)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="status-dot pulsing" style={{ background: healthStatus.online ? 'var(--mint)' : 'var(--accent-amber)' }} />
              <div>
                <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>
                  {healthStatus.online ? 'Backend Connected & Active' : 'Operating in Standalone Engine Mode'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {healthStatus.online
                    ? `Spring Boot 4.1.1 responded with ${healthStatus.latency}ms roundtrip latency`
                    : 'Backend is offline or initializing. Local state engine is seamlessly maintaining full functionality.'}
                </div>
              </div>
            </div>

            <span className={`status-pill ${healthStatus.online ? 'live' : 'queued'}`}>
              {healthStatus.online ? 'Online' : 'Fallback Active'}
            </span>
          </div>
        )}

        <form onSubmit={handleSaveSettings}>
          <div className="form-group">
            <label className="form-label">Backend Target Base URL</label>
            <input
              type="text"
              className="form-input"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)' }}
            />
            <div className="form-hint">Proxied automatically in development mode via `vite.config.js` to avoid CORS issues.</div>
          </div>

          <button type="submit" className="btn btn-primary btn-sm">
            <Save size={14} /> Save Configuration
          </button>
          {saved && <span style={{ marginLeft: 12, color: 'var(--mint)', fontSize: '0.85rem' }}>Saved!</span>}
        </form>
      </div>

      {/* Runtime Architecture Card */}
      <div className="render-card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: 16 }}>
          Container Runtime Settings
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Workspace Isolation Directory</label>
            <input
              type="text"
              disabled
              className="form-input"
              value="hostex-workspaces/app-{id}"
              style={{ fontFamily: 'var(--font-mono)', opacity: 0.8 }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Docker Default Internal Port</label>
            <input
              type="text"
              disabled
              className="form-input"
              value="80 (HTTP)"
              style={{ fontFamily: 'var(--font-mono)', opacity: 0.8 }}
            />
          </div>
        </div>
      </div>

      {/* User Account Card */}
      <div className="render-card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: 16 }}>
          Developer Profile
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input type="text" className="form-input" defaultValue={user?.name || 'Developer'} />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" disabled className="form-input" defaultValue={user?.email || 'admin@hostex.io'} />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div
        className="render-card"
        style={{
          borderColor: 'rgba(244, 63, 94, 0.3)',
          background: 'rgba(244, 63, 94, 0.03)',
        }}
      >
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--accent-rose)', marginBottom: 8 }}>
          Reset Local Data
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
          Clear all simulated applications, workload jobs, environment variables, and cached cluster telemetry stored in local state.
        </p>

        <button className="btn btn-danger btn-sm" onClick={handleResetCache}>
          <Trash2 size={14} /> Clear Cache &amp; Reset Demo Data
        </button>
      </div>
    </div>
  );
}
