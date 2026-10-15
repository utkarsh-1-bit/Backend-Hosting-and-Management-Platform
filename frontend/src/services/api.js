// API client service for HosteX backend integration
// Points to Spring Boot REST backend on http://localhost:8080 (via Vite proxy or direct base URL)

const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Universal fetch wrapper with error handling and fallback support
 */
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
    let errorMessage = `HTTP Error ${response.status}`;
    try {
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        errorMessage = json.message || json.error || text;
      } catch {
        errorMessage = text || response.statusText;
      }
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) return null;
  return response.json();
}

/**
 * User & Authentication Endpoints
 * Maps to com.backend.controller.UserController:
 * - POST /api/users/register
 * - POST /api/users/login
 */
export const authApi = {
  login: async ({ email, password }) => {
    return request('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async ({ name, email, password }) => {
    return request('/api/users/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },
};

/**
 * Applications Endpoints
 * Maps to com.backend.controller.ApplicationController:
 * - POST /api/applications
 * - GET /api/applications/{id} -> returns ApplicationResponse { id, name, status, url }
 * - GET /api/applications/user/{userId} -> returns List<Application>
 * - PUT /api/applications/{id}
 * - DELETE /api/applications/{id}
 * - POST /api/applications/{id}/start
 * - POST /api/applications/{id}/stop
 * - POST /api/applications/{id}/restart
 */
export const appApi = {
  // Get all applications for a specific user
  getByUser: async (userId) => {
    return request(`/api/applications/user/${userId}`);
  },

  // Get application response with container live URL and status
  getById: async (id) => {
    return request(`/api/applications/${id}`);
  },

  // Create new application
  create: async (data) => {
    return request('/api/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update application configuration
  update: async (id, data) => {
    return request(`/api/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete application and clean up container resources
  delete: async (id) => {
    return request(`/api/applications/${id}`, {
      method: 'DELETE',
    });
  },

  // Lifecycle operations
  start: async (id) => {
    return request(`/api/applications/${id}/start`, {
      method: 'POST',
    });
  },

  stop: async (id) => {
    return request(`/api/applications/${id}/stop`, {
      method: 'POST',
    });
  },

  restart: async (id) => {
    return request(`/api/applications/${id}/restart`, {
      method: 'POST',
    });
  },
};

/**
 * Environment Variables Endpoints
 * Maps to com.backend.controller.EnvironmentVariableController:
 * - POST /api/applications/{applicationId}/env
 * - GET /api/applications/{applicationId}/env
 * - GET /api/applications/{applicationId}/env/{key}
 * - PUT /api/applications/{applicationId}/env/{key}
 * - DELETE /api/applications/{applicationId}/env/{key}
 */
export const envApi = {
  getByApp: async (applicationId) => {
    return request(`/api/applications/${applicationId}/env`);
  },

  getByKey: async (applicationId, key) => {
    return request(`/api/applications/${applicationId}/env/${encodeURIComponent(key)}`);
  },

  create: async (applicationId, { variableKey, variableValue }) => {
    return request(`/api/applications/${applicationId}/env`, {
      method: 'POST',
      body: JSON.stringify({ variableKey, variableValue }),
    });
  },

  update: async (applicationId, key, { variableValue }) => {
    return request(`/api/applications/${applicationId}/env/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: JSON.stringify({ variableKey: key, variableValue }),
    });
  },

  delete: async (applicationId, key) => {
    return request(`/api/applications/${applicationId}/env/${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });
  },
};

/**
 * System and Health Diagnostics
 */
export const systemApi = {
  checkHealth: async () => {
    const startTime = performance.now();
    try {
      // Pinging the API endpoint
      const res = await fetch(`${API_BASE}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '__healthcheck__', password: '' }),
      });
      const latency = Math.round(performance.now() - startTime);
      // Even if 401/400 is returned, backend is up and running!
      return { online: true, latency, status: res.status };
    } catch {
      return { online: false, latency: null, status: null };
    }
  },
};
