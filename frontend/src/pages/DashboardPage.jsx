import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appApi } from '../services/api';
import { mockData } from '../services/mockData';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Box, Server, CalendarClock, Container,
  GitBranch, Clock, ArrowRight, RefreshCw, CheckCircle2, AlertCircle, PlayCircle
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [apps, setApps] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const userId = user?.id || 1;
      let userApps = [];

      try {
        const res = await appApi.getByUser(userId);
        if (Array.isArray(res)) userApps = res;
      } catch (err) {
        console.warn('Backend unavailable, using mock data for dashboard:', err.message);
      }

      if (userApps.length === 0) {
        userApps = await mockData.getApplications();
      }

      const [j, m] = await Promise.all([
        mockData.getJobs(),
        mockData.getApplicationMetrics(),
      ]);

      const running = userApps.filter((a) => a.status === 'RUNNING').length;
      const total = userApps.length;
      const activeJobs = j.filter((job) => ['QUEUED', 'SCHEDULED', 'RUNNING'].includes(job.status)).length;
      const runningContainers = running;

      setStats({
        totalApps: total,
        runningApps: running,
        activeJobs,
        runningContainers,
      });

      setApps(userApps);
      setJobs(j.slice(0, 5));
      setMetrics(m);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Applications', value: stats?.totalApps || 0, icon: Box, color: 'blue' },
    { label: 'Running Services', value: stats?.runningApps || 0, icon: Server, color: 'green' },
    { label: 'Active Workload Jobs', value: stats?.activeJobs || 0, icon: CalendarClock, color: 'yellow' },
    { label: 'Container Instances', value: stats?.runningContainers || 0, icon: Container, color: 'purple' },
  ];

  const formatTime = (ts) => {
    if (!ts) return '—';
    const d = new Date(ts);
    const now = new Date();
    const diff = Math.floor((now - d) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const chartTooltipStyle = {
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border-default)',
    borderRadius: 8,
    fontSize: '0.8rem',
    color: 'var(--text-primary)',
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Platform overview of workloads, containers, and application health</p>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => loadData(true)}
            disabled={refreshing}
            title="Refresh dashboard stats"
          >
            <RefreshCw size={14} className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">{label}</span>
              <div className={`stat-card-icon ${color}`}>
                <Icon size={18} />
              </div>
            </div>
            <div className="stat-card-value">{value}</div>
          </div>
        ))}
      </div>

      {metrics && (
        <div className="content-grid" style={{ marginBottom: 24 }}>
          <div className="card">
            <div className="card-header">
              <div>
                <span className="card-title">Cluster CPU Utilization</span>
                <p className="card-subtitle">Aggregate across all hosted workload containers</p>
              </div>
            </div>
            <div className="card-body" style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.cpuUsage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="time" stroke="var(--text-tertiary)" fontSize={11} />
                  <YAxis stroke="var(--text-tertiary)" fontSize={11} unit="%" domain={[0, 100]} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--accent-primary)"
                    fill="var(--accent-primary-muted)"
                    name="CPU %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <span className="card-title">Inbound Network Requests</span>
                <p className="card-subtitle">Requests per minute routed via gateway</p>
              </div>
            </div>
            <div className="card-body" style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.requestCount}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="time" stroke="var(--text-tertiary)" fontSize={11} />
                  <YAxis stroke="var(--text-tertiary)" fontSize={11} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--success)"
                    fill="var(--success-muted)"
                    name="Req/min"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="content-grid">
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title">Recent Applications</span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/applications')}
              style={{ fontSize: '0.8rem' }}
            >
              View all <ArrowRight size={13} style={{ marginLeft: 4 }} />
            </button>
          </div>
          {apps.length === 0 ? (
            <div className="card-body" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>No applications deployed yet</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Application</th>
                    <th>Status</th>
                    <th>Repository</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.slice(0, 5).map((app) => (
                    <tr
                      key={app.id}
                      onClick={() => navigate(`/applications/${app.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ fontWeight: 600 }}>{app.name}</td>
                      <td>
                        <span className={`status-badge ${(app.status || 'CREATED').toLowerCase()}`}>
                          {app.status || 'CREATED'}
                        </span>
                      </td>
                      <td className="cell-mono" style={{ color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <GitBranch size={12} />
                          {app.repositoryUrl ? app.repositoryUrl.replace('https://github.com/', '') : 'repo'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-tertiary)' }}>{formatTime(app.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title">Workload Scheduler Queue</span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/jobs')}
              style={{ fontSize: '0.8rem' }}
            >
              Manage jobs <ArrowRight size={13} style={{ marginLeft: 4 }} />
            </button>
          </div>
          {jobs.length === 0 ? (
            <div className="card-body" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>No recent workload jobs</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Job ID</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id}>
                      <td className="cell-mono">#{job.id}</td>
                      <td style={{ fontWeight: 500 }}>{job.jobType}</td>
                      <td>
                        <span className={`status-badge ${(job.status || 'QUEUED').toLowerCase()}`}>
                          {job.status || 'QUEUED'}
                        </span>
                      </td>
                      <td className="cell-mono">P{job.priority || 1}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
