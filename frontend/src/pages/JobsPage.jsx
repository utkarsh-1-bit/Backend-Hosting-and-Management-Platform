import { useState, useEffect } from 'react';
import { mockData } from '../services/mockData';
import {
  CalendarClock,
  Play,
  RotateCcw,
  Hammer,
  AlertCircle,
  Plus,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Hourglass,
  Layers
} from 'lucide-react';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    applicationId: '',
    jobType: 'BUILD',
    priority: 2,
    burstTime: 30,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsData, appsData] = await Promise.all([
        mockData.getJobs(),
        mockData.getApplications(),
      ]);
      setJobs(jobsData);
      setApps(appsData);
      if (appsData.length > 0 && !formData.applicationId) {
        setFormData(prev => ({ ...prev, applicationId: appsData[0].id }));
      }
    } catch (err) {
      console.error('Failed to load jobs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!formData.applicationId) return;

    try {
      setSubmitting(true);
      await mockData.createJob({
        applicationId: Number(formData.applicationId),
        jobType: formData.jobType,
        priority: Number(formData.priority),
        burstTime: Number(formData.burstTime) || 30,
      });
      setShowModal(false);
      await loadData();
    } catch (err) {
      console.error('Failed to create job', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelJob = async (id) => {
    try {
      await mockData.cancelJob(id);
      await loadData();
    } catch (err) {
      console.error('Failed to cancel job', err);
    }
  };

  const getAppName = (appId) => {
    const found = apps.find(a => a.id === appId);
    return found ? found.name : `App #${appId}`;
  };

  const getJobTypeIcon = (type) => {
    switch (type) {
      case 'BUILD':
        return <Hammer size={15} style={{ color: 'var(--accent-secondary)' }} />;
      case 'DEPLOY':
        return <Play size={15} style={{ color: 'var(--success)' }} />;
      case 'RESTART':
        return <RotateCcw size={15} style={{ color: 'var(--warning)' }} />;
      default:
        return <CalendarClock size={15} />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="status-badge status-running"><CheckCircle2 size={12} /> Completed</span>;
      case 'RUNNING':
        return <span className="status-badge status-deploying"><Clock size={12} /> Running</span>;
      case 'QUEUED':
        return <span className="status-badge status-created"><Hourglass size={12} /> Queued</span>;
      case 'SCHEDULED':
        return <span className="status-badge status-created"><Layers size={12} /> Scheduled</span>;
      case 'CANCELLED':
        return <span className="status-badge status-stopped"><XCircle size={12} /> Cancelled</span>;
      default:
        return <span className="status-badge status-stopped">{status}</span>;
    }
  };

  const filteredJobs = jobs.filter(j => {
    if (filterType !== 'ALL' && j.jobType !== filterType) return false;
    if (filterStatus !== 'ALL' && j.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    total: jobs.length,
    running: jobs.filter(j => j.status === 'RUNNING').length,
    queued: jobs.filter(j => ['QUEUED', 'SCHEDULED'].includes(j.status)).length,
    completed: jobs.filter(j => j.status === 'COMPLETED').length,
  };

  return (
    <div className="jobs-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Workload Jobs</h1>
          <p className="page-subtitle">Track, dispatch, and manage asynchronous deployment and build tasks</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          Create Job
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Jobs</span>
            <div className="stat-card-icon stat-icon-blue"><CalendarClock size={16} /></div>
          </div>
          <div className="stat-card-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">In Progress</span>
            <div className="stat-card-icon stat-icon-amber"><Clock size={16} /></div>
          </div>
          <div className="stat-card-value">{stats.running}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Queued / Scheduled</span>
            <div className="stat-card-icon stat-icon-purple"><Hourglass size={16} /></div>
          </div>
          <div className="stat-card-value">{stats.queued}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Completed</span>
            <div className="stat-card-icon stat-icon-green"><CheckCircle2 size={16} /></div>
          </div>
          <div className="stat-card-value">{stats.completed}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 className="card-title">Job Execution Queue</h2>
            <p className="card-subtitle">Active and historic background executions</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select
              className="form-control"
              style={{ width: 'auto', padding: '6px 12px' }}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="ALL">All Types</option>
              <option value="BUILD">Build Jobs</option>
              <option value="DEPLOY">Deploy Jobs</option>
              <option value="RESTART">Restart Jobs</option>
            </select>
            <select
              className="form-control"
              style={{ width: 'auto', padding: '6px 12px' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="QUEUED">Queued</option>
              <option value="RUNNING">Running</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-page">
            <div className="spinner spinner-lg"></div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="empty-state">
            <CalendarClock size={40} style={{ color: 'var(--text-tertiary)', marginBottom: '12px' }} />
            <p>No jobs found matching the selected filter</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Application</th>
                  <th>Type</th>
                  <th>Priority</th>
                  <th>Burst Time</th>
                  <th>Arrival Time</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>#{job.id}</td>
                    <td style={{ fontWeight: 550, color: 'var(--text-primary)' }}>
                      {getAppName(job.applicationId)}
                    </td>
                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {getJobTypeIcon(job.jobType)}
                        <span>{job.jobType}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor:
                            job.priority >= 3
                              ? 'var(--danger-muted)'
                              : job.priority === 2
                              ? 'var(--warning-muted)'
                              : 'var(--info-muted)',
                          color:
                            job.priority >= 3
                              ? 'var(--danger)'
                              : job.priority === 2
                              ? 'var(--warning)'
                              : 'var(--info)',
                        }}
                      >
                        P{job.priority}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{job.burstTime ? `${job.burstTime}s` : '—'}</td>
                    <td style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                      {job.arrivalTime ? new Date(job.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}
                    </td>
                    <td>{getStatusBadge(job.status)}</td>
                    <td style={{ textAlign: 'right' }}>
                      {['QUEUED', 'SCHEDULED'].includes(job.status) && (
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', color: 'var(--danger)' }}
                          onClick={() => handleCancelJob(job.id)}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create Workload Job</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateJob}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Target Application</label>
                  <select
                    className="form-control"
                    value={formData.applicationId}
                    onChange={(e) => setFormData({ ...formData, applicationId: e.target.value })}
                    required
                  >
                    {apps.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.status})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Job Type</label>
                    <select
                      className="form-control"
                      value={formData.jobType}
                      onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                    >
                      <option value="BUILD">BUILD</option>
                      <option value="DEPLOY">DEPLOY</option>
                      <option value="RESTART">RESTART</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority (1: Low to 5: High)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      className="form-control"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Estimated Burst Time (seconds)</label>
                  <input
                    type="number"
                    min="5"
                    max="600"
                    className="form-control"
                    value={formData.burstTime}
                    onChange={(e) => setFormData({ ...formData, burstTime: e.target.value })}
                    required
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
                    Used by SJF (Shortest Job First) and FCFS algorithms for optimal scheduling.
                  </span>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Submit Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
