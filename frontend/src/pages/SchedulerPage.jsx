import { useState, useEffect, useCallback } from 'react';
import { appApi, jobsApi, schedulerApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageArtwork from '../components/PageArtwork';
import {
  Activity,
  Play,
  RotateCw,
  Cpu,
  Layers,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';

export default function SchedulerPage() {
  const { user } = useAuth();
  const [algorithm, setAlgorithm] = useState('FCFS');
  const [jobs, setJobs] = useState([]);
  const [apps, setApps] = useState([]);
  const [scheduledSequence, setScheduledSequence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningSimulation, setRunningSimulation] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [jobsData, appsData] = await Promise.all([
        jobsApi.getAll(),
        appApi.getByUser(user.id),
      ]);
      setError('');
      setJobs(jobsData);
      setApps(appsData);
    } catch (err) {
      setError(err.message || 'Unable to load scheduling data.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleRunSimulation = async () => {
    try {
      setRunningSimulation(true);
      const res = await schedulerApi.preview(algorithm);
      setScheduledSequence(res);
    } catch (err) {
      setError(err.message || 'Unable to preview queue order.');
    } finally {
      setRunningSimulation(false);
    }
  };

  const getAppName = (appId) => {
    const found = apps.find(a => a.id === appId);
    return found ? found.name : `App #${appId}`;
  };

  const queuedJobs = jobs.filter(j => ['QUEUED', 'SCHEDULED'].includes(j.status));

  const algoDescriptions = {
    FCFS: 'First-Come, First-Served processes jobs in order of arrival time. Fair and deterministic for sequential batch tasks.',
    SJF: 'Shortest Job First prioritizes tasks with the lowest estimated burst time, minimizing overall average wait time.',
    PRIORITY: 'Priority scheduling selects the lowest priority value first, matching the backend scheduler policy.',
  };

  return (
    <div className="scheduler-page">
      <div className="page-header page-header-illustrated">
        <div>
          <h1 className="page-title">Job Scheduling Engine</h1>
          <p className="page-subtitle">Compare queued workloads using the configured scheduling policy</p>
        </div>
        <PageArtwork variant="scheduler" />
        <button
          className="btn btn-primary"
          onClick={handleRunSimulation}
          disabled={runningSimulation || queuedJobs.length === 0}
        >
          {runningSimulation ? (
            <RotateCw className="spinner" size={16} />
          ) : (
            <Play size={16} />
          )}
          Preview {algorithm} Order
        </button>
      </div>

      {error && <div className="auth-error" role="alert">{error}</div>}

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">Algorithm Policy</h2>
            <p className="card-subtitle">Select the CPU-inspired job dispatcher policy</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['FCFS', 'SJF', 'PRIORITY'].map((algo) => (
              <button
                key={algo}
                className={`btn ${algorithm === algo ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => {
                  setAlgorithm(algo);
                  setScheduledSequence([]);
                }}
              >
                {algo}
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: '0 24px 20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
          <Info size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
          <span>{algoDescriptions[algorithm]}</span>
        </div>
      </div>

      <div className="content-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Pending Jobs in Pool</h2>
              <p className="card-subtitle">{queuedJobs.length} tasks ready for scheduling</p>
            </div>
            <Layers size={18} style={{ color: 'var(--text-tertiary)' }} />
          </div>

          {loading ? (
            <div className="loading-page">
              <div className="spinner"></div>
            </div>
          ) : queuedJobs.length === 0 ? (
            <div className="empty-state">
              <Activity size={36} style={{ color: 'var(--text-tertiary)', marginBottom: '8px' }} />
              <p>No queued jobs currently in the pool</p>
            </div>
          ) : (
            <div className="scheduler-queue" style={{ padding: '0 24px 24px' }}>
              {queuedJobs.map((job) => (
                <div key={job.id} className="scheduler-job">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="scheduler-job-name">{getAppName(job.applicationId)}</span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: 'var(--bg-elevated)',
                          color: 'var(--text-secondary)',
                          fontFamily: 'monospace',
                        }}
                      >
                        {job.jobType}
                      </span>
                    </div>
                    <div className="scheduler-job-meta" style={{ marginTop: '4px' }}>
                      Priority: P{job.priority} &bull; Burst: {job.burstTime}s &bull; Arrived: {new Date(job.arrivalTime).toLocaleTimeString()}
                    </div>
                  </div>
                  <span className="status-badge status-created">#{job.id}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Queue Order Preview</h2>
              <p className="card-subtitle">Server-calculated order according to {algorithm}</p>
            </div>
            <Sparkles size={18} style={{ color: 'var(--accent-primary)' }} />
          </div>

          {scheduledSequence.length === 0 ? (
            <div className="empty-state" style={{ minHeight: '260px' }}>
              <Cpu size={36} style={{ color: 'var(--text-tertiary)', marginBottom: '8px' }} />
              <p>Preview the queued jobs in the selected order</p>
            </div>
          ) : (
            <div className="scheduler-queue" style={{ padding: '0 24px 24px' }}>
              {scheduledSequence.map((job, idx) => (
                <div key={job.id} className="scheduler-job" style={{ borderColor: idx === 0 ? 'var(--accent-primary)' : 'var(--border-subtle)' }}>
                  <div className="scheduler-job-order">#{idx + 1}</div>
                  <div className="scheduler-job-info">
                    <div className="scheduler-job-name">
                      {getAppName(job.applicationId)} — <span style={{ color: 'var(--accent-primary-hover)' }}>{job.jobType}</span>
                    </div>
                    <div className="scheduler-job-meta">
                      Priority: P{job.priority} &bull; Est. Duration: {job.burstTime}s
                    </div>
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--text-tertiary)' }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
