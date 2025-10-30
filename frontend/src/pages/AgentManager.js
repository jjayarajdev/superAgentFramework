import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Switch,
  Tooltip,
} from '@mui/material';
import {
  Build as BuildIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  AutoAwesome as AIIcon,
} from '@mui/icons-material';
import { agentsAPI } from '../api';
import AgentBuilderWizard from '../components/AgentBuilderWizard';

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {title}
        </Typography>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            backgroundColor: `${color}.50`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: `${color}.main`,
          }}
        >
          <Icon />
        </Box>
      </Box>
      <Typography variant="h3" fontWeight={700} gutterBottom>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {subtitle}
      </Typography>
    </CardContent>
  </Card>
);

const AgentCard = ({ agent, onEdit, onDelete, onToggle }) => {
  const category = agent.category || 'Integration';
  const categoryColors = {
    Sales: 'primary',
    Communication: 'success',
    Data: 'secondary',
    Integration: 'warning',
    HR: 'info',
    Custom: 'error',
  };
  const color = categoryColors[category] || 'primary';
  const isCustom = agent.is_custom || agent.category === 'Custom';

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Chip label={category} size="small" color={color} variant="outlined" />
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {isCustom && (
              <>
                <Tooltip title="Edit Agent">
                  <IconButton size="small" onClick={() => onEdit(agent)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Agent">
                  <IconButton size="small" onClick={() => onDelete(agent)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
            <Tooltip title={agent.enabled ? 'Disable' : 'Enable'}>
              <Switch
                size="small"
                checked={agent.enabled !== false}
                onChange={() => onToggle(agent)}
              />
            </Tooltip>
          </Box>
        </Box>

        <Typography variant="h6" fontWeight={600} gutterBottom>
          {agent.name}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 60 }}>
          {agent.description}
        </Typography>

        {agent.connectors && agent.connectors.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" fontWeight={600} display="block" gutterBottom>
              Connectors:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {agent.connectors.slice(0, 3).map((connector, idx) => (
                <Chip
                  key={idx}
                  label={connector}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              ))}
              {agent.connectors.length > 3 && (
                <Chip
                  label={`+${agent.connectors.length - 3}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              )}
            </Box>
          </Box>
        )}

        {agent.capabilities && agent.capabilities.length > 0 && (
          <Box>
            <Typography variant="caption" fontWeight={600} display="block" gutterBottom>
              Capabilities:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {agent.capabilities.slice(0, 3).map((capability, idx) => (
                <Chip
                  key={idx}
                  label={capability}
                  size="small"
                  color={color}
                  sx={{ fontSize: '0.7rem' }}
                />
              ))}
              {agent.capabilities.length > 3 && (
                <Chip
                  label={`+${agent.capabilities.length - 3}`}
                  size="small"
                  color={color}
                  sx={{ fontSize: '0.7rem' }}
                />
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Old dialog removed - using AgentBuilderWizard instead

const AgentManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const queryClient = useQueryClient();

  const { data: agents, isLoading, error } = useQuery({
    queryKey: ['agents'],
    queryFn: agentsAPI.getAll,
  });

  const createMutation = useMutation({
    mutationFn: agentsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setDialogOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => agentsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setDialogOpen(false);
      setEditingAgent(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: agentsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });

  // Calculate stats
  const stats = React.useMemo(() => {
    if (!agents) return { total: 0, enabled: 0, custom: 0, builtin: 0 };

    return {
      total: agents.length,
      enabled: agents.filter((a) => a.enabled !== false).length,
      custom: agents.filter((a) => a.is_custom || a.category === 'Custom').length,
      builtin: agents.filter((a) => !a.is_custom && a.category !== 'Custom').length,
    };
  }, [agents]);

  const filteredAgents = React.useMemo(() => {
    if (!agents) return [];
    if (!searchTerm) return agents;

    return agents.filter((agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [agents, searchTerm]);

  const handleEdit = (agent) => {
    setEditingAgent(agent);
    setDialogOpen(true);
  };

  const handleDelete = (agent) => {
    if (window.confirm(`Are you sure you want to delete the agent "${agent.name}"?`)) {
      deleteMutation.mutate(agent.agent_type);
    }
  };

  const handleToggle = (agent) => {
    updateMutation.mutate({
      id: agent.agent_type,
      data: { ...agent, enabled: !agent.enabled },
    });
  };

  const handleCreateOrUpdate = (agentData) => {
    if (editingAgent) {
      updateMutation.mutate({ id: editingAgent.agent_type, data: agentData });
    } else {
      createMutation.mutate(agentData);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BuildIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Agent Manager
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create and manage your custom AI agents
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingAgent(null);
              setDialogOpen(true);
            }}
          >
            Create Custom Agent
          </Button>
        </Box>
      </Box>

      {/* Stats Cards - 4 in a row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Agents"
            value={stats.total}
            subtitle="All agents"
            icon={BuildIcon}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Enabled"
            value={stats.enabled}
            subtitle="Active agents"
            icon={CheckCircleIcon}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Custom"
            value={stats.custom}
            subtitle="Your agents"
            icon={AIIcon}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Built-in"
            value={stats.builtin}
            subtitle="Pre-built agents"
            icon={BuildIcon}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search agents..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load agents: {error.message}
        </Alert>
      )}

      {/* Mutation Errors */}
      {(createMutation.isError || updateMutation.isError || deleteMutation.isError) && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => {
            createMutation.reset();
            updateMutation.reset();
            deleteMutation.reset();
          }}
        >
          Operation failed:{' '}
          {createMutation.error?.message ||
            updateMutation.error?.message ||
            deleteMutation.error?.message}
        </Alert>
      )}

      {/* Agents Grid */}
      {filteredAgents && filteredAgents.length > 0 && (
        <Grid container spacing={3}>
          {filteredAgents.map((agent) => (
            <Grid item xs={12} md={6} key={agent.agent_type}>
              <AgentCard
                agent={agent}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggle={handleToggle}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty State */}
      {filteredAgents && filteredAgents.length === 0 && !isLoading && (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <BuildIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No agents found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm
                  ? 'Try adjusting your search'
                  : 'Create your first custom agent to get started'}
              </Typography>
              {!searchTerm && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingAgent(null);
                    setDialogOpen(true);
                  }}
                >
                  Create Custom Agent
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Wizard */}
      <AgentBuilderWizard
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingAgent(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingAgent}
      />
    </Box>
  );
};

export default AgentManager;
