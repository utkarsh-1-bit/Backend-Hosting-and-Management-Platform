const API_BASE = import.meta.env.VITE_API_URL || '';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = sessionStorage.getItem('hostex_token');
  const { headers: optionHeaders, ...requestOptions } = options;

  const config = {
    ...requestOptions,
    headers: {
      ...(requestOptions.body && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...optionHeaders,
    },
  };

  const response = await fetch(url, config);

  if (response.status === 401) {
    sessionStorage.removeItem('hostex_token');
    sessionStorage.removeItem('hostex_user');
    window.dispatchEvent(new Event('hostex:unauthorized'));
  }

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
  const responseText = await response.text();
  if (!responseText) return null;
  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
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
 * Application and runtime endpoints
 */
export const appApi = {
  getByUser: async (userId) => {
    return request(`/api/applications/user/${userId}`);
  },

  getById: async (id) => {
    return request(`/api/applications/${id}`);
  },

  create: async (data) => {
    return request('/api/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return request(`/api/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return request(`/api/applications/${id}`, {
      method: 'DELETE',
    });
  },

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

  deploy: async (id) => request(`/api/applications/${id}/deploy`, { method: 'POST' }),

  getResources: async (id) => request(`/api/applications/${id}/resources`),

  getLogs: async (id) => request(`/api/applications/${id}/logs`),
};

export const jobsApi = {
  getAll: async () => request('/api/jobs'),

  create: async (data) => request('/api/jobs', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  cancel: async (id) => request(`/api/jobs/${id}`, { method: 'DELETE' }),
};

export const schedulerApi = {
  preview: async (algorithm) => request(`/api/scheduler/queue?algorithm=${encodeURIComponent(algorithm)}`),
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
      const res = await fetch(`${API_BASE}/api/health`);
      const latency = Math.round(performance.now() - startTime);
      const health = res.ok ? await res.json() : null;
      return { online: res.ok, latency, status: res.status, database: health?.database || 'DOWN' };
    } catch {
      return { online: false, latency: null, status: null, database: 'UNKNOWN' };
    }
  },
};
