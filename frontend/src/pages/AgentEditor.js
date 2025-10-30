import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Divider,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  AutoFixHigh as GenerateIcon,
  ExpandMore as ExpandIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const AgentEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEditMode = !!id;
  const agentFromState = location.state?.agent;

  const [agentData, setAgentData] = useState({
    name: '',
    description: '',
    llmProvider: 'OpenAI',
    llmModel: 'gpt-4o-mini',
    temperature: 0.7,
    agentRole: 'You are an expert customer support agent.',
    agentGoal: 'Your goal is to address and resolve customer inquiries.',
    agentInstructions: 'LISTEN to the customer\'s concern & GATHER all relevant information needed for resolution. PROVIDE clear and concise answers to the customer. Type @ to mention other agents.',
    managerAgent: false,
  });

  // Load agent data if in edit mode
  useEffect(() => {
    if (isEditMode && agentFromState) {
      setAgentData({
        name: agentFromState.name || '',
        description: agentFromState.description || '',
        llmProvider: agentFromState.llmProvider || 'OpenAI',
        llmModel: agentFromState.llmModel || 'gpt-4o-mini',
        temperature: agentFromState.temperature || 0.7,
        agentRole: agentFromState.agentRole || agentFromState.role || 'You are an expert customer support agent.',
        agentGoal: agentFromState.agentGoal || agentFromState.goal || 'Your goal is to address and resolve customer inquiries.',
        agentInstructions: agentFromState.agentInstructions || agentFromState.instructions || 'LISTEN to the customer\'s concern & GATHER all relevant information needed for resolution. PROVIDE clear and concise answers to the customer.',
        managerAgent: agentFromState.managerAgent || false,
      });
    }
  }, [isEditMode, agentFromState]);

  const [features, setFeatures] = useState({
    knowledgeBase: false,
    dataQuery: false,
    memory: false,
    voiceAgent: false,
    context: false,
    fileAsOutput: false,
    safeResponsibleAI: false,
    hallucinationManager: false,
  });

  const handleInputChange = (field, value) => {
    setAgentData({ ...agentData, [field]: value });
  };

  const handleFeatureToggle = (feature) => {
    setFeatures({ ...features, [feature]: !features[feature] });
  };

  const handleGenerateWithAI = (field) => {
    // Simulate AI generation
    const suggestions = {
      agentRole: 'You are a highly skilled customer support specialist with expertise in resolving technical issues and providing exceptional customer service.',
      agentGoal: 'Your primary goal is to efficiently address customer inquiries, resolve issues on first contact, and ensure customer satisfaction through clear communication and problem-solving.',
      agentInstructions: 'LISTEN actively to the customer\'s concerns and GATHER all relevant details needed for resolution.\n\nPROVIDE clear, concise, and accurate answers tailored to the customer\'s needs.\n\nESCALATE complex issues to specialized agents when necessary using @ mentions.\n\nFOLLOW UP to ensure the customer\'s issue is fully resolved.\n\nMAINTAIN a professional, empathetic, and patient tone throughout all interactions.',
    };

    if (suggestions[field]) {
      handleInputChange(field, suggestions[field]);
    }
  };

  const handleImprovePrompt = () => {
    handleGenerateWithAI('agentInstructions');
  };

  const handleCreate = () => {
    console.log(isEditMode ? 'Updating agent:' : 'Creating agent:', { ...agentData, features });
    alert(isEditMode ? 'Agent updated successfully!' : 'Agent created successfully!');
    navigate('/agents/library');
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', backgroundColor: '#f9fafb' }}>
      {/* Left Panel - Configuration Form */}
      <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            {isEditMode ? 'Edit Agent' : 'Create Agent'}
          </Typography>
          {isEditMode && agentFromState && (
            <Typography variant="body2" color="text.secondary">
              Editing: {agentFromState.name}
            </Typography>
          )}
        </Box>

        {/* Name */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Name
          </Typography>
          <TextField
            fullWidth
            placeholder="Agent name"
            value={agentData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            size="small"
          />
        </Box>

        {/* Description */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Description
          </Typography>
          <TextField
            fullWidth
            placeholder="Agent description"
            value={agentData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            size="small"
          />
        </Box>

        {/* LLM Provider & Model */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              LLM Provider
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={agentData.llmProvider}
                onChange={(e) => handleInputChange('llmProvider', e.target.value)}
              >
                <MenuItem value="OpenAI">OpenAI</MenuItem>
                <MenuItem value="Anthropic">Anthropic</MenuItem>
                <MenuItem value="Google">Google</MenuItem>
                <MenuItem value="Amazon Bedrock">Amazon Bedrock</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                LLM Model
              </Typography>
              <Typography variant="caption" color="primary" sx={{ cursor: 'pointer' }}>
                Need help choosing?
              </Typography>
            </Box>
            <FormControl fullWidth size="small">
              <Select
                value={agentData.llmModel}
                onChange={(e) => handleInputChange('llmModel', e.target.value)}
              >
                <MenuItem value="gpt-4o-mini">gpt-4o-mini</MenuItem>
                <MenuItem value="gpt-4o">gpt-4o</MenuItem>
                <MenuItem value="gpt-4-turbo">gpt-4-turbo</MenuItem>
                <MenuItem value="gpt-3.5-turbo">gpt-3.5-turbo</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Agent Role */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Agent Role
            </Typography>
            <Button
              size="small"
              startIcon={<GenerateIcon />}
              onClick={() => handleGenerateWithAI('agentRole')}
              sx={{ textTransform: 'none' }}
            >
              Generate with AI
            </Button>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={2}
            value={agentData.agentRole}
            onChange={(e) => handleInputChange('agentRole', e.target.value)}
            size="small"
            InputProps={{
              endAdornment: (
                <IconButton size="small" sx={{ alignSelf: 'flex-start' }}>
                  <ExpandIcon />
                </IconButton>
              ),
            }}
          />
        </Box>

        {/* Agent Goal */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Agent Goal
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            value={agentData.agentGoal}
            onChange={(e) => handleInputChange('agentGoal', e.target.value)}
            size="small"
            InputProps={{
              endAdornment: (
                <IconButton size="small" sx={{ alignSelf: 'flex-start' }}>
                  <ExpandIcon />
                </IconButton>
              ),
            }}
          />
        </Box>

        {/* Agent Instructions */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Agent Instructions
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={5}
            value={agentData.agentInstructions}
            onChange={(e) => handleInputChange('agentInstructions', e.target.value)}
            size="small"
            InputProps={{
              endAdornment: (
                <IconButton size="small" sx={{ alignSelf: 'flex-start' }}>
                  <ExpandIcon />
                </IconButton>
              ),
            }}
          />
        </Box>

        {/* Manager Agent Checkbox */}
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={agentData.managerAgent}
                onChange={(e) => handleInputChange('managerAgent', e.target.checked)}
              />
            }
            label="Manager Agent"
          />
          <Button
            size="small"
            variant="text"
            onClick={handleImprovePrompt}
            sx={{ textTransform: 'none', textDecoration: 'underline', ml: 2 }}
          >
            Improve prompt
          </Button>
        </Box>

        {/* Tool Configuration */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Tool Configuration
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            sx={{ textTransform: 'none' }}
          >
            Add
          </Button>
        </Box>

        {/* Examples (Text) */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Examples (Text)
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            sx={{ textTransform: 'none' }}
          >
            Add
          </Button>
        </Box>

        {/* Structured Output (JSON) */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Structured Output (JSON)
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            sx={{ textTransform: 'none' }}
          >
            Add
          </Button>
        </Box>
      </Box>

      {/* Right Panel - Features & Steps */}
      <Box
        sx={{
          width: 360,
          borderLeft: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'white',
          overflow: 'auto',
        }}
      >
        {/* Search & Agent API */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            fullWidth
            placeholder="Search features..."
            size="small"
            sx={{ mb: 1 }}
          />
          <Button variant="outlined" size="small" fullWidth sx={{ textTransform: 'none' }}>
            Agent API
          </Button>
        </Box>

        {/* Core Features */}
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Core Features
          </Typography>

          <List disablePadding>
            {/* Knowledge Base */}
            <ListItem sx={{ px: 0, py: 1 }}>
              <ListItemText
                primary="Knowledge Base"
                primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
              />
              <Switch
                size="small"
                checked={features.knowledgeBase}
                onChange={() => handleFeatureToggle('knowledgeBase')}
              />
            </ListItem>

            {/* Data Query */}
            <ListItem sx={{ px: 0, py: 1 }}>
              <ListItemText
                primary="Data Query"
                primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: '#667eea',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                  }}
                >
                  🚀
                </Box>
                <Switch
                  size="small"
                  checked={features.dataQuery}
                  onChange={() => handleFeatureToggle('dataQuery')}
                />
              </Box>
            </ListItem>

            {/* Memory */}
            <ListItem sx={{ px: 0, py: 1 }}>
              <ListItemText
                primary="Memory"
                primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
              />
              <Switch
                size="small"
                checked={features.memory}
                onChange={() => handleFeatureToggle('memory')}
              />
            </ListItem>

            {/* Voice Agent */}
            <ListItem sx={{ px: 0, py: 1 }}>
              <ListItemText
                primary="Voice Agent"
                primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
              />
              <Chip label="Upgrade" size="small" color="primary" sx={{ height: 20 }} />
            </ListItem>

            {/* Context */}
            <ListItem sx={{ px: 0, py: 1 }}>
              <ListItemText
                primary="Context"
                primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
              />
              <Switch
                size="small"
                checked={features.context}
                onChange={() => handleFeatureToggle('context')}
              />
            </ListItem>

            {/* File as Output */}
            <ListItem sx={{ px: 0, py: 1 }}>
              <ListItemText
                primary="File as Output"
                primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
              />
              <Switch
                size="small"
                checked={features.fileAsOutput}
                onChange={() => handleFeatureToggle('fileAsOutput')}
              />
            </ListItem>

            {/* Safe & Responsible AI */}
            <ListItem sx={{ px: 0, py: 1 }}>
              <ListItemText
                primary="Safe & Responsible AI"
                primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
              />
              <Chip label="Upgrade" size="small" color="primary" sx={{ height: 20 }} />
            </ListItem>

            {/* Hallucination Manager */}
            <ListItem sx={{ px: 0, py: 1 }}>
              <ListItemText
                primary="Hallucination Manager"
                primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
              />
              <Chip label="Upgrade" size="small" color="primary" sx={{ height: 20 }} />
            </ListItem>
          </List>
        </Box>

        <Divider />

        {/* Start Building Steps */}
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Start Building
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {/* Step 1 */}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: '#667eea',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                1
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Choose LLM & Define Role
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Select your preferred large language model and define your agent's purpose
                </Typography>
              </Box>
            </Box>

            {/* Step 2 */}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: '#e0e7ff',
                  color: '#667eea',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                2
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Add Tools (Optional)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Enhance your agent with external tools and capabilities
                </Typography>
              </Box>
            </Box>

            {/* Step 3 */}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: '#e0e7ff',
                  color: '#667eea',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                3
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Enable Features (Optional)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Add advanced features to boost your agent's internal powers
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Create/Update Button */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleCreate}
            sx={{ mt: 3, textTransform: 'none', fontWeight: 600 }}
          >
            {isEditMode ? 'Update Agent' : 'Create'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AgentEditor;
