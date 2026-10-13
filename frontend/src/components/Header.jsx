import { useLocation } from 'react-router-dom';
import { Bell, Search, HelpCircle } from 'lucide-react';

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
        <button className="header-icon-btn" title="Search">
          <Search />
        </button>
        <button className="header-icon-btn" title="Notifications">
          <Bell />
        </button>
        <button className="header-icon-btn" title="Help">
          <HelpCircle />
        </button>
      </div>
    </header>
  );
}
