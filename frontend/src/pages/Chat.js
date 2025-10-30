import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Stack,
  Tooltip,
  alpha,
  Tabs,
  Tab,
  Grid,
  Button,
  Badge,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  AutoAwesome as SparkleIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
  TrendingUp as SalesIcon,
  Group as HRIcon,
  BugReport as SupportIcon,
  Notifications as NotifyIcon,
  Psychology as AIIcon,
  Rocket as RocketIcon,
  AccountTree as WorkflowIcon,
  FlashOn as QuickIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { workflowsAPI } from '../api';

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "👋 Hi! I'm your AI assistant.\n\nI can help you:\n• **Execute workflows** - Run any saved workflow\n• **Track execution status** - Monitor workflow progress\n• **View results** - See execution outputs and logs\n\nClick on a workflow below or type your request!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [showQuestions, setShowQuestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch workflows from API
  const { data: workflows = [] } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const response = await api.get('/api/v1/workflows/');
      return response.data;
    },
  });

  // Pre-defined questions based on workflows
  const workflowQuestions = workflows.slice(0, 8).map((wf) => ({
    id: wf.id,
    question: `Execute: ${wf.name}`,
    description: wf.description || 'Run this workflow',
    icon: WorkflowIcon,
    category: wf.category || 'workflow',
    type: 'workflow',
  }));

  // Ad-hoc multi-agent questions (Dynamic Orchestration)
  // These are UNIQUE combinations NOT covered by existing workflows
  const adhocQuestions = [
    {
      id: 'adhoc_1',
      question: 'Compare Stripe revenue with Salesforce forecast and email CFO',
      description: 'Cross-platform financial analysis: Stripe + Salesforce + Email',
      icon: QuickIcon,
      category: 'finance',
      type: 'adhoc',
    },
    {
      id: 'adhoc_2',
      question: 'Find employees with upcoming birthdays and send Slack celebrations',
      description: 'HR analytics + team engagement: Workday + Slack',
      icon: HRIcon,
      category: 'hr',
      type: 'adhoc',
    },
    {
      id: 'adhoc_3',
      question: 'Analyze Zendesk satisfaction scores and update HubSpot contacts',
      description: 'Customer feedback loop: Zendesk → HubSpot CRM sync',
      icon: SupportIcon,
      category: 'analytics',
      type: 'adhoc',
    },
    {
      id: 'adhoc_4',
      question: 'Check ServiceNow SLA breaches and escalate to Jira with email alert',
      description: 'Multi-step escalation: ServiceNow → Jira → Email (3 agents)',
      icon: NotifyIcon,
      category: 'operations',
      type: 'adhoc',
    },
    {
      id: 'adhoc_5',
      question: 'Pull top HubSpot leads, enrich with Salesforce, and schedule emails',
      description: 'Lead enrichment pipeline: HubSpot + Salesforce + Email',
      icon: SalesIcon,
      category: 'marketing',
      type: 'adhoc',
    },
    {
      id: 'adhoc_6',
      question: 'Find dormant Jira projects and notify managers via email and Slack',
      description: 'Project health check: Jira → Email + Slack dual notification',
      icon: RocketIcon,
      category: 'project-mgmt',
      type: 'adhoc',
    },
    {
      id: 'adhoc_7',
      question: 'Calculate Stripe churn rate and create HubSpot re-engagement campaign',
      description: 'Retention automation: Stripe analysis → HubSpot marketing',
      icon: QuickIcon,
      category: 'retention',
      type: 'adhoc',
    },
    {
      id: 'adhoc_8',
      question: 'Sync SAP purchase orders with Workday expenses and flag anomalies',
      description: 'Finance reconciliation: SAP + Workday + anomaly detection',
      icon: SalesIcon,
      category: 'finance',
      type: 'adhoc',
    },
  ];

  // All predefined questions
  const allQuestions = [
    ...workflowQuestions,
    ...adhocQuestions,
  ];

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mutation for executing workflows
  const executeWorkflowMutation = useMutation({
    mutationFn: ({ workflowId, workflowName }) => {
      return workflowsAPI.execute({ id: workflowId, input: {} });
    },
    onSuccess: (data, variables) => {
      const executionId = data.execution_id || data.id;
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `✅ Successfully started execution of "${variables.workflowName}"!\n\nExecution ID: ${executionId}\n\nYou can monitor the progress in the Executions page.`,
        workflow: variables.workflowName,
        execution_id: executionId,
        execution_status: 'RUNNING',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    },
    onError: (error, variables) => {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `❌ Failed to execute "${variables.workflowName}": ${error.response?.data?.detail || error.message}`,
        isError: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    },
  });

  // Mutation for sending messages (for general chat)
  const sendMessageMutation = useMutation({
    mutationFn: async (message) => {
      const response = await api.post('/api/v1/chat/message', {
        message,
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Add assistant response
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.response || 'I processed your request.',
        workflow: data.workflow_executed,
        agents_used: data.agents_used,
        execution_id: data.execution_id,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    },
    onError: (error) => {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `❌ Sorry, I encountered an error: ${error.response?.data?.detail || error.message}`,
        isError: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Send to API
    sendMessageMutation.mutate(input);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (question) => {
    setInput(typeof question === 'string' ? question : question.question);
    inputRef.current?.focus();
  };

  const handleQuestionClick = (question) => {
    const text = question.question;

    // Add user message
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date(),
      questionType: question.type,
    };

    setMessages((prev) => [...prev, userMessage]);

    // If it's a workflow question, execute directly
    if (question.type === 'workflow' && question.id) {
      const workflow = workflows.find(w => w.id === question.id);
      if (workflow) {
        executeWorkflowMutation.mutate({
          workflowId: workflow.id,
          workflowName: workflow.name,
        });
        return;
      }
    }

    // Otherwise send to chat API
    sendMessageMutation.mutate(text);
  };

  // Filter questions by active tab
  const getFilteredQuestions = () => {
    if (activeTab === 0) return allQuestions;
    if (activeTab === 1) return workflowQuestions;
    if (activeTab === 2) return adhocQuestions;
    return allQuestions;
  };

  const filteredQuestions = getFilteredQuestions();

  return (
    <Box
      sx={{
        height: 'calc(100vh - 120px)',
        display: 'flex',
        gap: 2,
        p: 3,
        maxWidth: '1600px',
        margin: '0 auto',
      }}
    >
      {/* Left Sidebar - Quick Actions */}
      <Paper
        elevation={2}
        sx={{
          width: '320px',
          minWidth: '320px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: alpha('#f5f5f5', 0.3),
          overflow: 'hidden',
        }}
      >
        {/* Sidebar Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <QuickIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Quick Actions
            </Typography>
          </Box>
          <Chip
            label={`${filteredQuestions.length} available`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>

        {/* Tabs for categorization */}
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ px: 2, pt: 1, borderBottom: 1, borderColor: 'divider' }}
          variant="fullWidth"
        >
          <Tab label={`All (${allQuestions.length})`} sx={{ minWidth: 0, fontSize: '0.75rem' }} />
          <Tab
            label={`Workflows (${workflowQuestions.length})`}
            sx={{ minWidth: 0, fontSize: '0.75rem' }}
          />
          <Tab
            label={`Dynamic (${adhocQuestions.length})`}
            sx={{ minWidth: 0, fontSize: '0.75rem' }}
          />
        </Tabs>

        {/* Scrollable Question List */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <Stack spacing={1.5}>
            {filteredQuestions.map((q) => (
              <QuestionCardCompact key={q.id} question={q} onClick={() => handleQuestionClick(q)} />
            ))}
          </Stack>
        </Box>
      </Paper>

      {/* Right Side - Chat Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            <SparkleIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
            AI Assistant
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ask questions in natural language - I'll intelligently route them using GPT-4
          </Typography>
        </Box>

        {/* Messages Container */}
        <Paper
          elevation={2}
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 3,
            mb: 2,
            backgroundColor: alpha('#f5f5f5', 0.5),
          }}
        >
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* Loading indicator */}
          {(sendMessageMutation.isPending || executeWorkflowMutation.isPending) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <BotIcon />
              </Avatar>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                {executeWorkflowMutation.isPending ? 'Executing workflow...' : 'Thinking...'}
              </Typography>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Paper>

        {/* Input Area */}
        <Paper elevation={3} sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything... (Press Enter to send)"
              variant="outlined"
              inputRef={inputRef}
              disabled={sendMessageMutation.isPending}
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={!input.trim() || sendMessageMutation.isPending || executeWorkflowMutation.isPending}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                '&:disabled': { bgcolor: 'action.disabledBackground' },
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

// Message Bubble Component
const MessageBubble = ({ message }) => {
  const navigate = useNavigate();
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 3,
        gap: 2,
      }}
    >
      {!isUser && (
        <Avatar sx={{ bgcolor: isError ? 'error.main' : 'primary.main' }}>
          <BotIcon />
        </Avatar>
      )}

      <Box sx={{ maxWidth: '70%' }}>
        <Paper
          elevation={1}
          sx={{
            p: 2,
            bgcolor: isUser ? 'primary.main' : isError ? alpha('#f44336', 0.1) : 'white',
            color: isUser ? 'white' : 'text.primary',
            borderRadius: 2,
          }}
        >
          <Typography
            variant="body1"
            sx={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {message.content}
          </Typography>

          {/* Show workflow/agent info */}
          {message.workflow && (
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                <SuccessIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                Executed workflow: {message.workflow}
              </Typography>

              {message.agents_used && message.agents_used.length > 0 && (
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                  {message.agents_used.map((agent, index) => (
                    <Chip
                      key={index}
                      label={agent}
                      size="small"
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  ))}
                </Stack>
              )}

              {message.execution_id && (
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Execution ID: {message.execution_id}
                    </Typography>
                    {message.execution_status && (
                      <Chip
                        label={message.execution_status}
                        size="small"
                        color={message.execution_status === 'COMPLETED' ? 'success' : 'info'}
                        sx={{ height: 18, fontSize: '0.65rem' }}
                      />
                    )}
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigate('/executions')}
                    sx={{ mt: 0.5 }}
                  >
                    View Execution Details
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Paper>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 0.5, ml: 1 }}
        >
          {message.timestamp.toLocaleTimeString()}
        </Typography>
      </Box>

      {isUser && (
        <Avatar sx={{ bgcolor: 'secondary.main' }}>
          <PersonIcon />
        </Avatar>
      )}
    </Box>
  );
};

// Compact Question Card Component for Sidebar
const QuestionCardCompact = ({ question, onClick }) => {
  const Icon = question.icon;
  const isWorkflow = question.type === 'workflow';
  const isAdhoc = question.type === 'adhoc';

  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s',
        border: '1px solid',
        borderColor: isAdhoc ? 'success.light' : isWorkflow ? 'primary.light' : 'divider',
        '&:hover': {
          boxShadow: 3,
          borderColor: isAdhoc ? 'success.main' : isWorkflow ? 'primary.main' : 'primary.light',
          transform: 'translateX(4px)',
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
          <Avatar
            sx={{
              bgcolor: isAdhoc
                ? alpha('#4caf50', 0.1)
                : isWorkflow
                ? alpha('#1976d2', 0.1)
                : alpha('#9c27b0', 0.1),
              color: isAdhoc ? 'success.main' : isWorkflow ? 'primary.main' : 'secondary.main',
              width: 32,
              height: 32,
            }}
          >
            <Icon sx={{ fontSize: 18 }} />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Chip
              label={isAdhoc ? 'Dynamic' : isWorkflow ? 'Workflow' : 'Quick'}
              size="small"
              sx={{
                height: 18,
                fontSize: '0.65rem',
                bgcolor: isAdhoc
                  ? alpha('#4caf50', 0.1)
                  : isWorkflow
                  ? alpha('#1976d2', 0.1)
                  : alpha('#9c27b0', 0.1),
                color: isAdhoc ? 'success.main' : isWorkflow ? 'primary.main' : 'secondary.main',
              }}
            />
          </Box>
        </Box>

        <Typography
          variant="body2"
          fontWeight="600"
          sx={{
            mb: 0.5,
            lineHeight: 1.3,
            fontSize: '0.85rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {question.question}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            fontSize: '0.7rem',
            lineHeight: 1.2,
          }}
        >
          {question.description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Chat;
