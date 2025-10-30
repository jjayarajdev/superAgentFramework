import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Step,
  Stepper,
  StepLabel,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Divider,
  Switch,
  FormControlLabel,
  Slider,
  Checkbox,
  FormGroup,
  Autocomplete,
} from '@mui/material';
import {
  Info as InfoIcon,
  AutoAwesome as AIIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Save as SaveIcon,
  PlayArrow as PlayArrowIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const AVAILABLE_MODELS = [
  { provider: 'OpenAI', models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
  { provider: 'Anthropic', models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'] },
  { provider: 'Google', models: ['gemini-pro', 'gemini-pro-vision'] },
  { provider: 'Azure', models: ['gpt-4', 'gpt-35-turbo'] },
];

const AVAILABLE_TOOLS = [
  { id: 'sales_intelligence', name: 'Sales Intelligence', category: 'Sales', description: 'Salesforce integration for deals and opportunities' },
  { id: 'stripe', name: 'Stripe Payments', category: 'Finance', description: 'Payment processing and revenue analytics' },
  { id: 'hubspot', name: 'HubSpot CRM', category: 'Sales', description: 'CRM and marketing automation' },
  { id: 'jira', name: 'Jira', category: 'Project', description: 'Project management and issue tracking' },
  { id: 'slack', name: 'Slack', category: 'Communication', description: 'Team messaging and notifications' },
  { id: 'zendesk', name: 'Zendesk', category: 'Support', description: 'Customer support tickets' },
  { id: 'workday', name: 'Workday HR', category: 'HR', description: 'Human resources management' },
  { id: 'servicenow', name: 'ServiceNow', category: 'IT', description: 'IT service management' },
  { id: 'email_outreach', name: 'Email Outreach', category: 'Communication', description: 'Send personalized emails' },
  { id: 'sap', name: 'SAP', category: 'ERP', description: 'Enterprise resource planning' },
  { id: 'darwinbox', name: 'Darwinbox', category: 'HR', description: 'HR management system' },
];

const AGENT_FEATURES = [
  { id: 'short_term_memory', name: 'Short-Term Memory', description: 'Recall recent user interactions', impact: 'Low latency' },
  { id: 'long_term_memory', name: 'Long-Term Memory', description: 'Contextualize extended conversations', impact: 'Medium latency' },
  { id: 'structured_output', name: 'Structured Outputs', description: 'Enforce response schemas', impact: 'Low latency' },
  { id: 'humanizer', name: 'Humanizer', description: 'Natural conversational tone', impact: 'Low cost' },
  { id: 'reflection', name: 'Reflection', description: 'Agent reviews its own responses', impact: 'High latency' },
  { id: 'toxicity_check', name: 'Toxicity Check', description: 'Filter harmful content', impact: 'Medium latency' },
  { id: 'bias_detection', name: 'Fairness & Bias', description: 'Minimize biased outputs', impact: 'Medium latency' },
  { id: 'pii_masking', name: 'PII Masking', description: 'Detect and redact sensitive data', impact: 'Low latency' },
];

// Step 1: Basic Info
const BasicInfoStep = ({ formData, setFormData }) => {
  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Let's start with the basics
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Give your agent a name and describe its purpose
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField
          label="Agent Name"
          fullWidth
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Sales Intelligence Assistant"
          helperText="Choose a descriptive name that reflects the agent's role"
        />

        <TextField
          label="Description"
          fullWidth
          required
          multiline
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe what this agent does and when to use it..."
          helperText="Provide a clear description to help users understand the agent's capabilities"
        />
      </Box>
    </Box>
  );
};

// Step 2: Model Selection
const ModelSelectionStep = ({ formData, setFormData }) => {
  const [provider, setProvider] = useState(formData.llm_provider || 'OpenAI');

  const availableModels = AVAILABLE_MODELS.find((p) => p.provider === provider)?.models || [];

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Choose your AI model
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Select the LLM provider and model that best fits your use case
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <FormControl fullWidth>
          <InputLabel>LLM Provider</InputLabel>
          <Select
            value={provider}
            label="LLM Provider"
            onChange={(e) => {
              setProvider(e.target.value);
              setFormData({ ...formData, llm_provider: e.target.value, llm_model: '' });
            }}
          >
            {AVAILABLE_MODELS.map((p) => (
              <MenuItem key={p.provider} value={p.provider}>
                {p.provider}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Model</InputLabel>
          <Select
            value={formData.llm_model || ''}
            label="Model"
            onChange={(e) => setFormData({ ...formData, llm_model: e.target.value })}
          >
            {availableModels.map((model) => (
              <MenuItem key={model} value={model}>
                {model}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" fontWeight={600}>
              Temperature: {formData.temperature || 0.7}
            </Typography>
            <Tooltip title="Controls randomness: lower = more focused, higher = more creative">
              <InfoIcon fontSize="small" color="action" />
            </Tooltip>
          </Box>
          <Slider
            value={formData.temperature || 0.7}
            onChange={(e, value) => setFormData({ ...formData, temperature: value })}
            min={0}
            max={1}
            step={0.1}
            marks={[
              { value: 0, label: '0' },
              { value: 0.5, label: '0.5' },
              { value: 1, label: '1' },
            ]}
            valueLabelDisplay="auto"
          />
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" fontWeight={600}>
              Top P: {formData.top_p || 0.9}
            </Typography>
            <Tooltip title="Controls diversity: lower = more deterministic, higher = more diverse">
              <InfoIcon fontSize="small" color="action" />
            </Tooltip>
          </Box>
          <Slider
            value={formData.top_p || 0.9}
            onChange={(e, value) => setFormData({ ...formData, top_p: value })}
            min={0}
            max={1}
            step={0.05}
            marks={[
              { value: 0, label: '0' },
              { value: 0.5, label: '0.5' },
              { value: 1, label: '1' },
            ]}
            valueLabelDisplay="auto"
          />
        </Box>
      </Box>
    </Box>
  );
};

// Step 3: Role & Instructions
const RoleInstructionsStep = ({ formData, setFormData, onImprove, improving }) => {
  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Define the agent's role and instructions
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Specify how the agent should behave and respond
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField
          label="Agent Role"
          fullWidth
          required
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          placeholder="e.g., Customer Support Agent, Data Analyst, Sales Representative"
          helperText="Define the primary role or persona for this agent"
        />

        <Box>
          <TextField
            label="Instructions"
            fullWidth
            required
            multiline
            rows={8}
            value={formData.instructions}
            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
            placeholder="Provide detailed instructions for how the agent should behave, respond, and interact with users..."
            helperText="Be specific about expected behaviors, tone, and constraints"
          />

          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={improving ? <CircularProgress size={16} /> : <AIIcon />}
              onClick={onImprove}
              disabled={improving || !formData.name || !formData.description}
              fullWidth
            >
              {improving ? 'Improving with AI...' : 'Improve with AI'}
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              AI will enhance your role and instructions based on the agent's name and description
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// Step 4: Tool Selection
const ToolSelectionStep = ({ formData, setFormData }) => {
  const selectedTools = formData.tools || [];

  const toggleTool = (toolId) => {
    const isSelected = selectedTools.includes(toolId);
    if (isSelected) {
      setFormData({ ...formData, tools: selectedTools.filter((t) => t !== toolId) });
    } else {
      setFormData({ ...formData, tools: [...selectedTools, toolId] });
    }
  };

  const categories = [...new Set(AVAILABLE_TOOLS.map((t) => t.category))];

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Select tools and integrations
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose which external systems this agent can interact with
      </Typography>

      {categories.map((category) => (
        <Box key={category} sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} color="primary" gutterBottom>
            {category}
          </Typography>
          <Grid container spacing={2}>
            {AVAILABLE_TOOLS.filter((tool) => tool.category === category).map((tool) => (
              <Grid item xs={12} sm={6} md={4} key={tool.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: selectedTools.includes(tool.id) ? 'primary.main' : 'divider',
                    backgroundColor: selectedTools.includes(tool.id) ? 'primary.50' : 'background.paper',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: 2,
                    },
                    transition: 'all 0.2s',
                  }}
                  onClick={() => toggleTool(tool.id)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {tool.name}
                      </Typography>
                      <Checkbox checked={selectedTools.includes(tool.id)} size="small" />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {tool.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}

      {selectedTools.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No tools selected. Your agent will only have conversational capabilities.
        </Alert>
      )}

      {selectedTools.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, mt: 3 }}>
          <Typography variant="caption" fontWeight={600} gutterBottom display="block">
            Selected Tools ({selectedTools.length}):
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedTools.map((toolId) => {
              const tool = AVAILABLE_TOOLS.find((t) => t.id === toolId);
              return (
                <Chip
                  key={toolId}
                  label={tool?.name}
                  color="primary"
                  onDelete={() => toggleTool(toolId)}
                  size="small"
                />
              );
            })}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

// Step 5: Knowledge Base
const KnowledgeBaseStep = ({ formData, setFormData }) => {
  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Attach knowledge base (Optional)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Connect document collections to provide context and improve response accuracy
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={formData.use_rag || false}
              onChange={(e) => setFormData({ ...formData, use_rag: e.target.checked })}
            />
          }
          label="Enable Knowledge Base (RAG)"
        />

        {formData.use_rag && (
          <>
            <Alert severity="info">
              RAG (Retrieval-Augmented Generation) allows your agent to retrieve relevant information from your document collection before generating responses.
            </Alert>

            <TextField
              label="Knowledge Base Collection"
              fullWidth
              select
              value={formData.knowledge_base_id || ''}
              onChange={(e) => setFormData({ ...formData, knowledge_base_id: e.target.value })}
              helperText="Select an existing knowledge base or create a new one in the Knowledge Base page"
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="kb_default">Default Company KB</MenuItem>
              <MenuItem value="kb_sales">Sales Documentation</MenuItem>
              <MenuItem value="kb_support">Support KB</MenuItem>
            </TextField>

            <Box>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Top K Results: {formData.rag_top_k || 3}
              </Typography>
              <Slider
                value={formData.rag_top_k || 3}
                onChange={(e, value) => setFormData({ ...formData, rag_top_k: value })}
                min={1}
                max={10}
                step={1}
                marks
                valueLabelDisplay="auto"
              />
              <Typography variant="caption" color="text.secondary">
                Number of relevant documents to retrieve for each query
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

// Step 6: Features
const FeaturesStep = ({ formData, setFormData }) => {
  const selectedFeatures = formData.features || [];

  const toggleFeature = (featureId) => {
    const isSelected = selectedFeatures.includes(featureId);
    if (isSelected) {
      setFormData({ ...formData, features: selectedFeatures.filter((f) => f !== featureId) });
    } else {
      setFormData({ ...formData, features: [...selectedFeatures, featureId] });
    }
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Select agent features
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Enable advanced capabilities and safety features
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        Note: Enabling features may increase latency and cost. Choose wisely based on your requirements.
      </Alert>

      <Grid container spacing={2}>
        {AGENT_FEATURES.map((feature) => (
          <Grid item xs={12} md={6} key={feature.id}>
            <Card
              sx={{
                cursor: 'pointer',
                border: '2px solid',
                borderColor: selectedFeatures.includes(feature.id) ? 'secondary.main' : 'divider',
                backgroundColor: selectedFeatures.includes(feature.id) ? 'secondary.50' : 'background.paper',
                '&:hover': {
                  borderColor: 'secondary.main',
                  boxShadow: 2,
                },
                transition: 'all 0.2s',
              }}
              onClick={() => toggleFeature(feature.id)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {feature.name}
                  </Typography>
                  <Checkbox checked={selectedFeatures.includes(feature.id)} size="small" />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {feature.description}
                </Typography>
                <Chip label={feature.impact} size="small" variant="outlined" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Step 7: Testing
const TestingStep = ({ formData }) => {
  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    // Simulate API call
    setTimeout(() => {
      setTestResponse('This is a simulated response from your agent. In production, this would call the actual LLM with your configuration.');
      setTesting(false);
    }, 2000);
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Test your agent
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Try out your agent before deploying it
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Agent Configuration Summary
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Name:</Typography>
            <Typography variant="body2">{formData.name || 'Not set'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Model:</Typography>
            <Typography variant="body2">{formData.llm_model || 'Not set'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Role:</Typography>
            <Typography variant="body2">{formData.role || 'Not set'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Tools:</Typography>
            <Typography variant="body2">{formData.tools?.length || 0} selected</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Test Message"
          fullWidth
          multiline
          rows={3}
          value={testMessage}
          onChange={(e) => setTestMessage(e.target.value)}
          placeholder="Enter a test query for your agent..."
        />

        <Button
          variant="contained"
          color="secondary"
          startIcon={testing ? <CircularProgress size={16} /> : <PlayArrowIcon />}
          onClick={handleTest}
          disabled={testing || !testMessage}
        >
          {testing ? 'Testing...' : 'Test Agent'}
        </Button>

        {testResponse && (
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'success.50' }}>
            <Typography variant="caption" fontWeight={600} gutterBottom display="block">
              Agent Response:
            </Typography>
            <Typography variant="body2">{testResponse}</Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

// Step 8: Deploy
const DeployStep = ({ formData }) => {
  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Review and deploy
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review your agent configuration and save it
      </Typography>

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={600} color="primary">
                Basic Information
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Name:</Typography>
                  <Typography variant="body2">{formData.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Description:</Typography>
                  <Typography variant="body2">{formData.description}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={600} color="primary">
                Model Configuration
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Provider:</Typography>
                  <Typography variant="body2">{formData.llm_provider || 'OpenAI'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Model:</Typography>
                  <Typography variant="body2">{formData.llm_model}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Temperature:</Typography>
                  <Typography variant="body2">{formData.temperature}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={600} color="primary">
                Role & Instructions
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Role:</Typography>
                  <Typography variant="body2">{formData.role}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Instructions:</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {formData.instructions}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" fontWeight={600} color="primary">
                Tools ({formData.tools?.length || 0})
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {formData.tools?.map((toolId) => {
                  const tool = AVAILABLE_TOOLS.find((t) => t.id === toolId);
                  return <Chip key={toolId} label={tool?.name} size="small" />;
                })}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" fontWeight={600} color="primary">
                Features ({formData.features?.length || 0})
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {formData.features?.map((featureId) => {
                  const feature = AGENT_FEATURES.find((f) => f.id === featureId);
                  return <Chip key={featureId} label={feature?.name} size="small" color="secondary" />;
                })}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Alert severity="success" sx={{ mt: 3 }}>
        Your agent is ready to be saved! Click "Save Agent" to deploy it.
      </Alert>
    </Box>
  );
};

// Main Wizard Component
const AgentBuilderWizard = ({ open, onClose, onSubmit, initialData = null }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState(
    initialData || {
      name: '',
      description: '',
      llm_provider: 'OpenAI',
      llm_model: 'gpt-4',
      temperature: 0.7,
      top_p: 0.9,
      role: '',
      instructions: '',
      tools: [],
      use_rag: false,
      knowledge_base_id: '',
      rag_top_k: 3,
      features: [],
    }
  );
  const [improving, setImproving] = useState(false);

  const steps = [
    'Basic Info',
    'Model Selection',
    'Role & Instructions',
    'Tools',
    'Knowledge Base',
    'Features',
    'Testing',
    'Deploy',
  ];

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleImprove = async () => {
    setImproving(true);
    // Simulate AI improvement
    setTimeout(() => {
      setFormData({
        ...formData,
        role: formData.role || `${formData.name} - AI Assistant`,
        instructions: formData.instructions || `You are a ${formData.name}. ${formData.description}\n\nYour primary responsibilities include:\n1. Providing accurate and helpful information\n2. Maintaining a professional and friendly tone\n3. Following company guidelines and policies\n\nAlways ensure responses are clear, concise, and actionable.`,
      });
      setImproving(false);
    }, 2000);
  };

  const handleSave = () => {
    const agentData = {
      name: formData.name,
      description: formData.description,
      agent_type: formData.name.toLowerCase().replace(/\s+/g, '_'),
      category: 'Custom',
      llm_provider: formData.llm_provider,
      llm_model: formData.llm_model,
      temperature: formData.temperature,
      top_p: formData.top_p,
      role: formData.role,
      system_prompt: formData.instructions,
      connectors: formData.tools || [],
      capabilities: formData.features || [],
      config: {
        use_rag: formData.use_rag,
        knowledge_base_id: formData.knowledge_base_id,
        rag_top_k: formData.rag_top_k,
      },
      is_custom: true,
      enabled: true,
    };

    onSubmit(agentData);
    onClose();
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return formData.name && formData.description;
      case 1:
        return formData.llm_model;
      case 2:
        return formData.role && formData.instructions;
      default:
        return true;
    }
  };

  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'background.default',
        zIndex: 1300,
        overflow: 'auto',
      }}
    >
      <Box sx={{ maxWidth: 900, margin: '0 auto', p: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant="h4" fontWeight={700}>
            {initialData ? 'Edit Agent' : 'Create New Agent'}
          </Typography>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <Paper elevation={0} variant="outlined" sx={{ p: 4, mb: 3, minHeight: 400 }}>
          {activeStep === 0 && <BasicInfoStep formData={formData} setFormData={setFormData} />}
          {activeStep === 1 && <ModelSelectionStep formData={formData} setFormData={setFormData} />}
          {activeStep === 2 && (
            <RoleInstructionsStep
              formData={formData}
              setFormData={setFormData}
              onImprove={handleImprove}
              improving={improving}
            />
          )}
          {activeStep === 3 && <ToolSelectionStep formData={formData} setFormData={setFormData} />}
          {activeStep === 4 && <KnowledgeBaseStep formData={formData} setFormData={setFormData} />}
          {activeStep === 5 && <FeaturesStep formData={formData} setFormData={setFormData} />}
          {activeStep === 6 && <TestingStep formData={formData} />}
          {activeStep === 7 && <DeployStep formData={formData} />}
        </Paper>

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
            size="large"
          >
            Back
          </Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {activeStep < steps.length - 1 && (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForwardIcon />}
                disabled={!canProceed()}
                size="large"
              >
                Next
              </Button>
            )}
            {activeStep === steps.length - 1 && (
              <Button
                variant="contained"
                color="success"
                onClick={handleSave}
                startIcon={<SaveIcon />}
                size="large"
              >
                Save Agent
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AgentBuilderWizard;
