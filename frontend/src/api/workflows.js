import client from './client';

export const workflowsAPI = {
  // Get all workflows
  getAll: async () => {
    const response = await client.get('/workflows');
    return response.data;
  },

  // Get single workflow
  get: async (id) => {
    const response = await client.get(`/workflows/${id}`);
    return response.data;
  },

  // Create workflow
  create: async (data) => {
    const response = await client.post('/workflows', data);
    return response.data;
  },

  // Update workflow
  update: async (id, data) => {
    const response = await client.put(`/workflows/${id}`, data);
    return response.data;
  },

  // Delete workflow
  delete: async (id) => {
    const response = await client.delete(`/workflows/${id}`);
    return response.data;
  },

  // Execute workflow
  execute: async (id, input) => {
    const response = await client.post(`/workflows/${id}/execute`, { input });
    return response.data;
  },

  // Get workflow templates
  getTemplates: async () => {
    const response = await client.get('/examples');
    return response.data;
  },

  // Create from template
  createFromTemplate: async (templateId) => {
    const response = await client.post(`/examples/${templateId}/create`);
    return response.data;
  },
};

export default workflowsAPI;
