import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Box,
  CalendarClock,
  Activity,
  Settings,
  LogOut,
  Terminal,
  Server,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/applications', icon: Box, label: 'Applications' },
  { to: '/jobs', icon: CalendarClock, label: 'Workload Jobs' },
  { to: '/scheduler', icon: Activity, label: 'Scheduler' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Server size={18} />
        </div>
        <div>
          <h1>HosteX</h1>
          <span>Hosting Platform</span>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Main</div>
        <ul className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `sidebar-link${isActive || location.pathname.startsWith(to) ? ' active' : ''}`
                }
              >
                <Icon />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">System</div>
        <ul className="sidebar-nav">
          <li>
            <NavLink to="/logs" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <Terminal />
              Logs
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <Settings />
              Settings
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={logout} title="Sign out">
          <div className="sidebar-avatar">{getInitials(user?.name)}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || 'User'}</div>
            <div className="sidebar-user-email">{user?.email || ''}</div>
          </div>
          <LogOut size={16} style={{ color: 'var(--text-tertiary)', marginLeft: 'auto' }} />
        </div>
      </div>
    </aside>
  );
}
