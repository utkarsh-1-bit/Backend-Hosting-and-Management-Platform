import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { appApi, envApi } from '../services/api';
import {
  ArrowLeft,
  Server,
  Play,
  RotateCcw,
  Square,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Terminal,
  Activity,
  Key,
  Settings,
  GitBranch,
  Clock,
  Plus,
  Eye,
  EyeOff,
  Download,
  Search,
  Filter,
  AlertTriangle,
  RefreshCw,
  Zap,
  Layers,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export default function AppDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'events');
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Deploys state
  const [deploys, setDeploys] = useState([
    {
      id: 'dep-902',
      commit: 'b59a541',
      message: 'minor: optimize container port mapping and workspace isolation',
      author: 'Shawn022',
      branch: 'main',
      status: 'LIVE',
      duration: '1m 42s',
      timestamp: 'Today at 21:18',
    },
    {
      id: 'dep-901',
      commit: '8998b0a',
      message: 'feat: synchronized concurrency in WorkloadScheduler',
      author: 'Shawn022',
      branch: 'main',
      status: 'SUCCESS',
      duration: '2m 04s',
      timestamp: 'Today at 19:39',
    },
    {
      id: 'dep-900',
      commit: '76ee556',
      message: 'feat: add platform logs and workload scheduler architecture',
      author: 'utkarsh-1-bit',
      branch: 'main',
      status: 'SUCCESS',
      duration: '1m 55s',
      timestamp: 'Oct 15, 15:10',
    },
  ]);

  // Terminal & Logs state
  const [logs, setLogs] = useState([]);
  const [logFilter, setLogFilter] = useState('all');
  const [logSearch, setLogSearch] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const terminalRef = useRef(null);

  // Environment variables state
  const [envVars, setEnvVars] = useState([]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [showValues, setShowValues] = useState({});
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkEnvText, setBulkEnvText] = useState('');

  // Metrics state
  const [metrics, setMetrics] = useState(null);
  const [metricRange, setMetricRange] = useState('1h');

  // Load application details
  const loadApp = useCallback(async () => {
    setLoading(true);
    try {
      const data = await appApi.getById(id);
      if (!data) throw new Error('Application not found');
      setApp(data);

      // Load environment variables
      try {
        const envs = await envApi.getByApp(id);
        if (envs && Array.isArray(envs)) {
          setEnvVars(envs);
          setBulkEnvText(envs.map((e) => `${e.variableKey}=${e.variableValue}`).join('\n'));
        } else {
          setEnvVars([]);
        }
      } catch {
        setEnvVars([]);
      }

      // Generate initial logs from app state
      const now = new Date().toISOString().substring(11, 19);
      setLogs([
        { time: `${now} [info]`, level: 'info', text: `Service ${data.name} loaded from backend.` },
        { time: `${now} [info]`, level: 'info', text: `Repository: ${data.repositoryUrl || 'N/A'}` },
        { time: `${now} [info]`, level: 'info', text: `Branch: ${data.branch || 'main'} | Status: ${data.status}` },
        { time: `${now} [runtime]`, level: data.status === 'RUNNING' ? 'success' : 'info', text: `Container status: ${data.status}` },
      ]);

      // Placeholder metric structure (backend doesn't expose a metrics API)
      setMetrics({
        cpu: Array.from({ length: 12 }, (_, i) => ({ time: `${i * 5}m`, value: Math.random() * 30 + 5 })),
        memory: Array.from({ length: 12 }, (_, i) => ({ time: `${i * 5}m`, value: Math.random() * 200 + 100 })),
        requests: Array.from({ length: 12 }, (_, i) => ({ time: `${i * 5}m`, value: Math.floor(Math.random() * 80 + 20) })),
        latency: Array.from({ length: 12 }, (_, i) => ({ time: `${i * 5}m`, value: Math.floor(Math.random() * 40 + 5) })),
      });
    } catch (err) {
      console.error('Failed to load app:', err);
      setApp(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadApp();
  }, [loadApp]);

  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Tab switch handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Actions
  const handleDeploy = async () => {
    setActionLoading('deploy');
    try {
      await appApi.start(id);
      setApp((prev) => ({ ...prev, status: 'BUILDING' }));
      const now = new Date().toISOString().substring(11, 19);
      setLogs((prev) => [
        ...prev,
        { time: `${now} [deploy]`, level: 'build', text: `Triggering manual deploy for ${app.name}...` },
        { time: `${now} [docker]`, level: 'build', text: `Running git clone from ${app.repositoryUrl || 'origin/main'}` },
        { time: `${now} [docker]`, level: 'build', text: `Rebuilding Docker container hostex-app-${app.id}:latest` },
      ]);
      setTimeout(() => {
        loadApp();
        setActionLoading(null);
      }, 3500);
    } catch (err) {
      alert('Deployment error: ' + err.message);
      setActionLoading(null);
    }
  };

  const handleRestart = async () => {
    setActionLoading('restart');
    try {
      try {
        await appApi.restart(id);
      } catch {
        // Mock restart
      }
      setTimeout(() => {
        setActionLoading(null);
        alert('Service container restarted successfully.');
      }, 1500);
    } catch (err) {
      alert('Restart error: ' + err.message);
      setActionLoading(null);
    }
  };

  const handleStop = async () => {
    setActionLoading('stop');
    try {
      await appApi.stop(id);
      setApp((prev) => ({ ...prev, status: 'STOPPED' }));
      setActionLoading(null);
    } catch (err) {
      alert('Stop error: ' + err.message);
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    const confirmName = prompt(`To delete this service and wipe all containers, type "${app.name}":`);
    if (confirmName !== app.name) {
      if (confirmName !== null) alert('Name did not match. Deletion cancelled.');
      return;
    }

    try {
      await appApi.delete(id);
      navigate('/applications');
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Environment variable handlers
  const handleAddEnv = async (e) => {
    e.preventDefault();
    if (!newKey.trim()) return;

    try {
      await envApi.create(id, { variableKey: newKey.trim(), variableValue: newValue });
      setEnvVars((prev) => [...prev, { variableKey: newKey.trim(), variableValue: newValue }]);
      setNewKey('');
      setNewValue('');
    } catch (err) {
      alert('Failed to save environment variable: ' + err.message);
    }
  };

  const handleDeleteEnv = async (key) => {
    try {
      await envApi.delete(id, key);
      setEnvVars((prev) => prev.filter((e) => e.variableKey !== key));
    } catch (err) {
      alert('Failed to delete variable: ' + err.message);
    }
  };
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ padding: 80, textAlign: 'center' }}>
        <div className="spinner spinner-lg" />
        <div style={{ color: 'var(--text-tertiary)', marginTop: 16 }}>Loading service configuration...</div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="render-card" style={{ padding: 60, textAlign: 'center' }}>
        <h3>Application not found</h3>
        <p style={{ color: 'var(--text-secondary)', margin: '12px 0 20px' }}>
          This application may have been deleted or the ID is invalid.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/applications')}>
          Back to Services
        </button>
      </div>
    );
  }

  const isLive = app.status === 'RUNNING' || app.status === 'READY';
  const isBuilding = app.status === 'BUILDING' || app.status === 'DEPLOYING' || actionLoading === 'deploy';
  const liveUrl = app.liveUrl || `https://${(app.name || 'app').toLowerCase()}.hostex.dev`;

  const filteredLogs = logs.filter((log) => {
    const matchesFilter =
      logFilter === 'all' ||
      (logFilter === 'build' && log.level === 'build') ||
      (logFilter === 'runtime' && (log.level === 'info' || log.level === 'success')) ||
      (logFilter === 'error' && log.level === 'error');
    const matchesSearch = log.text.toLowerCase().includes(logSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      {/* Service Header */}
      <div className="service-detail-header">
        <div style={{ marginBottom: 16 }}>
          <button
            className="btn btn-ghost btn-sm"
            style={{ padding: 0, gap: 6, color: 'var(--text-tertiary)' }}
            onClick={() => navigate('/applications')}
          >
            <ArrowLeft size={14} /> Back to Services
          </button>
        </div>

        <div className="service-detail-top">
          <div className="service-detail-meta">
            <div className="service-icon-box" style={{ width: 44, height: 44 }}>
              <Server size={22} className="text-mint" />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h1 className="service-detail-title">{app.name}</h1>
                <span
                  className={`status-pill ${
                    isBuilding ? 'deploying' : isLive ? 'live' : (app.status || 'created').toLowerCase()
                  }`}
                >
                  <span className={`status-dot ${isLive || isBuilding ? 'pulsing' : ''}`} />
                  {isBuilding ? 'Building' : isLive ? 'Live' : app.status || 'Created'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <span className="type-badge">Web Service</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)' }}>
                  <GitBranch size={13} /> {app.branch || 'main'}
                </span>
                <span>{app.region || 'us-west-oregon'}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Live URL Pill */}
            {isLive && (
              <div className="url-pill">
                <span>{liveUrl}</span>
                <button title="Copy URL" onClick={() => handleCopy(liveUrl)}>
                  {copiedUrl ? <Check size={13} className="text-mint" /> : <Copy size={13} />}
                </button>
                <a href={liveUrl} target="_blank" rel="noreferrer" title="Open in new tab" style={{ color: 'inherit' }}>
                  <ExternalLink size={13} />
                </a>
              </div>
            )}

            <button
              className="btn btn-primary btn-sm"
              disabled={isBuilding}
              onClick={handleDeploy}
            >
              {isBuilding ? (
                <>
                  <div className="spinner" style={{ width: 14, height: 14 }} /> Deploying...
                </>
              ) : (
                <>
                  <Play size={14} /> Manual Deploy
                </>
              )}
            </button>

            <button
              className="btn btn-secondary btn-sm"
              disabled={actionLoading === 'restart'}
              onClick={handleRestart}
              title="Restart running container"
            >
              <RotateCcw size={14} className={actionLoading === 'restart' ? 'spinning' : ''} />
              <span>Restart</span>
            </button>

            {isLive ? (
              <button
                className="btn btn-secondary btn-sm"
                disabled={actionLoading === 'stop'}
                onClick={handleStop}
                title="Stop service container"
              >
                <Square size={14} />
                <span>Stop</span>
              </button>
            ) : null}

            <button
              className="btn btn-danger btn-sm btn-icon"
              title="Delete service"
              onClick={handleDelete}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Render Tabs Navigation */}
        <div className="render-tabs">
          <button
            className={`render-tab-btn ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => handleTabChange('events')}
          >
            <Clock size={16} /> Events &amp; Deploys
          </button>
          <button
            className={`render-tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => handleTabChange('logs')}
          >
            <Terminal size={16} /> Logs
          </button>
          <button
            className={`render-tab-btn ${activeTab === 'metrics' ? 'active' : ''}`}
            onClick={() => handleTabChange('metrics')}
          >
            <Activity size={16} /> Metrics
          </button>
          <button
            className={`render-tab-btn ${activeTab === 'env' ? 'active' : ''}`}
            onClick={() => handleTabChange('env')}
          >
            <Key size={16} /> Environment
          </button>
          <button
            className={`render-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => handleTabChange('settings')}
          >
            <Settings size={16} /> Settings
          </button>
        </div>
      </div>

      {/* Tab 1: Events & Deploys */}
      {activeTab === 'events' && (
        <div style={{ maxWidth: 1080 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff' }}>Deploy History</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Timeline of automatic Git pushes and manual builds.
              </p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleDeploy}>
              <Play size={13} className="text-mint" /> Trigger Deploy
            </button>
          </div>

          <div className="deploy-feed">
            {deploys.map((dep, idx) => (
              <div key={dep.id} className="deploy-item">
                <div className="deploy-info-left">
                  <span className="deploy-commit-badge">{dep.commit}</span>
                  <div>
                    <div className="deploy-title">{dep.message}</div>
                    <div className="deploy-sub">
                      <span>{dep.author}</span>
                      <span>&bull;</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{dep.branch}</span>
                      <span>&bull;</span>
                      <span>Build time: {dep.duration}</span>
                      <span>&bull;</span>
                      <span>{dep.timestamp}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className={`status-pill ${dep.status === 'LIVE' ? 'live' : 'ready'}`}>
                    <span className={`status-dot ${dep.status === 'LIVE' ? 'pulsing' : ''}`} />
                    {dep.status}
                  </span>

                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleTabChange('logs')}
                  >
                    View Logs
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Terminal Logs */}
      {activeTab === 'logs' && (
        <div>
          <div className="render-terminal">
            {/* Terminal Header Toolbar */}
            <div className="terminal-header">
              <div className="terminal-controls">
                <span className="terminal-dot red" />
                <span className="terminal-dot yellow" />
                <span className="terminal-dot green" />
                <span style={{ marginLeft: 10, fontWeight: 500, color: '#fff' }}>
                  {app.name} &mdash; Runtime &amp; Build Logs
                </span>
              </div>

              {/* Terminal Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Search in logs */}
                <div style={{ position: 'relative' }}>
                  <Search size={13} style={{ position: 'absolute', left: 8, top: 7, color: 'var(--text-tertiary)' }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ padding: '3px 8px 3px 26px', fontSize: '0.78rem', width: 160, height: 26 }}
                    placeholder="Search logs..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                  />
                </div>

                {/* Level filters */}
                <div className="filter-pills" style={{ padding: 2 }}>
                  <button
                    className={`filter-pill-btn ${logFilter === 'all' ? 'active' : ''}`}
                    style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                    onClick={() => setLogFilter('all')}
                  >
                    All
                  </button>
                  <button
                    className={`filter-pill-btn ${logFilter === 'build' ? 'active' : ''}`}
                    style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                    onClick={() => setLogFilter('build')}
                  >
                    Build
                  </button>
                  <button
                    className={`filter-pill-btn ${logFilter === 'runtime' ? 'active' : ''}`}
                    style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                    onClick={() => setLogFilter('runtime')}
                  >
                    Runtime
                  </button>
                  <button
                    className={`filter-pill-btn ${logFilter === 'error' ? 'active' : ''}`}
                    style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                    onClick={() => setLogFilter('error')}
                  >
                    Errors
                  </button>
                </div>

                {/* Auto scroll toggle */}
                <button
                  className={`btn btn-sm ${autoScroll ? 'btn-secondary' : 'btn-ghost'}`}
                  style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                  onClick={() => setAutoScroll(!autoScroll)}
                >
                  Auto-scroll: {autoScroll ? 'ON' : 'OFF'}
                </button>

                {/* Clear logs */}
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                  onClick={() => setLogs([])}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="terminal-body" ref={terminalRef}>
              {filteredLogs.length === 0 ? (
                <div style={{ color: 'var(--text-tertiary)', padding: '20px 0' }}>
                  No logs found matching your filters.
                </div>
              ) : (
                filteredLogs.map((item, idx) => (
                  <div key={idx} className="terminal-line">
                    <span className="terminal-time">{item.time}</span>
                    <span className={`terminal-msg ${item.level}`}>{item.text}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Metrics Charts */}
      {activeTab === 'metrics' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff' }}>Cluster Performance</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Real-time container CPU, Memory, and Network telemetry.
              </p>
            </div>

            <div className="filter-pills">
              {['1h', '6h', '24h', '7d'].map((r) => (
                <button
                  key={r}
                  className={`filter-pill-btn ${metricRange === r ? 'active' : ''}`}
                  onClick={() => setMetricRange(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="metrics-grid">
            {/* CPU Chart */}
            <div className="metric-chart-card">
              <div className="metric-chart-header">
                <div>
                  <div className="metric-chart-title">CPU Utilization</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Total core usage across container</div>
                </div>
                <div className="metric-chart-value">22%</div>
              </div>

              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics?.cpuUsage || []}>
                    <defs>
                      <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#46e3b7" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#46e3b7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#475569" fontSize={11} />
                    <YAxis stroke="#475569" fontSize={11} unit="%" />
                    <Tooltip
                      contentStyle={{
                        background: '#0d0f15',
                        border: '1px solid var(--border-default)',
                        borderRadius: 6,
                        color: '#fff',
                      }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#46e3b7" strokeWidth={2} fill="url(#cpuGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Memory Chart */}
            <div className="metric-chart-card">
              <div className="metric-chart-header">
                <div>
                  <div className="metric-chart-title">Memory Allocation</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Resident set size (RSS)</div>
                </div>
                <div className="metric-chart-value">284 MB</div>
              </div>

              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics?.memoryUsage || []}>
                    <defs>
                      <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#475569" fontSize={11} />
                    <YAxis stroke="#475569" fontSize={11} unit="MB" />
                    <Tooltip
                      contentStyle={{
                        background: '#0d0f15',
                        border: '1px solid var(--border-default)',
                        borderRadius: 6,
                        color: '#fff',
                      }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={2} fill="url(#memGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Request Throughput */}
            <div className="metric-chart-card">
              <div className="metric-chart-header">
                <div>
                  <div className="metric-chart-title">HTTP Requests</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Total incoming requests/sec</div>
                </div>
                <div className="metric-chart-value" style={{ color: 'var(--accent-purple)' }}>320 req/s</div>
              </div>

              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics?.requests || []}>
                    <defs>
                      <linearGradient id="reqGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#475569" fontSize={11} />
                    <YAxis stroke="#475569" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        background: '#0d0f15',
                        border: '1px solid var(--border-default)',
                        borderRadius: 6,
                        color: '#fff',
                      }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#a78bfa" strokeWidth={2} fill="url(#reqGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Network Traffic */}
            <div className="metric-chart-card">
              <div className="metric-chart-header">
                <div>
                  <div className="metric-chart-title">Network Outbound</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Bandwidth through port 80</div>
                </div>
                <div className="metric-chart-value" style={{ color: 'var(--accent-amber)' }}>78 MB/s</div>
              </div>

              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics?.networkTraffic || []}>
                    <defs>
                      <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#475569" fontSize={11} />
                    <YAxis stroke="#475569" fontSize={11} unit="MB" />
                    <Tooltip
                      contentStyle={{
                        background: '#0d0f15',
                        border: '1px solid var(--border-default)',
                        borderRadius: 6,
                        color: '#fff',
                      }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#fbbf24" strokeWidth={2} fill="url(#netGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Environment Variables */}
      {activeTab === 'env' && (
        <div style={{ maxWidth: 960 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff' }}>Environment Variables</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Encrypted secrets and config injected into your container runtime environment.
              </p>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setBulkMode(!bulkMode)}
            >
              {bulkMode ? 'Key-Value View' : 'Bulk Edit (.env)'}
            </button>
          </div>

          {bulkMode ? (
            <div className="render-card">
              <label className="form-label">Bulk Environment Editor (.env syntax)</label>
              <textarea
                className="form-textarea"
                rows={10}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                value={bulkEnvText}
                onChange={(e) => setBulkEnvText(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const lines = bulkEnvText.split('\n');
                    const parsed = [];
                    lines.forEach((l) => {
                      const idx = l.indexOf('=');
                      if (idx > 0) {
                        parsed.push({
                          variableKey: l.substring(0, idx).trim(),
                          variableValue: l.substring(idx + 1).trim(),
                        });
                      }
                    });
                    setEnvVars(parsed);
                    setBulkMode(false);
                    alert('Environment updated! Re-deploying container to apply changes.');
                    handleDeploy();
                  }}
                >
                  Save &amp; Redeploy
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Add New Env Variable Form */}
              <form onSubmit={handleAddEnv} className="render-card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label className="form-label">Key</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. DATABASE_URL"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value.toUpperCase())}
                      style={{ fontFamily: 'var(--font-mono)' }}
                    />
                  </div>

                  <div style={{ flex: 1.5 }}>
                    <label className="form-label">Value</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. mysql://user:pass@host:3306/db"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      style={{ fontFamily: 'var(--font-mono)' }}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={!newKey.trim()}>
                    <Plus size={14} /> Add
                  </button>
                </div>
              </form>

              {/* Existing Variables Table */}
              <div className="render-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="env-table">
                  <thead>
                    <tr>
                      <th style={{ width: '35%' }}>Key</th>
                      <th>Value</th>
                      <th style={{ width: 100, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {envVars.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', padding: 32, color: 'var(--text-tertiary)' }}>
                          No environment variables set yet.
                        </td>
                      </tr>
                    ) : (
                      envVars.map((item) => {
                        const isVisible = showValues[item.variableKey];
                        return (
                          <tr key={item.variableKey}>
                            <td className="env-key">{item.variableKey}</td>
                            <td>
                              <div className="env-value-box">
                                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {isVisible ? item.variableValue : '••••••••••••••••••••'}
                                </span>
                                <button
                                  className="btn-icon btn-ghost btn-sm"
                                  onClick={() =>
                                    setShowValues((prev) => ({
                                      ...prev,
                                      [item.variableKey]: !prev[item.variableKey],
                                    }))
                                  }
                                >
                                  {isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                                </button>
                                <button
                                  className="btn-icon btn-ghost btn-sm"
                                  title="Copy value"
                                  onClick={() => handleCopy(item.variableValue)}
                                >
                                  <Copy size={13} />
                                </button>
                              </div>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                className="btn-icon btn-danger btn-sm"
                                title="Delete variable"
                                onClick={() => handleDeleteEnv(item.variableKey)}
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Settings */}
      {activeTab === 'settings' && (
        <div style={{ maxWidth: 840 }}>
          <div className="render-card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: 16 }}>
              Service Configuration
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Service Name</label>
                <input type="text" className="form-input" defaultValue={app.name} />
              </div>

              <div className="form-group">
                <label className="form-label">Branch</label>
                <input type="text" className="form-input" defaultValue={app.branch || 'main'} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Git Repository URL</label>
              <input type="text" className="form-input" defaultValue={app.repositoryUrl} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Build Command</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontFamily: 'var(--font-mono)' }}
                  defaultValue={app.buildCommand || 'mvn clean install'}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Start Command</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontFamily: 'var(--font-mono)' }}
                  defaultValue={app.startCommand || 'java -jar target/app.jar'}
                />
              </div>
            </div>

            <button className="btn btn-primary" onClick={() => alert('Settings saved successfully.')}>
              Save Changes
            </button>
          </div>

          {/* Danger Zone */}
          <div
            className="render-card"
            style={{
              borderColor: 'rgba(244, 63, 94, 0.3)',
              background: 'rgba(244, 63, 94, 0.03)',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--accent-rose)', marginBottom: 8 }}>
              Danger Zone
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Permanently delete this web service, remove its container instances, and delete workspace files in `hostex-workspaces/app-{id}`.
            </p>

            <button className="btn btn-danger" onClick={handleDelete}>
              <Trash2 size={15} /> Delete {app.name}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
