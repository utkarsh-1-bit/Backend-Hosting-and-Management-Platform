import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { systemApi } from '../services/api';
import {
  Plus,
  Search,
  Server,
  Terminal,
  ExternalLink,
  ChevronDown,
  LogOut,
  Settings,
  HelpCircle,
  Activity,
  Layers,
  Database,
  Globe,
  Cpu,
} from 'lucide-react';

export default function Header({ onOpenNewModal, onOpenCommandPalette }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [backendStatus, setBackendStatus] = useState({ online: false, latency: null, checking: true });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNewMenu, setShowNewMenu] = useState(false);

  const checkConnection = async () => {
    setBackendStatus((prev) => ({ ...prev, checking: true }));
    const health = await systemApi.checkHealth();
    setBackendStatus({ online: health.online, latency: health.latency, checking: false });
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 15000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K for command palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (onOpenCommandPalette) onOpenCommandPalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenCommandPalette]);

  return (
    <header className="render-header">
      {/* Left: Brand and Workspace Selector */}
      <div className="header-left">
        <div className="header-workspace-select" title="Switch environment">
          <Layers size={14} className="text-mint" />
          <span>Personal Project</span>
          <ChevronDown size={12} />
        </div>

        {/* Global Quick Search Button */}
        <button
          className="search-wrapper btn-secondary btn-sm"
          style={{ width: 220, padding: '5px 12px', justifyContent: 'space-between', color: 'var(--text-tertiary)' }}
          onClick={onOpenCommandPalette}
          title="Search services, commands, docs (Ctrl+K)"
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}>
            <Search size={13} /> Search or jump to...
          </span>
          <kbd style={{ fontSize: '0.7rem', padding: '2px 5px', background: 'rgba(255,255,255,0.06)', borderRadius: 4 }}>
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right: Controls, Backend Status, + New, Profile */}
      <div className="header-right">
        {/* Spring Boot Live Health Indicator */}
        <button
          className={`backend-status-badge ${backendStatus.online ? 'connected' : 'fallback'}`}
          onClick={checkConnection}
          title={
            backendStatus.online
              ? `Connected to Spring Boot API on :8080 (${backendStatus.latency}ms). Click to re-verify.`
              : 'Spring Boot backend is offline or loading. Operating via persistent local simulation. Click to retry.'
          }
        >
          <span className={`status-dot ${backendStatus.checking ? 'pulsing' : ''}`} style={{
            background: backendStatus.online ? 'var(--mint)' : 'var(--accent-amber)',
          }} />
          <span>
            {backendStatus.checking
              ? 'Pinging API...'
              : backendStatus.online
              ? `Backend Live · ${backendStatus.latency}ms`
              : 'Local Engine'}
          </span>
        </button>

        {/* Landing Page Preview Link */}
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate('/landing')}
          title="View Render Product Showcase / Landing Page"
        >
          <Globe size={14} />
          <span>Showcase</span>
        </button>

        {/* Render "+ New" Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowNewMenu(!showNewMenu)}
          >
            <Plus size={15} />
            <span>New +</span>
          </button>

          {showNewMenu && (
            <div
              className="render-card"
              style={{
                position: 'absolute',
                right: 0,
                top: '110%',
                width: 240,
                padding: '6px',
                zIndex: 1000,
                boxShadow: 'var(--shadow-lg)',
              }}
              onClick={() => setShowNewMenu(false)}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', padding: '6px 10px', textTransform: 'uppercase' }}>
                Create Service
              </div>
              <button
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', gap: 10 }}
                onClick={() => {
                  if (onOpenNewModal) onOpenNewModal('web');
                }}
              >
                <Server size={14} className="text-mint" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, color: '#fff' }}>Web Service</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>APIs, Node, Python, Java</div>
                </div>
              </button>

              <button
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', gap: 10 }}
                onClick={() => {
                  if (onOpenNewModal) onOpenNewModal('static');
                }}
              >
                <Globe size={14} className="text-cyan" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, color: '#fff' }}>Static Site</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>React, Vite, Vue, HTML</div>
                </div>
              </button>

              <button
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', gap: 10 }}
                onClick={() => {
                  if (onOpenNewModal) onOpenNewModal('worker');
                }}
              >
                <Cpu size={14} className="text-purple" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, color: '#fff' }}>Background Worker</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Queue consumers, Celery</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Menu */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn-icon btn-ghost btn-sm"
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{ borderRadius: '50%', padding: 4 }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #46e3b7, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '0.8rem',
                color: '#07080b',
              }}
            >
              {(user?.name || user?.email || 'U')[0].toUpperCase()}
            </div>
          </button>

          {showUserMenu && (
            <div
              className="render-card"
              style={{
                position: 'absolute',
                right: 0,
                top: '110%',
                width: 220,
                padding: '8px',
                zIndex: 1000,
              }}
              onClick={() => setShowUserMenu(false)}
            >
              <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', marginBottom: 6 }}>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fff' }}>{user?.name || 'Developer'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{user?.email || 'admin@hostex.io'}</div>
              </div>

              <button
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start' }}
                onClick={() => navigate('/settings')}
              >
                <Settings size={14} /> Account Settings
              </button>

              <button
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--accent-rose)' }}
                onClick={() => logout()}
              >
                <LogOut size={14} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
