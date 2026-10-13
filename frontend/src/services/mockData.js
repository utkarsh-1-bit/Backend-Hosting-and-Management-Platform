// Mock data store to simulate backend responses for demonstration
// Replace each function with real API calls when the backend is connected

const delay = (ms) => new Promise(res => setTimeout(res, ms));

let applications = [
  {
    id: 1,
    userId: 1,
    name: 'payment-service',
    repositoryUrl: 'https://github.com/acme/payment-service',
    branch: 'main',
    buildCommand: 'mvn clean install',
    startCommand: 'java -jar target/app.jar',
    status: 'RUNNING',
    createdAt: '2026-09-15T10:30:00',
    updatedAt: '2026-10-10T14:22:00',
  },
  {
    id: 2,
    userId: 1,
    name: 'user-auth-api',
    repositoryUrl: 'https://github.com/acme/user-auth-api',
    branch: 'develop',
    buildCommand: 'npm run build',
    startCommand: 'node dist/index.js',
    status: 'RUNNING',
    createdAt: '2026-09-20T08:15:00',
    updatedAt: '2026-10-11T09:45:00',
  },
  {
    id: 3,
    userId: 1,
    name: 'notification-worker',
    repositoryUrl: 'https://github.com/acme/notification-worker',
    branch: 'main',
    buildCommand: 'go build -o app .',
    startCommand: './app',
    status: 'STOPPED',
    createdAt: '2026-10-01T16:00:00',
    updatedAt: '2026-10-08T11:30:00',
  },
  {
    id: 4,
    userId: 1,
    name: 'analytics-engine',
    repositoryUrl: 'https://github.com/acme/analytics-engine',
    branch: 'release/v2',
    buildCommand: 'pip install -r requirements.txt',
    startCommand: 'python main.py',
    status: 'DEPLOYING',
    createdAt: '2026-10-05T12:00:00',
    updatedAt: '2026-10-12T07:15:00',
  },
  {
    id: 5,
    userId: 1,
    name: 'inventory-sync',
    repositoryUrl: 'https://github.com/acme/inventory-sync',
    branch: 'main',
    buildCommand: 'cargo build --release',
    startCommand: './target/release/inventory-sync',
    status: 'CREATED',
    createdAt: '2026-10-10T09:00:00',
    updatedAt: '2026-10-10T09:00:00',
  },
];

let containers = [
  { id: 1, applicationId: 1, dockerContainerId: 'a3f8b2c91d4e', imageName: 'payment-service:latest', status: 'RUNNING', hostPort: 8081, containerPort: 8080, createdAt: '2026-10-10T14:22:00', startedAt: '2026-10-10T14:22:30', stoppedAt: null },
  { id: 2, applicationId: 2, dockerContainerId: 'e7d1c5a83b2f', imageName: 'user-auth-api:latest', status: 'RUNNING', hostPort: 3001, containerPort: 3000, createdAt: '2026-10-11T09:45:00', startedAt: '2026-10-11T09:45:15', stoppedAt: null },
  { id: 3, applicationId: 3, dockerContainerId: 'b4e9f1d72a6c', imageName: 'notification-worker:latest', status: 'STOPPED', hostPort: 9090, containerPort: 8080, createdAt: '2026-10-06T10:00:00', startedAt: '2026-10-06T10:00:20', stoppedAt: '2026-10-08T11:30:00' },
];

let workloadJobs = [
  { id: 1, applicationId: 1, jobType: 'DEPLOY', status: 'COMPLETED', priority: 2, arrivalTime: '2026-10-10T14:20:00', burstTime: 45, startTime: '2026-10-10T14:20:10', completionTime: '2026-10-10T14:22:00' },
  { id: 2, applicationId: 2, jobType: 'BUILD', status: 'COMPLETED', priority: 1, arrivalTime: '2026-10-11T09:40:00', burstTime: 30, startTime: '2026-10-11T09:40:15', completionTime: '2026-10-11T09:44:00' },
  { id: 3, applicationId: 4, jobType: 'DEPLOY', status: 'RUNNING', priority: 3, arrivalTime: '2026-10-12T07:10:00', burstTime: 60, startTime: '2026-10-12T07:15:00', completionTime: null },
  { id: 4, applicationId: 3, jobType: 'RESTART', status: 'QUEUED', priority: 1, arrivalTime: '2026-10-12T08:00:00', burstTime: 15, startTime: null, completionTime: null },
  { id: 5, applicationId: 5, jobType: 'BUILD', status: 'QUEUED', priority: 2, arrivalTime: '2026-10-12T08:30:00', burstTime: 40, startTime: null, completionTime: null },
  { id: 6, applicationId: 1, jobType: 'RESTART', status: 'SCHEDULED', priority: 4, arrivalTime: '2026-10-12T09:00:00', burstTime: 10, startTime: null, completionTime: null },
];

let envVars = [
  { id: 1, applicationId: 1, variableKey: 'DB_HOST', variableValue: 'mysql.internal:3306', createdAt: '2026-09-15T10:35:00', updatedAt: '2026-09-15T10:35:00' },
  { id: 2, applicationId: 1, variableKey: 'STRIPE_KEY', variableValue: 'sk_live_***************', createdAt: '2026-09-15T10:36:00', updatedAt: '2026-10-01T14:00:00' },
  { id: 3, applicationId: 1, variableKey: 'LOG_LEVEL', variableValue: 'INFO', createdAt: '2026-09-15T10:37:00', updatedAt: '2026-09-15T10:37:00' },
  { id: 4, applicationId: 2, variableKey: 'JWT_SECRET', variableValue: '********', createdAt: '2026-09-20T08:20:00', updatedAt: '2026-09-20T08:20:00' },
  { id: 5, applicationId: 2, variableKey: 'REDIS_URL', variableValue: 'redis://cache.internal:6379', createdAt: '2026-09-20T08:21:00', updatedAt: '2026-09-20T08:21:00' },
];

const mockLogs = [
  { level: 'info', message: '2026-10-12 07:15:02 — Application starting on port 8080' },
  { level: 'info', message: '2026-10-12 07:15:03 — Connected to MySQL database at mysql.internal:3306' },
  { level: 'info', message: '2026-10-12 07:15:04 — Initializing Spring context...' },
  { level: 'success', message: '2026-10-12 07:15:06 — Application started successfully in 4.2s' },
  { level: 'info', message: '2026-10-12 07:15:10 — Health check endpoint registered at /actuator/health' },
  { level: 'info', message: '2026-10-12 09:22:15 — POST /api/payments — 201 Created — 45ms' },
  { level: 'info', message: '2026-10-12 09:22:18 — GET /api/payments/txn-8812 — 200 OK — 12ms' },
  { level: 'warn', message: '2026-10-12 11:45:33 — Slow query detected: SELECT * FROM transactions WHERE status=PENDING — 850ms' },
  { level: 'info', message: '2026-10-12 12:00:00 — Running scheduled job: cleanup-expired-sessions' },
  { level: 'error', message: '2026-10-12 14:30:11 — Connection pool exhausted — retrying in 5s' },
  { level: 'info', message: '2026-10-12 14:30:16 — Connection pool recovered — 8/20 connections available' },
  { level: 'info', message: '2026-10-12 16:12:44 — GET /api/payments/summary — 200 OK — 28ms' },
];

let nextAppId = 6;
let nextJobId = 7;
let nextEnvId = 6;

export const mockData = {
  // Applications
  getApplications: async () => {
    await delay(300);
    return [...applications];
  },
  getApplication: async (id) => {
    await delay(200);
    const app = applications.find(a => a.id === Number(id));
    if (!app) throw new Error('Application not found');
    return { ...app };
  },
  createApplication: async (data) => {
    await delay(400);
    const app = { id: nextAppId++, userId: 1, status: 'CREATED', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...data };
    applications.push(app);
    return { ...app };
  },
  updateApplication: async (id, data) => {
    await delay(300);
    const idx = applications.findIndex(a => a.id === Number(id));
    if (idx === -1) throw new Error('Application not found');
    applications[idx] = { ...applications[idx], ...data, updatedAt: new Date().toISOString() };
    return { ...applications[idx] };
  },
  deleteApplication: async (id) => {
    await delay(300);
    applications = applications.filter(a => a.id !== Number(id));
  },
  deployApplication: async (id) => {
    await delay(500);
    const idx = applications.findIndex(a => a.id === Number(id));
    if (idx !== -1) {
      applications[idx].status = 'DEPLOYING';
      applications[idx].updatedAt = new Date().toISOString();
    }
  },
  startApplication: async (id) => {
    await delay(400);
    const idx = applications.findIndex(a => a.id === Number(id));
    if (idx !== -1) {
      applications[idx].status = 'RUNNING';
      applications[idx].updatedAt = new Date().toISOString();
    }
  },
  stopApplication: async (id) => {
    await delay(400);
    const idx = applications.findIndex(a => a.id === Number(id));
    if (idx !== -1) {
      applications[idx].status = 'STOPPED';
      applications[idx].updatedAt = new Date().toISOString();
    }
  },
  getApplicationLogs: async () => {
    await delay(250);
    return [...mockLogs];
  },
  getApplicationMetrics: async () => {
    await delay(200);
    return {
      cpuUsage: Array.from({ length: 12 }, (_, i) => ({ time: `${7 + i}:00`, value: Math.round(15 + Math.random() * 40) })),
      memoryUsage: Array.from({ length: 12 }, (_, i) => ({ time: `${7 + i}:00`, value: Math.round(200 + Math.random() * 300) })),
      requestCount: Array.from({ length: 12 }, (_, i) => ({ time: `${7 + i}:00`, value: Math.round(50 + Math.random() * 200) })),
    };
  },

  // Containers
  getContainersByApp: async (appId) => {
    await delay(200);
    return containers.filter(c => c.applicationId === Number(appId));
  },

  // Jobs
  getJobs: async () => {
    await delay(250);
    return [...workloadJobs].sort((a, b) => new Date(b.arrivalTime) - new Date(a.arrivalTime));
  },
  createJob: async (data) => {
    await delay(400);
    const job = { id: nextJobId++, status: 'QUEUED', arrivalTime: new Date().toISOString(), startTime: null, completionTime: null, ...data };
    workloadJobs.push(job);
    return { ...job };
  },
  cancelJob: async (id) => {
    await delay(300);
    const idx = workloadJobs.findIndex(j => j.id === Number(id));
    if (idx !== -1) workloadJobs[idx].status = 'CANCELLED';
  },

  // Environment variables
  getEnvVarsByApp: async (appId) => {
    await delay(200);
    return envVars.filter(e => e.applicationId === Number(appId));
  },
  createEnvVar: async (appId, data) => {
    await delay(300);
    const env = { id: nextEnvId++, applicationId: Number(appId), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...data };
    envVars.push(env);
    return { ...env };
  },
  deleteEnvVar: async (id) => {
    await delay(200);
    envVars = envVars.filter(e => e.id !== Number(id));
  },

  // Scheduler
  runScheduler: async (algorithm) => {
    await delay(600);
    const pending = workloadJobs.filter(j => j.status === 'QUEUED');
    let ordered;
    switch (algorithm) {
      case 'SJF':
        ordered = [...pending].sort((a, b) => (a.burstTime || 0) - (b.burstTime || 0));
        break;
      case 'PRIORITY':
        ordered = [...pending].sort((a, b) => (b.priority || 0) - (a.priority || 0));
        break;
      case 'FCFS':
      default:
        ordered = [...pending].sort((a, b) => new Date(a.arrivalTime) - new Date(b.arrivalTime));
        break;
    }
    return ordered;
  },

  // Stats
  getDashboardStats: async () => {
    await delay(300);
    const running = applications.filter(a => a.status === 'RUNNING').length;
    const total = applications.length;
    const activeJobs = workloadJobs.filter(j => ['QUEUED', 'SCHEDULED', 'RUNNING'].includes(j.status)).length;
    const runningContainers = containers.filter(c => c.status === 'RUNNING').length;
    return { totalApps: total, runningApps: running, activeJobs, runningContainers };
  },
};
