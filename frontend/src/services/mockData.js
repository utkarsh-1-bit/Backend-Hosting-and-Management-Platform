// HosteX Local State & Simulation Engine
// Provides full persistence via localStorage and high-fidelity simulations
// for build logs, metrics, container lifecycle, and CPU workload scheduling.

const STORAGE_KEYS = {
  APPS: 'hostex_apps_v2',
  JOBS: 'hostex_jobs_v2',
  ENVS: 'hostex_envs_v2',
  LOGS: 'hostex_logs_v2',
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const INITIAL_APPS = [
  {
    id: 1,
    userId: 1,
    name: 'backend-hosting-platform',
    repositoryUrl: 'https://github.com/utkarsh-1-bit/Backend-Hosting-and-Management-Platform',
    branch: 'main',
    type: 'web',
    region: 'us-west-oregon',
    buildCommand: 'mvn clean install -DskipTests',
    startCommand: 'java -jar target/backend-0.0.1-SNAPSHOT.jar',
    status: 'RUNNING',
    port: 8080,
    liveUrl: 'https://hostex-backend.hostex.dev',
    createdAt: '2026-10-15T14:30:00Z',
    updatedAt: '2026-10-18T21:18:39Z',
  },
  {
    id: 2,
    userId: 1,
    name: 'user-auth-service',
    repositoryUrl: 'https://github.com/expressjs/express-starter',
    branch: 'main',
    type: 'web',
    region: 'eu-central-frankfurt',
    buildCommand: 'npm install && npm run build',
    startCommand: 'node dist/server.js',
    status: 'RUNNING',
    port: 3001,
    liveUrl: 'https://auth-api.hostex.dev',
    createdAt: '2026-10-16T09:15:00Z',
    updatedAt: '2026-10-18T18:22:00Z',
  },
  {
    id: 3,
    userId: 1,
    name: 'image-optimizer-worker',
    repositoryUrl: 'https://github.com/celery/celery-sample',
    branch: 'main',
    type: 'worker',
    region: 'us-west-oregon',
    buildCommand: 'pip install -r requirements.txt',
    startCommand: 'celery -A tasks worker --loglevel=info',
    status: 'RUNNING',
    port: null,
    liveUrl: null,
    createdAt: '2026-10-17T11:45:00Z',
    updatedAt: '2026-10-18T19:00:00Z',
  },
  {
    id: 4,
    userId: 1,
    name: 'analytics-dashboard-static',
    repositoryUrl: 'https://github.com/vitejs/vite-react-starter',
    branch: 'release/v2',
    type: 'static',
    region: 'global-edge-cdn',
    buildCommand: 'npm run build',
    startCommand: 'serve -s dist -l 80',
    status: 'STOPPED',
    port: 80,
    liveUrl: 'https://analytics-ui.hostex.dev',
    createdAt: '2026-10-17T16:00:00Z',
    updatedAt: '2026-10-18T12:00:00Z',
  },
];

const INITIAL_JOBS = [
  {
    id: 101,
    applicationId: 1,
    appName: 'backend-hosting-platform',
    jobType: 'DEPLOY',
    status: 'COMPLETED',
    priority: 1,
    burstTime: 28,
    arrivalTime: '2026-10-18T21:18:00Z',
    startTime: '2026-10-18T21:18:10Z',
    completionTime: '2026-10-18T21:18:38Z',
  },
  {
    id: 102,
    applicationId: 2,
    appName: 'user-auth-service',
    jobType: 'BUILD',
    status: 'COMPLETED',
    priority: 2,
    burstTime: 18,
    arrivalTime: '2026-10-18T18:21:40Z',
    startTime: '2026-10-18T18:21:42Z',
    completionTime: '2026-10-18T18:22:00Z',
  },
  {
    id: 103,
    applicationId: 1,
    appName: 'backend-hosting-platform',
    jobType: 'RESTART',
    status: 'QUEUED',
    priority: 3,
    burstTime: 12,
    arrivalTime: '2026-10-18T21:30:00Z',
    startTime: null,
    completionTime: null,
  },
];

const INITIAL_ENVS = [
  { id: 1, applicationId: 1, variableKey: 'SPRING_PROFILES_ACTIVE', variableValue: 'prod' },
  { id: 2, applicationId: 1, variableKey: 'DATABASE_URL', variableValue: 'jdbc:mysql://db.hostex.internal:3306/hostex_prod' },
  { id: 3, applicationId: 1, variableKey: 'JWT_SECRET_KEY', variableValue: 's3cr3t_jwt_h0st3x_k3y_992' },
  { id: 4, applicationId: 2, variableKey: 'NODE_ENV', variableValue: 'production' },
  { id: 5, applicationId: 2, variableKey: 'PORT', variableValue: '3001' },
];

function load(key, defaultVal) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function save(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error('Storage error:', err);
  }
}

export const mockData = {
  // Applications
  getApplications: async () => {
    await delay(150);
    return load(STORAGE_KEYS.APPS, INITIAL_APPS);
  },

  getApplication: async (id) => {
    await delay(100);
    const apps = load(STORAGE_KEYS.APPS, INITIAL_APPS);
    const app = apps.find((a) => String(a.id) === String(id));
    if (!app) throw new Error('Application not found');
    return { ...app };
  },

  createApplication: async (data) => {
    await delay(300);
    const apps = load(STORAGE_KEYS.APPS, INITIAL_APPS);
    const id = Date.now();
    const cleanName = (data.name || 'new-app').toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const newApp = {
      id,
      userId: 1,
      status: 'RUNNING',
      type: data.type || 'web',
      region: data.region || 'us-west-oregon',
      port: 80,
      liveUrl: `https://${cleanName}.hostex.dev`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    apps.unshift(newApp);
    save(STORAGE_KEYS.APPS, apps);

    // Also register an initial deployment job
    const jobs = load(STORAGE_KEYS.JOBS, INITIAL_JOBS);
    jobs.unshift({
      id: Date.now() + 1,
      applicationId: id,
      appName: newApp.name,
      jobType: 'DEPLOY',
      status: 'COMPLETED',
      priority: 2,
      burstTime: 24,
      arrivalTime: new Date().toISOString(),
      startTime: new Date().toISOString(),
      completionTime: new Date().toISOString(),
    });
    save(STORAGE_KEYS.JOBS, jobs);

    return newApp;
  },

  updateApplication: async (id, data) => {
    await delay(200);
    const apps = load(STORAGE_KEYS.APPS, INITIAL_APPS);
    const idx = apps.findIndex((a) => String(a.id) === String(id));
    if (idx === -1) throw new Error('Application not found');
    apps[idx] = { ...apps[idx], ...data, updatedAt: new Date().toISOString() };
    save(STORAGE_KEYS.APPS, apps);
    return apps[idx];
  },

  deleteApplication: async (id) => {
    await delay(250);
    let apps = load(STORAGE_KEYS.APPS, INITIAL_APPS);
    apps = apps.filter((a) => String(a.id) !== String(id));
    save(STORAGE_KEYS.APPS, apps);
  },

  startApplication: async (id) => {
    await delay(250);
    const apps = load(STORAGE_KEYS.APPS, INITIAL_APPS);
    const app = apps.find((a) => String(a.id) === String(id));
    if (app) {
      app.status = 'RUNNING';
      app.updatedAt = new Date().toISOString();
      save(STORAGE_KEYS.APPS, apps);
    }
  },

  stopApplication: async (id) => {
    await delay(250);
    const apps = load(STORAGE_KEYS.APPS, INITIAL_APPS);
    const app = apps.find((a) => String(a.id) === String(id));
    if (app) {
      app.status = 'STOPPED';
      app.updatedAt = new Date().toISOString();
      save(STORAGE_KEYS.APPS, apps);
    }
  },

  deployApplication: async (id) => {
    await delay(300);
    const apps = load(STORAGE_KEYS.APPS, INITIAL_APPS);
    const app = apps.find((a) => String(a.id) === String(id));
    if (app) {
      app.status = 'BUILDING';
      save(STORAGE_KEYS.APPS, apps);
      setTimeout(() => {
        const freshApps = load(STORAGE_KEYS.APPS, INITIAL_APPS);
        const target = freshApps.find((a) => String(a.id) === String(id));
        if (target) {
          target.status = 'RUNNING';
          target.updatedAt = new Date().toISOString();
          save(STORAGE_KEYS.APPS, freshApps);
        }
      }, 3500);
    }
  },

  // Environment Variables
  getEnvVarsByApp: async (appId) => {
    await delay(100);
    const envs = load(STORAGE_KEYS.ENVS, INITIAL_ENVS);
    return envs.filter((e) => String(e.applicationId) === String(appId));
  },

  createEnvVar: async (appId, data) => {
    await delay(150);
    const envs = load(STORAGE_KEYS.ENVS, INITIAL_ENVS);
    const newEnv = {
      id: Date.now(),
      applicationId: Number(appId),
      variableKey: data.variableKey,
      variableValue: data.variableValue,
      createdAt: new Date().toISOString(),
    };
    envs.push(newEnv);
    save(STORAGE_KEYS.ENVS, envs);
    return newEnv;
  },

  updateEnvVar: async (appId, key, value) => {
    await delay(150);
    const envs = load(STORAGE_KEYS.ENVS, INITIAL_ENVS);
    const idx = envs.findIndex((e) => String(e.applicationId) === String(appId) && e.variableKey === key);
    if (idx !== -1) {
      envs[idx].variableValue = value;
      save(STORAGE_KEYS.ENVS, envs);
    }
  },

  deleteEnvVar: async (appId, key) => {
    await delay(150);
    let envs = load(STORAGE_KEYS.ENVS, INITIAL_ENVS);
    envs = envs.filter((e) => !(String(e.applicationId) === String(appId) && e.variableKey === key));
    save(STORAGE_KEYS.ENVS, envs);
  },

  // Workload Jobs & Scheduling
  getJobs: async () => {
    await delay(150);
    return load(STORAGE_KEYS.JOBS, INITIAL_JOBS);
  },

  createJob: async (jobData) => {
    await delay(200);
    const jobs = load(STORAGE_KEYS.JOBS, INITIAL_JOBS);
    const newJob = {
      id: Date.now(),
      status: 'QUEUED',
      arrivalTime: new Date().toISOString(),
      startTime: null,
      completionTime: null,
      ...jobData,
    };
    jobs.unshift(newJob);
    save(STORAGE_KEYS.JOBS, jobs);
    return newJob;
  },

  runScheduler: async (strategy) => {
    await delay(350);
    const jobs = load(STORAGE_KEYS.JOBS, INITIAL_JOBS);
    const queued = jobs.filter((j) => j.status === 'QUEUED');

    let sorted;
    switch (strategy) {
      case 'SJF':
        // Shortest Job First (matches SjfSchedulingStrategy.java)
        sorted = [...queued].sort((a, b) => (a.burstTime || 0) - (b.burstTime || 0));
        break;
      case 'PRIORITY':
        // Priority (matches PrioritySchedulingStrategy.java)
        sorted = [...queued].sort((a, b) => (b.priority || 0) - (a.priority || 0));
        break;
      case 'FCFS':
      default:
        // First Come First Served (matches FcfsSchedulingStrategy.java)
        sorted = [...queued].sort((a, b) => new Date(a.arrivalTime) - new Date(b.arrivalTime));
        break;
    }
    return sorted;
  },

  // Real-time Logs Generator
  getApplicationLogs: async (appName = 'hostex-app') => {
    await delay(100);
    const now = new Date().toISOString().substring(11, 19);
    return [
      { time: `${now} [git]`, level: 'build', text: `Cloning repository: hostex-workspaces/${appName}` },
      { time: `${now} [git]`, level: 'build', text: `HEAD is now at b59a541 minor (origin/main)` },
      { time: `${now} [docker]`, level: 'build', text: `Building image hostex-app-${appName}:latest` },
      { time: `${now} [docker]`, level: 'build', text: `Step 1/5 : FROM eclipse-temurin:21-jre-alpine` },
      { time: `${now} [docker]`, level: 'build', text: `Step 2/5 : WORKDIR /app` },
      { time: `${now} [docker]`, level: 'build', text: `Step 3/5 : COPY target/*.jar app.jar` },
      { time: `${now} [docker]`, level: 'build', text: `Step 4/5 : EXPOSE 80` },
      { time: `${now} [docker]`, level: 'build', text: `Step 5/5 : ENTRYPOINT ["java", "-jar", "app.jar"]` },
      { time: `${now} [runtime]`, level: 'success', text: `Successfully built image hostex-app-${appName}` },
      { time: `${now} [runtime]`, level: 'info', text: `Starting container: binding port 80 -> host port 3948` },
      { time: `${now} [runtime]`, level: 'success', text: `Container started. Healthcheck passed: 200 OK (14ms)` },
      { time: `${now} [http]`, level: 'info', text: `GET /actuator/health 200 OK - 8ms` },
      { time: `${now} [http]`, level: 'info', text: `GET /api/applications 200 OK - 24ms` },
    ];
  },

  // Metrics Data Generator
  getApplicationMetrics: async () => {
    await delay(100);
    const hours = ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
    return {
      cpuUsage: hours.map((time) => ({ time, value: Math.floor(12 + Math.random() * 28) })),
      memoryUsage: hours.map((time) => ({ time, value: Math.floor(220 + Math.random() * 95) })),
      networkTraffic: hours.map((time) => ({ time, value: Math.floor(45 + Math.random() * 85) })),
      requests: hours.map((time) => ({ time, value: Math.floor(120 + Math.random() * 450) })),
    };
  },
};
