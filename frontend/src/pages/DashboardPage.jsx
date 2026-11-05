import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appApi, jobsApi } from '../services/api';
import heroImage from '../assets/hero.png';
import deploymentOrbit from '../assets/deployment-orbit.svg';
import {
  Box, Server, CalendarClock, Container,
  GitBranch, ArrowRight, RefreshCw
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [apps, setApps] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);

    try {
      const [userApps, userJobs] = await Promise.all([
        appApi.getByUser(user.id),
        jobsApi.getAll(),
      ]);
      setError('');

      const running = userApps.filter((a) => a.status === 'RUNNING').length;
      const total = userApps.length;
      const activeJobs = userJobs.filter((job) => ['QUEUED', 'SCHEDULED', 'RUNNING'].includes(job.status)).length;
      const runningContainers = running;

      setStats({
        totalApps: total,
        runningApps: running,
        activeJobs,
        runningContainers,
      });

      setApps(userApps);
      setJobs(userJobs.slice(0, 5));
    } catch (err) {
      setError(err.message || 'Unable to load platform data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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

      {error ? (
        <div className="dashboard-error" role="alert">
          <div>
            <p>Dashboard data could not be loaded.</p>
            <span>{error}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => loadData(true)} disabled={refreshing}>
            <RefreshCw size={14} className={refreshing ? 'spinning' : ''} />
            Try again
          </button>
        </div>
      ) : (
        <>
          <section className="dashboard-banner">
            <div className="dashboard-banner-copy">
              <span className="dashboard-eyebrow">HosteX control room</span>
              <h2>Your services, in one clear view.</h2>
              <p>Keep deployments, workloads, and runtime health moving from a single workspace.</p>
              <button className="btn btn-primary" onClick={() => navigate('/applications')}>
                Explore applications <ArrowRight size={15} />
              </button>
            </div>
            <div className="dashboard-artwork">
              <img className="dashboard-banner-orbit" src={deploymentOrbit} alt="" aria-hidden="true" />
              <img className="dashboard-banner-image" src={heroImage} alt="Layered hosting platform illustration" />
            </div>
          </section>

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
                          <td style={{ color: 'var(--text-tertiary)' }}>{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '—'}</td>
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
      )}
    </>
  );
}
