import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from './theme/theme';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/common/Layout';
import PrivateRoute from './components/auth/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Templates from './pages/Templates';
import Executions from './pages/Executions';
import AgentLibrary from './pages/AgentLibrary';
import KnowledgeBase from './pages/KnowledgeBase';
import AgentManager from './pages/AgentManager';
import Analytics from './pages/Analytics';
import Workflows from './pages/Workflows';
import WorkflowBuilder from './pages/WorkflowBuilder';
import VisualWorkflowBuilder from './pages/VisualWorkflowBuilder';
import AgentEditor from './pages/AgentEditor';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />

              {/* Protected Routes */}
              <Route
                element={
                  <PrivateRoute>
                    <Layout />
                  </PrivateRoute>
                }
              >
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/workflows" element={<Workflows />} />
                <Route path="/workflows/builder" element={<WorkflowBuilder />} />
                <Route path="/workflows/:id/edit" element={<WorkflowBuilder />} />
                <Route path="/workflows/visual-builder" element={<VisualWorkflowBuilder />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/executions" element={<Executions />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/agents/manager" element={<AgentManager />} />
                <Route path="/agents/library" element={<AgentLibrary />} />
                <Route path="/agents/builder" element={<AgentEditor />} />
                <Route path="/agents/:id/edit" element={<AgentEditor />} />
                <Route path="/knowledge-base" element={<KnowledgeBase />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
