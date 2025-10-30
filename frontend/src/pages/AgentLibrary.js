import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Switch,
  FormControlLabel,
  Checkbox,
  Autocomplete,
} from '@mui/material';
import {
  LocalLibrary as LibraryIcon,
  Search as SearchIcon,
  TrendingUp as TrendingIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { agentsAPI } from '../api';

const categoryColors = {
  Sales: 'primary',
  Communication: 'success',
  Data: 'secondary',
  Integration: 'warning',
  HR: 'info',
};

const AgentCard = ({ agent, onConfigure }) => {
  const category = agent.category || 'Integration';
  const color = categoryColors[category] || 'primary';
  const matchPercentage = agent.match_percentage || Math.floor(Math.random() * 30) + 70;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Chip
            label={category}
            size="small"
            color={color}
            variant="outlined"
          />
          <Chip
            icon={<TrendingIcon />}
            label={`${matchPercentage}% match`}
            size="small"
            sx={{
              bgcolor: 'success.50',
              color: 'success.main',
              fontWeight: 600,
            }}
          />
        </Box>

        <Typography variant="h6" fontWeight={600} gutterBottom>
          {agent.name}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            minHeight: 48,
            maxHeight: 48,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {agent.description}
        </Typography>

        <Box sx={{ mb: 2, minHeight: 56 }}>
          <Typography variant="caption" fontWeight={600} display="block" gutterBottom>
            Connectors:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {agent.connectors?.slice(0, 3).map((connector, idx) => (
              <Chip
                key={idx}
                label={connector}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            ))}
            {agent.connectors?.length > 3 && (
              <Chip
                label={`+${agent.connectors.length - 3}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            )}
          </Box>
        </Box>

        <Box sx={{ mb: 2, minHeight: 56 }}>
          <Typography variant="caption" fontWeight={600} display="block" gutterBottom>
            Capabilities:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {agent.capabilities?.slice(0, 3).map((capability, idx) => (
              <Chip
                key={idx}
                label={capability}
                size="small"
                color={color}
                sx={{ fontSize: '0.7rem' }}
              />
            ))}
            {agent.capabilities?.length > 3 && (
              <Chip
                label={`+${agent.capabilities.length - 3}`}
                size="small"
                color={color}
                sx={{ fontSize: '0.7rem' }}
              />
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto', pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Est. Cost
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              ${agent.estimated_cost || '0.015'}/run
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Latency
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {agent.avg_latency || '1.2'}s
            </Typography>
          </Box>
        </Box>

        {/* Configure Button */}
        <Box sx={{ mt: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => onConfigure(agent)}
            size="small"
          >
            Configure
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

const AgentLibrary = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [configureDialogOpen, setConfigureDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [configFormData, setConfigFormData] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPasswords, setShowPasswords] = useState({});

  const queryClient = useQueryClient();

  const { data: agents, isLoading, error } = useQuery({
    queryKey: ['agents'],
    queryFn: agentsAPI.getAll,
  });

  // Mutation for saving agent configuration
  const saveConfigMutation = useMutation({
    mutationFn: ({ agentType, configData }) => {
      console.log('Saving configuration:', { agentType, configData });
      return agentsAPI.saveConfiguration(agentType, configData);
    },
    onSuccess: (data) => {
      console.log('Configuration saved successfully:', data);
      setSaveSuccess(true);
      setTimeout(() => {
        setConfigureDialogOpen(false);
        setSaveSuccess(false);
        setConfigFormData({});
      }, 1500);
      queryClient.invalidateQueries(['agentConfig']);
    },
    onError: (error) => {
      console.error('Error saving configuration:', error);
      alert('Failed to save configuration: ' + (error.response?.data?.detail || error.message));
    },
  });

  // Extract unique categories
  const categories = React.useMemo(() => {
    if (!agents) return ['All Categories'];
    const cats = [...new Set(agents.map((a) => a.category || 'Integration'))];
    return ['All Categories', ...cats];
  }, [agents]);

  // Filter agents
  const filteredAgents = React.useMemo(() => {
    if (!agents) return [];

    return agents.filter((agent) => {
      const matchesSearch =
        !searchTerm ||
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === 'All Categories' ||
        (agent.category || 'Integration') === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [agents, searchTerm, categoryFilter]);

  // Handle configure button click - navigate to Lyzr builder
  const handleConfigure = (agent) => {
    // Navigate to Lyzr Agent Builder with agent ID for editing
    navigate(`/agents/${agent.agent_type}/edit`, { state: { agent } });
  };

  // Old handleConfigure code (kept for reference, not used)
  const handleConfigureOld = async (agent) => {
    setSelectedAgent(agent);
    setConfigureDialogOpen(true);

    // Try to load existing configuration
    try {
      const existingConfig = await agentsAPI.getConfiguration(agent.agent_type);

      if (existingConfig && existingConfig.config_data) {
        // Use existing configuration
        setConfigFormData(existingConfig.config_data);
      } else {
        // Initialize form data with default values from schema
        const initialData = {};
        if (agent.config_schema?.properties) {
          Object.keys(agent.config_schema.properties).forEach((key) => {
            const prop = agent.config_schema.properties[key];
            if (prop.default !== undefined) {
              initialData[key] = prop.default;
            }
          });
        }
        setConfigFormData(initialData);
      }
    } catch (error) {
      // If loading fails, use defaults
      const initialData = {};
      if (agent.config_schema?.properties) {
        Object.keys(agent.config_schema.properties).forEach((key) => {
          const prop = agent.config_schema.properties[key];
          if (prop.default !== undefined) {
            initialData[key] = prop.default;
          }
        });
      }
      setConfigFormData(initialData);
    }
  };

  // Handle form field change
  const handleFieldChange = (fieldName, value) => {
    setConfigFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // Handle save configuration
  const handleSaveConfig = () => {
    if (selectedAgent) {
      saveConfigMutation.mutate({
        agentType: selectedAgent.agent_type,
        configData: {
          agent_name: selectedAgent.name,
          config_data: configFormData,
          is_active: true,
        },
      });
    }
  };

  // Handle close dialog
  const handleCloseDialog = () => {
    setConfigureDialogOpen(false);
    setConfigFormData({});
    setSaveSuccess(false);
    setShowPasswords({});
  };

  // Toggle password visibility
  const togglePasswordVisibility = (fieldName) => {
    setShowPasswords((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  // Smart field renderer based on field type and name
  const renderFormField = (fieldName, field) => {
    const fieldValue = configFormData[fieldName] ?? field.default ?? '';
    const isRequired = selectedAgent?.config_schema?.required?.includes(fieldName);
    const label = field.title || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    // Determine if field contains sensitive data
    const isSensitive = fieldName.toLowerCase().includes('key') ||
                       fieldName.toLowerCase().includes('secret') ||
                       fieldName.toLowerCase().includes('password') ||
                       fieldName.toLowerCase().includes('token');

    // Handle different field types

    // Boolean fields (checkbox/switch)
    if (field.type === 'boolean') {
      return (
        <FormControlLabel
          key={fieldName}
          control={
            <Switch
              checked={Boolean(fieldValue)}
              onChange={(e) => handleFieldChange(fieldName, e.target.checked)}
              color="primary"
            />
          }
          label={
            <Box>
              <Typography variant="body1">{label}</Typography>
              {field.description && (
                <Typography variant="caption" color="text.secondary" display="block">
                  {field.description}
                </Typography>
              )}
            </Box>
          }
        />
      );
    }

    // Enum fields (dropdown)
    if (field.enum && Array.isArray(field.enum)) {
      return (
        <FormControl key={fieldName} fullWidth>
          <InputLabel>{label}</InputLabel>
          <Select
            value={fieldValue}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            label={label}
            required={isRequired}
          >
            {field.enum.map((option) => (
              <MenuItem key={option} value={option}>
                {option.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </MenuItem>
            ))}
          </Select>
          {field.description && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              {field.description}
            </Typography>
          )}
        </FormControl>
      );
    }

    // JSON/Object fields (textarea)
    if (field.type === 'object' || fieldName.toLowerCase().includes('params')) {
      return (
        <TextField
          key={fieldName}
          fullWidth
          multiline
          rows={4}
          label={label}
          value={typeof fieldValue === 'object' ? JSON.stringify(fieldValue, null, 2) : fieldValue}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              handleFieldChange(fieldName, parsed);
            } catch {
              // Keep as string if not valid JSON
              handleFieldChange(fieldName, e.target.value);
            }
          }}
          helperText={field.description || 'Enter valid JSON'}
          required={isRequired}
        />
      );
    }

    // Sensitive fields (password input with toggle)
    if (isSensitive) {
      return (
        <TextField
          key={fieldName}
          fullWidth
          label={label}
          type={showPasswords[fieldName] ? 'text' : 'password'}
          value={fieldValue}
          onChange={(e) => handleFieldChange(fieldName, e.target.value)}
          helperText={field.description}
          required={isRequired}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => togglePasswordVisibility(fieldName)}
                  edge="end"
                  size="small"
                >
                  {showPasswords[fieldName] ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      );
    }

    // Number fields
    if (field.type === 'integer' || field.type === 'number') {
      return (
        <TextField
          key={fieldName}
          fullWidth
          label={label}
          type="number"
          value={fieldValue}
          onChange={(e) => handleFieldChange(fieldName, field.type === 'integer' ? parseInt(e.target.value) : parseFloat(e.target.value))}
          helperText={field.description}
          required={isRequired}
        />
      );
    }

    // Default: Text field
    return (
      <TextField
        key={fieldName}
        fullWidth
        label={label}
        value={fieldValue}
        onChange={(e) => handleFieldChange(fieldName, e.target.value)}
        helperText={field.description}
        type="text"
        required={isRequired}
      />
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LibraryIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Typography variant="h4" fontWeight={700}>
            Agent Library
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Browse and discover AI agents for your workflows
        </Typography>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search agents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryFilter}
            label="Category"
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

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

      {/* Agents Grid */}
      {filteredAgents && filteredAgents.length > 0 && (
        <Grid container spacing={3}>
          {filteredAgents.map((agent) => (
            <Grid item xs={12} md={6} key={agent.agent_type}>
              <AgentCard agent={agent} onConfigure={handleConfigure} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty State */}
      {filteredAgents && filteredAgents.length === 0 && !isLoading && (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <LibraryIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No agents found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search or filters
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Configuration Dialog */}
      <Dialog
        open={configureDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SettingsIcon color="primary" />
              <Typography variant="h6">Configure {selectedAgent?.name}</Typography>
            </Box>
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {saveSuccess ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="success.main" gutterBottom>
                Configuration saved successfully!
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Alert severity="info">
                Configure the connection settings for {selectedAgent?.name}. These settings will be used when this agent is executed in workflows.
              </Alert>

              {selectedAgent?.config_schema?.properties && Object.keys(selectedAgent.config_schema.properties)
                .filter((key) => key !== 'connector')
                .map((fieldName) => {
                  const field = selectedAgent.config_schema.properties[fieldName];
                  return renderFormField(fieldName, field);
                })}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saveConfigMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveConfig}
            variant="contained"
            disabled={saveConfigMutation.isPending || saveSuccess}
          >
            {saveConfigMutation.isPending ? 'Saving...' : 'Save Configuration'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgentLibrary;
