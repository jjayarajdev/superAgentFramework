/**
 * API Utility
 * Handles authenticated API requests with JWT tokens
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Get stored auth token
 */
export const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

/**
 * Get stored user data
 */
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

/**
 * Make authenticated API request
 *
 * @param {string} endpoint - API endpoint (e.g., '/api/v1/workflows/')
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise} - Response data
 */
export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Add auth header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle 401 Unauthorized (token expired or invalid)
    if (response.status === 401) {
      logout();
      throw new Error('Session expired. Please login again.');
    }

    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Return JSON data
    return await response.json();

  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

/**
 * API Helper Functions
 */

// Workflows
export const workflowsApi = {
  list: () => apiRequest('/api/v1/workflows/'),

  get: (workflowId) => apiRequest(`/api/v1/workflows/${workflowId}`),

  create: (workflow) => apiRequest('/api/v1/workflows/', {
    method: 'POST',
    body: JSON.stringify(workflow)
  }),

  update: (workflowId, workflow) => apiRequest(`/api/v1/workflows/${workflowId}`, {
    method: 'PUT',
    body: JSON.stringify(workflow)
  }),

  delete: (workflowId) => apiRequest(`/api/v1/workflows/${workflowId}`, {
    method: 'DELETE'
  }),

  getStats: (workflowId) => apiRequest(`/api/v1/workflows/${workflowId}/stats`)
};

// Executions
export const executionsApi = {
  list: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/v1/executions/${queryString ? '?' + queryString : ''}`);
  },

  get: (executionId) => apiRequest(`/api/v1/executions/${executionId}`),

  create: (execution) => apiRequest('/api/v1/executions/', {
    method: 'POST',
    body: JSON.stringify(execution)
  }),

  getMetrics: (executionId) => apiRequest(`/api/v1/executions/${executionId}/metrics`),

  getLogs: (executionId, filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return apiRequest(`/api/v1/executions/${executionId}/logs${queryString ? '?' + queryString : ''}`);
  }
};

// Agents
export const agentsApi = {
  listTypes: () => apiRequest('/api/v1/agents/types'),

  generate: (agent) => apiRequest('/api/v1/agents/generate', {
    method: 'POST',
    body: JSON.stringify(agent)
  })
};

// Auth
export const authApi = {
  login: async (username, password) => {
    const formBody = new URLSearchParams();
    formBody.append('username', username);
    formBody.append('password', password);

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formBody
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Login failed');
    }

    return await response.json();
  },

  register: (userData) => fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  }).then(r => r.json()),

  getProfile: () => apiRequest('/api/v1/auth/me'),

  logout: () => apiRequest('/api/v1/auth/logout', { method: 'POST' })
};

// Examples
export const examplesApi = {
  list: () => apiRequest('/api/v1/examples/'),

  instantiate: (exampleId) => apiRequest(`/api/v1/examples/${exampleId}/instantiate`, {
    method: 'POST'
  }),

  runAll: () => apiRequest('/api/v1/examples/run-all', {
    method: 'POST'
  })
};

export default {
  apiRequest,
  workflows: workflowsApi,
  executions: executionsApi,
  agents: agentsApi,
  auth: authApi,
  examples: examplesApi,
  getAuthToken,
  getUser,
  isAuthenticated,
  logout
};
