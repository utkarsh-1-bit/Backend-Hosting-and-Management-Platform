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
  Filter,
  Grid,
  List,
  GitBranch,
  Terminal,
  Clock,
  MoreVertical,
  Trash2,
} from 'lucide-react';

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const context = useOutletContext();
  const openNewServiceModal = context?.openNewServiceModal;

  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [copiedId, setCopiedId] = useState(null);
  const [deployingId, setDeployingId] = useState(null);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    try {
      const userId = JSON.parse(localStorage.getItem('hostex_user') || '{}').id || 1;
      const data = await appApi.getByUser(userId);
      setApps(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load apps:', err);
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

  const handleDeploy = async (e, app) => {
    e.stopPropagation();
    setDeployingId(app.id);
    try {
      await appApi.start(app.id);
      setApps((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status: 'BUILDING' } : a))
      );
      setTimeout(() => {
        fetchApps();
        setDeployingId(null);
      }, 3000);
    } catch (err) {
      console.error('Deploy failed:', err);
      setDeployingId(null);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this service and release its resources?')) return;
    try {
      await appApi.delete(id);
      setApps((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert('Failed to delete service: ' + err.message);
    }
  };

  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      (app.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.repositoryUrl || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || (app.type || 'web') === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div>
      <div className="services-header">
        <div className="services-title-group">
          <h1>Services</h1>
          <p>All active web services, static sites, background workers, and containers.</p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchApps} title="Refresh services">
            <RotateCcw size={14} className={loading ? 'spinning' : ''} />
            <span>Refresh</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => (openNewServiceModal ? openNewServiceModal('web') : null)}
          >
            <Plus size={16} />
            <span>New Service</span>
          </button>
        </div>
      </div>

      {/* Filter and View Mode Switcher */}
      <div className="services-filter-bar">
        <div className="search-wrapper" style={{ flex: 1, minWidth: 260 }}>
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, repository, or branch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-pills">
          <button
            className={`filter-pill-btn ${typeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setTypeFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-pill-btn ${typeFilter === 'web' ? 'active' : ''}`}
            onClick={() => setTypeFilter('web')}
          >
            Web Services
          </button>
          <button
            className={`filter-pill-btn ${typeFilter === 'static' ? 'active' : ''}`}
            onClick={() => setTypeFilter('static')}
          >
            Static Sites
          </button>
          <button
            className={`filter-pill-btn ${typeFilter === 'worker' ? 'active' : ''}`}
            onClick={() => setTypeFilter('worker')}
          >
            Workers
          </button>
        </div>

        <div className="filter-pills">
          <button
            className={`filter-pill-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            <Grid size={14} />
          </button>
          <button
            className={`filter-pill-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="Table / List view"
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* Render View */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <div className="spinner spinner-lg" />
          <div style={{ color: 'var(--text-tertiary)', marginTop: 16 }}>Loading services...</div>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="render-card" style={{ padding: 60, textAlign: 'center' }}>
          <Server size={36} className="text-mint" style={{ margin: '0 auto 16px', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: 8 }}>No services found</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 420, margin: '0 auto 20px', fontSize: '0.9rem' }}>
            {searchQuery ? 'No services match your filters.' : 'Deploy your first web service from GitHub.'}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => (openNewServiceModal ? openNewServiceModal('web') : null)}
          >
            <Plus size={15} /> Create a New Service
          </button>
        </div>
      ) : viewMode === 'grid' ? (
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

                  <span
                    className={`status-pill ${
                      isBuilding ? 'deploying' : isLive ? 'live' : (app.status || 'created').toLowerCase()
                    }`}
                  >
                    <span className={`status-dot ${isLive || isBuilding ? 'pulsing' : ''}`} />
                    {isBuilding ? 'Building' : isLive ? 'Live' : app.status || 'Created'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)' }}>
                    <GitBranch size={13} className="text-tertiary" /> {app.branch || 'main'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-tertiary)' }}>
                    <Clock size={12} /> {app.updatedAt ? new Date(app.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently'}
                  </span>
                </div>

                {isLive && (
                  <div className="service-card-url" onClick={(e) => e.stopPropagation()}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {liveUrl}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button
                        title="Copy URL"
                        onClick={(e) => handleCopyUrl(e, app.id, liveUrl)}
                      >
                        {copiedId === app.id ? <Check size={13} className="text-mint" /> : <Copy size={13} />}
                      </button>
                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Visit site"
                        style={{ color: 'inherit', display: 'flex', alignItems: 'center' }}
                      >
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                )}

                <div className="service-card-footer" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                    onClick={() => navigate(`/applications/${app.id}?tab=logs`)}
                  >
                    <Terminal size={13} /> Logs
                  </button>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                      disabled={isBuilding}
                      onClick={(e) => handleDeploy(e, app)}
                    >
                      {isBuilding ? (
                        <>
                          <div className="spinner" style={{ width: 12, height: 12 }} /> Deploying...
                        </>
                      ) : (
                        <>
                          <Play size={12} className="text-mint" /> Deploy
                        </>
                      )}
                    </button>

                    <button
                      className="btn btn-danger btn-sm btn-icon"
                      title="Delete service"
                      onClick={(e) => handleDelete(e, app.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="render-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="env-table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Branch / Repository</th>
                <th>Live URL</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => {
                const isLive = app.status === 'RUNNING' || app.status === 'READY';
                const isBuilding = app.status === 'BUILDING' || app.status === 'DEPLOYING' || deployingId === app.id;
                const liveUrl = app.liveUrl || `https://${(app.name || 'app').toLowerCase()}.hostex.dev`;

                return (
                  <tr
                    key={app.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/applications/${app.id}`)}
                  >
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem' }}>{app.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{app.region || 'us-west-oregon'}</div>
                    </td>
                    <td>
                      <span className="type-badge">
                        {app.type === 'static' ? 'Static Site' : app.type === 'worker' ? 'Worker' : 'Web Service'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          isBuilding ? 'deploying' : isLive ? 'live' : (app.status || 'created').toLowerCase()
                        }`}
                      >
                        <span className={`status-dot ${isLive || isBuilding ? 'pulsing' : ''}`} />
                        {isBuilding ? 'Building' : isLive ? 'Live' : app.status || 'Created'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <GitBranch size={12} style={{ display: 'inline', marginRight: 4 }} />
                        {app.branch || 'main'}
                      </div>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {isLive ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--mint)' }}>
                          <span>{liveUrl}</span>
                          <button
                            className="btn-icon btn-ghost btn-sm"
                            onClick={(e) => handleCopyUrl(e, app.id, liveUrl)}
                          >
                            {copiedId === app.id ? <Check size={12} className="text-mint" /> : <Copy size={12} />}
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>&mdash;</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          disabled={isBuilding}
                          onClick={(e) => handleDeploy(e, app)}
                        >
                          <Play size={12} className="text-mint" /> Deploy
                        </button>
                        <button
                          className="btn btn-danger btn-sm btn-icon"
                          onClick={(e) => handleDelete(e, app.id)}
                          title="Delete service"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
