import client from './client';

export const executionsAPI = {
  // Get all executions
  getAll: async (params = {}) => {
    const response = await client.get('/api/v1/executions', { params });
    return response.data;
  },

  // Get single execution
  get: async (id) => {
    const response = await client.get(`/api/v1/executions/${id}`);
    return response.data;
  },

  // Get execution stats
  getStats: async () => {
    const response = await client.get('/api/v1/executions/stats');
    return response.data;
  },
};

export default executionsAPI;
