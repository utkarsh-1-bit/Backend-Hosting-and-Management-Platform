import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { appApi } from '../services/api';
import {
  Server,
  Globe,
  Cpu,
  Plus,
  Play,
  RotateCcw,
  ExternalLink,
  Copy,
  Check,
  Search,
  Layers,
  Terminal,
  Activity,
  GitBranch,
  Clock,
  Zap,
  AlertCircle,
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const context = useOutletContext();
  const openNewServiceModal = context?.openNewServiceModal;

  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [deployingId, setDeployingId] = useState(null);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use user ID from localStorage or default to 1
      const userId = JSON.parse(localStorage.getItem('hostex_user') || '{}').id || 1;
      const data = await appApi.getByUser(userId);
      setApps(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load applications:', err);
      setError(err.message || 'Unable to connect to backend. Make sure the Spring Boot server is running on port 8080.');
      setApps([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const handleCopyUrl = (e, id, url) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickDeploy = async (e, app) => {
    e.stopPropagation();
    setDeployingId(app.id);
    try {
      await appApi.start(app.id);
      setApps((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status: 'BUILDING' } : a))
      );
      // Refresh after a delay to get real status
      setTimeout(() => {
        fetchApps();
        setDeployingId(null);
      }, 3000);
    } catch (err) {
      console.error('Deploy failed:', err);
      setDeployingId(null);
    }
  };

  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      (app.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.repositoryUrl || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || (app.type || 'web') === typeFilter;
    return matchesSearch && matchesType;
  });

  const runningCount = apps.filter((a) => a.status === 'RUNNING' || a.status === 'READY').length;
  const buildingCount = apps.filter((a) => a.status === 'BUILDING' || a.status === 'DEPLOYING').length;

  return (
    <div>
      {/* Header Row */}
      <div className="services-header">
        <div className="services-title-group">
          <h1>Dashboard</h1>
          <p>Manage, monitor, and deploy all your applications and cloud services.</p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchApps} title="Refresh data">
            <RotateCcw size={14} className={loading ? 'spinning' : ''} />
            <span>Refresh</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => (openNewServiceModal ? openNewServiceModal('web') : navigate('/applications'))}
          >
            <Plus size={16} />
            <span>New Service</span>
          </button>
        </div>
      </div>

      {/* Cluster Overview Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div className="render-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Live Services</span>
            <Server size={14} className="text-mint" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff' }}>
            {runningCount} <span style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', fontWeight: 400 }}>/ {apps.length}</span>
          </div>
        </div>

        <div className="render-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Active Builds</span>
            <Layers size={14} className="text-cyan" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: buildingCount > 0 ? 'var(--status-deploying)' : '#fff' }}>
            {buildingCount}
          </div>
        </div>

        <div className="render-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Workload Scheduling</span>
            <Cpu size={14} className="text-purple" />
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--mint)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Zap size={15} /> FCFS / Priority / SJF
          </div>
        </div>

        <div className="render-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Runtime Engine</span>
            <Activity size={14} className="text-mint" />
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginTop: 4 }}>
            Docker Port 80 &middot; Healthy
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && !loading && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            padding: '14px 18px',
            background: 'rgba(244, 63, 94, 0.08)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            borderRadius: 8,
            marginBottom: 20,
            color: 'var(--accent-rose)',
            fontSize: '0.88rem',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>Backend Connection Failed</strong>
            <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{error}</div>
            <div style={{ marginTop: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={fetchApps}>
                <RotateCcw size={12} /> Retry Connection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="services-filter-bar">
        <div className="search-wrapper" style={{ flex: 1, minWidth: 260 }}>
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search services by name or repository..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-pills">
          <button className={`filter-pill-btn ${typeFilter === 'all' ? 'active' : ''}`} onClick={() => setTypeFilter('all')}>All</button>
          <button className={`filter-pill-btn ${typeFilter === 'web' ? 'active' : ''}`} onClick={() => setTypeFilter('web')}>Web Services</button>
          <button className={`filter-pill-btn ${typeFilter === 'static' ? 'active' : ''}`} onClick={() => setTypeFilter('static')}>Static Sites</button>
          <button className={`filter-pill-btn ${typeFilter === 'worker' ? 'active' : ''}`} onClick={() => setTypeFilter('worker')}>Workers</button>
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <div className="spinner spinner-lg" />
          <div style={{ color: 'var(--text-tertiary)', marginTop: 16 }}>Connecting to backend...</div>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="render-card" style={{ padding: 60, textAlign: 'center' }}>
          <Server size={36} className="text-mint" style={{ margin: '0 auto 16px', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: 8 }}>
            {error ? 'Backend unavailable' : 'No services found'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 420, margin: '0 auto 20px', fontSize: '0.9rem' }}>
            {error
              ? 'Start the Spring Boot backend on port 8080 to manage your deployments.'
              : searchQuery
              ? 'No services match your search query.'
              : 'You have not deployed any services yet. Connect your first Git repository to get started.'}
          </p>
          {!error && (
            <button
              className="btn btn-primary"
              onClick={() => (openNewServiceModal ? openNewServiceModal('web') : navigate('/applications'))}
            >
              <Plus size={15} /> Create a New Service
            </button>
          )}
        </div>
      ) : (
        <div className="services-grid">
          {filteredApps.map((app) => {
            const isLive = app.status === 'RUNNING' || app.status === 'READY';
            const isBuilding = app.status === 'BUILDING' || app.status === 'DEPLOYING' || deployingId === app.id;
            const liveUrl = app.liveUrl || `https://${(app.name || 'app').toLowerCase()}.hostex.dev`;

            return (
              <div
                key={app.id}
                className="service-card"
                onClick={() => navigate(`/applications/${app.id}`)}
              >
                <div className="service-card-top">
                  <div className="service-icon-name">
                    <div className="service-icon-box">
                      {app.type === 'static' ? (
                        <Globe size={18} className="text-cyan" />
                      ) : app.type === 'worker' ? (
                        <Cpu size={18} className="text-purple" />
                      ) : (
                        <Server size={18} className="text-mint" />
                      )}
                    </div>
                    <div>
                      <div className="service-name">{app.name}</div>
                      <div className="service-meta-line">
                        <span className="type-badge">
                          {app.type === 'static' ? 'Static Site' : app.type === 'worker' ? 'Worker' : 'Web Service'}
                        </span>
                        <span>{app.region || 'us-west-oregon'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Pill */}
                  <span
                    className={`status-pill ${
                      isBuilding ? 'deploying' : isLive ? 'live' : (app.status || 'created').toLowerCase()
                    }`}
                  >
                    <span className={`status-dot ${isLive || isBuilding ? 'pulsing' : ''}`} />
                    {isBuilding ? 'Building' : isLive ? 'Live' : app.status || 'Created'}
                  </span>
                </div>

                {/* Git branch and commit line */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)' }}>
                    <GitBranch size={13} className="text-tertiary" /> {app.branch || 'main'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-tertiary)' }}>
                    <Clock size={12} /> {app.updatedAt ? new Date(app.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently'}
                  </span>
                </div>

                {/* Live URL Pill */}
                {isLive && (
                  <div className="service-card-url" onClick={(e) => e.stopPropagation()}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {liveUrl}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button
                        title="Copy live URL"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
                        onClick={(e) => handleCopyUrl(e, app.id, liveUrl)}
                      >
                        {copiedId === app.id ? <Check size={13} className="text-mint" /> : <Copy size={13} />}
                      </button>
                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Visit application"
                        style={{ color: 'inherit', display: 'flex', alignItems: 'center' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                )}

                {/* Card Actions Footer */}
                <div className="service-card-footer" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                    onClick={() => navigate(`/applications/${app.id}?tab=logs`)}
                  >
                    <Terminal size={13} /> Logs
                  </button>

                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                    disabled={isBuilding}
                    onClick={(e) => handleQuickDeploy(e, app)}
                  >
                    {isBuilding ? (
                      <>
                        <div className="spinner" style={{ width: 12, height: 12 }} /> Deploying...
                      </>
                    ) : (
                      <>
                        <Play size={12} className="text-mint" /> Manual Deploy
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
