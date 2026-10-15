import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { systemApi } from '../services/api';
import {
  User, Key, Shield, Save, Check, Server,
  RefreshCw, CheckCircle2, XCircle, Terminal, HardDrive
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || 'Utkarsh Shukla');
  const [email, setEmail] = useState(user?.email || 'utkarsh@hostex.dev');
  const [saved, setSaved] = useState(false);

  // Platform preferences
  const [clusterRegion, setClusterRegion] = useState('ap-south-1 (Mumbai)');
  const [autoScale, setAutoScale] = useState(true);
  const [slackAlerts, setSlackAlerts] = useState(true);

  // Backend connection status
  const [backendHealth, setBackendHealth] = useState({ loading: true, online: false, latency: null });
  const [testingConnection, setTestingConnection] = useState(false);

  const testBackend = async () => {
    setTestingConnection(true);
    try {
      const res = await systemApi.checkHealth();
      setBackendHealth({ loading: false, online: res.online, latency: res.latency });
    } finally {
      setTestingConnection(false);
    }
  };

  useEffect(() => {
    testBackend();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Platform Settings</h1>
          <p className="page-subtitle">Configure backend connectivity, developer profile, and cluster options</p>
        </div>
      </div>

      <div className="content-grid" style={{ marginBottom: 24 }}>
        {/* Backend Connectivity & Integration Status */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 className="card-title">Backend Integration</h2>
              <p className="card-subtitle">Spring Boot REST API & Database connectivity</p>
            </div>
            <Server size={18} style={{ color: 'var(--text-tertiary)' }} />
          </div>

          <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {backendHealth.loading ? (
                  <RefreshCw size={16} className="spinning" style={{ color: 'var(--text-tertiary)' }} />
                ) : backendHealth.online ? (
                  <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
                ) : (
                  <XCircle size={18} style={{ color: 'var(--danger)' }} />
                )}
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    {backendHealth.loading
                      ? 'Checking backend connection...'
                      : backendHealth.online
                      ? 'Connected to Spring Boot Backend'
                      : 'Backend Server Offline'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    {backendHealth.online
                      ? `API responding at http://localhost:8080 (${backendHealth.latency}ms latency)`
                      : 'Spring Boot is not currently running on http://localhost:8080'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={testBackend}
                disabled={testingConnection}
              >
                <RefreshCw size={13} className={testingConnection ? 'spinning' : ''} />
                {testingConnection ? 'Pinging...' : 'Test Ping'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '12px 14px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 600 }}>API Endpoint</div>
                <div style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--text-primary)', marginTop: '4px' }}>http://localhost:8080/api</div>
              </div>
              <div style={{ padding: '12px 14px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 600 }}>Database Target</div>
                <div style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--text-primary)', marginTop: '4px' }}>MySQL (jdbc:mysql://localhost:3306)</div>
              </div>
              <div style={{ padding: '12px 14px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 600 }}>Container Runtime</div>
                <div style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--text-primary)', marginTop: '4px' }}>Docker Engine API</div>
              </div>
            </div>

            {!backendHealth.online && !backendHealth.loading && (
              <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>How to run the backend locally:</div>
                <code>cd backend && ./mvnw spring-boot:run</code>
                <div style={{ marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Frontend will automatically communicate via Vite proxy on port 5173.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Developer Identity</h2>
              <p className="card-subtitle">Your credentials and API access tokens</p>
            </div>
            <User size={18} style={{ color: 'var(--text-tertiary)' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '0 24px 24px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">API Access Token</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="password"
                  className="form-control"
                  value="htx_live_983749284719481230491823"
                  readOnly
                  style={{ fontFamily: 'monospace' }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => alert('API token copied to clipboard')}
                >
                  <Key size={14} />
                  Copy
                </button>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
                Used by CLI and automated pipelines to authenticate API requests.
              </span>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }}>
              {saved ? (
                <>
                  <Check size={16} /> Saved
                </>
              ) : (
                <>
                  <Save size={16} /> Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Cluster Preferences Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Cluster Preferences</h2>
            <p className="card-subtitle">Default compute environment settings</p>
          </div>
          <Shield size={18} style={{ color: 'var(--text-tertiary)' }} />
        </div>

        <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label">Primary Region</label>
            <select
              className="form-control"
              value={clusterRegion}
              onChange={(e) => setClusterRegion(e.target.value)}
            >
              <option value="ap-south-1 (Mumbai)">ap-south-1 (Mumbai)</option>
              <option value="us-east-1 (N. Virginia)">us-east-1 (N. Virginia)</option>
              <option value="eu-west-1 (Ireland)">eu-west-1 (Ireland)</option>
              <option value="ap-southeast-1 (Singapore)">ap-southeast-1 (Singapore)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontWeight: 550, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Automatic Workload Auto-scaling</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Scale containers dynamically according to CPU thresholds</div>
            </div>
            <input
              type="checkbox"
              checked={autoScale}
              onChange={(e) => setAutoScale(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
            <div>
              <div style={{ fontWeight: 550, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Deployment Notifications</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Send alerts on job crash, container stoppage, or failed builds</div>
            </div>
            <input
              type="checkbox"
              checked={slackAlerts}
              onChange={(e) => setSlackAlerts(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
