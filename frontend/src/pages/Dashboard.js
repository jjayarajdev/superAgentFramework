import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayIcon,
  AccountTree,
  CheckCircle,
  AttachMoney,
  Speed,
  ChevronRight,
} from '@mui/icons-material';

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <Card sx={{ height: '100%' }}>
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

const FeatureCard = ({ title, description, icon: Icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
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
          mb: 2,
        }}
      >
        <Icon />
      </Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          textAlign: 'center',
          py: 6,
          mb: 4,
        }}
      >
        <Chip
          label="Enterprise AI Agent Platform"
          sx={{
            mb: 2,
            backgroundColor: 'primary.50',
            color: 'primary.main',
            fontWeight: 600,
          }}
        />
        <Typography
          variant="h2"
          fontWeight={700}
          gutterBottom
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Build Multi-Agent Workflows
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
          Orchestrate autonomous AI agents that work together to automate complex
          enterprise tasks. No code required.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => navigate('/workflows/builder')}
          >
            Create Workflow
          </Button>
          <Button
            variant="outlined"
            size="large"
            endIcon={<ChevronRight />}
            onClick={() => navigate('/executions')}
          >
            View Executions
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Workflows"
            value="2"
            subtitle="+2 this week"
            icon={AccountTree}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed"
            value="0"
            subtitle="1 total runs"
            icon={CheckCircle}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Cost"
            value="$0.00"
            subtitle="+$0.00 / month"
            icon={AttachMoney}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg. Latency"
            value="0ms"
            subtitle="+0% vs last week"
            icon={Speed}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Platform Features */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Platform Features
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <FeatureCard
              title="Visual Workflow Builder"
              description="Drag-and-drop interface for creating multi-agent workflows"
              icon={AccountTree}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FeatureCard
              title="Enterprise Connectors"
              description="Pre-built integrations with Salesforce, Outlook, HR systems"
              icon={PlayIcon}
              color="secondary"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FeatureCard
              title="Cost Transparency"
              description="Per-agent token tracking and cost estimation"
              icon={AttachMoney}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FeatureCard
              title="RAG Integration"
              description="Responses cite actual sources from your knowledge base"
              icon={CheckCircle}
              color="info"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Your Workflows */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>
            Your Workflows
          </Typography>
          <Button
            variant="text"
            endIcon={<ChevronRight />}
            onClick={() => navigate('/workflows')}
          >
            View All
          </Button>
        </Box>
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <AccountTree sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No workflows yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create your first workflow to automate complex tasks
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/workflows/builder')}
              >
                Create Workflow
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Recent Executions */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>
            Recent Executions
          </Typography>
          <Button
            variant="text"
            endIcon={<ChevronRight />}
            onClick={() => navigate('/executions')}
          >
            View All
          </Button>
        </Box>
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <PlayIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No executions yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Workflow execution history will appear here
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;
