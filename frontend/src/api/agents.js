import client from './client';

export const agentsAPI = {
  // Get all agents
  getAll: async () => {
    const response = await client.get('/agents');
    return response.data;
  },

  // Get single agent
  get: async (id) => {
    const response = await client.get(`/agents/${id}`);
    return response.data;
  },

  // Create custom agent
  create: async (data) => {
    const response = await client.post('/agents', data);
    return response.data;
  },

  // Update agent
  update: async (id, data) => {
    const response = await client.put(`/agents/${id}`, data);
    return response.data;
  },

  // Delete agent
  delete: async (id) => {
    const response = await client.delete(`/agents/${id}`);
    return response.data;
  },

  // Generate agent from description
  generate: async (description) => {
    const response = await client.post('/agent-generator/generate', { description });
    return response.data;
  },
};

export default agentsAPI;
