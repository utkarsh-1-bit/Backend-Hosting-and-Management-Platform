import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appApi } from '../services/api';
import {
  X,
  Server,
  Globe,
  Cpu,
  GitBranch,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import GithubIcon from './GithubIcon';

export default function NewServiceModal({ isOpen, onClose, initialType = 'web', onCreated }) {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [serviceType, setServiceType] = useState(initialType);
  const [repoUrl, setRepoUrl] = useState('https://github.com/utkarsh-1-bit/Backend-Hosting-and-Management-Platform');
  const [name, setName] = useState('backend-hosting-platform');
  const [branch, setBranch] = useState('main');
  const [region, setRegion] = useState('us-west-oregon');
  const [buildCommand, setBuildCommand] = useState('mvn clean install -DskipTests');
  const [startCommand, setStartCommand] = useState('java -jar target/backend-0.0.1-SNAPSHOT.jar');
  const [port, setPort] = useState('8080');
  const [plan, setPlan] = useState('free');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const repoPresets = [
    {
      label: 'HosteX Spring Boot Backend',
      url: 'https://github.com/utkarsh-1-bit/Backend-Hosting-and-Management-Platform',
      name: 'backend-hosting-platform',
      build: 'mvn clean install -DskipTests',
      start: 'java -jar target/backend-0.0.1-SNAPSHOT.jar',
      port: '8080',
    },
    {
      label: 'Express Node.js REST API',
      url: 'https://github.com/expressjs/express-starter',
      name: 'express-api-service',
      build: 'npm install && npm run build',
      start: 'node dist/index.js',
      port: '3000',
    },
    {
      label: 'FastAPI Python Microservice',
      url: 'https://github.com/tiangolo/fastapi-template',
      name: 'fastapi-backend',
      build: 'pip install -r requirements.txt',
      start: 'uvicorn main:app --host 0.0.0.0 --port 80',
      port: '80',
    },
    {
      label: 'React Vite Static Frontend',
      url: 'https://github.com/vitejs/vite-react-starter',
      name: 'vite-frontend-edge',
      build: 'npm run build',
      start: 'serve -s dist -l 80',
      port: '80',
    },
  ];

  const handleSelectPreset = (preset) => {
    setRepoUrl(preset.url);
    setName(preset.name);
    setBuildCommand(preset.build);
    setStartCommand(preset.start);
    setPort(preset.port);
    setStep(2);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      name: name.trim() || 'my-service',
      repositoryUrl: repoUrl.trim(),
      branch: branch.trim() || 'main',
      userId: 1,
      type: serviceType,
      region,
      buildCommand,
      startCommand,
      port: Number(port) || 80,
    };

    try {
      const createdApp = await appApi.create(payload);
      if (createdApp && createdApp.id) {
        try {
          await appApi.start(createdApp.id);
        } catch (startErr) {
          console.warn('Start triggered with note:', startErr.message);
        }
      }
      setSubmitting(false);
      onClose();
      if (onCreated) onCreated(createdApp);
      navigate(`/applications/${createdApp.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create application. Make sure the backend is running.');
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: 680 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="header-brand-logo" style={{ width: 24, height: 24 }}>
              <Server size={14} />
            </div>
            <div className="modal-title">Create a New Service</div>
          </div>
          <button className="btn-icon btn-ghost btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div
              style={{
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid var(--accent-rose)',
                color: 'var(--accent-rose)',
                padding: '10px 14px',
                borderRadius: 8,
                marginBottom: 16,
                fontSize: '0.85rem',
              }}
            >
              {error}
            </div>
          )}

          {step === 1 ? (
            <div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.9rem' }}>
                Deploy any Git repository or Docker container with automatic HTTPS, global CDN, and zero-downtime deploys.
              </p>

              {/* Step 1: Select Type */}
              <div className="form-label" style={{ marginBottom: 12 }}>1. Select Service Type</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
                <div
                  className={`render-card interactive ${serviceType === 'web' ? 'selected' : ''}`}
                  style={{
                    padding: 14,
                    borderColor: serviceType === 'web' ? 'var(--mint)' : 'var(--border-default)',
                    background: serviceType === 'web' ? 'rgba(70, 227, 183, 0.05)' : 'var(--bg-panel)',
                  }}
                  onClick={() => setServiceType('web')}
                >
                  <Server size={20} className="text-mint" style={{ marginBottom: 8 }} />
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>Web Service</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                    HTTP APIs, Node, Java, Python, Go
                  </div>
                </div>

                <div
                  className={`render-card interactive ${serviceType === 'static' ? 'selected' : ''}`}
                  style={{
                    padding: 14,
                    borderColor: serviceType === 'static' ? 'var(--mint)' : 'var(--border-default)',
                    background: serviceType === 'static' ? 'rgba(70, 227, 183, 0.05)' : 'var(--bg-panel)',
                  }}
                  onClick={() => setServiceType('static')}
                >
                  <Globe size={20} className="text-cyan" style={{ marginBottom: 8 }} />
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>Static Site</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                    Fast edge hosting for React, Vite, Vue
                  </div>
                </div>

                <div
                  className={`render-card interactive ${serviceType === 'worker' ? 'selected' : ''}`}
                  style={{
                    padding: 14,
                    borderColor: serviceType === 'worker' ? 'var(--mint)' : 'var(--border-default)',
                    background: serviceType === 'worker' ? 'rgba(70, 227, 183, 0.05)' : 'var(--bg-panel)',
                  }}
                  onClick={() => setServiceType('worker')}
                >
                  <Cpu size={20} className="text-purple" style={{ marginBottom: 8 }} />
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>Background Worker</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                    Queue consumers, Redis jobs, Celery
                  </div>
                </div>
              </div>

              {/* Step 1: Connect Git Repository */}
              <div className="form-label" style={{ marginBottom: 12 }}>2. Connect a Repository</div>
              <div className="form-group">
                <div style={{ display: 'flex', gap: 10 }}>
                  <div className="search-wrapper" style={{ flex: 1 }}>
                    <GithubIcon size={16} className="search-icon" />
                    <input
                      type="url"
                      className="search-input"
                      placeholder="https://github.com/user/repository"
                      value={repoUrl}
                      onChange={(e) => {
                        setRepoUrl(e.target.value);
                        const parts = e.target.value.split('/');
                        if (parts.length > 0 && parts[parts.length - 1]) {
                          setName(parts[parts.length - 1].replace('.git', ''));
                        }
                      }}
                    />
                  </div>
                  <button className="btn btn-primary" onClick={() => setStep(2)}>
                    Continue <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Quick Template Presets */}
              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 8 }}>
                  Or pick a ready-to-deploy template:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {repoPresets.map((preset) => (
                    <div
                      key={preset.url}
                      className="render-card interactive"
                      style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      onClick={() => handleSelectPreset(preset)}
                    >
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '0.88rem', color: '#fff' }}>{preset.label}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                          {preset.url}
                        </div>
                      </div>
                      <span className="btn btn-secondary btn-sm" style={{ pointerEvents: 'none' }}>
                        Use Template
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Service Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="my-service"
                  />
                  <div className="form-hint">Unique identifier for your service URL</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Branch</label>
                  <div className="search-wrapper">
                    <GitBranch size={14} className="search-icon" />
                    <input
                      type="text"
                      required
                      className="search-input"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="main"
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Region</label>
                  <select className="form-select" value={region} onChange={(e) => setRegion(e.target.value)}>
                    <option value="us-west-oregon">Oregon (US West)</option>
                    <option value="us-east-ohio">Ohio (US East)</option>
                    <option value="eu-central-frankfurt">Frankfurt (EU Central)</option>
                    <option value="ap-southeast-singapore">Singapore (Asia Pacific)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Port</label>
                  <input
                    type="number"
                    className="form-input"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder="8080"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Build Command</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontFamily: 'var(--font-mono)' }}
                  value={buildCommand}
                  onChange={(e) => setBuildCommand(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Start Command</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontFamily: 'var(--font-mono)' }}
                  value={startCommand}
                  onChange={(e) => setStartCommand(e.target.value)}
                />
              </div>

              {/* Instance Tier Selection */}
              <div className="form-group">
                <label className="form-label">Instance Tier</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  <div
                    className="render-card interactive"
                    style={{
                      padding: 10,
                      borderColor: plan === 'free' ? 'var(--mint)' : 'var(--border-default)',
                      background: plan === 'free' ? 'rgba(70, 227, 183, 0.05)' : 'var(--bg-canvas)',
                    }}
                    onClick={() => setPlan('free')}
                  >
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>Free</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>512 MB RAM · 0.1 CPU</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--mint)', marginTop: 4, fontWeight: 600 }}>$0 / mo</div>
                  </div>

                  <div
                    className="render-card interactive"
                    style={{
                      padding: 10,
                      borderColor: plan === 'starter' ? 'var(--mint)' : 'var(--border-default)',
                      background: plan === 'starter' ? 'rgba(70, 227, 183, 0.05)' : 'var(--bg-canvas)',
                    }}
                    onClick={() => setPlan('starter')}
                  >
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>Starter</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>1 GB RAM · 0.5 CPU</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--mint)', marginTop: 4, fontWeight: 600 }}>$7 / mo</div>
                  </div>

                  <div
                    className="render-card interactive"
                    style={{
                      padding: 10,
                      borderColor: plan === 'standard' ? 'var(--mint)' : 'var(--border-default)',
                      background: plan === 'standard' ? 'rgba(70, 227, 183, 0.05)' : 'var(--bg-canvas)',
                    }}
                    onClick={() => setPlan('standard')}
                  >
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>Standard</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>2 GB RAM · 1.0 CPU</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--mint)', marginTop: 4, fontWeight: 600 }}>$25 / mo</div>
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ margin: '0 -24px -24px', padding: '16px 24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                  Back
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <div className="spinner" /> Provisioning Service...
                    </>
                  ) : (
                    <>
                      <Zap size={14} /> Create Web Service
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
