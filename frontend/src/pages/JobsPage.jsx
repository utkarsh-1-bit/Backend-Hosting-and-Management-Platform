import { useState, useEffect, useCallback } from 'react';
import { appApi } from '../services/api';
import {
  Layers,
  RotateCcw,
  Clock,
  CheckCircle,
  AlertCircle,
  Cpu,
  Search,
  Zap,
  Server,
  Play,
  XCircle,
} from 'lucide-react';

export default function JobsPage() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = JSON.parse(localStorage.getItem('hostex_user') || '{}').id || 1;
      const data = await appApi.getByUser(userId);
      setApps(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load deployments:', err);
      setError(err.message || 'Failed to connect to backend.');
      setApps([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Map applications to a deployments/jobs view
  const deployments = apps.map((app) => ({
    id: app.id,
    appName: app.name,
    repositoryUrl: app.repositoryUrl,
    branch: app.branch || 'main',
    status: app.status,
    jobType: 'DEPLOY',
    priority: 1,
    updatedAt: app.updatedAt,
    createdAt: app.createdAt,
  }));

  const filteredDeployments = deployments.filter((job) => {
    const statusMap = {
      RUNNING: 'RUNNING',
      BUILDING: 'RUNNING',
      DEPLOYING: 'RUNNING',
      COMPLETED: 'COMPLETED',
      READY: 'COMPLETED',
      FAILED: 'FAILED',
      STOPPED: 'FAILED',
      CREATED: 'QUEUED',
      QUEUED: 'QUEUED',
    };
    const normalizedStatus = statusMap[job.status?.toUpperCase()] || 'QUEUED';
    const matchesStatus = filterStatus === 'ALL' || normalizedStatus === filterStatus;
    const matchesSearch =
      (job.appName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.repositoryUrl || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(job.id).includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const getStatusPill = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'RUNNING' || s === 'BUILDING' || s === 'DEPLOYING') return 'deploying';
    if (s === 'READY') return 'live';
    if (s === 'FAILED' || s === 'STOPPED' || s === 'ERROR') return 'failed';
    if (s === 'CREATED' || s === 'QUEUED') return 'queued';
    return 'queued';
  };

  const getStatusLabel = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'RUNNING' || s === 'BUILDING' || s === 'DEPLOYING') return 'In Progress';
    if (s === 'READY') return 'Completed';
    if (s === 'FAILED' || s === 'ERROR') return 'Failed';
    if (s === 'STOPPED') return 'Stopped';
    return status || 'Queued';
  };

  return (
    <div>
      <div className="services-header">
        <div className="services-title-group">
          <h1>Deployments</h1>
          <p>
            Track deployment history and workload execution across all your services. Scheduled via FCFS, Priority, and SJF algorithms.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchData} title="Refresh deployments">
            <RotateCcw size={14} className={loading ? 'spinning' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Scheduler Algorithm Info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { name: 'FCFS', label: 'First Come First Served', desc: 'Jobs dispatched in arrival order', color: 'var(--mint)' },
          { name: 'PRIORITY', label: 'Priority Scheduling', desc: 'High priority jobs execute first', color: 'var(--accent-purple)' },
          { name: 'SJF', label: 'Shortest Job First', desc: 'Minimizes average wait time', color: 'var(--status-deploying)' },
        ].map((algo) => (
          <div
            key={algo.name}
            className="render-card"
            style={{ padding: '16px 20px', borderLeft: `3px solid ${algo.color}` }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Cpu size={14} style={{ color: algo.color }} />
              <span style={{ fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}>{algo.name}</span>
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: algo.color, marginBottom: 4 }}>{algo.label}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{algo.desc}</div>
          </div>
        ))}
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
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="services-filter-bar">
        <div className="search-wrapper" style={{ flex: 1, minWidth: 260 }}>
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search deployments by service name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-pills">
          {['ALL', 'RUNNING', 'COMPLETED', 'QUEUED', 'FAILED'].map((st) => (
            <button
              key={st}
              className={`filter-pill-btn ${filterStatus === st ? 'active' : ''}`}
              onClick={() => setFilterStatus(st)}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Deployments Table */}
      <div className="render-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="env-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Service</th>
              <th>Branch</th>
              <th>Job Type</th>
              <th>Status</th>
              <th>Scheduler</th>
              <th style={{ textAlign: 'right' }}>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>
                  <div className="spinner" />
                  <div style={{ marginTop: 8, color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                    Connecting to backend...
                  </div>
                </td>
              </tr>
            ) : filteredDeployments.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>
                  {error ? 'Backend unavailable. Start the Spring Boot server on port 8080.' : 'No deployments found.'}
                </td>
              </tr>
            ) : (
              filteredDeployments.map((job) => {
                const pillClass = getStatusPill(job.status);
                const isActive = pillClass === 'deploying';

                return (
                  <tr key={job.id}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--mint)' }}>
                        #{job.id}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Server size={14} style={{ color: 'var(--text-tertiary)' }} />
                        <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem' }}>
                          {job.appName || `app-${job.id}`}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {job.branch}
                      </span>
                    </td>
                    <td>
                      <span className="type-badge">{job.jobType}</span>
                    </td>
                    <td>
                      <span className={`status-pill ${pillClass}`}>
                        <span className={`status-dot ${isActive ? 'pulsing' : ''}`} />
                        {getStatusLabel(job.status)}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)' }}>
                        <Zap size={12} /> FCFS
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                        {job.updatedAt
                          ? new Date(job.updatedAt).toLocaleString([], {
                              month: 'short', day: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })
                          : '—'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
