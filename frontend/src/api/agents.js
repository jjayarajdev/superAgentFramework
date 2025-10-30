import client from './client';

export const agentsAPI = {
  // Get all agents
  getAll: async () => {
    const response = await client.get('/api/v1/agents/types');
    // Transform the response to match frontend expectations
    const agents = response.data.agent_types || [];
    return agents.map((agent) => {
      // Extract capabilities from config_schema properties
      const capabilities = agent.config_schema?.properties
        ? Object.keys(agent.config_schema.properties)
            .filter((key) => key !== 'connector')
            .map((key) => {
              const prop = agent.config_schema.properties[key];
              return prop.title || key.replace(/_/g, ' ');
            })
            .slice(0, 5) // Limit to first 5 capabilities
        : [];

      return {
        agent_type: agent.id || agent.name,
        name: agent.name,
        description: agent.description || '',
        category: agent.category || 'Integration',
        connectors: agent.supported_connectors || [],
        capabilities: capabilities,
        config_schema: agent.config_schema || {},
      };
    });
  },

  // Get single agent
  get: async (id) => {
    const response = await client.get(`/api/v1/agents/types/${id}/schema`);
    return response.data;
  },

  // Create custom agent (not implemented in backend yet, return mock)
  create: async (data) => {
    // Backend doesn't support CRUD for agents yet
    // This would need to be implemented in the backend
    console.warn('Create agent not implemented in backend yet');
    return { ...data, id: Date.now() };
  },

  // Update agent (not implemented in backend yet, return mock)
  update: async (id, data) => {
    console.warn('Update agent not implemented in backend yet');
    return { ...data, id };
  },

  // Delete agent (not implemented in backend yet, return mock)
  delete: async (id) => {
    console.warn('Delete agent not implemented in backend yet');
    return { success: true };
  },

  // Generate agent from description
  generate: async (description) => {
    const response = await client.post('/api/v1/agents/generate', description);
    return response.data;
  },

  // ============================================================================
  // AGENT CONFIGURATION ENDPOINTS
  // ============================================================================

  // Get all agent configurations for the organization
  getConfigurations: async () => {
    const response = await client.get('/api/v1/agents/configurations/');
    return response.data;
  },

  // Get configuration for a specific agent type
  getConfiguration: async (agentType) => {
    const response = await client.get(`/api/v1/agents/configurations/${agentType}`);
    return response.data;
  },

  // Create or update agent configuration
  saveConfiguration: async (agentType, configData) => {
    const response = await client.post('/api/v1/agents/configurations/', {
      agent_type: agentType,
      agent_name: configData.agent_name || agentType,
      config_data: configData.config_data || configData,
      is_active: configData.is_active !== undefined ? configData.is_active : true,
    });
    return response.data;
  },

  // Update existing agent configuration
  updateConfiguration: async (agentType, configData) => {
    const response = await client.put(`/api/v1/agents/configurations/${agentType}`, configData);
    return response.data;
  },

  // Delete agent configuration
  deleteConfiguration: async (agentType) => {
    const response = await client.delete(`/api/v1/agents/configurations/${agentType}`);
    return response.data;
  },
};

export default agentsAPI;
