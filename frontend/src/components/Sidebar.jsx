import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Server,
  Layers,
  Terminal,
  Settings,
  ExternalLink,
  Zap,
} from 'lucide-react';

export default function Sidebar() {
  const platformItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/applications', label: 'Services', icon: Server },
    { to: '/jobs', label: 'Deployments', icon: Layers },
  ];

  const diagnosticsItems = [
    { to: '/logs', label: 'Platform Logs', icon: Terminal },
    { to: '/settings', label: 'Environment & Config', icon: Settings },
  ];

  return (
    <aside className="render-sidebar">
      {/* Brand & Logo */}
      <div className="sidebar-header">
        <NavLink to="/dashboard" className="header-brand">
          <div className="header-brand-logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="12 2 2 7 12 12 22 7 12 2" fill="currentColor" fillOpacity="0.1" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
            Host<span style={{ color: 'var(--mint)' }}>eX</span>
          </span>
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              background: 'rgba(70, 227, 183, 0.1)',
              color: 'var(--mint)',
              padding: '2px 6px',
              borderRadius: 4,
              border: '1px solid rgba(70, 227, 183, 0.25)',
              marginLeft: 4,
            }}
          >
            Cloud
          </span>
        </NavLink>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Platform</div>
        {platformItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={17} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <div className="sidebar-section-title">Diagnostics</div>
        {diagnosticsItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={17} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Resource Usage Card */}
      <div className="sidebar-footer">
        <div className="resource-usage-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.78rem' }}>
              Cluster Allocation
            </span>
            <span style={{ color: 'var(--mint)', fontWeight: 600, fontSize: '0.75rem' }}>
              Healthy
            </span>
          </div>

          <div className="resource-bar-track">
            <div className="resource-bar-fill" style={{ width: '38%' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
            <span>RAM: 1.5 / 4.0 GB</span>
            <span>CPU: 24%</span>
          </div>
        </div>

        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Zap size={12} className="text-mint" /> Spring Boot 4.1.1
          </span>
          <a
            href="https://github.com/utkarsh-1-bit/Backend-Hosting-and-Management-Platform"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}
          >
            Repo <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </aside>
  );
}
