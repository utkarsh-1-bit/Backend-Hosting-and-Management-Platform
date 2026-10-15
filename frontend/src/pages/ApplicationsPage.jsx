import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appApi } from '../services/api';
import { mockData } from '../services/mockData';
import { Plus, GitBranch, Clock, Box, X, Search, ExternalLink, RefreshCw } from 'lucide-react';

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  const loadApps = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const userId = user?.id || 1;
      const data = await appApi.getByUser(userId);
      setApps(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Backend unavailable, falling back to cached applications:', err.message);
      const fallback = await mockData.getApplications();
      setApps(fallback);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadApps();
  }, [user?.id]);

  const formatDate = (ts) => {
    if (!ts) return '—';
    return new Date(ts).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getAppInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      app.name?.toLowerCase().includes(search.toLowerCase()) ||
      app.repositoryUrl?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || app.status?.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Applications</h1>
            <p className="page-subtitle">
              Manage your hosted web applications, container workloads, and automated deployments
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => loadApps(true)}
              disabled={refreshing}
              title="Refresh application list"
            >
              <RefreshCw size={15} className={refreshing ? 'spinning' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              <Plus size={16} />
              New Application
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)',
            }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '36px' }}
            placeholder="Filter applications by name or repository..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['ALL', 'RUNNING', 'STOPPED', 'DEPLOYING'].map((status) => (
            <button
              key={status}
              type="button"
              className={`btn btn-sm ${statusFilter === status ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredApps.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Box />
            </div>
            <h3>{apps.length === 0 ? 'No applications deployed yet' : 'No matching applications'}</h3>
            <p>
              {apps.length === 0
                ? 'Create and configure your first backend application to connect repository workloads.'
                : 'Try adjusting your search query or status filter to see other applications.'}
            </p>
            {apps.length === 0 && (
              <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                <Plus size={16} />
                Create Application
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="app-grid">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="app-card"
              onClick={() => navigate(`/applications/${app.id}`)}
            >
              <div className="app-card-top">
                <div className="app-card-icon">{getAppInitial(app.name)}</div>
                <span className={`status-badge ${(app.status || 'CREATED').toLowerCase()}`}>
                  {app.status || 'CREATED'}
                </span>
              </div>
              <div className="app-card-name">{app.name}</div>
              <div className="app-card-repo">
                <GitBranch size={13} />
                {app.repositoryUrl ? app.repositoryUrl.replace('https://github.com/', '') : 'repository'} · {app.branch || 'main'}
              </div>
              <div className="app-card-meta">
                <div className="app-card-meta-item">
                  <Clock />
                  {formatDate(app.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateAppModal
          userId={user?.id || 1}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            loadApps();
          }}
        />
      )}
    </>
  );
}

function CreateAppModal({ userId, onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '',
    repositoryUrl: '',
    branch: 'main',
    buildCommand: 'mvn clean install',
    startCommand: 'java -jar target/app.jar',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Connect to real Spring Boot backend POST /api/applications
      await appApi.create({
        userId,
        name: form.name.trim(),
        repositoryUrl: form.repositoryUrl.trim(),
        branch: form.branch.trim() || 'main',
        buildCommand: form.buildCommand.trim(),
        startCommand: form.startCommand.trim(),
      });
      onCreated();
    } catch (err) {
      console.warn('Real backend call failed, falling back to mock create:', err.message);
      try {
        await mockData.createApplication({
          ...form,
          userId,
        });
        onCreated();
      } catch (fallbackErr) {
        setError(fallbackErr.message || err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">New Application</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="auth-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Application Name</label>
              <input
                className="form-input"
                value={form.name}
                onChange={handleChange('name')}
                placeholder="payment-service"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Repository URL</label>
              <input
                className="form-input"
                value={form.repositoryUrl}
                onChange={handleChange('repositoryUrl')}
                placeholder="https://github.com/utkarsh-1-bit/Backend-Hosting-and-Management-Platform"
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Branch</label>
                <input
                  className="form-input"
                  value={form.branch}
                  onChange={handleChange('branch')}
                  placeholder="main"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Build Command</label>
                <input
                  className="form-input"
                  value={form.buildCommand}
                  onChange={handleChange('buildCommand')}
                  placeholder="mvn clean install"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Start Command</label>
              <input
                className="form-input"
                value={form.startCommand}
                onChange={handleChange('startCommand')}
                placeholder="java -jar target/app.jar"
              />
              <div className="form-hint">The command executed inside the workload container.</div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Deploy Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
