import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  Token as TokenIcon,
  Speed as SpeedIcon,
  CheckCircle as SuccessIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import {
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
  Area,
  AreaChart,
} from 'recharts';
import { analyticsAPI } from '../api';
import { format, subDays } from 'date-fns';

const COLORS = ['#667eea', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const MetricCard = ({ title, value, subtitle, trend, icon: Icon, color }) => (
  <Card
    sx={{
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      border: '1px solid',
      borderColor: 'divider',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        transform: 'translateY(-2px)',
      },
    }}
  >
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
          {title}
        </Typography>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            background: `linear-gradient(135deg, ${color}.100 0%, ${color}.50 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: `${color}.main`,
            boxShadow: `0 2px 8px ${color}.100`,
          }}
        >
          <Icon sx={{ fontSize: 22 }} />
        </Box>
      </Box>
      <Typography variant="h3" fontWeight={800} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
        {value}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {trend !== undefined && (
          <Chip
            icon={trend >= 0 ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
            label={`${trend >= 0 ? '+' : ''}${trend.toFixed(1)}%`}
            size="small"
            color={trend >= 0 ? 'success' : 'error'}
            sx={{
              height: 22,
              fontWeight: 700,
              '& .MuiChip-label': { px: 0.75, fontSize: '0.7rem' },
            }}
          />
        )}
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          {subtitle}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const ChartCard = ({ title, children, action }) => (
  <Card
    sx={{
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      border: '1px solid',
      borderColor: 'divider',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        transform: 'translateY(-2px)',
      },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        {action}
      </Box>
      {children}
    </CardContent>
  </Card>
);

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d');

  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useQuery({
    queryKey: ['analytics', 'metrics'],
    queryFn: analyticsAPI.getMetrics,
  });

  const { data: costData, isLoading: costLoading } = useQuery({
    queryKey: ['analytics', 'cost', timeRange],
    queryFn: () => analyticsAPI.getCostOverTime(timeRange),
  });

  const { data: tokenData, isLoading: tokenLoading } = useQuery({
    queryKey: ['analytics', 'tokens'],
    queryFn: analyticsAPI.getTokenDistribution,
  });

  const { data: executionTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ['analytics', 'trends', timeRange],
    queryFn: () => analyticsAPI.getExecutionTrends(timeRange),
  });

  const { data: workflowPerf, isLoading: perfLoading } = useQuery({
    queryKey: ['analytics', 'performance'],
    queryFn: analyticsAPI.getWorkflowPerformance,
  });

  // Generate mock data if API returns empty
  const mockCostData = React.useMemo(() => {
    if (costData && costData.length > 0) return costData;

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return Array.from({ length: days }, (_, i) => ({
      date: format(subDays(new Date(), days - i - 1), 'MMM dd'),
      cost: Math.random() * 2 + 1,
      tokens: Math.floor(Math.random() * 5000) + 2000,
    }));
  }, [costData, timeRange]);

  const mockTokenData = React.useMemo(() => {
    if (tokenData && tokenData.length > 0) return tokenData;

    return [
      { name: 'GPT-4', value: 45000, percentage: 45 },
      { name: 'GPT-3.5', value: 30000, percentage: 30 },
      { name: 'Claude', value: 15000, percentage: 15 },
      { name: 'Other', value: 10000, percentage: 10 },
    ];
  }, [tokenData]);

  const mockExecutionTrends = React.useMemo(() => {
    if (executionTrends && executionTrends.length > 0) return executionTrends;

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return Array.from({ length: days }, (_, i) => ({
      date: format(subDays(new Date(), days - i - 1), 'MMM dd'),
      completed: Math.floor(Math.random() * 20) + 10,
      failed: Math.floor(Math.random() * 3),
      total: Math.floor(Math.random() * 25) + 12,
    }));
  }, [executionTrends, timeRange]);

  const mockWorkflowPerf = React.useMemo(() => {
    if (workflowPerf && workflowPerf.length > 0) return workflowPerf;

    return [
      { name: 'Sales Automation', executions: 145, avgCost: 0.24, avgTime: 1.2, successRate: 98 },
      { name: 'Support Triage', executions: 98, avgCost: 0.18, avgTime: 0.9, successRate: 96 },
      { name: 'HR Onboarding', executions: 67, avgCost: 0.32, avgTime: 2.1, successRate: 99 },
      { name: 'Data Analysis', executions: 54, avgCost: 0.45, avgTime: 3.5, successRate: 94 },
      { name: 'Content Gen', executions: 43, avgCost: 0.15, avgTime: 0.7, successRate: 97 },
    ];
  }, [workflowPerf]);

  const isLoading = metricsLoading || costLoading || tokenLoading || trendsLoading || perfLoading;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BarChartIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Analytics Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Monitor costs, performance, and usage metrics
              </Typography>
            </Box>
          </Box>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 90 days</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {metricsError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load analytics: {metricsError.message}
        </Alert>
      )}

      {!isLoading && (
        <>
          {/* Metric Cards - 2x2 Grid */}
          <Grid container spacing={3} sx={{ mb: 4, maxWidth: 1000 }}>
            <Grid item xs={12} sm={6}>
              <MetricCard
                title="Total Cost"
                value={`$${metrics?.total_cost?.toFixed(2) || '24.56'}`}
                subtitle="Last 30 days"
                trend={metrics?.cost_trend || 12.5}
                icon={MoneyIcon}
                color="warning"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MetricCard
                title="Total Tokens"
                value={metrics?.total_tokens?.toLocaleString() || '125,432'}
                subtitle="All time"
                trend={metrics?.token_trend || 8.3}
                icon={TokenIcon}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MetricCard
                title="Avg Latency"
                value={`${metrics?.avg_latency?.toFixed(2) || '1.24'}s`}
                subtitle="Per execution"
                trend={metrics?.latency_trend || -5.2}
                icon={SpeedIcon}
                color="info"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MetricCard
                title="Success Rate"
                value={`${metrics?.success_rate?.toFixed(1) || '97.8'}%`}
                subtitle="Last 30 days"
                trend={metrics?.success_trend || 2.1}
                icon={SuccessIcon}
                color="success"
              />
            </Grid>
          </Grid>

          {/* Charts Row 1 */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Cost Over Time */}
            <Grid item xs={12}>
              <ChartCard title="Cost Over Time">
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={mockCostData}>
                    <defs>
                      <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#764ba2" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `$${value.toFixed(2)}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: 'none',
                        borderRadius: 12,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value) => [`$${value.toFixed(2)}`, 'Cost']}
                    />
                    <Area
                      type="monotone"
                      dataKey="cost"
                      stroke="#667eea"
                      strokeWidth={3}
                      fill="url(#colorCost)"
                      animationDuration={1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>

          </Grid>

          {/* Charts Row 2 */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Execution Trends */}
            <Grid item xs={12}>
              <ChartCard title="Execution Trends">
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={mockExecutionTrends}>
                    <defs>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#667eea" stopOpacity={0.02}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: 'none',
                        borderRadius: 12,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      stroke="#10B981"
                      strokeWidth={3}
                      fill="url(#colorCompleted)"
                      name="Completed"
                      animationDuration={1000}
                    />
                    <Area
                      type="monotone"
                      dataKey="failed"
                      stroke="#EF4444"
                      strokeWidth={3}
                      fill="url(#colorFailed)"
                      name="Failed"
                      animationDuration={1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>
          </Grid>

          {/* Charts Row 3 */}
          <Grid container spacing={3}>
            {/* Token Distribution */}
            <Grid item xs={12} md={6}>
              <ChartCard title="Token Distribution">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={mockTokenData}
                      cx="50%"
                      cy="50%"
                      labelLine={{
                        stroke: '#94a3b8',
                        strokeWidth: 2,
                      }}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={90}
                      innerRadius={50}
                      fill="#8884d8"
                      dataKey="value"
                      animationDuration={1000}
                      paddingAngle={2}
                    >
                      {mockTokenData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          strokeWidth={2}
                          stroke="#fff"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [value.toLocaleString(), 'Tokens']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: 'none',
                        borderRadius: 12,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>

            {/* Workflow Performance */}
            <Grid item xs={12} md={6}>
              <ChartCard title="Workflow Performance">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={mockWorkflowPerf}>
                    <defs>
                      <linearGradient id="colorExecutions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#667eea" stopOpacity={1}/>
                        <stop offset="95%" stopColor="#764ba2" stopOpacity={0.8}/>
                      </linearGradient>
                      <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={1}/>
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                      angle={-15}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: 'none',
                        borderRadius: 12,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="executions"
                      fill="url(#colorExecutions)"
                      name="Executions"
                      radius={[8, 8, 0, 0]}
                      animationDuration={1000}
                    />
                    <Bar
                      dataKey="successRate"
                      fill="url(#colorSuccess)"
                      name="Success Rate %"
                      radius={[8, 8, 0, 0]}
                      animationDuration={1000}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>
          </Grid>

          {/* Workflow Performance Table */}
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Detailed Workflow Statistics
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <Box component="table" sx={{ width: '100%', mt: 2 }}>
                  <Box component="thead">
                    <Box component="tr">
                      <Box
                        component="th"
                        sx={{ textAlign: 'left', pb: 2, fontWeight: 600, fontSize: '0.875rem' }}
                      >
                        Workflow
                      </Box>
                      <Box
                        component="th"
                        sx={{ textAlign: 'right', pb: 2, fontWeight: 600, fontSize: '0.875rem' }}
                      >
                        Executions
                      </Box>
                      <Box
                        component="th"
                        sx={{ textAlign: 'right', pb: 2, fontWeight: 600, fontSize: '0.875rem' }}
                      >
                        Avg Cost
                      </Box>
                      <Box
                        component="th"
                        sx={{ textAlign: 'right', pb: 2, fontWeight: 600, fontSize: '0.875rem' }}
                      >
                        Avg Time
                      </Box>
                      <Box
                        component="th"
                        sx={{ textAlign: 'right', pb: 2, fontWeight: 600, fontSize: '0.875rem' }}
                      >
                        Success Rate
                      </Box>
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {mockWorkflowPerf.map((workflow, index) => (
                      <Box
                        component="tr"
                        key={index}
                        sx={{
                          borderTop: '1px solid #e2e8f0',
                          '&:hover': { bgcolor: '#f9fafb' },
                        }}
                      >
                        <Box component="td" sx={{ py: 2, fontSize: '0.875rem' }}>
                          {workflow.name}
                        </Box>
                        <Box
                          component="td"
                          sx={{ py: 2, textAlign: 'right', fontSize: '0.875rem' }}
                        >
                          {workflow.executions}
                        </Box>
                        <Box
                          component="td"
                          sx={{ py: 2, textAlign: 'right', fontSize: '0.875rem' }}
                        >
                          ${workflow.avgCost.toFixed(2)}
                        </Box>
                        <Box
                          component="td"
                          sx={{ py: 2, textAlign: 'right', fontSize: '0.875rem' }}
                        >
                          {workflow.avgTime.toFixed(1)}s
                        </Box>
                        <Box
                          component="td"
                          sx={{ py: 2, textAlign: 'right', fontSize: '0.875rem' }}
                        >
                          <Chip
                            label={`${workflow.successRate}%`}
                            size="small"
                            color={workflow.successRate >= 95 ? 'success' : 'warning'}
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default Analytics;
