// Custom Node Types for Lyzr-style Workflow Builder
import React from 'react';
import { Handle, Position } from 'reactflow';
import { Box, Typography, Chip, IconButton } from '@mui/material';
import {
  SmartToy as AgentIcon,
  CallSplit as ConditionalIcon,
  AltRoute as RouterIcon,
  Api as ApiIcon,
  Input as InputIcon,
  SwapHoriz as A2AIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

// Helper function to get status styles
const getStatusStyles = (status) => {
  switch (status) {
    case 'pending':
      return {
        borderColor: '#9CA3AF',
        backgroundColor: '#F9FAFB',
        badgeColor: '#6B7280',
        badgeLabel: 'Pending',
      };
    case 'running':
      return {
        borderColor: '#3B82F6',
        backgroundColor: '#EFF6FF',
        badgeColor: '#3B82F6',
        badgeLabel: 'Running',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      };
    case 'completed':
      return {
        borderColor: '#10B981',
        backgroundColor: '#ECFDF5',
        badgeColor: '#10B981',
        badgeLabel: 'Completed',
      };
    case 'failed':
      return {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
        badgeColor: '#EF4444',
        badgeLabel: 'Failed',
      };
    default:
      return null;
  }
};

// Agent Node (Purple)
export const AgentNode = ({ data, selected }) => {
  const statusStyles = data.executionStatus ? getStatusStyles(data.executionStatus) : null;

  return (
    <Box
      sx={{
        padding: 2,
        borderRadius: 2,
        border: '2px solid',
        borderColor: statusStyles ? statusStyles.borderColor : (selected ? '#8B5CF6' : '#E9D5FF'),
        backgroundColor: statusStyles ? statusStyles.backgroundColor : '#FAF5FF',
        minWidth: 180,
        maxWidth: 220,
        boxShadow: selected ? '0 8px 24px rgba(139, 92, 246, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.3s',
        position: 'relative',
        animation: statusStyles?.animation || 'none',
        '@keyframes pulse': {
          '0%, 100%': {
            opacity: 1,
            boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.7)',
          },
          '50%': {
            opacity: 1,
            boxShadow: '0 0 0 10px rgba(59, 130, 246, 0)',
          },
        },
        '&:hover': {
          boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 12,
          height: 12,
          backgroundColor: '#8B5CF6',
          border: '2px solid white',
        }}
      />

      {/* Status badge in top-right corner */}
      {statusStyles && (
        <Chip
          label={statusStyles.badgeLabel}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            height: 20,
            fontSize: '0.6rem',
            backgroundColor: 'white',
            color: statusStyles.badgeColor,
            border: `1px solid ${statusStyles.badgeColor}`,
            fontWeight: 700,
          }}
        />
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            backgroundColor: statusStyles?.badgeColor || '#8B5CF6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 1,
            color: 'white',
          }}
        >
          <AgentIcon fontSize="small" />
        </Box>
        <Typography variant="body2" fontWeight={700} sx={{ flex: 1 }}>
          {data.label || 'Agent'}
        </Typography>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        AI Agent
      </Typography>

      {data.agentName && (
        <Chip
          label={data.agentName}
          size="small"
          sx={{
            height: 18,
            fontSize: '0.65rem',
            backgroundColor: '#E9D5FF',
            color: '#8B5CF6',
            fontWeight: 600,
          }}
        />
      )}

      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 12,
          height: 12,
          backgroundColor: '#8B5CF6',
          border: '2px solid white',
        }}
      />
    </Box>
  );
};

// Conditional Node (Yellow/Orange)
export const ConditionalNode = ({ data, selected }) => {
  const statusStyles = data.executionStatus ? getStatusStyles(data.executionStatus) : null;

  return (
    <Box
      sx={{
        padding: 2,
        borderRadius: 2,
        border: '2px solid',
        borderColor: statusStyles ? statusStyles.borderColor : (selected ? '#F59E0B' : '#FDE68A'),
        backgroundColor: statusStyles ? statusStyles.backgroundColor : '#FFFBEB',
        minWidth: 180,
        maxWidth: 220,
        boxShadow: selected ? '0 8px 24px rgba(245, 158, 11, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.3s',
        position: 'relative',
        animation: statusStyles?.animation || 'none',
        '@keyframes pulse': {
          '0%, 100%': {
            opacity: 1,
            boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.7)',
          },
          '50%': {
            opacity: 1,
            boxShadow: '0 0 0 10px rgba(59, 130, 246, 0)',
          },
        },
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 12,
          height: 12,
          backgroundColor: '#F59E0B',
          border: '2px solid white',
        }}
      />

      {/* Status badge */}
      {statusStyles && (
        <Chip
          label={statusStyles.badgeLabel}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            height: 20,
            fontSize: '0.6rem',
            backgroundColor: 'white',
            color: statusStyles.badgeColor,
            border: `1px solid ${statusStyles.badgeColor}`,
            fontWeight: 700,
          }}
        />
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            backgroundColor: statusStyles?.badgeColor || '#F59E0B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 1,
            color: 'white',
          }}
        >
          <ConditionalIcon fontSize="small" />
        </Box>
        <Typography variant="body2" fontWeight={700} sx={{ flex: 1 }}>
          {data.label || 'Conditional'}
        </Typography>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        Branching logic
      </Typography>

      {data.condition && (
        <Box
          sx={{
            mt: 1,
            p: 1,
            backgroundColor: '#FEF3C7',
            borderRadius: 1,
            border: '1px solid #FDE68A',
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
            Condition:
          </Typography>
          <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem' }}>
            {data.condition}
          </Typography>
        </Box>
      )}

      {/* True handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        style={{
          width: 12,
          height: 12,
          backgroundColor: '#10B981',
          border: '2px solid white',
          top: '40%',
        }}
      />
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          right: -35,
          top: 'calc(40% - 10px)',
          fontSize: '0.65rem',
          fontWeight: 600,
          color: '#10B981',
        }}
      >
        True
      </Typography>

      {/* False handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        style={{
          width: 12,
          height: 12,
          backgroundColor: '#EF4444',
          border: '2px solid white',
          top: '60%',
        }}
      />
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          right: -38,
          top: 'calc(60% - 10px)',
          fontSize: '0.65rem',
          fontWeight: 600,
          color: '#EF4444',
        }}
      >
        False
      </Typography>
    </Box>
  );
};

// Router Node (Red/Orange)
export const RouterNode = ({ data, selected }) => {
  return (
    <Box
      sx={{
        padding: 2,
        borderRadius: 2,
        border: '2px solid',
        borderColor: selected ? '#EF4444' : '#FECACA',
        backgroundColor: '#FEF2F2',
        minWidth: 180,
        maxWidth: 220,
        boxShadow: selected ? '0 8px 24px rgba(239, 68, 68, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.3s',
        position: 'relative',
      }}
    >
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

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            backgroundColor: '#EF4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 1,
            color: 'white',
          }}
        >
          <RouterIcon fontSize="small" />
        </Box>
        <Typography variant="body2" fontWeight={700} sx={{ flex: 1 }}>
          {data.label || 'Router'}
        </Typography>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        Multi-path routing
      </Typography>

      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 12,
          height: 12,
          backgroundColor: '#EF4444',
          border: '2px solid white',
        }}
      />
    </Box>
  );
};

// API Call Node (Blue)
export const APICallNode = ({ data, selected }) => {
  const statusStyles = data.executionStatus ? getStatusStyles(data.executionStatus) : null;

  return (
    <Box
      sx={{
        padding: 2,
        borderRadius: 2,
        border: '2px solid',
        borderColor: statusStyles ? statusStyles.borderColor : (selected ? '#3B82F6' : '#BFDBFE'),
        backgroundColor: statusStyles ? statusStyles.backgroundColor : '#EFF6FF',
        minWidth: 180,
        maxWidth: 220,
        boxShadow: selected ? '0 8px 24px rgba(59, 130, 246, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.3s',
        position: 'relative',
        animation: statusStyles?.animation || 'none',
        '@keyframes pulse': {
          '0%, 100%': {
            opacity: 1,
            boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.7)',
          },
          '50%': {
            opacity: 1,
            boxShadow: '0 0 0 10px rgba(59, 130, 246, 0)',
          },
        },
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 12,
          height: 12,
          backgroundColor: '#3B82F6',
          border: '2px solid white',
        }}
      />

      {/* Status badge */}
      {statusStyles && (
        <Chip
          label={statusStyles.badgeLabel}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            height: 20,
            fontSize: '0.6rem',
            backgroundColor: 'white',
            color: statusStyles.badgeColor,
            border: `1px solid ${statusStyles.badgeColor}`,
            fontWeight: 700,
          }}
        />
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            backgroundColor: statusStyles?.badgeColor || '#3B82F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 1,
            color: 'white',
          }}
        >
          <ApiIcon fontSize="small" />
        </Box>
        <Typography variant="body2" fontWeight={700} sx={{ flex: 1 }}>
          {data.label || 'API Call'}
        </Typography>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        External API requests
      </Typography>

      {data.method && (
        <Chip
          label={data.method}
          size="small"
          sx={{
            height: 18,
            fontSize: '0.65rem',
            backgroundColor: '#DBEAFE',
            color: '#3B82F6',
            fontWeight: 600,
          }}
        />
      )}

      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 12,
          height: 12,
          backgroundColor: '#3B82F6',
          border: '2px solid white',
        }}
      />
    </Box>
  );
};

// Default Inputs Node (Green)
export const DefaultInputsNode = ({ data, selected }) => {
  return (
    <Box
      sx={{
        padding: 2,
        borderRadius: 2,
        border: '2px solid',
        borderColor: selected ? '#10B981' : '#A7F3D0',
        backgroundColor: '#ECFDF5',
        minWidth: 180,
        maxWidth: 220,
        boxShadow: selected ? '0 8px 24px rgba(16, 185, 129, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.3s',
        position: 'relative',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            backgroundColor: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 1,
            color: 'white',
          }}
        >
          <InputIcon fontSize="small" />
        </Box>
        <Typography variant="body2" fontWeight={700} sx={{ flex: 1 }}>
          {data.label || 'Default Inputs'}
        </Typography>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        Parameter inputs
      </Typography>

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
    </Box>
  );
};

// A2A (Agent to Agent) Node (Purple)
export const A2ANode = ({ data, selected }) => {
  return (
    <Box
      sx={{
        padding: 2,
        borderRadius: 2,
        border: '2px solid',
        borderColor: selected ? '#A855F7' : '#E9D5FF',
        backgroundColor: '#FAF5FF',
        minWidth: 180,
        maxWidth: 220,
        boxShadow: selected ? '0 8px 24px rgba(168, 85, 247, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.3s',
        position: 'relative',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 12,
          height: 12,
          backgroundColor: '#A855F7',
          border: '2px solid white',
        }}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            backgroundColor: '#A855F7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 1,
            color: 'white',
          }}
        >
          <A2AIcon fontSize="small" />
        </Box>
        <Typography variant="body2" fontWeight={700} sx={{ flex: 1 }}>
          {data.label || 'A2A'}
        </Typography>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        Agent to Agent
      </Typography>

      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 12,
          height: 12,
          backgroundColor: '#A855F7',
          border: '2px solid white',
        }}
      />
    </Box>
  );
};

// Export all node types
export const nodeTypes = {
  agent: AgentNode,
  conditional: ConditionalNode,
  router: RouterNode,
  apiCall: APICallNode,
  defaultInputs: DefaultInputsNode,
  a2a: A2ANode,
};

// Node palette configuration (for drag-and-drop)
export const NODE_PALETTE = [
  {
    id: 'agent',
    type: 'agent',
    label: 'Agent',
    subtitle: 'AI Agent',
    icon: AgentIcon,
    color: '#8B5CF6',
    lightColor: '#FAF5FF',
    data: { label: 'Agent' },
  },
  {
    id: 'conditional',
    type: 'conditional',
    label: 'Conditional',
    subtitle: 'Branching logic',
    icon: ConditionalIcon,
    color: '#F59E0B',
    lightColor: '#FFFBEB',
    data: { label: 'Conditional' },
  },
  {
    id: 'router',
    type: 'router',
    label: 'Router',
    subtitle: 'Multi-path routing',
    icon: RouterIcon,
    color: '#EF4444',
    lightColor: '#FEF2F2',
    data: { label: 'Router' },
  },
  {
    id: 'apiCall',
    type: 'apiCall',
    label: 'API Call',
    subtitle: 'External API requests',
    icon: ApiIcon,
    color: '#3B82F6',
    lightColor: '#EFF6FF',
    data: { label: 'API Call' },
  },
  {
    id: 'defaultInputs',
    type: 'defaultInputs',
    label: 'Default Inputs',
    subtitle: 'Parameter inputs',
    icon: InputIcon,
    color: '#10B981',
    lightColor: '#ECFDF5',
    data: { label: 'Default Inputs' },
  },
  {
    id: 'a2a',
    type: 'a2a',
    label: 'A2A',
    subtitle: 'Agent to Agent',
    icon: A2AIcon,
    color: '#A855F7',
    lightColor: '#FAF5FF',
    data: { label: 'A2A' },
  },
];
