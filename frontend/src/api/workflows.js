import client from './client';

export const workflowsAPI = {
  // Get all workflows
  getAll: async () => {
    const response = await client.get('/api/v1/workflows/');
    return response.data;
  },

  // Get single workflow
  get: async (id) => {
    const response = await client.get(`/api/v1/workflows/${id}`);
    return response.data;
  },

  // Create workflow
  create: async (data) => {
    const response = await client.post('/api/v1/workflows/', data);
    return response.data;
  },

  // Update workflow
  update: async (id, data) => {
    const response = await client.put(`/api/v1/workflows/${id}`, data);
    return response.data;
  },

  // Delete workflow
  delete: async (id) => {
    const response = await client.delete(`/api/v1/workflows/${id}`);
    return response.data;
  },

  // Execute workflow
  execute: async ({ id, input = {} }) => {
    const response = await client.post('/api/v1/executions/', {
      workflow_id: id,
      input: typeof input === 'string' ? input : JSON.stringify(input),
      params: {},
    });
    return response.data;
  },

  // Get workflow templates
  getTemplates: async () => {
    const response = await client.get('/api/v1/examples/');
    return response.data;
  },

  // Create from template
  createFromTemplate: async (templateId) => {
    const response = await client.post(`/api/v1/examples/${templateId}/create`);
    return response.data;
  },
};

export default workflowsAPI;
