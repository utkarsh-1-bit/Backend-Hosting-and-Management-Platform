import { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Search,
  Filter,
  Download,
  RotateCcw,
  Zap,
} from 'lucide-react';

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [logFilter, setLogFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const terminalRef = useRef(null);

  const initialLogs = [
    { time: '21:18:38', service: 'hostex-backend', level: 'info', text: 'Spring Boot 4.1.1 started on port 8080 (JVM running for 2.41s)' },
    { time: '21:18:39', service: 'git-service', level: 'build', text: 'Workspace isolation verified: hostex-workspaces ready' },
    { time: '21:18:39', service: 'scheduler', level: 'info', text: 'WorkloadScheduler started polling with 5000ms fixedDelay' },
    { time: '21:19:02', service: 'docker-runtime', level: 'info', text: 'Docker engine connected: docker.sock accessible' },
    { time: '21:20:15', service: 'hostex-backend', level: 'info', text: 'GET /api/applications/user/1 HTTP/1.1 200 OK (18ms)' },
    { time: '21:22:40', service: 'workload-executor', level: 'info', text: 'Scheduled job #395 processed via FCFS strategy' },
    { time: '21:24:12', service: 'docker-runtime', level: 'success', text: 'Container hostex-app-1 mapped: port 80 -> host 3982' },
    { time: '21:26:05', service: 'healthcheck', level: 'success', text: 'Healthcheck 200 OK: container latency 12ms' },
  ];

  useEffect(() => {
    setLogs(initialLogs);

    // Stream realistic periodic log events
    const interval = setInterval(() => {
      const now = new Date().toTimeString().split(' ')[0];
      const randomLogs = [
        { time: now, service: 'healthcheck', level: 'success', text: 'Cluster heartbeat 200 OK · 0 dropped packets' },
        { time: now, service: 'hostex-backend', level: 'info', text: 'GET /actuator/health 200 OK (9ms)' },
        { time: now, service: 'scheduler', level: 'info', text: 'WorkloadScheduler polling: 0 pending queued jobs' },
      ];
      const pick = randomLogs[Math.floor(Math.random() * randomLogs.length)];
      setLogs((prev) => [...prev, pick]);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((log) => {
    const matchesFilter =
      logFilter === 'all' ||
      (logFilter === 'build' && log.level === 'build') ||
      (logFilter === 'runtime' && (log.level === 'info' || log.level === 'success')) ||
      (logFilter === 'error' && log.level === 'error');
    const matchesSearch =
      log.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.service.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleDownloadLogs = () => {
    const content = filteredLogs.map((l) => `[${l.time}] [${l.service}] [${l.level.toUpperCase()}] ${l.text}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hostex-platform-logs-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="services-header">
        <div className="services-title-group">
          <h1>Platform Logs</h1>
          <p>Real-time cluster audit trails, container runtime events, and scheduler telemetry.</p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary btn-sm" onClick={handleDownloadLogs} title="Download logs">
            <Download size={14} /> Download Logs
          </button>
        </div>
      </div>

      <div className="render-terminal">
        {/* Terminal Header */}
        <div className="terminal-header">
          <div className="terminal-controls">
            <span className="terminal-dot red" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
            <span style={{ marginLeft: 10, fontWeight: 500, color: '#fff' }}>
              Cluster Audit Console &middot; Live Stream
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Search filter */}
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 8, top: 7, color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="form-input"
                style={{ padding: '3px 8px 3px 26px', fontSize: '0.78rem', width: 170, height: 26 }}
                placeholder="Search cluster logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter buttons */}
            <div className="filter-pills" style={{ padding: 2 }}>
              {['all', 'runtime', 'build', 'error'].map((f) => (
                <button
                  key={f}
                  className={`filter-pill-btn ${logFilter === f ? 'active' : ''}`}
                  style={{ padding: '2px 8px', fontSize: '0.75rem', textTransform: 'capitalize' }}
                  onClick={() => setLogFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>

            <button
              className={`btn btn-sm ${autoScroll ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ fontSize: '0.75rem', padding: '3px 8px' }}
              onClick={() => setAutoScroll(!autoScroll)}
            >
              Auto-scroll: {autoScroll ? 'ON' : 'OFF'}
            </button>

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
        <div className="terminal-body" ref={terminalRef} style={{ minHeight: 460 }}>
          {filteredLogs.length === 0 ? (
            <div style={{ color: 'var(--text-tertiary)', padding: '20px 0' }}>
              No matching platform logs found.
            </div>
          ) : (
            filteredLogs.map((item, idx) => (
              <div key={idx} className="terminal-line">
                <span className="terminal-time">[{item.time}]</span>
                <span style={{ color: 'var(--accent-purple)', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>
                  [{item.service}]
                </span>
                <span className={`terminal-msg ${item.level}`}>{item.text}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
