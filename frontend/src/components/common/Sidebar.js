import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Home as HomeIcon,
  AccountTree as WorkflowsIcon,
  ViewModule as TemplatesIcon,
  PlayCircleOutline as ExecutionsIcon,
  BarChart as AnalyticsIcon,
  SmartToy as AgentManagerIcon,
  LocalLibrary as AgentLibraryIcon,
  Description as KnowledgeBaseIcon,
  Chat as ChatIcon,
  AutoAwesome as VisualIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 220;

const navSections = [
  {
    title: 'Workspace',
    items: [
      { text: 'Home', icon: <HomeIcon />, path: '/dashboard' },
      { text: 'AI Chat', icon: <ChatIcon />, path: '/chat' },
      { text: 'Workflows', icon: <WorkflowsIcon />, path: '/workflows' },
      { text: 'Templates', icon: <TemplatesIcon />, path: '/templates' },
    ],
  },
  {
    title: 'Visual Studio',
    items: [
      { text: 'Workflow Builder', icon: <VisualIcon />, path: '/workflows/visual-builder' },
      { text: 'Agent Builder', icon: <BuildIcon />, path: '/agents/builder' },
    ],
  },
  {
    title: 'Monitoring',
    items: [
      { text: 'Executions', icon: <ExecutionsIcon />, path: '/executions' },
      { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
    ],
  },
  {
    title: 'Agents & Knowledge',
    items: [
      { text: 'Agent Library', icon: <AgentLibraryIcon />, path: '/agents/library' },
      { text: 'Agent Manager', icon: <AgentManagerIcon />, path: '/agents/manager' },
      { text: 'Knowledge Base', icon: <KnowledgeBaseIcon />, path: '/knowledge-base' },
    ],
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        },
      }}
    >
      {/* Logo Section */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold',
          }}
        >
          ⚡
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
            SuperAgent
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Multi-Agent Framework
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', py: 2 }}>
        {navSections.map((section, sectionIndex) => (
          <Box key={section.title} sx={{ mb: sectionIndex < navSections.length - 1 ? 3 : 0 }}>
            <Typography
              variant="overline"
              sx={{ px: 3, color: 'text.secondary', fontSize: '0.7rem', display: 'block', mb: 1 }}
            >
              {section.title}
            </Typography>
            <List sx={{ px: 2 }}>
              {section.items.map((item) => (
                <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    selected={isActive(item.path)}
                    sx={{
                      borderRadius: 2,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                        '& .MuiListItemIcon-root': {
                          color: 'white',
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: isActive(item.path) ? 'white' : 'text.secondary',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: isActive(item.path) ? 600 : 500,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
      </Box>

      <Divider />

      {/* Platform Stats */}
      <Box sx={{ p: 3 }}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontSize: '0.7rem' }}
        >
          Platform Stats
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Total Workflows
            </Typography>
            <Typography variant="caption" fontWeight={600}>
              -
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">
              This Month
            </Typography>
            <Typography variant="caption" fontWeight={600} color="success.main">
              $0.00
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* User Profile */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'primary.main',
              fontSize: '0.875rem',
            }}
          >
            {user?.username?.[0]?.toUpperCase() || 'D'}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user?.username || 'Demo User'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.email || 'demo@superagent.ai'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
