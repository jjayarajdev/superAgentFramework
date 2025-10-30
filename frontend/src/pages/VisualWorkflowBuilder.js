import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
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
} from '@mui/material';
import {
  Save as SaveIcon,
  PlayArrow as PlayIcon,
  Close as CloseIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { nodeTypes, NODE_PALETTE } from '../components/workflow/NodeTypes';

const DRAWER_WIDTH = 280;

const VisualWorkflowBuilder = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  // Node configuration state
  const [nodeConfig, setNodeConfig] = useState({
    apiUrl: '',
    httpMethod: 'GET',
    headers: [],
    queryParams: [],
    condition: '',
  });

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
    },
    [reactFlowInstance, setNodes]
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
      });
    }
  }, []);

  const handleSaveConfig = () => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...nodeConfig,
            },
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
  };

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeType));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleSaveWorkflow = () => {
    const workflowData = {
      id: workflowId,
      name: workflowName,
      nodes: nodes,
      edges: edges,
      agents: nodes,
    };
    console.log(isEditMode ? 'Updating workflow:' : 'Creating workflow:', workflowData);
    alert(isEditMode ? 'Workflow updated successfully!' : 'Workflow saved successfully!');
    // TODO: Add actual API call to save/update workflow
  };

  const handleRunWorkflow = () => {
    if (nodes.length === 0) {
      alert('Please add nodes to the workflow first');
      return;
    }
    console.log('Running workflow with nodes:', nodes);
    alert('Workflow execution started!');
  };

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
            startIcon={<SaveIcon />}
            onClick={handleSaveWorkflow}
            sx={{ textTransform: 'none', minHeight: 32 }}
          >
            Save
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<PlayIcon />}
            onClick={handleRunWorkflow}
            sx={{ textTransform: 'none', minHeight: 32 }}
          >
            Run
          </Button>
        </Box>

        {/* React Flow Canvas */}
        <Box
          ref={reactFlowWrapper}
          sx={{ flexGrow: 1, backgroundColor: '#fafafa', position: 'relative' }}
        >
          <ReactFlow
            nodes={nodes}
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
            <Controls />
          </ReactFlow>

          {/* Zoom Controls */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              backgroundColor: 'white',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              padding: 0.5,
            }}
          >
            <IconButton size="small">
              <AddIcon fontSize="small" />
            </IconButton>
            <Divider />
            <IconButton size="small">
              <SettingsIcon fontSize="small" />
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

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    No agents connected to this API node to configure mappings.
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Connect agents to this node to configure mappings
                  </Typography>
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
    </Box>
  );
};

export default VisualWorkflowBuilder;
