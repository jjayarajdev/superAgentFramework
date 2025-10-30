export const analyticsAPI = {
  // Get dashboard summary
  getSummary: async () => {
    // Backend analytics not implemented yet, return empty
    return {};
  },

  // Get cost over time
  getCostOverTime: async (period = '30d') => {
    // Backend analytics not implemented yet, return empty
    // This allows the page to use mock data
    return [];
  },

  // Get token distribution
  getTokenDistribution: async () => {
    // Backend analytics not implemented yet, return empty
    // This allows the page to use mock data
    return [];
  },

  // Get success rate
  getSuccessRate: async (period = '30d') => {
    // Backend analytics not implemented yet, return empty
    return {};
  },

  // Get workflow performance
  getWorkflowPerformance: async () => {
    // Backend analytics not implemented yet, return empty
    // This allows the page to use mock data
    return [];
  },

  // Get metrics (fallback to empty for now - backend not implemented)
  getMetrics: async () => {
    // Backend analytics not implemented yet, return empty
    // This allows the page to use mock data
    return {};
  },

  // Get execution trends (fallback to empty for now - backend not implemented)
  getExecutionTrends: async (period = '30d') => {
    // Backend analytics not implemented yet, return empty
    // This allows the page to use mock data
    return [];
  },
};

export default analyticsAPI;
