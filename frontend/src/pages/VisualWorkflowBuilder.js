import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  Typography,
  Button,
  Card,
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Tabs,
  Tab,
  Chip,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Save as SaveIcon,
  PlayArrow as PlayIcon,
  Close as CloseIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  FitScreen as FitScreenIcon,
} from '@mui/icons-material';
import { nodeTypes, NODE_PALETTE } from '../components/workflow/NodeTypes';
import { workflowsAPI, agentsAPI, executionsAPI } from '../api';

const DRAWER_WIDTH = 280;

const VisualWorkflowBuilder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const workflowFromState = location.state?.workflow;
  const isEditMode = !!workflowFromState;

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [configPanelOpen, setConfigPanelOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [workflowId, setWorkflowId] = useState(null);

  // Execution state
  const [executionId, setExecutionId] = useState(null);
  const [executionStatus, setExecutionStatus] = useState(null);
  const [nodeStatuses, setNodeStatuses] = useState({});

  // Undo/Redo state
  const [history, setHistory] = useState([{ nodes: [], edges: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Node configuration state
  const [nodeConfig, setNodeConfig] = useState({
    apiUrl: '',
    httpMethod: 'GET',
    headers: [],
    queryParams: [],
    condition: '',
    selectedAgent: '',
    agentName: '',
  });

  // Fetch available agents
  const { data: availableAgents, isLoading: agentsLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: agentsAPI.getAll,
  });

  // Mutations for API calls
  const createWorkflowMutation = useMutation({
    mutationFn: workflowsAPI.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      setWorkflowId(data.id);
      setSnackbar({
        open: true,
        message: 'Workflow created successfully!',
        severity: 'success',
      });
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Failed to create workflow: ${error.message}`,
        severity: 'error',
      });
    },
  });

  const updateWorkflowMutation = useMutation({
    mutationFn: ({ id, data }) => workflowsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      setSnackbar({
        open: true,
        message: 'Workflow updated successfully!',
        severity: 'success',
      });
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Failed to update workflow: ${error.message}`,
        severity: 'error',
      });
    },
  });

  const executeWorkflowMutation = useMutation({
    mutationFn: workflowsAPI.execute,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['executions'] });
      const execId = data.execution_id || data.id;
      setExecutionId(execId);
      setExecutionStatus('RUNNING');

      // Initialize all nodes as pending
      const initialStatuses = {};
      nodes.forEach(node => {
        initialStatuses[node.id] = 'pending';
      });
      setNodeStatuses(initialStatuses);

      setSnackbar({
        open: true,
        message: `Workflow execution started! Monitoring progress...`,
        severity: 'success',
      });

      // Start polling for execution status
      startPolling(execId);
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Failed to execute workflow: ${error.message}`,
        severity: 'error',
      });
    },
  });

  // Polling for execution status
  const startPolling = useCallback((execId) => {
    const pollInterval = setInterval(async () => {
      try {
        const execution = await executionsAPI.get(execId);

        setExecutionStatus(execution.status);

        // Simulate node status updates based on execution progress
        if (execution.agent_results && Array.isArray(execution.agent_results)) {
          const newStatuses = {};

          execution.agent_results.forEach((result) => {
            // Find matching node by agent type
            const matchingNode = nodes.find(n =>
              n.data.agentName === result.agent_type ||
              n.data.label === result.agent_name
            );

            if (matchingNode) {
              newStatuses[matchingNode.id] = result.status === 'success' ? 'completed' :
                                             result.status === 'error' ? 'failed' :
                                             'running';
            }
          });

          setNodeStatuses(prev => ({ ...prev, ...newStatuses }));
        }

        // Stop polling if execution is complete
        if (execution.status === 'COMPLETED' || execution.status === 'FAILED') {
          clearInterval(pollInterval);

          setSnackbar({
            open: true,
            message: execution.status === 'COMPLETED'
              ? '✅ Workflow completed successfully!'
              : '❌ Workflow execution failed',
            severity: execution.status === 'COMPLETED' ? 'success' : 'error',
          });

          // Mark all remaining nodes as completed or failed
          const finalStatuses = {};
          nodes.forEach(node => {
            if (!nodeStatuses[node.id]) {
              finalStatuses[node.id] = execution.status === 'COMPLETED' ? 'completed' : 'failed';
            }
          });
          setNodeStatuses(prev => ({ ...prev, ...finalStatuses }));
        }
      } catch (error) {
        console.error('Error polling execution status:', error);
        clearInterval(pollInterval);
      }
    }, 2000); // Poll every 2 seconds

    // Cleanup on unmount
    return () => clearInterval(pollInterval);
  }, [nodes, nodeStatuses]);

  // Load workflow data if in edit mode
  useEffect(() => {
    if (isEditMode && workflowFromState) {
      setWorkflowName(workflowFromState.name || 'Untitled Workflow');
      setWorkflowId(workflowFromState.id);

      // Load nodes if available
      if (workflowFromState.agents && Array.isArray(workflowFromState.agents)) {
        // Convert agents to nodes format
        const loadedNodes = workflowFromState.agents.map((agent, index) => ({
          id: agent.id || `agent-${index}`,
          type: 'agent',
          position: agent.position || { x: 100 + (index * 250), y: 100 },
          data: {
            label: agent.name || agent.agent_type || 'Agent',
            agentName: agent.agent_type,
            ...agent,
          },
        }));
        setNodes(loadedNodes);
      }

      // Load edges if available
      if (workflowFromState.edges && Array.isArray(workflowFromState.edges)) {
        setEdges(workflowFromState.edges);
      }
    }
  }, [isEditMode, workflowFromState, setNodes, setEdges]);

  // Save state to history for undo/redo
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes, edges });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [nodes, edges, history, historyIndex]);

  // Undo handler
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setNodes(history[newIndex].nodes);
      setEdges(history[newIndex].edges);
      setSnackbar({ open: true, message: 'Undo', severity: 'info' });
    }
  }, [historyIndex, history, setNodes, setEdges]);

  // Redo handler
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setNodes(history[newIndex].nodes);
      setEdges(history[newIndex].edges);
      setSnackbar({ open: true, message: 'Redo', severity: 'info' });
    }
  }, [historyIndex, history, setNodes, setEdges]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Cmd/Ctrl + S: Save workflow
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault();
        handleSaveWorkflow();
      }

      // Cmd/Ctrl + Z: Undo
      if ((event.metaKey || event.ctrlKey) && !event.shiftKey && event.key === 'z') {
        event.preventDefault();
        handleUndo();
      }

      // Cmd/Ctrl + Shift + Z: Redo
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'z') {
        event.preventDefault();
        handleRedo();
      }

      // Delete or Backspace: Delete selected node
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNode && !configPanelOpen) {
        event.preventDefault();
        handleDeleteNode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, configPanelOpen, handleUndo, handleRedo]);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed },
            animated: true,
          },
          eds
        )
      ),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const nodeData = JSON.parse(event.dataTransfer.getData('application/reactflow'));

      if (!nodeData || !reactFlowInstance) return;

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: `${nodeData.type}-${Date.now()}`,
        type: nodeData.type,
        position,
        data: { ...nodeData.data },
      };

      setNodes((nds) => nds.concat(newNode));
      saveToHistory();
    },
    [reactFlowInstance, setNodes, saveToHistory]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setConfigPanelOpen(true);

    // Load existing config if available
    if (node.data) {
      setNodeConfig({
        apiUrl: node.data.apiUrl || '',
        httpMethod: node.data.method || 'GET',
        headers: node.data.headers || [],
        queryParams: node.data.queryParams || [],
        condition: node.data.condition || '',
        selectedAgent: node.data.agentName || '',
        agentName: node.data.label || '',
      });
    }
  }, []);

  const handleSaveConfig = () => {
    if (!selectedNode) return;

    // Update node with config, including agent selection for agent nodes
    const updatedData = {
      ...selectedNode.data,
      ...nodeConfig,
    };

    // For agent nodes, update the label and agentName
    if (selectedNode.type === 'agent' && nodeConfig.selectedAgent) {
      const selectedAgentInfo = availableAgents?.find(a => a.agent_type === nodeConfig.selectedAgent);
      updatedData.label = nodeConfig.agentName || selectedAgentInfo?.name || nodeConfig.selectedAgent;
      updatedData.agentName = nodeConfig.selectedAgent;
    }

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: updatedData,
          };
        }
        return node;
      })
    );

    setConfigPanelOpen(false);
  };

  const handleDeleteNode = () => {
    if (!selectedNode) return;

    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    setEdges((eds) =>
      eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
    );
    setConfigPanelOpen(false);
    setSelectedNode(null);
    saveToHistory();
  };

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeType));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleSaveWorkflow = () => {
    if (!workflowName || workflowName.trim() === '') {
      setSnackbar({
        open: true,
        message: 'Please enter a workflow name',
        severity: 'warning',
      });
      return;
    }

    if (nodes.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please add at least one node to the workflow',
        severity: 'warning',
      });
      return;
    }

    // Convert nodes to agents format for backend
    const agents = nodes.map((node) => ({
      id: node.id,
      agent_type: node.data.agentName || node.data.label || 'custom',
      name: node.data.label,
      position: node.position,
      ...node.data,
    }));

    const workflowData = {
      name: workflowName,
      description: `Workflow with ${nodes.length} nodes`,
      agents: agents,
      edges: edges,
      status: 'Active',
    };

    if (isEditMode && workflowId) {
      // Update existing workflow
      updateWorkflowMutation.mutate({ id: workflowId, data: workflowData });
    } else {
      // Create new workflow
      createWorkflowMutation.mutate(workflowData);
    }
  };

  const handleRunWorkflow = () => {
    if (nodes.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please add nodes to the workflow first',
        severity: 'warning',
      });
      return;
    }

    if (!workflowId) {
      setSnackbar({
        open: true,
        message: 'Please save the workflow before executing',
        severity: 'warning',
      });
      return;
    }

    // Execute the workflow
    executeWorkflowMutation.mutate({ id: workflowId, input: {} });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Zoom functions
  const handleZoomIn = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomIn({ duration: 300 });
    }
  }, [reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomOut({ duration: 300 });
    }
  }, [reactFlowInstance]);

  const handleFitView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2, duration: 300 });
    }
  }, [reactFlowInstance]);

  return (
    <Box sx={{
      display: 'flex',
      height: '100vh', // Full viewport height
      position: 'relative',
    }}>
      {/* Left Sidebar - Node Palette */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            position: 'relative',
            border: 'none',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
            Nodes
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Drag components
          </Typography>
        </Box>

        {/* Draggable Components */}
        <List sx={{ p: 2 }}>
          <Typography
            variant="caption"
            fontWeight={600}
            color="text.secondary"
            sx={{ display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            Drag Components
          </Typography>

          {NODE_PALETTE.map((nodeType) => {
            const Icon = nodeType.icon;
            return (
              <Card
                key={nodeType.id}
                draggable
                onDragStart={(e) => onDragStart(e, nodeType)}
                sx={{
                  mb: 1.5,
                  cursor: 'grab',
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: nodeType.lightColor,
                  '&:active': {
                    cursor: 'grabbing',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  },
                  '&:hover': {
                    boxShadow: 3,
                    borderColor: nodeType.color,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <ListItem sx={{ py: 1.5 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      backgroundColor: nodeType.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 1.5,
                      color: 'white',
                    }}
                  >
                    <Icon fontSize="small" />
                  </Box>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={600}>
                        {nodeType.label}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {nodeType.subtitle}
                      </Typography>
                    }
                  />
                </ListItem>
              </Card>
            );
          })}
        </List>
      </Drawer>

      {/* Main Canvas */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Toolbar */}
        <Box
          sx={{
            p: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'white',
            display: 'flex',
            gap: 2,
            alignItems: 'center',
          }}
        >
          <Tabs value={0} sx={{ minHeight: 36 }}>
            <Tab label="Workflow" sx={{ minHeight: 36, textTransform: 'none' }} />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {workflowName}
                </Box>
              }
              sx={{ minHeight: 36, textTransform: 'none' }}
            />
          </Tabs>

          <Button variant="text" size="small" sx={{ textTransform: 'none', minHeight: 32 }}>
            My Workflows
          </Button>
          <Button variant="text" size="small" sx={{ textTransform: 'none', minHeight: 32 }}>
            Guide
          </Button>
          <Button variant="text" size="small" sx={{ textTransform: 'none', minHeight: 32 }}>
            Workflow API
          </Button>

          <Box sx={{ flexGrow: 1 }} />

          <Button
            variant="outlined"
            size="small"
            startIcon={createWorkflowMutation.isPending || updateWorkflowMutation.isPending ? <CircularProgress size={16} /> : <SaveIcon />}
            onClick={handleSaveWorkflow}
            disabled={createWorkflowMutation.isPending || updateWorkflowMutation.isPending}
            sx={{ textTransform: 'none', minHeight: 32 }}
          >
            {createWorkflowMutation.isPending || updateWorkflowMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={executeWorkflowMutation.isPending ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <PlayIcon />}
            onClick={handleRunWorkflow}
            disabled={executeWorkflowMutation.isPending}
            sx={{ textTransform: 'none', minHeight: 32 }}
          >
            {executeWorkflowMutation.isPending ? 'Running...' : 'Run'}
          </Button>
        </Box>

        {/* React Flow Canvas */}
        <Box
          ref={reactFlowWrapper}
          sx={{ flexGrow: 1, backgroundColor: '#fafafa', position: 'relative' }}
        >
          <ReactFlow
            nodes={nodes.map(node => ({
              ...node,
              data: {
                ...node.data,
                executionStatus: nodeStatuses[node.id],
              },
            }))}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-right"
          >
            <Background color="#e5e5e5" gap={16} />
            <Controls showInteractive={false} />
            <MiniMap
              nodeColor={(node) => {
                switch (node.type) {
                  case 'agent':
                    return '#8B5CF6';
                  case 'conditional':
                    return '#F59E0B';
                  case 'router':
                    return '#3B82F6';
                  case 'apiCall':
                    return '#10B981';
                  default:
                    return '#6B7280';
                }
              }}
              maskColor="rgba(0, 0, 0, 0.1)"
              style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
          </ReactFlow>

          {/* Custom Zoom Controls */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 120,
              left: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              backgroundColor: 'white',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              padding: 0.5,
              boxShadow: 1,
            }}
          >
            <IconButton size="small" onClick={handleZoomIn} title="Zoom In">
              <ZoomInIcon fontSize="small" />
            </IconButton>
            <Divider />
            <IconButton size="small" onClick={handleZoomOut} title="Zoom Out">
              <ZoomOutIcon fontSize="small" />
            </IconButton>
            <Divider />
            <IconButton size="small" onClick={handleFitView} title="Fit View">
              <FitScreenIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Bottom Panel - Workflow Events */}
        <Box
          sx={{
            p: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography variant="caption" fontWeight={600}>
            Workflow Events
          </Typography>
          <Chip label={`${nodes.length} nodes`} size="small" sx={{ height: 20 }} />
          <Chip label={`${edges.length} connections`} size="small" sx={{ height: 20 }} />
        </Box>
      </Box>

      {/* Right Panel - Node Configuration */}
      <Drawer
        anchor="right"
        open={configPanelOpen}
        onClose={() => setConfigPanelOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 400,
            p: 0,
          },
        }}
      >
        {selectedNode && (
          <>
            {/* Header */}
            <Box
              sx={{
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.default',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={700}>
                  Node Configuration
                </Typography>
                <IconButton size="small" onClick={() => setConfigPanelOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>

            {/* Tabs */}
            <Tabs value={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}>
              <Tab label="API Configuration" sx={{ textTransform: 'none' }} />
            </Tabs>

            {/* Configuration Form */}
            <Box sx={{ p: 2 }}>
              {selectedNode.type === 'apiCall' && (
                <>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Endpoint Configuration
                  </Typography>

                  <TextField
                    fullWidth
                    label="API URL"
                    placeholder="https://api.example.com/endpoint"
                    value={nodeConfig.apiUrl}
                    onChange={(e) => setNodeConfig({ ...nodeConfig, apiUrl: e.target.value })}
                    size="small"
                    sx={{ mb: 2 }}
                  />

                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>HTTP Method</InputLabel>
                    <Select
                      value={nodeConfig.httpMethod}
                      label="HTTP Method"
                      onChange={(e) => setNodeConfig({ ...nodeConfig, httpMethod: e.target.value })}
                    >
                      <MenuItem value="GET">GET</MenuItem>
                      <MenuItem value="POST">POST</MenuItem>
                      <MenuItem value="PUT">PUT</MenuItem>
                      <MenuItem value="DELETE">DELETE</MenuItem>
                      <MenuItem value="PATCH">PATCH</MenuItem>
                    </Select>
                  </FormControl>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Headers
                      </Typography>
                      <Button size="small" startIcon={<AddIcon />} sx={{ textTransform: 'none' }}>
                        Add Header
                      </Button>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      No headers configured
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Query Parameters
                      </Typography>
                      <Button size="small" startIcon={<AddIcon />} sx={{ textTransform: 'none' }}>
                        Add Query Param
                      </Button>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      No query parameters configured
                    </Typography>
                  </Box>
                </>
              )}

              {selectedNode.type === 'conditional' && (
                <>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Conditional Logic
                  </Typography>

                  <TextField
                    fullWidth
                    label="Condition"
                    placeholder="Is the user angry or frustrated?"
                    value={nodeConfig.condition}
                    onChange={(e) => setNodeConfig({ ...nodeConfig, condition: e.target.value })}
                    size="small"
                    multiline
                    rows={3}
                    sx={{ mb: 2 }}
                  />

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    Define the condition that determines the branching logic.
                    True path will be taken if condition is met, False otherwise.
                  </Typography>
                </>
              )}

              {selectedNode.type === 'agent' && (
                <>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Agent Configuration
                  </Typography>

                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Select Agent Type</InputLabel>
                    <Select
                      value={nodeConfig.selectedAgent}
                      label="Select Agent Type"
                      onChange={(e) => setNodeConfig({ ...nodeConfig, selectedAgent: e.target.value })}
                      disabled={agentsLoading}
                    >
                      {agentsLoading ? (
                        <MenuItem disabled>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Loading agents...
                        </MenuItem>
                      ) : availableAgents && availableAgents.length > 0 ? (
                        availableAgents.map((agent) => (
                          <MenuItem key={agent.agent_type} value={agent.agent_type}>
                            {agent.name}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No agents available</MenuItem>
                      )}
                    </Select>
                  </FormControl>

                  {nodeConfig.selectedAgent && (
                    <>
                      <TextField
                        fullWidth
                        label="Agent Display Name"
                        placeholder="Enter a custom name (optional)"
                        value={nodeConfig.agentName}
                        onChange={(e) => setNodeConfig({ ...nodeConfig, agentName: e.target.value })}
                        size="small"
                        sx={{ mb: 2 }}
                        helperText="Leave empty to use default agent name"
                      />

                      {availableAgents && (
                        <Box sx={{ mb: 2 }}>
                          {(() => {
                            const agentInfo = availableAgents.find(a => a.agent_type === nodeConfig.selectedAgent);
                            return agentInfo ? (
                              <>
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                  <strong>Description:</strong> {agentInfo.description}
                                </Typography>
                                {agentInfo.capabilities && agentInfo.capabilities.length > 0 && (
                                  <Box>
                                    <Typography variant="caption" fontWeight={600} display="block" sx={{ mb: 0.5 }}>
                                      Capabilities:
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                      {agentInfo.capabilities.map((cap, idx) => (
                                        <Chip key={idx} label={cap} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                                      ))}
                                    </Box>
                                  </Box>
                                )}
                              </>
                            ) : null;
                          })()}
                        </Box>
                      )}
                    </>
                  )}
                </>
              )}
            </Box>

            {/* Actions */}
            <Box sx={{ p: 2, mt: 'auto', borderTop: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  onClick={handleDeleteNode}
                  sx={{ textTransform: 'none' }}
                >
                  Delete
                </Button>
                <Button variant="text" onClick={() => setConfigPanelOpen(false)} sx={{ textTransform: 'none' }}>
                  Cancel
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSaveConfig}
                  sx={{ textTransform: 'none' }}
                >
                  Save Changes
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Drawer>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VisualWorkflowBuilder;
