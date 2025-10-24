import client from './client';

export const analyticsAPI = {
  // Get dashboard summary
  getSummary: async () => {
    const response = await client.get('/api/v1/analytics/summary');
    return response.data;
  },

  // Get cost over time
  getCostOverTime: async (period = '30d') => {
    const response = await client.get('/api/v1/analytics/cost', { params: { period } });
    return response.data;
  },

  // Get token distribution
  getTokenDistribution: async () => {
    const response = await client.get('/api/v1/analytics/tokens');
    return response.data;
  },

  // Get success rate
  getSuccessRate: async (period = '30d') => {
    const response = await client.get('/api/v1/analytics/success-rate', { params: { period } });
    return response.data;
  },

  // Get workflow performance
  getWorkflowPerformance: async () => {
    const response = await client.get('/api/v1/analytics/performance');
    return response.data;
  },
};

export default analyticsAPI;
