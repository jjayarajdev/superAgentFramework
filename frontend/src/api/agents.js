import client from './client';

export const agentsAPI = {
  // Get all agents
  getAll: async () => {
    const response = await client.get('/api/v1/agents');
    return response.data;
  },

  // Get single agent
  get: async (id) => {
    const response = await client.get(`/api/v1/agents/${id}`);
    return response.data;
  },

  // Create custom agent
  create: async (data) => {
    const response = await client.post('/api/v1/agents', data);
    return response.data;
  },

  // Update agent
  update: async (id, data) => {
    const response = await client.put(`/api/v1/agents/${id}`, data);
    return response.data;
  },

  // Delete agent
  delete: async (id) => {
    const response = await client.delete(`/api/v1/agents/${id}`);
    return response.data;
  },

  // Generate agent from description
  generate: async (description) => {
    const response = await client.post('/api/v1/agents/generate', { description });
    return response.data;
  },
};

export default agentsAPI;
