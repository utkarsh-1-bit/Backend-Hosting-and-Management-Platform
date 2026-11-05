import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appApi, envApi } from '../services/api';
import PageArtwork from '../components/PageArtwork';
import {
    ArrowLeft, Play, Square, RotateCcw, Trash2,
    GitBranch, Clock, Terminal, Settings, Activity, Key,
    Plus, X, Copy, ExternalLink, RefreshCw, Check, Eye, EyeOff
} from 'lucide-react';

export default function AppDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [app, setApp] = useState(null);
    const [logs, setLogs] = useState([]);
    const [metrics, setMetrics] = useState(null);
    const [envVars, setEnvVars] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState('');
    const [showEnvModal, setShowEnvModal] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [error, setError] = useState('');
    const [revealedEnvKeys, setRevealedEnvKeys] = useState({});

    const loadData = useCallback(async (isManual = false) => {
        if (isManual) setRefreshing(true);

        try {
            const userApps = await appApi.getByUser(user.id);
            setError('');
            const ownedApp = userApps.find((item) => String(item.id) === String(id));
            if (!ownedApp) {
                setApp(null);
                setEnvVars([]);
                setLogs([]);
                setMetrics(null);
                return;
            }

            const [liveApp, liveEnvs] = await Promise.all([
                appApi.getById(id),
                envApi.getByApp(id),
            ]);

            setApp({ ...ownedApp, ...liveApp });
            setEnvVars(Array.isArray(liveEnvs) ? liveEnvs : []);
            if (liveApp.status === 'RUNNING') {
                const [logResult, resourceResult] = await Promise.all([
                    appApi.getLogs(id).then((value) => ({ value })).catch(() => null),
                    appApi.getResources(id).then((value) => ({ value })).catch(() => null),
                ]);
                setLogs(logResult?.value
                    ? logResult.value.split(/\r?\n/).filter(Boolean).map((message) => ({ message, level: /error/i.test(message) ? 'error' : /warn/i.test(message) ? 'warn' : 'info' }))
                    : []);
                setMetrics(resourceResult?.value || null);
            } else {
                setLogs([]);
                setMetrics(null);
            }
        } catch (err) {
            setError(err.message || 'Unable to load application details.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [id, user?.id]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const handleAction = async (action) => {
        setActionLoading(action);
        try {
            switch (action) {
                case 'start':
                    await appApi.start(id);
                    break;
                case 'stop':
                    await appApi.stop(id);
                    break;
                case 'restart':
                    await appApi.restart(id);
                    break;
                case 'delete':
                    if (window.confirm(`Are you sure you want to delete "${app?.name}"? This removes all containers and configurations.`)) {
                        await appApi.delete(id);
                        void navigate('/applications');
                        return;
                    }
                    break;
                default:
                    break;
            }
            await loadData(true);
        } catch (err) {
            setError(`Could not ${action} application: ${err.message}`);
        } finally {
            setActionLoading('');
        }
    };

    const handleDeleteEnv = async (variableKey) => {
        if (!window.confirm(`Delete environment variable "${variableKey}"?`)) return;
        try {
            await envApi.delete(id, variableKey);
            const updated = await envApi.getByApp(id);
            setEnvVars(Array.isArray(updated) ? updated : []);
        } catch (err) {
            setError(err.message || 'Unable to delete environment variable.');
        }
    };

    const copyUrlToClipboard = () => {
        if (!app?.url) return;
        void navigator.clipboard.writeText(app.url).catch(() => {
            setError('Clipboard access is unavailable in this browser context.');
        });
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
    };

    if (loading) {
        return (
            <div className="loading-page">
                <div className="spinner spinner-lg" />
            </div>
        );
    }

    if (!app) {
        return (
            <div className="empty-state">
                <h3>Application not found</h3>
                <p>The application you're looking for does not exist or has been deleted.</p>
                <button className="btn btn-primary" onClick={() => navigate('/applications')}>
                    Back to Applications
                </button>
            </div>
        );
    }

    const tabs = [
        { key: 'overview', label: 'Overview', icon: Activity },
        { key: 'logs', label: 'Logs', icon: Terminal },
        { key: 'env', label: 'Environment', icon: Key },
        { key: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <>
            <div className="detail-header">
                <button className="detail-back" onClick={() => navigate('/applications')} title="Back to applications">
                    <ArrowLeft size={18} />
                </button>
                <div className="detail-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <h1 className="detail-title">{app.name}</h1>
                        <span className={`status-badge ${(app.status || 'CREATED').toLowerCase()}`}>
                            {app.status || 'CREATED'}
                        </span>
                    </div>
                    <div className="detail-description" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {app.branch && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <GitBranch size={13} /> {app.branch}
                            </span>
                        )}
                        {app.createdAt && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={13} /> Created {new Date(app.createdAt).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>

                <PageArtwork variant="detail" />

                <div className="detail-actions">
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => loadData(true)}
                        disabled={refreshing}
                        title="Refresh application data"
                    >
                        <RefreshCw size={14} className={refreshing ? 'spinning' : ''} />
                    </button>

                    {app.status !== 'RUNNING' ? (
                        <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleAction('start')}
                            disabled={!!actionLoading}
                        >
                            <Play size={14} />
                            {actionLoading === 'start' ? 'Starting...' : 'Start'}
                        </button>
                    ) : (
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleAction('stop')}
                            disabled={!!actionLoading}
                        >
                            <Square size={14} />
                            {actionLoading === 'stop' ? 'Stopping...' : 'Stop'}
                        </button>
                    )}

                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleAction('restart')}
                        disabled={!!actionLoading}
                        title="Restart container"
                    >
                        <RotateCcw size={14} />
                        {actionLoading === 'restart' ? 'Restarting...' : 'Restart'}
                    </button>

                    <button
                        className="btn btn-danger btn-sm btn-icon"
                        onClick={() => handleAction('delete')}
                        disabled={!!actionLoading}
                        title="Delete Application"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {error && <div className="auth-error" role="alert">{error}</div>}

            {/* Live Service URL Banner (Returned by updated backend ApplicationResponse) */}
            {app.url && app.status === 'RUNNING' && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 20px',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '24px',
                        flexWrap: 'wrap',
                        gap: '12px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span
                            style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--success)',
                                display: 'inline-block',
                                boxShadow: '0 0 8px rgba(34, 197, 94, 0.4)',
                            }}
                        />
                        <div>
                            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.06em', fontWeight: 600 }}>
                                Live Service URL
                            </div>
                            <a
                                href={app.url}
                                target="_blank"
                                rel="noreferrer"
                                style={{ fontSize: '0.95rem', color: 'var(--text-accent)', fontWeight: 600, textDecoration: 'none' }}
                            >
                                {app.url}
                            </a>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={copyUrlToClipboard}
                        >
                            {copiedUrl ? <Check size={13} style={{ color: 'var(--success)' }} /> : <Copy size={13} />}
                            {copiedUrl ? 'Copied' : 'Copy URL'}
                        </button>
                        <a
                            href={app.url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-primary btn-sm"
                        >
                            <ExternalLink size={13} />
                            Visit Application
                        </a>
                    </div>
                </div>
            )}

            <div className="tabs">
                {tabs.map(({ key, label }) => (
                    <button
                        key={key}
                        className={`tab${activeTab === key ? ' active' : ''}`}
                        onClick={() => setActiveTab(key)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <>
                    <div className="content-grid" style={{ marginBottom: 24 }}>
                        <div className="card">
                            <div className="card-header">
                                <span className="card-title">Application Configuration</span>
                            </div>
                            <div className="card-body">
                                <div style={{ display: 'grid', gap: 14 }}>
                                    <InfoRow label="Repository URL" value={app.repositoryUrl || '—'} mono />
                                    <InfoRow label="Git Branch" value={app.branch || 'main'} />
                                    <InfoRow label="Start Command" value={app.startCommand || '—'} mono />
                                    <InfoRow label="Container Port" value={app.containerPort || 8080} />
                                    <InfoRow
                                        label="Last Updated"
                                        value={app.updatedAt ? new Date(app.updatedAt).toLocaleString() : '—'}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {metrics && app.status === 'RUNNING' && (
                        <section className="stats-grid" aria-label="Current resource usage">
                            <ResourceStat label="CPU usage" value={metrics.cpuUsage} />
                            <ResourceStat label="Memory usage" value={metrics.memoryUsage} />
                            <ResourceStat label="Memory utilization" value={metrics.memoryPercentage} />
                        </section>
                    )}
                </>
            )}

            {activeTab === 'logs' && (
                <div className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="card-title">Runtime Container Logs</span>
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => loadData(true)}
                            disabled={refreshing}
                            title="Refresh runtime logs"
                        >
                            <RefreshCw size={14} className={refreshing ? 'spinning' : ''} />
                            Refresh
                        </button>
                    </div>
                    <div className="terminal-viewer">
                        {app.status !== 'RUNNING' ? (
                            <div className="terminal-empty">Start this application to view its runtime logs.</div>
                        ) : logs.length === 0 ? (
                            <div className="terminal-empty">No runtime logs are available yet.</div>
                        ) : logs.map((log, i) => (
                            <div key={i} className={`terminal-line ${log.level}`}>
                                {log.message}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'env' && (
                <div className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span className="card-title">Environment Variables</span>
                            <p className="card-subtitle">Injected into application containers at execution time</p>
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={() => setShowEnvModal(true)}>
                            <Plus size={14} />
                            Add Variable
                        </button>
                    </div>
                    {envVars.length === 0 ? (
                        <div className="card-body" style={{ textAlign: 'center', padding: '40px 20px' }}>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                                No environment variables configured.
                            </p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Key</th>
                                        <th>Value</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {envVars.map((env) => (
                                        <tr key={env.id || env.variableKey}>
                                            <td className="cell-mono" style={{ fontWeight: 600 }}>{env.variableKey}</td>
                                            <td className="cell-mono" style={{ color: 'var(--text-secondary)' }}>
                                                {revealedEnvKeys[env.variableKey] ? env.variableValue : 'Value hidden'}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-secondary btn-sm btn-icon"
                                                    onClick={() => setRevealedEnvKeys((current) => ({ ...current, [env.variableKey]: !current[env.variableKey] }))}
                                                    title={revealedEnvKeys[env.variableKey] ? 'Hide value' : 'Reveal value'}
                                                    aria-label={revealedEnvKeys[env.variableKey] ? `Hide ${env.variableKey}` : `Reveal ${env.variableKey}`}
                                                >
                                                    {revealedEnvKeys[env.variableKey] ? <EyeOff size={13} /> : <Eye size={13} />}
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm btn-icon"
                                                    onClick={() => handleDeleteEnv(env.variableKey)}
                                                    title="Delete variable"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">General Settings</span>
                    </div>
                    <div className="card-body">
                        <SettingsForm app={app} onSaved={() => void loadData(true)} />
                    </div>
                </div>
            )}

            {showEnvModal && (
                <EnvModal
                    appId={id}
                    onClose={() => setShowEnvModal(false)}
                    onCreated={() => {
                        setShowEnvModal(false);
                        void loadData(true);
                    }}
                />
            )}
        </>
    );
}

function InfoRow({ label, value, mono }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{label}</span>
            <span
                style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-primary)',
                    fontFamily: mono ? "'SF Mono', 'Fira Code', monospace" : 'inherit',
                    maxWidth: '65%',
                    textAlign: 'right',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}
            >
                {value}
            </span>
        </div>
    );
}

function EnvModal({ appId, onClose, onCreated }) {
    const [key, setKey] = useState('');
    const [value, setValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // Connect to real Spring Boot backend POST /api/applications/{appId}/env
            await envApi.create(appId, { variableKey: key.trim(), variableValue: value.trim() });
            onCreated();
        } catch (err) {
            setError(err.message || 'Unable to add environment variable.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h2 className="modal-title">Add Environment Variable</h2>
                    <button className="modal-close" onClick={onClose} aria-label="Close modal">
                        <X size={18} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && <div className="auth-error">{error}</div>}
                        <div className="form-group">
                            <label className="form-label">Key</label>
                            <input
                                className="form-input"
                                value={key}
                                onChange={(e) => setKey(e.target.value)}
                                placeholder="DATABASE_URL"
                                required
                                style={{ fontFamily: "'SF Mono', monospace", fontSize: '0.85rem' }}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Value</label>
                            <input
                                className="form-input"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder="mysql://localhost:3306/hostex"
                                required
                                style={{ fontFamily: "'SF Mono', monospace", fontSize: '0.85rem' }}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <span className="spinner" /> : 'Add Variable'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ResourceStat({ label, value }) {
    return (
        <div className="stat-card">
            <div className="stat-card-header">
                <span className="stat-card-label">{label}</span>
            </div>
            <div className="stat-card-value">{value || '—'}</div>
        </div>
    );
}

function SettingsForm({ app, onSaved }) {
    const [form, setForm] = useState({
        name: app.name || '',
        repositoryUrl: app.repositoryUrl || '',
        branch: app.branch || 'main',
        startCommand: app.startCommand || '',
        plan: app.plan || 'BASIC',
        containerPort: app.containerPort || 8080,
    });
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        setSaved(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await appApi.update(app.id, { ...form, containerPort: Number(form.containerPort) });
            setSaved(true);
            onSaved();
        } catch (err) {
            setError(err.message || 'Unable to save application settings.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <div className="auth-error" style={{ marginBottom: 14 }}>{error}</div>}
            <div className="form-group">
                <label className="form-label">Application Name</label>
                <input className="form-input" value={form.name} onChange={handleChange('name')} required />
            </div>
            <div className="form-group">
                <label className="form-label">Repository URL</label>
                <input className="form-input" value={form.repositoryUrl} onChange={handleChange('repositoryUrl')} required />
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Branch</label>
                    <input className="form-input" value={form.branch} onChange={handleChange('branch')} required />
                </div>
                <div className="form-group">
                    <label className="form-label">Container Port</label>
                    <input className="form-input" type="number" min="1" max="65535" value={form.containerPort} onChange={handleChange('containerPort')} required />
                    <div className="form-hint">Use the port your app listens on inside the container (for example, 80 for Nginx or 8080 for Spring Boot).</div>
                </div>
            </div>
            <div className="form-group">
                <label className="form-label">Start Command</label>
                <input className="form-input" value={form.startCommand} onChange={handleChange('startCommand')} />
            </div>
            <div className="form-group">
                <label className="form-label">Resource Plan</label>
                <select className="form-input" value={form.plan} onChange={handleChange('plan')}>
                    <option value="BASIC">Basic · 0.5 CPU · 512 MB</option>
                    <option value="STANDARD">Standard · 1 CPU · 1 GB</option>
                    <option value="PREMIUM">Premium · 2 CPU · 2 GB</option>
                </select>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 12 }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <span className="spinner" /> : 'Save Changes'}
                </button>
                {saved && (
                    <span style={{ fontSize: '0.82rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Check size={14} /> Saved successfully
                    </span>
                )}
            </div>
        </form>
    );
}
