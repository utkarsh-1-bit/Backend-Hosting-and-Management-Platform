import { useState, useEffect } from 'react';
import {
  Server,
  Globe,
  Cpu,
  Terminal,
  Zap,
  ArrowRight,
  Shield,
  Layers,
  GitBranch,
  Play,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Database,
  Lock,
  Activity,
} from 'lucide-react';

// Open dashboard in a new tab
const openDashboard = () => {
  window.open('/dashboard', '_blank', 'noopener,noreferrer');
};

export default function LandingPage() {
  const [terminalStep, setTerminalStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  const terminalLines = [
    { text: '$ git push origin main', color: '#94a3b8' },
    { text: 'Counting objects: 104, done.', color: '#64748b' },
    { text: 'Compressing objects: 100% (68/68), done.', color: '#64748b' },
    { text: 'Writing objects: 100% (104/104), 24.12 KiB | 8.04 MiB/s, done.', color: '#64748b' },
    { text: 'remote: [HosteX Engine] Webhook received for repo: utkarsh-1-bit/Backend-Hosting-and-Management-Platform', color: '#46e3b7' },
    { text: 'remote: [Workload Scheduler] Enqueued deployment job #395 with FCFS strategy', color: '#a78bfa' },
    { text: 'remote: [GitService] Cloning into hostex-workspaces/app-1...', color: '#38bdf8' },
    { text: 'remote: [DockerRuntime] Building image hostex-app-1:latest', color: '#38bdf8' },
    { text: 'remote: [DockerRuntime] Step 1/3: Pulling openjdk:21-slim-buster', color: '#cbd5e1' },
    { text: 'remote: [DockerRuntime] Step 2/3: Compiling application with Maven Wrapper', color: '#cbd5e1' },
    { text: 'remote: [DockerRuntime] Step 3/3: Exposing container port 80 → dynamic host port 3982', color: '#cbd5e1' },
    { text: 'remote: [HosteX HealthCheck] HTTP GET /actuator/health: 200 OK (11ms)', color: '#46e3b7' },
    { text: '===> Application hostex-backend is LIVE at https://hostex-backend.hostex.dev', color: '#46e3b7', highlight: true },
  ];

  const runSimulation = () => {
    setIsSimulating(true);
    setTerminalStep(0);
  };

  useEffect(() => {
    if (isSimulating) {
      if (terminalStep < terminalLines.length) {
        const timer = setTimeout(() => {
          setTerminalStep((prev) => prev + 1);
        }, 350);
        return () => clearTimeout(timer);
      } else {
        setIsSimulating(false);
      }
    }
  }, [isSimulating, terminalStep, terminalLines.length]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)' }} className="bg-ambient-grid">
      {/* Landing Top Navigation */}
      <header
        style={{
          height: 64,
          borderBottom: '1px solid var(--border-default)',
          background: 'rgba(7, 8, 11, 0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="header-brand-logo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="12 2 2 7 12 12 22 7 12 2" fill="currentColor" fillOpacity="0.1" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', color: '#fff' }}>
              Host<span style={{ color: 'var(--mint)' }}>eX</span>
            </span>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <a href="#features" className="btn btn-ghost btn-sm">Products</a>
            <a href="#how-it-works" className="btn btn-ghost btn-sm">How it works</a>
            <a
              href="https://github.com/utkarsh-1-bit/Backend-Hosting-and-Management-Platform"
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              GitHub <ExternalLink size={12} />
            </a>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/login" className="btn btn-ghost btn-sm">
            Sign In
          </a>
          <button className="btn btn-primary btn-sm" onClick={openDashboard}>
            Launch Dashboard <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-badge">
          <Zap size={13} /> Next-Gen Cloud Application Hosting &middot; Powered by Spring Boot 4
        </div>

        <h1 className="landing-title">
          The fastest way to build &amp; host apps on <span>modern cloud infrastructure</span>
        </h1>

        <p className="landing-sub">
          HosteX delivers automated Git deployments, Docker container virtualization, zero-downtime rolling updates, and multi-algorithm workload scheduling with full FCFS, Priority, and SJF strategies.
        </p>

        <div className="landing-ctas">
          <button className="btn btn-primary btn-lg" onClick={openDashboard}>
            Get Started for Free <ArrowRight size={16} />
          </button>
          <button
            className="btn btn-secondary btn-lg"
            onClick={runSimulation}
            disabled={isSimulating}
          >
            <Play size={16} className="text-mint" />
            {isSimulating ? 'Deploying Simulated Container...' : 'Simulate Git Push Deploy'}
          </button>
        </div>

        {/* Live Interactive Terminal Simulation Box */}
        <div className="landing-demo-card">
          <div className="terminal-header">
            <div className="terminal-controls">
              <span className="terminal-dot red" />
              <span className="terminal-dot yellow" />
              <span className="terminal-dot green" />
              <span style={{ marginLeft: 8, fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                bash &mdash; deploy-simulator@hostex-cloud
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="status-pill live">
                <span className="status-dot pulsing" /> Ready to Deploy
              </span>
              <button
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                onClick={runSimulation}
              >
                Replay Run
              </button>
            </div>
          </div>

          <div className="terminal-body" style={{ minHeight: 280, fontFamily: 'var(--font-mono)' }}>
            {(terminalStep === 0 && !isSimulating
              ? terminalLines
              : terminalLines.slice(0, terminalStep || 1)
            ).map((line, idx) => (
              <div
                key={idx}
                className="terminal-line"
                style={{
                  color: line.color,
                  fontWeight: line.highlight ? 600 : 400,
                  background: line.highlight ? 'rgba(70, 227, 183, 0.08)' : 'transparent',
                  padding: line.highlight ? '4px 8px' : '0',
                  borderRadius: 4,
                }}
              >
                <span>{line.text}</span>
              </div>
            ))}
            {isSimulating && (
              <div style={{ display: 'inline-block', width: 8, height: 14, background: 'var(--mint)', animation: 'pulse-ring 1s infinite' }} />
            )}
          </div>
        </div>

        {/* Service Types Showcase Grid */}
        <div id="features" style={{ textAlign: 'left', marginBottom: 28 }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', marginBottom: 6 }}>
            Run anything. Scale everything.
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Enterprise-grade developer primitives designed for productivity and low latency.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-box">
            <div className="feature-icon-circle">
              <Server size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: 8 }}>
              Web Services &amp; APIs
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Run Spring Boot, Node.js, Python, Go, and Rust web applications with automatic TLS certificates, custom domains, and dynamic port mapping.
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-icon-circle" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)' }}>
              <Globe size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: 8 }}>
              Static Sites on Edge
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Deploy React, Vue, Vite, and Next.js frontends straight from Git to global edge servers with instant cache invalidation on push.
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-icon-circle" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-purple)' }}>
              <Cpu size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: 8 }}>
              Workload Scheduling
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Built-in multi-strategy job schedulers (FCFS, Priority, Shortest-Job-First) with synchronized concurrency control preventing CPU starvation.
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-icon-circle" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-amber)' }}>
              <Terminal size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: 8 }}>
              Isolated Workspaces
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Safe workspace sandboxing in <code>hostex-workspaces/app-&#123;id&#125;</code> with automated deployment cleanup and instant rollback capabilities.
            </p>
          </div>
        </div>

        {/* How it works section */}
        <div id="how-it-works" style={{ marginBottom: 80 }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', marginBottom: 8, textAlign: 'left' }}>
            Deploy in 3 steps
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, textAlign: 'left' }}>
            From git push to live in seconds.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              { step: '01', icon: <GitBranch size={22} />, title: 'Connect Repository', desc: 'Link your GitHub repository and HosteX automatically configures webhooks for push-triggered deployments.' },
              { step: '02', icon: <Layers size={22} />, title: 'Auto Build & Containerize', desc: 'HosteX detects your stack, runs the build, and packages it into an isolated Docker container on port 80.' },
              { step: '03', icon: <Activity size={22} />, title: 'Live & Health-Checked', desc: 'Your app is served with a health check on /actuator/health and exposed via a dynamic host port.' },
            ].map((item) => (
              <div key={item.step} className="render-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: 'rgba(70, 227, 183, 0.1)', color: 'var(--mint)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {item.icon}
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                    STEP {item.step}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Banner */}
        <div
          className="render-card"
          style={{
            background: 'linear-gradient(135deg, rgba(70, 227, 183, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)',
            borderColor: 'var(--mint-border)',
            padding: '32px',
            marginBottom: 48,
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 24, textAlign: 'center' }}>
            {[
              { value: '< 30s', label: 'Avg. Deploy Time' },
              { value: '3', label: 'Scheduling Algorithms' },
              { value: '99.9%', label: 'Uptime SLA' },
              { value: 'Port 80', label: 'Container Standard' },
            ].map((stat) => (
              <div key={stat.label}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--mint)', marginBottom: 4 }}>{stat.value}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action Banner */}
        <div
          className="render-card"
          style={{
            background: 'linear-gradient(135deg, rgba(70, 227, 183, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
            borderColor: 'var(--mint-border)',
            padding: '48px 32px',
            textAlign: 'center',
            marginBottom: 60,
          }}
        >
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: 12 }}>
            Ready to deploy your first application?
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 540, margin: '0 auto 24px', fontSize: '1.05rem' }}>
            Jump into the dashboard, link your Git repository, and watch HosteX compile and launch your containers in seconds.
          </p>
          <button className="btn btn-primary btn-lg" onClick={openDashboard}>
            Enter Dashboard Console <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-default)',
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: 'var(--text-tertiary)',
        fontSize: '0.82rem',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="header-brand-logo" style={{ width: 20, height: 20, fontSize: '0.6rem' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="12 2 2 7 12 12 22 7 12 2" fill="currentColor" fillOpacity="0.1" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <span>© 2026 HosteX Cloud. Built with Spring Boot 4 + React.</span>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <a
            href="https://github.com/utkarsh-1-bit/Backend-Hosting-and-Management-Platform"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            GitHub <ExternalLink size={11} />
          </a>
          <a href="/login" style={{ color: 'var(--text-tertiary)' }}>Sign In</a>
          <button
            onClick={openDashboard}
            style={{ background: 'none', border: 'none', color: 'var(--mint)', cursor: 'pointer', fontSize: 'inherit', padding: 0 }}
          >
            Dashboard →
          </button>
        </div>
      </footer>
    </div>
  );
}
