import { useLocation } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/useTheme';
const pageTitles = {
  '/dashboard': 'Dashboard',
  '/applications': 'Applications',
  '/jobs': 'Workload Jobs',
  '/scheduler': 'Scheduler',
  '/logs': 'Logs',
  '/settings': 'Settings',
};

export default function Header() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const getPageName = () => {
    const path = location.pathname;
    if (pageTitles[path]) return pageTitles[path];
    if (path.startsWith('/applications/')) return 'Application Details';
    return 'HosteX';
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-breadcrumb">
          <span>HosteX</span>
          <span>/</span>
          <strong>{getPageName()}</strong>
        </div>
      </div>
      <div className="header-right">
        <button
          className="header-icon-btn"
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
}
