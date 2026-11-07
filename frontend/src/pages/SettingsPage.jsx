import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { systemApi } from '../services/api';
import PageArtwork from '../components/PageArtwork';
import { Database, RefreshCw, Server, CircleCheck, CircleX, UserRound } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [health, setHealth] = useState({ loading: true, online: false, database: 'UNKNOWN', latency: null });
  const [checking, setChecking] = useState(false);

  const loadHealth = useCallback(async () => {
    const result = await systemApi.checkHealth();
    setHealth({ loading: false, ...result });
  }, []);

  const checkHealth = async () => {
    setChecking(true);
    await loadHealth();
    setChecking(false);
  };

  useEffect(() => {
    void loadHealth();
  }, [loadHealth]);

  return (
    <div className="settings-page">
      <div className="page-header page-header-illustrated">
        <div>
          <h1 className="page-title">System Settings</h1>
          <p className="page-subtitle">Account and service connectivity</p>
        </div>
        <PageArtwork variant="settings" />
      </div>

      <div className="content-grid">
        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Service Health</h2>
              <p className="card-subtitle">Live API and database connection check</p>
            </div>
            <button className="btn btn-secondary btn-sm" type="button" onClick={checkHealth} disabled={checking} title="Check service health">
              <RefreshCw size={14} className={checking ? 'spinning' : ''} />
            </button>
          </div>
          <div className="card-body" style={{ display: 'grid', gap: 16 }}>
            <HealthRow icon={Server} label="Spring Boot API" value={health.loading ? 'Checking' : health.online ? 'Operational' : 'Unavailable'} online={health.online} />
            <HealthRow icon={Database} label="MySQL connection" value={health.loading ? 'Checking' : health.database === 'UP' ? 'Operational' : 'Unavailable'} online={health.database === 'UP'} />
            {health.online && <p className="card-subtitle">Response time: {health.latency} ms</p>}
            {!health.online && !health.loading && <p className="card-subtitle">Start the backend with `mvnw spring-boot:run` from the backend directory, and configure DB_URL, DB_USERNAME, and DB_PASSWORD.</p>}
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Signed-in Account</h2>
              <p className="card-subtitle">Account details from the authenticated session</p>
            </div>
            <UserRound size={18} />
          </div>
          <div className="card-body" style={{ display: 'grid', gap: 16 }}>
            <div>
              <div className="form-label">Name</div>
              <div>{user?.name || '—'}</div>
            </div>
            <div>
              <div className="form-label">Email</div>
              <div>{user?.email || '—'}</div>
            </div>
            <p className="card-subtitle">Authentication uses a signed, expiring session token. Profile editing and API-key management are not available in this backend.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

function HealthRow({ icon: Icon, label, value, online }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Icon size={17} />
      <span style={{ flex: 1 }}>{label}</span>
      {online ? <CircleCheck size={16} style={{ color: 'var(--success)' }} /> : <CircleX size={16} style={{ color: 'var(--danger)' }} />}
      <span>{value}</span>
    </div>
  );
}
