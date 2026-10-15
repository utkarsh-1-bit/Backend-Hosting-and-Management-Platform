import { useState, useEffect } from 'react';
import { mockData } from '../services/mockData';
import { Terminal, Download, Trash2, Filter } from 'lucide-react';

export default function LogsPage() {
  const [apps, setApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState(1);
  const [logs, setLogs] = useState([]);
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const appsData = await mockData.getApplications();
        setApps(appsData);
        if (appsData.length > 0) {
          setSelectedApp(appsData[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    init();
  }, []);

  useEffect(() => {
    async function fetchLogs() {
      if (!selectedApp) return;
      try {
        setLoading(true);
        const data = await mockData.getApplicationLogs(selectedApp);
        setLogs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [selectedApp]);

  const filteredLogs = logs.filter((log) => {
    if (filterLevel !== 'ALL' && log.level !== filterLevel) return false;
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleClear = () => {
    setLogs([]);
  };

  const handleDownload = () => {
    const text = filteredLogs.map(l => l.message).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `app-${selectedApp}-logs.txt`;
    a.click();
  };

  return (
    <div className="logs-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">System & App Logs</h1>
          <p className="page-subtitle">Real-time log aggregation and standard output streaming</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={handleClear} title="Clear view">
            <Trash2 size={16} />
            Clear
          </button>
          <button className="btn btn-secondary" onClick={handleDownload} title="Export logs">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Service:
            </label>
            <select
              className="form-control"
              style={{ width: 'auto' }}
              value={selectedApp}
              onChange={(e) => setSelectedApp(Number(e.target.value))}
            >
              {apps.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.name} ({app.status})
                </option>
              ))}
            </select>

            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, marginLeft: '12px' }}>
              Level:
            </label>
            <select
              className="form-control"
              style={{ width: 'auto' }}
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
            >
              <option value="ALL">All Levels</option>
              <option value="info">INFO</option>
              <option value="warn">WARN</option>
              <option value="error">ERROR</option>
              <option value="success">SUCCESS</option>
            </select>
          </div>

          <div style={{ width: '260px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search output..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="logs-viewer" style={{ minHeight: '450px', maxHeight: '650px', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
              <div className="spinner"></div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '40px 0' }}>
              No log messages found matching the criteria
            </div>
          ) : (
            filteredLogs.map((log, idx) => (
              <div key={idx} className={`log-entry log-${log.level || 'info'}`}>
                {log.message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
