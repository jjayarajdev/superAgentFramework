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
  TrendingUp,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
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

  // Calculate chart data
  const chartData = React.useMemo(() => {
    const executionList = executions || [];

    // Execution trends over the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const executionTrends = last7Days.map((date) => {
      const dayExecutions = executionList.filter((e) =>
        e.created_at && e.created_at.startsWith(date)
      );
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        executions: dayExecutions.length,
        successful: dayExecutions.filter((e) => e.status === 'COMPLETED').length,
        failed: dayExecutions.filter((e) => e.status === 'FAILED').length,
      };
    });

    // Status distribution
    const statusCounts = {
      COMPLETED: executionList.filter((e) => e.status === 'COMPLETED').length,
      RUNNING: executionList.filter((e) => e.status === 'RUNNING').length,
      FAILED: executionList.filter((e) => e.status === 'FAILED').length,
      PENDING: executionList.filter((e) => e.status === 'PENDING').length,
    };

    const statusDistribution = [
      { name: 'Completed', value: statusCounts.COMPLETED, color: '#10B981' },
      { name: 'Running', value: statusCounts.RUNNING, color: '#3B82F6' },
      { name: 'Failed', value: statusCounts.FAILED, color: '#EF4444' },
      { name: 'Pending', value: statusCounts.PENDING, color: '#F59E0B' },
    ].filter((item) => item.value > 0);

    // Cost over time (last 7 days)
    const costOverTime = last7Days.map((date) => {
      const dayExecutions = executionList.filter((e) =>
        e.created_at && e.created_at.startsWith(date)
      );
      const cost = dayExecutions.reduce((sum, e) => sum + (e.metrics?.total_cost || 0), 0);
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        cost: parseFloat(cost.toFixed(2)),
      };
    });

    return {
      executionTrends,
      statusDistribution,
      costOverTime,
    };
  }, [executions]);

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

      {/* Analytics Charts */}
      {!isLoading && executions && executions.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
            Analytics
          </Typography>
          <Grid container spacing={3}>
            {/* Execution Trends */}
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight={600}>
                      Execution Trends (Last 7 Days)
                    </Typography>
                  </Box>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData.executionTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="executions"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        name="Total Executions"
                      />
                      <Line
                        type="monotone"
                        dataKey="successful"
                        stroke="#10B981"
                        strokeWidth={2}
                        name="Successful"
                      />
                      <Line
                        type="monotone"
                        dataKey="failed"
                        stroke="#EF4444"
                        strokeWidth={2}
                        name="Failed"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Status Distribution */}
            <Grid item xs={12} lg={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                    Status Distribution
                  </Typography>
                  {chartData.statusDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={chartData.statusDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartData.statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No execution data available
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Cost Over Time */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <AttachMoney sx={{ mr: 1, color: 'warning.main' }} />
                    <Typography variant="h6" fontWeight={600}>
                      Cost Over Time (Last 7 Days)
                    </Typography>
                  </Box>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.costOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="cost" fill="#F59E0B" name="Cost ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
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
