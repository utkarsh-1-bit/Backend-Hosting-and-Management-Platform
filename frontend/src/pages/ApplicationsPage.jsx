import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appApi } from '../services/api';
import emptyApplicationsImage from '../assets/empty-applications.svg';
import PageArtwork from '../components/PageArtwork';
import { Plus, GitBranch, Clock, Box, X, Search, RefreshCw } from 'lucide-react';

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadApps = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);

    try {
      const data = await appApi.getByUser(user.id);
      setError('');
      setApps(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to load applications.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadApps();
  }, [loadApps]);

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
          <PageArtwork variant="applications" />
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

      {error && <div className="auth-error" role="alert">{error}</div>}

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
            {apps.length === 0 && (
              <img
                className="empty-state-image"
                src={emptyApplicationsImage}
                alt=""
                aria-hidden="true"
              />
            )}
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
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            void loadApps();
          }}
        />
      )}
    </>
  );
}

function CreateAppModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '',
    repositoryUrl: '',
    branch: 'main',
    startCommand: '',
    plan: 'BASIC',
    containerPort: 8080,
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
        name: form.name.trim(),
        repositoryUrl: form.repositoryUrl.trim(),
        branch: form.branch.trim() || 'main',
        startCommand: form.startCommand.trim(),
        plan: form.plan,
        containerPort: Number(form.containerPort),
      });
      onCreated();
    } catch (err) {
      setError(err.message || 'Unable to create application.');
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
                  type="url"
                value={form.repositoryUrl}
                onChange={handleChange('repositoryUrl')}
                placeholder="https://github.com/acme/service"
                required
              />
              <div className="form-hint">Use a credential-free HTTPS Git repository URL.</div>
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
                <label className="form-label">Container Port</label>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  max="65535"
                  value={form.containerPort}
                  onChange={handleChange('containerPort')}
                  required
                />
                <div className="form-hint">Use the port your app listens on inside the container (for example, 80 for Nginx or 8080 for Spring Boot).</div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Resource Plan</label>
              <select className="form-input" value={form.plan} onChange={handleChange('plan')}>
                <option value="BASIC">Basic · 0.5 CPU · 512 MB</option>
                <option value="STANDARD">Standard · 1 CPU · 1 GB</option>
                <option value="PREMIUM">Premium · 2 CPU · 2 GB</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Start Command</label>
              <input
                className="form-input"
                value={form.startCommand}
                onChange={handleChange('startCommand')}
                placeholder="java -jar target/app.jar"
              />
              <div className="form-hint">Leave blank to use the image command. Set this only to override it.</div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
