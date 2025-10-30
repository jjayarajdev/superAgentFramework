import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
} from '@mui/material';
import {
  Rocket as RocketIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Support as SupportIcon,
  Add as AddIcon,
  Build as BuildIcon,
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

const Templates = () => {
  const navigate = useNavigate();

  const { data: templates, isLoading, error } = useQuery({
    queryKey: ['templates'],
    queryFn: workflowsAPI.getTemplates,
  });

  const handleUseTemplate = async (template) => {
    try {
      const workflow = await workflowsAPI.createFromTemplate(template.id);
      navigate(`/workflows/${workflow.id}/edit`);
    } catch (err) {
      console.error('Failed to create workflow from template:', err);
    }
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

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load templates: {error.message}
        </Alert>
      )}

      {/* Templates Grid */}
      {templates && templates.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {templates.map((template) => (
            <Grid item xs={12} md={6} key={template.id}>
              <TemplateCard template={template} onUse={handleUseTemplate} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty State */}
      {templates && templates.length === 0 && (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <DescriptionIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No templates available yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Check back soon for pre-built workflow templates
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
                onClick={() => navigate('/workflows/builder')}
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
    </Box>
  );
};

export default Templates;
