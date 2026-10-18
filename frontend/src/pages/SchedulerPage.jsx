import { useState } from 'react';
import { mockData } from '../services/mockData';
import {
  Cpu,
  Play,
  RotateCcw,
  Zap,
  ArrowRight,
  Plus,
  Clock,
  Layers,
  CheckCircle,
  Code2,
} from 'lucide-react';

export default function SchedulerPage() {
  const [strategy, setStrategy] = useState('FCFS');
  const [running, setRunning] = useState(false);
  const [sampleJobs, setSampleJobs] = useState([
    { id: 'J1', name: 'payment-deploy', burst: 25, priority: 2, arrival: 0 },
    { id: 'J2', name: 'auth-build', burst: 12, priority: 1, arrival: 2 },
    { id: 'J3', name: 'cache-restart', burst: 8, priority: 4, arrival: 5 },
    { id: 'J4', name: 'indexer-task', burst: 30, priority: 3, arrival: 6 },
  ]);

  const [scheduledSequence, setScheduledSequence] = useState([]);
  const [currentExecuting, setCurrentExecuting] = useState(null);

  const runSimulation = () => {
    setRunning(true);
    let ordered = [];

    if (strategy === 'SJF') {
      // Shortest Job First: Sort primarily by burst time
      ordered = [...sampleJobs].sort((a, b) => a.burst - b.burst);
    } else if (strategy === 'PRIORITY') {
      // Priority: Higher numerical priority executed first
      ordered = [...sampleJobs].sort((a, b) => b.priority - a.priority);
    } else {
      // FCFS: First Come First Served: Order by arrival time
      ordered = [...sampleJobs].sort((a, b) => a.arrival - b.arrival);
    }

    setScheduledSequence(ordered);

    // Animate execution through the pipeline
    ordered.forEach((job, idx) => {
      setTimeout(() => {
        setCurrentExecuting(job.id);
      }, idx * 800);
    });

    setTimeout(() => {
      setCurrentExecuting(null);
      setRunning(false);
    }, ordered.length * 800 + 400);
  };

  const codeSnippets = {
    FCFS: `// FcfsSchedulingStrategy.java
@Override
public WorkloadJob getNextJob(List<WorkloadJob> jobs) {
    return jobs.stream()
        .min(Comparator.comparing(WorkloadJob::getArrivalTime))
        .orElse(null);
}`,
    PRIORITY: `// PrioritySchedulingStrategy.java
@Override
public WorkloadJob getNextJob(List<WorkloadJob> jobs) {
    return jobs.stream()
        .max(Comparator.comparing(WorkloadJob::getPriority))
        .orElse(null);
}`,
    SJF: `// SjfSchedulingStrategy.java
@Override
public WorkloadJob getNextJob(List<WorkloadJob> jobs) {
    return jobs.stream()
        .min(Comparator.comparing(WorkloadJob::getBurstTime))
        .orElse(null);
}`,
  };

  return (
    <div style={{ maxWidth: 1100 }}>
      <div className="services-header">
        <div className="services-title-group">
          <h1>Workload Scheduling Engine</h1>
          <p>
            Interactive simulator of the backend Spring Boot scheduling algorithms (`com.backend.scheduler.strategy`).
          </p>
        </div>

        <button className="btn btn-primary" onClick={runSimulation} disabled={running}>
          {running ? (
            <>
              <div className="spinner" style={{ width: 14, height: 14 }} /> Scheduling Jobs...
            </>
          ) : (
            <>
              <Play size={15} /> Run Simulation
            </>
          )}
        </button>
      </div>

      {/* Algorithm Selector Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div
          className="render-card interactive"
          style={{
            borderColor: strategy === 'FCFS' ? 'var(--mint)' : 'var(--border-default)',
            background: strategy === 'FCFS' ? 'rgba(70, 227, 183, 0.05)' : 'var(--bg-panel)',
          }}
          onClick={() => setStrategy('FCFS')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontWeight: 600, color: '#fff', fontSize: '1rem' }}>FCFS</span>
            <span className="type-badge">First Come First Served</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Fair chronological dispatch queue based purely on task enqueue arrival timestamp.
          </p>
        </div>

        <div
          className="render-card interactive"
          style={{
            borderColor: strategy === 'PRIORITY' ? 'var(--mint)' : 'var(--border-default)',
            background: strategy === 'PRIORITY' ? 'rgba(70, 227, 183, 0.05)' : 'var(--bg-panel)',
          }}
          onClick={() => setStrategy('PRIORITY')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontWeight: 600, color: '#fff', fontSize: '1rem' }}>Priority Scheduling</span>
            <span className="type-badge" style={{ color: 'var(--accent-purple)' }}>High Priority First</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Urgent production and hotfix builds preempt standard automated test jobs.
          </p>
        </div>

        <div
          className="render-card interactive"
          style={{
            borderColor: strategy === 'SJF' ? 'var(--mint)' : 'var(--border-default)',
            background: strategy === 'SJF' ? 'rgba(70, 227, 183, 0.05)' : 'var(--bg-panel)',
          }}
          onClick={() => setStrategy('SJF')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontWeight: 600, color: '#fff', fontSize: '1rem' }}>Shortest Job First (SJF)</span>
            <span className="type-badge" style={{ color: 'var(--status-deploying)' }}>Min Burst Time</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Minimizes average cluster waiting time by executing lightweight builds first.
          </p>
        </div>
      </div>

      {/* Execution Pipeline Visualizer */}
      <div className="render-card" style={{ marginBottom: 24, padding: '24px 28px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: 6 }}>
          Cluster Execution Timeline ({strategy})
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
          Watch Docker containers spin up in order determined by {strategy} scheduling algorithm.
        </p>

        {scheduledSequence.length === 0 ? (
          <div style={{ padding: '36px 0', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
            Click &ldquo;Run Simulation&rdquo; above to animate the scheduling pipeline.
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflowX: 'auto', paddingBottom: 10 }}>
            {scheduledSequence.map((job, idx) => {
              const isExec = currentExecuting === job.id;
              return (
                <div key={job.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    className="render-card"
                    style={{
                      minWidth: 180,
                      padding: 14,
                      borderColor: isExec ? 'var(--mint)' : 'var(--border-default)',
                      background: isExec ? 'rgba(70, 227, 183, 0.1)' : 'var(--bg-canvas)',
                      boxShadow: isExec ? '0 0 20px rgba(70, 227, 183, 0.25)' : 'none',
                      transform: isExec ? 'scale(1.03)' : 'scale(1)',
                      transition: 'all 200ms ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, color: 'var(--mint)', fontFamily: 'var(--font-mono)' }}>
                        #{idx + 1} &middot; {job.id}
                      </span>
                      <span className="type-badge">P{job.priority}</span>
                    </div>

                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem' }}>{job.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                      Burst: {job.burst}s &middot; Arr: T+{job.arrival}s
                    </div>
                  </div>

                  {idx < scheduledSequence.length - 1 && (
                    <ArrowRight size={18} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Java Backend Source Code Preview */}
      <div className="render-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Code2 size={16} className="text-mint" />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>
            Active Backend Java Implementation
          </h3>
        </div>

        <pre
          style={{
            background: 'var(--bg-terminal)',
            padding: 18,
            borderRadius: 8,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            color: '#a78bfa',
            overflowX: 'auto',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {codeSnippets[strategy]}
        </pre>
      </div>
    </div>
  );
}
