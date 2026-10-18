import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Server,
  Layers,
  Cpu,
  Terminal,
  Settings,
  Plus,
  Play,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export default function CommandPaletteModal({ isOpen, onClose, onOpenNewModal }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) setQuery('');
  }, [isOpen]);

  if (!isOpen) return null;

  const actions = [
    { id: 'new', label: 'Create New Web Service', icon: Plus, handler: () => { onClose(); onOpenNewModal('web'); } },
    { id: 'services', label: 'Go to Services', icon: Server, handler: () => { onClose(); navigate('/applications'); } },
    { id: 'jobs', label: 'Go to Deployments Queue', icon: Layers, handler: () => { onClose(); navigate('/jobs'); } },
    { id: 'scheduler', label: 'Open Workload Scheduler Simulator', icon: Cpu, handler: () => { onClose(); navigate('/scheduler'); } },
    { id: 'logs', label: 'View Platform Audit Logs', icon: Terminal, handler: () => { onClose(); navigate('/logs'); } },
    { id: 'settings', label: 'Platform & Backend Settings', icon: Settings, handler: () => { onClose(); navigate('/settings'); } },
    { id: 'docs', label: 'Open GitHub Source Repository', icon: ExternalLink, handler: () => { window.open('https://github.com/utkarsh-1-bit/Backend-Hosting-and-Management-Platform', '_blank'); onClose(); } },
  ];

  const filtered = actions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth: 560, marginTop: '-15vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Search size={18} className="text-mint" />
          <input
            type="text"
            autoFocus
            className="form-input"
            style={{ border: 'none', background: 'transparent', boxShadow: 'none', padding: 4, fontSize: '1rem' }}
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd style={{ fontSize: '0.72rem', padding: '2px 6px', background: 'rgba(255,255,255,0.08)', borderRadius: 4, color: 'var(--text-tertiary)' }}>
            ESC
          </kbd>
        </div>

        <div style={{ padding: '8px', maxHeight: 320, overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
              No matching commands found
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="render-card interactive"
                  style={{
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                  }}
                  onClick={item.handler}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Icon size={16} className="text-mint" />
                    <span style={{ fontSize: '0.9rem', color: '#fff' }}>{item.label}</span>
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--text-tertiary)' }} />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
