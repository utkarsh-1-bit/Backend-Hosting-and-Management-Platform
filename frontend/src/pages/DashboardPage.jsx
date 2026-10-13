import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockData } from '../services/mockData';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Box, Server, CalendarClock, Container,
  ArrowUpRight, ArrowDownRight, TrendingUp,
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [apps, setApps] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const [s, a, j, m] = await Promise.all([
          mockData.getDashboardStats(),
          mockData.getApplications(),
          mockData.getJobs(),
          mockData.getApplicationMetrics(),
        ]);
        setStats(s);
        setApps(a);
        setJobs(j.slice(0, 5));
        setMetrics(m);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="loading-page"><div className="spinner spinner-lg" /></div>;
  }

  const statCards = [
    { label: 'Total Applications', value: stats?.totalApps || 0, icon: Box, color: 'blue', change: '+2', dir: 'up' },
    { label: 'Running', value: stats?.runningApps || 0, icon: Server, color: 'green', change: '+1', dir: 'up' },
    { label: 'Active Jobs', value: stats?.activeJobs || 0, icon: CalendarClock, color: 'yellow', change: '3', dir: 'up' },
    { label: 'Containers', value: stats?.runningContainers || 0, icon: Container, color: 'purple', change: '0', dir: 'up' },
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
            <p className="page-subtitle">Overview of your hosted applications and workloads</p>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map(({ label, value, icon: Icon, color, change, dir }) => (
          <div className="stat-card" key={label}>
            <div className="stat-card-top">
              <div className={`stat-card-icon ${color}`}>
                <Icon />
              </div>
              <span className={`stat-card-change ${dir}`}>
                {dir === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {change}
              </span>
            </div>
            <div className="stat-card-value">{value}</div>
            <div className="stat-card-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="content-grid" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">CPU Usage (%)</span>
            <TrendingUp size={16} style={{ color: 'var(--text-tertiary)' }} />
          </div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics?.cpuUsage || []}>
                  <defs>
                    <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="time" tick={{ fill: '#5c6478', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#5c6478', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="url(#cpuGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Memory Usage (MB)</span>
            <TrendingUp size={16} style={{ color: 'var(--text-tertiary)' }} />
          </div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics?.memoryUsage || []}>
                  <defs>
                    <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="time" tick={{ fill: '#5c6478', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#5c6478', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#memGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Applications</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/applications')}>View all</button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {apps.slice(0, 5).map(app => (
                  <tr key={app.id} onClick={() => navigate(`/applications/${app.id}`)} style={{ cursor: 'pointer' }}>
                    <td className="cell-primary">{app.name}</td>
                    <td>
                      <span className={`status-badge ${app.status.toLowerCase()}`}>{app.status}</span>
                    </td>
                    <td>{formatTime(app.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Jobs</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/jobs')}>View all</button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job.id}>
                    <td className="cell-primary">{job.jobType}</td>
                    <td>
                      <span className={`status-badge ${job.status.toLowerCase()}`}>{job.status}</span>
                    </td>
                    <td>{job.priority}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
