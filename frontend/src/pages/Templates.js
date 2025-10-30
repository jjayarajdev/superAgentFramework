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
  ToggleButtonGroup,
  ToggleButton,
  Snackbar,
} from '@mui/material';
import {
  Rocket as RocketIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Support as SupportIcon,
  Add as AddIcon,
  Build as BuildIcon,
  Search as SearchIcon,
  PersonSearch as PersonSearchIcon,
  Article as ArticleIcon,
  Email as EmailIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { workflowsAPI } from '../api';

const templateIcons = {
  sales: <BusinessIcon />,
  hr: <RocketIcon />,
  knowledge: <DescriptionIcon />,
  support: <SupportIcon />,
};

const templateColors = {
  sales: 'primary',
  hr: 'success',
  knowledge: 'secondary',
  support: 'warning',
};

const TemplateCard = ({ template, onUse }) => {
  const category = template.category || 'sales';
  const icon = templateIcons[category.toLowerCase()] || <BusinessIcon />;
  const color = templateColors[category.toLowerCase()] || 'primary';

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor: `${color}.50`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: `${color}.main`,
            }}
          >
            {icon}
          </Box>
          <Chip
            label={template.category || 'Sales Automation'}
            size="small"
            color={color}
            variant="outlined"
          />
        </Box>

        <Typography variant="h6" fontWeight={600} gutterBottom>
          {template.name}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {template.description}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" fontWeight={600} display="block" gutterBottom>
            Agents included:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {template.agents?.slice(0, 3).map((agent, idx) => (
              <Chip
                key={idx}
                label={agent.name || agent.agent_type}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            ))}
            {template.agents?.length > 3 && (
              <Chip
                label={`+${template.agents.length - 3} more`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Est. Cost
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              ${template.estimated_cost?.toFixed(2) || '0.00'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Avg. Time
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {template.estimated_time || '2.5s'}
            </Typography>
          </Box>
        </Box>

        <Button
          fullWidth
          variant="contained"
          color={color}
          startIcon={<RocketIcon />}
          onClick={() => onUse(template)}
        >
          Use This Template
        </Button>
      </CardContent>
    </Card>
  );
};

// Built-in templates
const BUILT_IN_TEMPLATES = [
  {
    id: 'template-sales-outreach',
    name: 'Automated Sales Outreach',
    category: 'Sales',
    description: 'Identify leads from Salesforce, research companies, personalize emails, and send automated follow-ups',
    estimated_cost: 0.45,
    estimated_time: '3.2s',
    agents: [
      { name: 'Salesforce Agent', agent_type: 'salesforce_agent' },
      { name: 'Sales Intelligence', agent_type: 'sales_intelligence_agent' },
      { name: 'Email Outreach', agent_type: 'email_outreach_agent' },
    ],
  },
  {
    id: 'template-hr-onboarding',
    name: 'Employee Onboarding Workflow',
    category: 'HR',
    description: 'Automated onboarding: sync data from Darwinbox, create accounts, send welcome emails, and schedule meetings',
    estimated_cost: 0.32,
    estimated_time: '2.8s',
    agents: [
      { name: 'Darwinbox HR Agent', agent_type: 'darwinbox_hr_agent' },
      { name: 'Email Agent', agent_type: 'email_outreach_agent' },
      { name: 'Calendar Agent', agent_type: 'outlook_calendar_agent' },
    ],
  },
  {
    id: 'template-customer-support',
    name: 'Customer Support Automation',
    category: 'Support',
    description: 'Create tickets in Jira, search knowledge base for answers, and send responses via Slack',
    estimated_cost: 0.28,
    estimated_time: '1.9s',
    agents: [
      { name: 'Jira Agent', agent_type: 'jira_agent' },
      { name: 'Knowledge Agent', agent_type: 'rag_knowledge_agent' },
      { name: 'Slack Agent', agent_type: 'slack_agent' },
    ],
  },
  {
    id: 'template-knowledge-extraction',
    name: 'Document Intelligence & RAG',
    category: 'Knowledge',
    description: 'Upload documents, extract key information, index in vector database, and enable semantic search',
    estimated_cost: 0.52,
    estimated_time: '4.1s',
    agents: [
      { name: 'RAG Agent', agent_type: 'rag_knowledge_agent' },
      { name: 'Summarizer Agent', agent_type: 'ai_assistant_agent' },
    ],
  },
  {
    id: 'template-lead-qualification',
    name: 'Lead Qualification Pipeline',
    category: 'Sales',
    description: 'Score leads, research companies, enrich contact data, and route to appropriate sales rep',
    estimated_cost: 0.39,
    estimated_time: '2.5s',
    agents: [
      { name: 'Salesforce Agent', agent_type: 'salesforce_agent' },
      { name: 'Sales Intelligence', agent_type: 'sales_intelligence_agent' },
      { name: 'Supervisor', agent_type: 'supervisor_agent' },
    ],
  },
  {
    id: 'template-expense-approval',
    name: 'Expense Report Processing',
    category: 'HR',
    description: 'Extract expenses from receipts, validate against policy, route for approval, and sync to payroll',
    estimated_cost: 0.41,
    estimated_time: '2.9s',
    agents: [
      { name: 'Darwinbox HR Agent', agent_type: 'darwinbox_hr_agent' },
      { name: 'Email Agent', agent_type: 'email_outreach_agent' },
      { name: 'Supervisor', agent_type: 'supervisor_agent' },
    ],
  },
];

const Templates = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const { data: backendTemplates, isLoading, error } = useQuery({
    queryKey: ['templates'],
    queryFn: workflowsAPI.getTemplates,
  });

  // Combine backend templates with built-in templates
  const allTemplates = React.useMemo(() => {
    // Ensure backendTemplates is an array
    const backend = Array.isArray(backendTemplates) ? backendTemplates : [];
    return [...BUILT_IN_TEMPLATES, ...backend];
  }, [backendTemplates]);

  // Get unique categories
  const categories = React.useMemo(() => {
    const cats = [...new Set(allTemplates.map(t => t.category))];
    return ['All', ...cats];
  }, [allTemplates]);

  // Filter templates
  const filteredTemplates = React.useMemo(() => {
    return allTemplates.filter(template => {
      const matchesSearch = !searchTerm ||
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === 'All' || template.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [allTemplates, searchTerm, categoryFilter]);

  // Mutation for creating workflow from template
  const createFromTemplateMutation = useMutation({
    mutationFn: async (template) => {
      // Convert template to workflow format
      const workflowData = {
        name: template.name,
        description: template.description,
        agents: template.agents || [],
        status: 'Active',
      };
      return workflowsAPI.create(workflowData);
    },
    onSuccess: (data, template) => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      setSnackbar({
        open: true,
        message: `Created workflow from "${template.name}" template!`,
      });
      // Navigate to visual builder with the new workflow
      setTimeout(() => {
        navigate('/workflows/visual-builder', { state: { workflow: data } });
      }, 1500);
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Failed to create workflow: ${error.message}`,
      });
    },
  });

  const handleUseTemplate = (template) => {
    createFromTemplateMutation.mutate(template);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <DescriptionIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Typography variant="h4" fontWeight={700}>
            Workflow Templates
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Start with pre-built workflows for common use cases
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search templates..."
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
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
          </Typography>

          <ToggleButtonGroup
            value={categoryFilter}
            exclusive
            onChange={(e, value) => value && setCategoryFilter(value)}
            size="small"
          >
            {categories.map((cat) => (
              <ToggleButton key={cat} value={cat}>
                {cat}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Could not load backend templates. Showing built-in templates only.
        </Alert>
      )}

      {/* Templates Grid */}
      {filteredTemplates && filteredTemplates.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {filteredTemplates.map((template) => (
            <Grid item xs={12} md={6} key={template.id}>
              <TemplateCard
                template={template}
                onUse={handleUseTemplate}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty State */}
      {filteredTemplates && filteredTemplates.length === 0 && !isLoading && (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <DescriptionIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No templates found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Try adjusting your search or filters
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Custom Template CTA */}
      <Card
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <CardContent sx={{ py: 6 }}>
          <Box sx={{ textAlign: 'center' }}>
            <BuildIcon sx={{ fontSize: 64, mb: 2, opacity: 0.9 }} />
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Need a Custom Template?
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
              Build your own workflow from scratch or request a custom template tailored to your specific use case
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'grey.100' },
                }}
                startIcon={<BuildIcon />}
                onClick={() => navigate('/workflows/visual-builder')}
              >
                Build from Scratch
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                }}
                startIcon={<AddIcon />}
              >
                Request Custom Template
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={createFromTemplateMutation.isError ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Templates;
