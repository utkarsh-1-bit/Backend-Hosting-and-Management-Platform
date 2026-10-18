import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, Zap, Server } from 'lucide-react';
import GithubIcon from '../components/GithubIcon';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    await login('demo@hostex.io', 'demo1234');
    navigate('/dashboard');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-canvas)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      className="bg-ambient-grid"
    >
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
          <div className="header-brand-logo" style={{ width: 34, height: 34 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="12 2 2 7 12 12 22 7 12 2" fill="currentColor" fillOpacity="0.1" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.4rem', color: '#fff' }}>
            Host<span style={{ color: 'var(--mint)' }}>eX</span>
          </span>
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: 6 }}>
          Sign in to your account
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Welcome back! Access your clusters and deployments.
        </p>
      </div>

      <div
        className="render-card"
        style={{
          width: '100%',
          maxWidth: 420,
          padding: 32,
          boxShadow: 'var(--shadow-lg), 0 0 40px rgba(0, 0, 0, 0.5)',
        }}
      >
        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid var(--accent-rose)',
              color: 'var(--accent-rose)',
              fontSize: '0.85rem',
              marginBottom: 18,
            }}
          >
            {error}
          </div>
        )}

        {/* GitHub Quick Login */}
        <button
          className="btn btn-secondary"
          style={{ width: '100%', marginBottom: 18, justifyContent: 'center' }}
          onClick={handleDemoLogin}
          type="button"
        >
          <GithubIcon size={16} /> Continue with GitHub
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0', color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          <span>OR CONTINUE WITH EMAIL</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="search-wrapper">
              <Mail size={15} className="search-icon" />
              <input
                type="email"
                required
                className="search-input"
                placeholder="developer@hostex.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
              <a href="#forgot" style={{ fontSize: '0.78rem', color: 'var(--mint)' }} onClick={(e) => { e.preventDefault(); alert('Password reset link sent.'); }}>
                Forgot?
              </a>
            </div>
            <div className="search-wrapper">
              <Lock size={15} className="search-icon" />
              <input
                type="password"
                required
                className="search-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? <div className="spinner" /> : <>Sign In <ArrowRight size={15} /></>}
          </button>
        </form>

        {/* Instant Demo Sandbox Shortcut */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <button
            className="btn btn-ghost btn-sm"
            style={{ width: '100%', color: 'var(--mint)' }}
            onClick={handleDemoLogin}
          >
            <Zap size={14} /> One-Click Instant Demo Login
          </button>
        </div>
      </div>

      <div style={{ marginTop: 24, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        Don&apos;t have an account?{' '}
        <Link to="/register" style={{ color: 'var(--mint)', fontWeight: 600 }}>
          Create one now
        </Link>
      </div>
    </div>
  );
}
