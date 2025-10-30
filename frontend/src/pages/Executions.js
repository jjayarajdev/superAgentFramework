import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  PlayCircleOutline as PlayIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { executionsAPI } from '../api';
import { format } from 'date-fns';

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <Card>
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

const ExecutionRow = ({ execution }) => {
  const [expanded, setExpanded] = useState(false);

  const statusConfig = {
    COMPLETED: { icon: <CheckCircleIcon />, color: 'success', label: 'completed' },
    RUNNING: { icon: <ScheduleIcon />, color: 'info', label: 'running' },
    FAILED: { icon: <ErrorIcon />, color: 'error', label: 'failed' },
    PENDING: { icon: <ScheduleIcon />, color: 'warning', label: 'pending' },
  };

  const status = statusConfig[execution.status] || statusConfig.PENDING;

  return (
    <>
      <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {execution.workflow_name || `Workflow ${execution.workflow_id}`}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {execution.created_at
                  ? format(new Date(execution.created_at), 'MMM dd, yyyy · h:mm a')
                  : 'Unknown date'}
              </Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell>
          <Chip
            icon={status.icon}
            label={status.label}
            size="small"
            color={status.color}
            variant="outlined"
          />
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight={600}>
            {execution.metrics?.total_tokens || 0}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight={600} color="success.main">
            ${execution.metrics?.total_cost?.toFixed(3) || '0.000'}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight={600}>
            {execution.metrics?.duration_seconds
              ? `${(execution.metrics.duration_seconds * 1000).toFixed(0)}ms`
              : '0ms'}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight={600}>
            {execution.agent_executions?.length || 0}
          </Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ py: 2, pl: 8 }}>
              <Typography variant="caption" fontWeight={600} gutterBottom display="block">
                Execution Details
              </Typography>
              <Box sx={{ display: 'flex', gap: 4, mt: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Execution ID
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    {execution.id}
                  </Typography>
                </Box>
                {execution.error && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Error
                    </Typography>
                    <Typography variant="body2" color="error.main">
                      {execution.error}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const Executions = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: executions, isLoading, error } = useQuery({
    queryKey: ['executions'],
    queryFn: executionsAPI.getAll,
  });

  // Calculate stats
  const stats = React.useMemo(() => {
    if (!executions) return { total: 0, completed: 0, running: 0, failed: 0, cost: 0 };

    return {
      total: executions.length,
      completed: executions.filter((e) => e.status === 'COMPLETED').length,
      running: executions.filter((e) => e.status === 'RUNNING').length,
      failed: executions.filter((e) => e.status === 'FAILED').length,
      cost: executions.reduce((sum, e) => sum + (e.metrics?.total_cost || 0), 0),
    };
  }, [executions]);

  const filteredExecutions = React.useMemo(() => {
    if (!executions) return [];
    if (!searchTerm) return executions;

    return executions.filter((execution) =>
      execution.workflow_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      execution.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [executions, searchTerm]);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PlayIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Typography variant="h4" fontWeight={700}>
            Workflow Executions
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Monitor and analyze your workflow execution history
        </Typography>
      </Box>

      {/* Stats Cards - 3-2 Layout */}
      <Grid container spacing={3} sx={{ mb: 4, maxWidth: 1400 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total"
            value={stats.total}
            subtitle="All time"
            icon={PlayIcon}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Completed"
            value={stats.completed}
            subtitle="Successful runs"
            icon={CheckCircleIcon}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Running"
            value={stats.running}
            subtitle="In progress"
            icon={ScheduleIcon}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <StatCard
            title="Failed"
            value={stats.failed}
            subtitle="Errors"
            icon={ErrorIcon}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <StatCard
            title="Total Cost"
            value={`$${stats.cost.toFixed(2)}`}
            subtitle="All time"
            icon={MoneyIcon}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search executions..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load executions: {error.message}
        </Alert>
      )}

      {/* Executions Table */}
      {filteredExecutions && filteredExecutions.length > 0 ? (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Execution History
            </Typography>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Workflow</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Tokens</TableCell>
                    <TableCell>Cost</TableCell>
                    <TableCell>Latency</TableCell>
                    <TableCell>Agents</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredExecutions.map((execution) => (
                    <ExecutionRow key={execution.id} execution={execution} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ) : (
        !isLoading && (
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
        )
      )}
    </Box>
  );
};

export default Executions;
