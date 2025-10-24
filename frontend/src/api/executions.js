import client from './client';

export const executionsAPI = {
  // Get all executions
  getAll: async (params = {}) => {
    const response = await client.get('/executions', { params });
    return response.data;
  },

  // Get single execution
  get: async (id) => {
    const response = await client.get(`/executions/${id}`);
    return response.data;
  },

  // Get execution stats
  getStats: async () => {
    const response = await client.get('/executions/stats');
    return response.data;
  },
};

export default executionsAPI;
