import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  InputAdornment,
  Tabs,
  Tab,
  CircularProgress,
  Badge,
} from '@mui/material';
import {
  Save as SaveIcon,
  PlayArrow as PlayIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Category as CategoryIcon,
  ViewModule as TemplateIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { workflowsAPI, agentsAPI } from '../api';

const DRAWER_WIDTH = 320;

// Workflow Templates - Using exact agent types from AGENT_REGISTRY
const WORKFLOW_TEMPLATES = [
  {
    id: 'sales-pipeline',
    name: 'Sales Pipeline Automation',
    description: 'Automate lead qualification, HubSpot CRM updates, and follow-up emails',
    category: 'Sales',
    icon: '💼',
    agents: ['sales_intelligence', 'hubspot', 'email_outreach'],
    complexity: 'Medium',
    estimatedTime: '5-10 min',
  },
  {
    id: 'customer-support',
    name: 'Customer Support Workflow',
    description: 'Ticket management with ServiceNow, Slack notifications, and Zendesk integration',
    category: 'Communication',
    icon: '💬',
    agents: ['servicenow', 'slack', 'zendesk'],
    complexity: 'Easy',
    estimatedTime: '3-5 min',
  },
  {
    id: 'data-sync',
    name: 'Financial Data Sync',
    description: 'Sync payment data from Stripe with HubSpot CRM for financial tracking',
    category: 'Integration',
    icon: '🔗',
    agents: ['stripe', 'hubspot'],
    complexity: 'Easy',
    estimatedTime: '5-8 min',
  },
  {
    id: 'hr-onboarding',
    name: 'Employee Onboarding',
    description: 'Automate HR workflows with Workday and Darwinbox integration',
    category: 'HR',
    icon: '👥',
    agents: ['workday', 'darwinbox_hr', 'email_outreach'],
    complexity: 'Medium',
    estimatedTime: '7-10 min',
  },
  {
    id: 'project-management',
    name: 'Project Management Flow',
    description: 'Coordinate projects with Jira, notify via Slack, and send updates via email',
    category: 'Data',
    icon: '📊',
    agents: ['jira', 'slack', 'email_outreach'],
    complexity: 'Medium',
    estimatedTime: '5-8 min',
  },
];

// Category color mapping
const CATEGORY_COLORS = {
  Sales: { main: '#667eea', light: '#f0f0ff', icon: '💼' },
  Communication: { main: '#10b981', light: '#e6fff6', icon: '💬' },
  Data: { main: '#8b5cf6', light: '#f5f0ff', icon: '📊' },
  Integration: { main: '#f59e0b', light: '#fff8e6', icon: '🔗' },
  HR: { main: '#06b6d4', light: '#e6f9ff', icon: '👥' },
  Finance: { main: '#ec4899', light: '#ffe6f5', icon: '💰' },
  Custom: { main: '#6b7280', light: '#f3f4f6', icon: '⚙️' },
  Default: { main: '#667eea', light: '#f0f0ff', icon: '🤖' },
};

// Custom Node Component for Agents with enhanced visuals
const AgentNode = ({ data, selected }) => {
  const category = data.category || 'Default';
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.Default;

  return (
    <Box
      sx={{
        padding: 2,
        borderRadius: 2.5,
        border: '2px solid',
        borderColor: selected ? colors.main : 'divider',
        backgroundColor: 'white',
        minWidth: 200,
        maxWidth: 250,
        boxShadow: selected ? '0 8px 24px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 14,
          height: 14,
          backgroundColor: colors.main,
          border: '3px solid white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
      />

      {/* Icon Badge */}
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2,
          backgroundColor: colors.light,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1.5,
          fontSize: '1.2rem',
        }}
      >
        {colors.icon}
      </Box>

      {/* Agent Type Badge */}
      <Chip
        label={data.agentType || 'Agent'}
        size="small"
        sx={{
          height: 20,
          fontSize: '0.7rem',
          fontWeight: 600,
          backgroundColor: colors.light,
          color: colors.main,
          border: `1px solid ${colors.main}`,
          mb: 1,
        }}
      />

      {/* Agent Name */}
      <Typography
        variant="body2"
        fontWeight={700}
        sx={{
          mb: 0.5,
          color: 'text.primary',
          lineHeight: 1.3,
        }}
      >
        {data.label}
      </Typography>

      {/* Description */}
      {data.description && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {data.description}
        </Typography>
      )}

      {/* Enabled indicator */}
      {data.enabled !== false && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)',
          }}
        />
      )}

      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 14,
          height: 14,
          backgroundColor: colors.main,
          border: '3px solid white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
      />
    </Box>
  );
};

// Custom Node for Start/End
const TerminalNode = ({ data, selected }) => {
  const isStart = data.type === 'start';
  return (
    <Box
      sx={{
        padding: 2,
        borderRadius: '50%',
        border: '3px solid',
        borderColor: selected ? 'primary.main' : isStart ? 'success.main' : 'error.main',
        backgroundColor: isStart ? 'success.50' : 'error.50',
        width: 100,
        height: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: selected ? 4 : 2,
        transition: 'all 0.2s',
        position: 'relative',
      }}
    >
      {!isStart && (
        <Handle
          type="target"
          position={Position.Left}
          style={{
            width: 12,
            height: 12,
            backgroundColor: '#EF4444',
            border: '2px solid white',
          }}
        />
      )}
      <Typography variant="body2" fontWeight={700} color={isStart ? 'success.dark' : 'error.dark'}>
        {data.label}
      </Typography>
      {isStart && (
        <Handle
          type="source"
          position={Position.Right}
          style={{
            width: 12,
            height: 12,
            backgroundColor: '#10B981',
            border: '2px solid white',
          }}
        />
      )}
    </Box>
  );
};

const nodeTypes = {
  agent: AgentNode,
  terminal: TerminalNode,
};

const WorkflowBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const [workflowName, setWorkflowName] = useState('New Workflow');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [paletteTab, setPaletteTab] = useState(0); // 0: Agents, 1: Templates

  // Load existing workflow if editing
  const { data: workflow, isLoading: workflowLoading } = useQuery({
    queryKey: ['workflow', id],
    queryFn: () => workflowsAPI.get(id),
    enabled: !!id,
  });

  // Load available agents for the palette
  const { data: agents, isLoading: agentsLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: agentsAPI.getAll,
  });

  // Filter agents based on search and category
  const filteredAgents = useMemo(() => {
    if (!agents) return [];

    let filtered = agents;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((agent) => agent.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (agent) =>
          agent.name?.toLowerCase().includes(term) ||
          agent.agent_type?.toLowerCase().includes(term) ||
          agent.description?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [agents, selectedCategory, searchTerm]);

  // Get categories from agents
  const categories = useMemo(() => {
    if (!agents) return ['All'];
    const cats = new Set(agents.map((a) => a.category || 'Default'));
    return ['All', ...Array.from(cats).sort()];
  }, [agents]);

  // Count agents per category
  const categoryCounts = useMemo(() => {
    if (!agents) return {};
    const counts = { All: agents.length };
    agents.forEach((agent) => {
      const cat = agent.category || 'Default';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [agents]);

  // Initialize workflow if editing
  useEffect(() => {
    if (workflow) {
      setWorkflowName(workflow.name);
      setWorkflowDescription(workflow.description || '');

      // Convert workflow data to React Flow format
      if (workflow.agents && workflow.agents.length > 0) {
        const flowNodes = workflow.agents.map((agent) => ({
          id: agent.id,
          type: 'agent',
          position: agent.position || { x: 250, y: 100 },
          data: {
            label: agent.name,
            agentType: agent.type,
            description: agent.description,
            config: agent.config || {},
          },
        }));

        const flowEdges = (workflow.edges || []).map((edge, index) => ({
          id: `e${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target,
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed },
        }));

        setNodes(flowNodes);
        setEdges(flowEdges);
      }
    }
  }, [workflow, setNodes, setEdges]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (id) {
        return workflowsAPI.update(id, data);
      }
      return workflowsAPI.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      setSaveDialogOpen(false);
      navigate('/workflows');
    },
  });

  // Execute mutation
  const executeMutation = useMutation({
    mutationFn: workflowsAPI.execute,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['executions'] });
      alert(`Workflow execution started! Execution ID: ${data.execution_id || data.id}`);
      navigate('/executions');
    },
  });

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed },
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
      const agentData = JSON.parse(event.dataTransfer.getData('application/reactflow'));

      if (!agentData) return;

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: `agent-${Date.now()}`,
        type: 'agent',
        position,
        data: {
          label: agentData.name,
          agentType: agentData.agent_type,
          description: agentData.description,
          category: agentData.category,
          enabled: agentData.enabled,
          config: {},
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setSettingsOpen(true);
  }, []);

  const handleDeleteNode = useCallback(() => {
    if (selectedNode && selectedNode.id !== 'start' && selectedNode.id !== 'end') {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
      );
      setSelectedNode(null);
      setSettingsOpen(false);
    }
  }, [selectedNode, setNodes, setEdges]);

  const handleSave = () => {
    // Convert React Flow nodes to workflow format
    const agentNodes = nodes.filter((n) => n.type === 'agent');

    const workflowData = {
      name: workflowName,
      description: workflowDescription || '',
      agents: agentNodes.map((node) => ({
        id: node.id,
        type: node.data.agentType,
        name: node.data.label,
        description: node.data.description || '',
        config: node.data.config || {},
        position: {
          x: Math.round(node.position.x),
          y: Math.round(node.position.y),
        },
      })),
      edges: edges.map((edge) => ({
        source: edge.source,
        target: edge.target,
        data_mapping: null,
      })),
    };

    saveMutation.mutate(workflowData);
  };

  const handleExecute = () => {
    if (!id) {
      alert('Please save the workflow before executing');
      return;
    }
    if (window.confirm('Execute this workflow?')) {
      executeMutation.mutate({ id, input: {} });
    }
  };

  const handleClear = () => {
    if (window.confirm('Clear all nodes? This cannot be undone.')) {
      setNodes([
        {
          id: 'start',
          type: 'terminal',
          position: { x: 100, y: 100 },
          data: { label: 'START', type: 'start' },
        },
        {
          id: 'end',
          type: 'terminal',
          position: { x: 600, y: 100 },
          data: { label: 'END', type: 'end' },
        },
      ]);
      setEdges([]);
    }
  };

  const onDragStart = (event, agent) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(agent));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleLoadTemplate = (template) => {
    if (!agents) {
      alert('Please wait for agents to load...');
      return;
    }

    // Create START node
    const startNode = {
      id: 'start',
      type: 'terminal',
      position: { x: 50, y: 150 },
      data: { label: 'START', type: 'start' },
    };

    // Create agent nodes from template
    const templateNodes = [startNode];
    const missingAgents = [];
    let xOffset = 250;
    const yOffset = 150;

    template.agents.forEach((agentType, index) => {
      const agent = agents.find((a) => a.agent_type === agentType);
      if (agent) {
        templateNodes.push({
          id: `agent-${Date.now()}-${index}`,
          type: 'agent',
          position: { x: xOffset, y: yOffset },
          data: {
            label: agent.name,
            agentType: agent.agent_type,
            description: agent.description,
            category: agent.category,
            enabled: agent.enabled,
            config: {},
          },
        });
        xOffset += 280;
      } else {
        missingAgents.push(agentType);
      }
    });

    if (templateNodes.length === 1) {
      // Only start node, no agents loaded
      alert(`Cannot load template: None of the required agents are available.\nMissing: ${missingAgents.join(', ')}`);
      return;
    }

    // Create END node
    const endNode = {
      id: 'end',
      type: 'terminal',
      position: { x: xOffset + 100, y: yOffset },
      data: { label: 'END', type: 'end' },
    };
    templateNodes.push(endNode);

    // Create edges to connect all nodes in sequence (START -> Agents -> END)
    const templateEdges = [];
    for (let i = 0; i < templateNodes.length - 1; i++) {
      templateEdges.push({
        id: `e${templateNodes[i].id}-${templateNodes[i + 1].id}`,
        source: templateNodes[i].id,
        target: templateNodes[i + 1].id,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
      });
    }

    setNodes(templateNodes);
    setEdges(templateEdges);
    setWorkflowName(template.name);
    setWorkflowDescription(template.description);

    // Switch to Agents tab to show the loaded workflow
    setPaletteTab(0);

    // Show success message with details
    const agentCount = templateNodes.length - 2; // Exclude START and END
    let message = `✅ Template "${template.name}" loaded successfully!\n\n`;
    message += `📊 Workflow: START → ${agentCount} Agent(s) → END`;

    if (missingAgents.length > 0) {
      message += `\n\n⚠️ Note: ${missingAgents.length} agent(s) were skipped (not available):\n${missingAgents.join(', ')}`;
    }
    message += '\n\n💡 You can now customize the workflow by:\n• Adding more agents between nodes\n• Adjusting connections\n• Configuring agent properties';
    alert(message);
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 100px)', position: 'relative' }}>
      {/* Left Drawer - Agent Palette */}
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              Workflow Builder
            </Typography>
            <Tooltip title="Refresh agents">
              <IconButton
                size="small"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['agents'] })}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Drag agents to canvas to build workflows
          </Typography>
        </Box>

        {/* Tabs */}
        <Tabs
          value={paletteTab}
          onChange={(e, val) => setPaletteTab(val)}
          sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 1 }}
          variant="fullWidth"
        >
          <Tab
            icon={<CategoryIcon fontSize="small" />}
            iconPosition="start"
            label={
              <Badge badgeContent={agents?.length || 0} color="primary" max={99}>
                <Typography variant="caption" fontWeight={600} sx={{ pr: 1 }}>
                  Agents
                </Typography>
              </Badge>
            }
            sx={{ minHeight: 48 }}
          />
          <Tab
            icon={<TemplateIcon fontSize="small" />}
            iconPosition="start"
            label="Templates"
            sx={{ minHeight: 48 }}
          />
        </Tabs>

        {/* Agents Tab */}
        {paletteTab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* Search */}
            <Box sx={{ p: 2, pb: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Category Filter */}
            <Box sx={{ px: 2, pb: 1 }}>
              <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" gutterBottom>
                Category
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {categories.map((cat) => (
                  <Chip
                    key={cat}
                    label={`${cat} (${categoryCounts[cat] || 0})`}
                    size="small"
                    onClick={() => setSelectedCategory(cat)}
                    color={selectedCategory === cat ? 'primary' : 'default'}
                    variant={selectedCategory === cat ? 'filled' : 'outlined'}
                    sx={{ fontSize: '0.7rem' }}
                  />
                ))}
              </Box>
            </Box>

            <Divider />

            {/* Agent List */}
            <List sx={{ p: 2, overflow: 'auto', flexGrow: 1 }}>
              {agentsLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={32} />
                </Box>
              )}

              {!agentsLoading && filteredAgents.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No agents found
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {searchTerm ? 'Try different search' : 'Create agents first'}
                  </Typography>
                </Box>
              )}

              {filteredAgents?.map((agent) => {
                const category = agent.category || 'Default';
                const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.Default;

                return (
                  <Card
                    key={agent.agent_type}
                    draggable
                    onDragStart={(e) => onDragStart(e, agent)}
                    sx={{
                      mb: 1.5,
                      cursor: 'grab',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:active': {
                        cursor: 'grabbing',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      },
                      '&:hover': {
                        boxShadow: 3,
                        borderColor: colors.main,
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    <ListItem sx={{ py: 1.5 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1.5,
                          backgroundColor: colors.light,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 1.5,
                          fontSize: '1rem',
                        }}
                      >
                        {colors.icon}
                      </Box>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.25 }}>
                            {agent.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {agent.agent_type}
                          </Typography>
                        }
                      />
                      {agent.enabled !== false && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: '#10b981',
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </ListItem>
                  </Card>
                );
              })}
            </List>
          </Box>
        )}

        {/* Templates Tab */}
        {paletteTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Pre-built Workflow Templates
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Click a template to load it onto the canvas
              </Typography>
            </Box>

            <List sx={{ p: 2, overflow: 'auto', flexGrow: 1 }}>
              {WORKFLOW_TEMPLATES.map((template) => {
                const colors = CATEGORY_COLORS[template.category] || CATEGORY_COLORS.Default;
                const complexityColors = {
                  Easy: 'success',
                  Medium: 'warning',
                  Hard: 'error',
                };

                return (
                  <Card
                    key={template.id}
                    sx={{
                      mb: 2,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: 3,
                        borderColor: colors.main,
                        transform: 'translateY(-2px)',
                      },
                    }}
                    onClick={() => handleLoadTemplate(template)}
                  >
                    <CardContent sx={{ p: 2 }}>
                      {/* Template Header */}
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            backgroundColor: colors.light,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 1.5,
                            fontSize: '1.5rem',
                            flexShrink: 0,
                          }}
                        >
                          {template.icon}
                        </Box>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={700} gutterBottom>
                            {template.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {template.description}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Template Metadata */}
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                        <Chip
                          label={template.category}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            backgroundColor: colors.light,
                            color: colors.main,
                            fontWeight: 600,
                          }}
                        />
                        <Chip
                          label={template.complexity}
                          size="small"
                          color={complexityColors[template.complexity]}
                          sx={{ height: 20, fontSize: '0.65rem' }}
                        />
                        <Chip
                          label={`${template.agents.length} agents`}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.65rem' }}
                        />
                      </Box>

                      {/* Estimated Time */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                          ⏱️ Setup time: {template.estimatedTime}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </List>

            {/* Info Footer */}
            <Box sx={{ p: 2, pt: 1, borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'background.default' }}>
              <Alert severity="info" sx={{ fontSize: '0.75rem', py: 0.5 }}>
                Templates create a starting point. You can customize by adding/removing agents or changing connections.
              </Alert>
            </Box>
          </Box>
        )}
      </Drawer>

      {/* Main Canvas */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Toolbar */}
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'white',
            display: 'flex',
            gap: 2,
            alignItems: 'center',
          }}
        >
          <TextField
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            placeholder="Workflow Name"
            variant="outlined"
            size="small"
            sx={{ flexGrow: 1, maxWidth: 300 }}
          />
          <TextField
            value={workflowDescription}
            onChange={(e) => setWorkflowDescription(e.target.value)}
            placeholder="Description (optional)"
            variant="outlined"
            size="small"
            sx={{ flexGrow: 1, maxWidth: 400 }}
          />
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="outlined"
            size="small"
            onClick={handleClear}
            startIcon={<DeleteIcon />}
          >
            Clear
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setSaveDialogOpen(true)}
            startIcon={<SaveIcon />}
          >
            Save
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleExecute}
            startIcon={<PlayIcon />}
            disabled={!id}
          >
            Execute
          </Button>
        </Box>

        {/* React Flow Canvas */}
        <Box ref={reactFlowWrapper} sx={{ flexGrow: 1, backgroundColor: '#f5f5f5' }}>
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
            attributionPosition="bottom-left"
          >
            <Background />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                if (node.type === 'terminal') {
                  return node.data.type === 'start' ? '#10B981' : '#EF4444';
                }
                return '#4F46E5';
              }}
              maskColor="rgba(0, 0, 0, 0.1)"
            />
          </ReactFlow>
        </Box>

        {/* Error Messages */}
        {saveMutation.isError && (
          <Alert severity="error" sx={{ m: 2 }}>
            Failed to save workflow: {saveMutation.error?.message}
          </Alert>
        )}
        {executeMutation.isError && (
          <Alert severity="error" sx={{ m: 2 }}>
            Failed to execute workflow: {executeMutation.error?.message}
          </Alert>
        )}
      </Box>

      {/* Node Settings Drawer - Enhanced */}
      <Drawer
        anchor="right"
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 380,
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
                <IconButton size="small" onClick={() => setSettingsOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Configure node properties and behavior
              </Typography>
            </Box>

            {/* Node Preview Card */}
            <Box sx={{ p: 2 }}>
              <Card
                variant="outlined"
                sx={{
                  p: 2,
                  backgroundColor: selectedNode.data.category
                    ? CATEGORY_COLORS[selectedNode.data.category]?.light
                    : 'background.paper',
                  border: '2px solid',
                  borderColor: selectedNode.data.category
                    ? CATEGORY_COLORS[selectedNode.data.category]?.main
                    : 'primary.main',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      backgroundColor: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 1.5,
                      fontSize: '1.3rem',
                    }}
                  >
                    {selectedNode.data.category
                      ? CATEGORY_COLORS[selectedNode.data.category]?.icon
                      : '🤖'}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" fontWeight={700}>
                      {selectedNode.data.label}
                    </Typography>
                    <Chip
                      label={selectedNode.data.agentType || 'Node'}
                      size="small"
                      sx={{ height: 18, fontSize: '0.65rem', mt: 0.5 }}
                    />
                  </Box>
                </Box>
              </Card>
            </Box>

            {/* Properties */}
            <Box sx={{ p: 2, pt: 0 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Properties
              </Typography>

              <Card variant="outlined" sx={{ p: 1.5, mb: 2 }}>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Node ID
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
                    {selectedNode.id}
                  </Typography>
                </Box>

                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Type
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {selectedNode.data.agentType || 'Terminal'}
                  </Typography>
                </Box>

                {selectedNode.data.category && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Category
                    </Typography>
                    <Chip
                      label={selectedNode.data.category}
                      size="small"
                      sx={{
                        backgroundColor: CATEGORY_COLORS[selectedNode.data.category]?.light,
                        color: CATEGORY_COLORS[selectedNode.data.category]?.main,
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                )}

                {selectedNode.data.description && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                      {selectedNode.data.description}
                    </Typography>
                  </Box>
                )}
              </Card>

              {/* Connection Info */}
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Connections
              </Typography>
              <Card variant="outlined" sx={{ p: 1.5, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Incoming
                  </Typography>
                  <Chip
                    label={edges.filter((e) => e.target === selectedNode.id).length}
                    size="small"
                    color="success"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    Outgoing
                  </Typography>
                  <Chip
                    label={edges.filter((e) => e.source === selectedNode.id).length}
                    size="small"
                    color="primary"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                </Box>
              </Card>

              {/* Status */}
              {selectedNode.data.enabled !== undefined && (
                <>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    Status
                  </Typography>
                  <Card variant="outlined" sx={{ p: 1.5, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor:
                            selectedNode.data.enabled !== false ? '#10b981' : '#ef4444',
                          mr: 1,
                        }}
                      />
                      <Typography variant="body2" fontWeight={600}>
                        {selectedNode.data.enabled !== false ? 'Enabled' : 'Disabled'}
                      </Typography>
                    </Box>
                  </Card>
                </>
              )}
            </Box>

            {/* Actions */}
            {selectedNode.id !== 'start' && selectedNode.id !== 'end' && (
              <Box sx={{ p: 2, pt: 0, mt: 'auto' }}>
                <Divider sx={{ mb: 2 }} />
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteNode}
                  sx={{ mb: 1 }}
                >
                  Delete Node
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
                  This will remove the node and its connections
                </Typography>
              </Box>
            )}
          </>
        )}
      </Drawer>

      {/* Save Confirmation Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Workflow</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Are you sure you want to save this workflow?
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Name:
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {workflowName}
            </Typography>
          </Box>
          {workflowDescription && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Description:
              </Typography>
              <Typography variant="body2">{workflowDescription}</Typography>
            </Box>
          )}
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Agents:
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {nodes.filter((n) => n.type === 'agent').length} agents
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkflowBuilder;
