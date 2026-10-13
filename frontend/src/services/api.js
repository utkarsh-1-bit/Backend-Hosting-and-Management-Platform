const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem('hostex_token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Request failed');
  }

  if (response.status === 204) return null;
  return response.json();
}

// Auth
export const authApi = {
  register: (data) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
};

// Applications
export const appApi = {
  list: () => request('/api/applications'),
  getById: (id) => request(`/api/applications/${id}`),
  getByUser: (userId) => request(`/api/applications?userId=${userId}`),
  create: (data) => request('/api/applications', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/api/applications/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateStatus: (id, status) => request(`/api/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  delete: (id) => request(`/api/applications/${id}`, { method: 'DELETE' }),
  deploy: (id) => request(`/api/applications/${id}/deploy`, { method: 'POST' }),
  start: (id) => request(`/api/applications/${id}/start`, { method: 'POST' }),
  stop: (id) => request(`/api/applications/${id}/stop`, { method: 'POST' }),
  restart: (id) => request(`/api/applications/${id}/restart`, { method: 'POST' }),
  getLogs: (id) => request(`/api/applications/${id}/logs`),
  getMetrics: (id) => request(`/api/applications/${id}/metrics`),
};

// Containers
export const containerApi = {
  getByApp: (appId) => request(`/api/containers?applicationId=${appId}`),
  getById: (id) => request(`/api/containers/${id}`),
  create: (data) => request('/api/containers', { method: 'POST', body: JSON.stringify(data) }),
  start: (id) => request(`/api/containers/${id}/start`, { method: 'POST' }),
  stop: (id) => request(`/api/containers/${id}/stop`, { method: 'POST' }),
  delete: (id) => request(`/api/containers/${id}`, { method: 'DELETE' }),
};

// Workload Jobs
export const jobApi = {
  list: () => request('/api/jobs'),
  getById: (id) => request(`/api/jobs/${id}`),
  create: (data) => request('/api/jobs', { method: 'POST', body: JSON.stringify(data) }),
  schedule: (id) => request(`/api/jobs/${id}/schedule`, { method: 'POST' }),
  start: (id) => request(`/api/jobs/${id}/start`, { method: 'POST' }),
  complete: (id) => request(`/api/jobs/${id}/complete`, { method: 'POST' }),
  cancel: (id) => request(`/api/jobs/${id}/cancel`, { method: 'POST' }),
};

// Environment Variables
export const envApi = {
  getByApp: (appId) => request(`/api/applications/${appId}/env`),
  create: (appId, data) => request(`/api/applications/${appId}/env`, { method: 'POST', body: JSON.stringify(data) }),
  update: (appId, id, data) => request(`/api/applications/${appId}/env/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (appId, id) => request(`/api/applications/${appId}/env/${id}`, { method: 'DELETE' }),
};

// Scheduler
export const schedulerApi = {
  runScheduler: (algorithm) => request(`/api/scheduler/run?algorithm=${algorithm}`, { method: 'POST' }),
};
