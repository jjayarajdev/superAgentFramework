import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  AccountTree as WorkflowIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  PlayArrow as PlayIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { workflowsAPI } from '../api';
import { format } from 'date-fns';

const WorkflowCard = ({ workflow, onEdit, onExecute, onDuplicate, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action) => {
    handleMenuClose();
    action();
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Chip
            label={workflow.status || 'Active'}
            size="small"
            color={workflow.status === 'Active' ? 'success' : 'default'}
            variant="outlined"
          />
          <IconButton size="small" onClick={handleMenuClick}>
            <MoreIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => handleAction(() => onEdit(workflow))}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Edit
            </MenuItem>
            <MenuItem onClick={() => handleAction(() => onExecute(workflow))}>
              <PlayIcon fontSize="small" sx={{ mr: 1 }} />
              Execute
            </MenuItem>
            <MenuItem onClick={() => handleAction(() => onDuplicate(workflow))}>
              <CopyIcon fontSize="small" sx={{ mr: 1 }} />
              Duplicate
            </MenuItem>
            <MenuItem onClick={() => handleAction(() => onDelete(workflow))}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          </Menu>
        </Box>

        <Typography variant="h6" fontWeight={600} gutterBottom>
          {workflow.name}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 60 }}>
          {workflow.description || 'No description provided'}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" fontWeight={600} display="block" gutterBottom>
            Agents ({workflow.agents?.length || 0}):
          </Typography>
          {workflow.agents && workflow.agents.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {workflow.agents.slice(0, 3).map((agent, idx) => (
                <Chip
                  key={idx}
                  label={agent.name || agent.agent_type}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              ))}
              {workflow.agents.length > 3 && (
                <Chip
                  label={`+${workflow.agents.length - 3} more`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              )}
            </Box>
          ) : (
            <Typography variant="caption" color="text.secondary">
              No agents configured
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Created
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {workflow.created_at
                ? format(new Date(workflow.created_at), 'MMM dd, yyyy')
                : 'Unknown'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Executions
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {workflow.execution_count || 0}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => onEdit(workflow)}
        >
          Edit
        </Button>
        <Button
          fullWidth
          variant="contained"
          startIcon={<PlayIcon />}
          onClick={() => onExecute(workflow)}
        >
          Execute
        </Button>
      </Box>
    </Card>
  );
};

const Workflows = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: workflows, isLoading, error } = useQuery({
    queryKey: ['workflows'],
    queryFn: workflowsAPI.getAll,
  });

  const executeMutation = useMutation({
    mutationFn: workflowsAPI.execute,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['executions'] });
      alert(`Workflow execution started! Execution ID: ${data.execution_id || data.id}`);
      navigate('/executions');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: workflowsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (workflow) => {
      const newWorkflow = {
        ...workflow,
        name: `${workflow.name} (Copy)`,
        id: undefined,
      };
      return workflowsAPI.create(newWorkflow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });

  const filteredWorkflows = React.useMemo(() => {
    if (!workflows) return [];
    if (!searchTerm) return workflows;

    return workflows.filter((workflow) =>
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [workflows, searchTerm]);

  const handleEdit = (workflow) => {
    navigate('/workflows/visual-builder', { state: { workflow } });
  };

  const handleExecute = (workflow) => {
    if (window.confirm(`Execute workflow "${workflow.name}"?`)) {
      executeMutation.mutate({ id: workflow.id, input: {} });
    }
  };

  const handleDuplicate = (workflow) => {
    duplicateMutation.mutate(workflow);
  };

  const handleDelete = (workflow) => {
    if (window.confirm(`Are you sure you want to delete "${workflow.name}"?`)) {
      deleteMutation.mutate(workflow.id);
    }
  };

  const handleCreateNew = () => {
    navigate('/workflows/visual-builder');
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WorkflowIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Box>
              <Typography variant="h4" fontWeight={700}>
                My Workflows
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create and manage your multi-agent workflows
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={handleCreateNew}
          >
            Create New Workflow
          </Button>
        </Box>
      </Box>

      {/* Search */}
      {workflows && workflows.length > 0 && (
        <TextField
          fullWidth
          placeholder="Search workflows..."
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
      )}

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load workflows: {error.message}
        </Alert>
      )}

      {/* Mutation Errors */}
      {(executeMutation.isError || deleteMutation.isError || duplicateMutation.isError) && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => {
            executeMutation.reset();
            deleteMutation.reset();
            duplicateMutation.reset();
          }}
        >
          Operation failed:{' '}
          {executeMutation.error?.message ||
            deleteMutation.error?.message ||
            duplicateMutation.error?.message}
        </Alert>
      )}

      {/* Workflows Grid */}
      {filteredWorkflows && filteredWorkflows.length > 0 ? (
        <Grid container spacing={3}>
          {filteredWorkflows.map((workflow) => (
            <Grid item xs={12} md={6} lg={4} key={workflow.id}>
              <WorkflowCard
                workflow={workflow}
                onEdit={handleEdit}
                onExecute={handleExecute}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        !isLoading && (
          <Card>
            <CardContent>
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <WorkflowIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {searchTerm ? 'No workflows found' : 'No workflows yet'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {searchTerm
                    ? 'Try adjusting your search'
                    : 'Create your first workflow or start from a template'}
                </Typography>
                {!searchTerm && (
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleCreateNew}
                    >
                      Create New Workflow
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/templates')}
                    >
                      Browse Templates
                    </Button>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        )
      )}
    </Box>
  );
};

export default Workflows;
