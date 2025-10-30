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
import { workflowsAPI, executionsAPI } from '../api';

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

  // Fetch workflows and executions data
  const { data: workflows, isLoading: workflowsLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: workflowsAPI.getAll,
  });

  const { data: executions, isLoading: executionsLoading } = useQuery({
    queryKey: ['executions'],
    queryFn: executionsAPI.getAll,
  });

  // Calculate stats from real data
  const stats = React.useMemo(() => {
    const workflowCount = workflows?.length || 0;
    const executionList = executions || [];

    const completed = executionList.filter((e) => e.status === 'COMPLETED').length;
    const totalRuns = executionList.length;
    const totalCost = executionList.reduce((sum, e) => sum + (e.metrics?.total_cost || 0), 0);

    // Calculate average latency
    const latencies = executionList
      .filter((e) => e.metrics?.duration_seconds)
      .map((e) => e.metrics.duration_seconds * 1000);
    const avgLatency = latencies.length > 0
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length
      : 0;

    return {
      workflowCount,
      completed,
      totalRuns,
      totalCost,
      avgLatency: Math.round(avgLatency),
    };
  }, [workflows, executions]);

  const isLoading = workflowsLoading || executionsLoading;

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

      {/* Stats Cards - 2x2 Grid */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mb: 6, maxWidth: 1000 }}>
          <Grid item xs={12} sm={6}>
            <StatCard
              title="Total Workflows"
              value={stats.workflowCount}
              subtitle={`${stats.workflowCount} active`}
              icon={AccountTree}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <StatCard
              title="Completed"
              value={stats.completed}
              subtitle={`${stats.totalRuns} total runs`}
              icon={CheckCircle}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <StatCard
              title="Total Cost"
              value={`$${stats.totalCost.toFixed(2)}`}
              subtitle="All executions"
              icon={AttachMoney}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <StatCard
              title="Avg. Latency"
              value={`${stats.avgLatency}ms`}
              subtitle={`${stats.totalRuns} executions`}
              icon={Speed}
              color="info"
            />
          </Grid>
        </Grid>
      )}

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
        {workflows && workflows.length > 0 ? (
          <Grid container spacing={3}>
            {workflows.slice(0, 3).map((workflow) => (
              <Grid item xs={12} md={4} key={workflow.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
                  }}
                  onClick={() => navigate(`/workflows/builder/${workflow.id}`)}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {workflow.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {workflow.description || 'No description'}
                    </Typography>
                    <Chip
                      label={`${workflow.agents?.length || 0} agents`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
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
        )}
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
        {executions && executions.length > 0 ? (
          <Card>
            <CardContent>
              {executions.slice(0, 5).map((execution) => {
                const statusColors = {
                  COMPLETED: 'success',
                  RUNNING: 'info',
                  FAILED: 'error',
                  PENDING: 'warning',
                };
                return (
                  <Box
                    key={execution.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 2,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 0 },
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {execution.workflow_name || `Workflow ${execution.workflow_id}`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {execution.created_at
                          ? new Date(execution.created_at).toLocaleString()
                          : 'Unknown date'}
                      </Typography>
                    </Box>
                    <Chip
                      label={execution.status}
                      size="small"
                      color={statusColors[execution.status] || 'default'}
                      variant="outlined"
                    />
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        ) : (
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
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
