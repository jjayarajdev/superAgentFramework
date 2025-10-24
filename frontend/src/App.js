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

// Placeholder pages for routes (we'll build these next)
const Workflows = () => <div>Workflows Page - Coming Soon</div>;
const WorkflowBuilder = () => <div>Workflow Builder - Coming Soon</div>;
const Templates = () => <div>Templates - Coming Soon</div>;
const Executions = () => <div>Executions - Coming Soon</div>;
const Analytics = () => <div>Analytics - Coming Soon</div>;
const AgentManager = () => <div>Agent Manager - Coming Soon</div>;
const AgentLibrary = () => <div>Agent Library - Coming Soon</div>;
const KnowledgeBase = () => <div>Knowledge Base - Coming Soon</div>;

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
                <Route path="/workflows" element={<Workflows />} />
                <Route path="/workflows/builder" element={<WorkflowBuilder />} />
                <Route path="/workflows/:id/edit" element={<WorkflowBuilder />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/executions" element={<Executions />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/agents/manager" element={<AgentManager />} />
                <Route path="/agents/library" element={<AgentLibrary />} />
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
