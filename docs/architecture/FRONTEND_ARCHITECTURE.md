# SuperAgent Frontend Architecture Plan

## Overview
Building a polished, enterprise-grade React frontend to match the screen-reference designs.

---

## Technology Stack

### Core Framework
- **React 18.x** - Latest stable with concurrent features
- **React Router v6** - Client-side routing
- **TypeScript** - Type safety (optional but recommended)

### UI Framework
- **Material-UI (MUI) v5** - Comprehensive component library
  - Matches the modern, professional look in screen references
  - Built-in theming system
  - Excellent documentation and community support
  - Pre-built components for tables, cards, dialogs, etc.

### State Management
- **React Context + useReducer** - For auth and global state
- **TanStack Query (React Query)** - Server state management
  - Automatic caching, background updates
  - Perfect for API data fetching
  - Built-in loading/error states

### Workflow Canvas
- **React Flow** - Visual workflow builder
  - Drag-and-drop node-based editor
  - Handles graph rendering, edges, zoom, pan
  - Customizable nodes and edges

### Charts & Analytics
- **Recharts** - React chart library
  - Composable chart components
  - Responsive by default
  - Clean, modern design

### Form Handling
- **React Hook Form** - Performant form validation
- **Yup** - Schema validation

### HTTP Client
- **Axios** - With interceptors for auth

### Additional Libraries
- **date-fns** - Date formatting
- **react-dropzone** - File uploads (Knowledge Base)
- **react-toastify** - Toast notifications
- **framer-motion** - Smooth animations

---

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── api/                    # API client & endpoints
│   │   ├── client.js           # Axios instance with interceptors
│   │   ├── auth.js             # Auth endpoints
│   │   ├── workflows.js        # Workflow CRUD
│   │   ├── executions.js       # Execution monitoring
│   │   ├── agents.js           # Agent management
│   │   ├── documents.js        # Knowledge base
│   │   └── analytics.js        # Analytics data
│   │
│   ├── components/             # Reusable components
│   │   ├── common/             # Shared UI components
│   │   │   ├── Layout.js       # Main layout with sidebar
│   │   │   ├── Sidebar.js      # Navigation sidebar
│   │   │   ├── Header.js       # Top header bar
│   │   │   ├── LoadingSpinner.js
│   │   │   ├── EmptyState.js   # Empty state illustrations
│   │   │   ├── StatCard.js     # Metric cards
│   │   │   └── SearchBar.js
│   │   │
│   │   ├── auth/               # Authentication components
│   │   │   ├── Login.js
│   │   │   ├── PrivateRoute.js
│   │   │   └── UserProfile.js
│   │   │
│   │   ├── workflows/          # Workflow-specific components
│   │   │   ├── WorkflowCard.js
│   │   │   ├── WorkflowList.js
│   │   │   ├── WorkflowCanvas.js    # React Flow canvas
│   │   │   └── WorkflowStats.js
│   │   │
│   │   ├── agents/             # Agent components
│   │   │   ├── AgentCard.js
│   │   │   ├── AgentLibrary.js
│   │   │   ├── AgentNode.js    # Canvas node
│   │   │   └── AgentPalette.js # Drag source
│   │   │
│   │   ├── executions/         # Execution components
│   │   │   ├── ExecutionCard.js
│   │   │   ├── ExecutionList.js
│   │   │   ├── ExecutionDetails.js
│   │   │   └── StatusBadge.js
│   │   │
│   │   ├── analytics/          # Chart components
│   │   │   ├── CostOverTime.js
│   │   │   ├── TokenDistribution.js
│   │   │   ├── SuccessRate.js
│   │   │   └── ExecutionTrends.js
│   │   │
│   │   └── templates/          # Template components
│   │       ├── TemplateCard.js
│   │       └── TemplateGrid.js
│   │
│   ├── pages/                  # Page components (routes)
│   │   ├── Dashboard.js        # Home dashboard
│   │   ├── WorkflowList.js     # Workflows page
│   │   ├── WorkflowBuilder.js  # Visual builder
│   │   ├── Templates.js        # Template library
│   │   ├── Executions.js       # Execution monitoring
│   │   ├── Analytics.js        # Analytics dashboard
│   │   ├── AgentManager.js     # Agent management
│   │   ├── AgentLibrary.js     # Browse agents
│   │   ├── KnowledgeBase.js    # Document upload
│   │   └── Login.js            # Login page
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.js          # Authentication hook
│   │   ├── useWorkflows.js     # Workflow queries
│   │   ├── useExecutions.js    # Execution queries
│   │   ├── useAgents.js        # Agent queries
│   │   └── useAnalytics.js     # Analytics data
│   │
│   ├── context/                # React Context providers
│   │   ├── AuthContext.js      # Auth state
│   │   └── ThemeContext.js     # Theme customization
│   │
│   ├── utils/                  # Utility functions
│   │   ├── formatters.js       # Date, currency formatting
│   │   ├── validators.js       # Validation helpers
│   │   └── constants.js        # App constants
│   │
│   ├── theme/                  # MUI theme configuration
│   │   └── theme.js            # Custom theme
│   │
│   ├── App.js                  # Main app component
│   ├── index.js                # Entry point
│   └── routes.js               # Route definitions
│
├── package.json
└── .env
```

---

## Page Breakdown (Based on Screen References)

### 1. Dashboard Page (Screenshot 7.42.10)
**Route:** `/dashboard` or `/`

**Components:**
- Hero section with "Build Multi-Agent Workflows" headline
- CTA buttons: "Create Workflow", "View Executions"
- 4 Metric cards:
  - Total Workflows (with trend)
  - Completed (with total runs)
  - Total Cost (with monthly change)
  - Avg. Latency (with weekly comparison)
- Platform Features section (cards grid)
- Your Workflows section (list)
- Recent Executions section (list)

**API Calls:**
- `GET /workflows` - List workflows
- `GET /executions` - Recent executions
- `GET /analytics/summary` - Dashboard metrics

---

### 2. Workflow Builder (Screenshot 7.42.17)
**Route:** `/workflows/builder` or `/workflows/:id/edit`

**Components:**
- Left sidebar: Agent Library with search
  - Tabs: All / Sales / Custom
  - Agent cards with icons, names, descriptions
  - Tags for connectors (Salesforce, HubSpot, etc.)
  - Tags for capabilities (Deal Analysis, Lead Scoring, etc.)
  - Match percentage badges
- Center canvas: React Flow workflow builder
  - Drag-and-drop from agent library
  - Connect agents with edges
  - Zoom, pan controls
  - Empty state: "Start Building Your Workflow"
- Right panel: Agent configuration
  - Edit agent properties
  - Configure inputs/outputs
- Top bar: Workflow name, Save, Execute buttons

**Libraries:**
- React Flow for canvas
- React DnD for drag-and-drop

**API Calls:**
- `GET /agents` - Fetch available agents
- `POST /workflows` - Create workflow
- `PUT /workflows/:id` - Update workflow
- `POST /executions` - Execute workflow

---

### 3. Templates Page (Screenshot 7.42.21 & 7.42.24)
**Route:** `/templates`

**Components:**
- Header: "Workflow Templates" with subtitle
- Template grid (2 columns):
  - **Sales Automation** (Sales Deal Outreach)
    - Description
    - Agents included: Sales Intelligence, Email Outreach
    - Est. Cost, Avg. Time
    - "Use This Template" button
  - **HR Automation** (Employee Onboarding)
    - Description
    - Agents: HR Data Retrieval, Email Outreach
    - Est. Cost, Avg. Time
  - **Knowledge Management** (Document Summarization)
    - Agents: Document Processor, Summary Generator
  - **Customer Success** (Customer Support Triage)
    - Agents: Ticket Analyzer, Knowledge Retrieval, Response Generator
- "Need a Custom Template?" CTA section
  - "Build from Scratch" button
  - "Request Custom Template" button

**API Calls:**
- `GET /examples` - Fetch workflow templates
- `POST /workflows/from-template` - Create from template

---

### 4. Executions Page (Screenshot 7.42.27)
**Route:** `/executions`

**Components:**
- Header: "Workflow Executions"
- 5 Stat cards:
  - Total (with play icon)
  - Completed (with checkmark)
  - Running (with clock)
  - Failed (with X)
  - Total Cost (with dollar sign)
- Search bar
- Execution History list:
  - Workflow name
  - Date & time
  - Status badge (running, completed, failed)
  - Metrics: Tokens (0), Cost ($0.000), Latency (0ms), Agents (0)
  - Expandable for details

**Real-time Updates:**
- WebSocket or polling for live status updates

**API Calls:**
- `GET /executions` - List executions (paginated)
- `GET /executions/:id` - Execution details
- `GET /analytics/executions` - Execution stats

---

### 5. Analytics Page (Screenshot 7.42.30)
**Route:** `/analytics`

**Components:**
- Header: "Analytics Dashboard"
- 4 Metric cards:
  - Total Spend ($0.00 with -8% vs last period)
  - Total Tokens (0.0K with improvement)
  - Success Rate (0% with +75% improvement)
  - Avg. Latency (0ms with -25% vs last)
- Chart 1: Cost Over Time (line chart)
  - Daily AI spending trends
- Chart 2: Token Distribution (pie/bar chart)
  - Usage by agent type
- Chart 3: Execution Trends (line chart)
  - Success vs failure rates over time
- Chart 4: Workflow Performance (bar chart)
  - Average cost per workflow

**Libraries:**
- Recharts for all visualizations

**API Calls:**
- `GET /analytics/cost` - Cost over time data
- `GET /analytics/tokens` - Token usage breakdown
- `GET /analytics/success-rate` - Success metrics
- `GET /analytics/performance` - Workflow performance

---

### 6. Agent Manager (Screenshot 7.42.36)
**Route:** `/agents/manager`

**Components:**
- Header: "Agent Manager" with "Create Custom Agent" button
- 4 Stat cards:
  - Total Agents (4)
  - Enabled (4)
  - Custom (0)
  - Built-in (4)
- Search bar
- Agent grid:
  - Agent cards with:
    - Icon
    - Name
    - "Built-in" badge
    - Description
    - Category tag
    - Connectors (badges)
    - Capabilities (badges)
    - Est. Cost, Latency

**API Calls:**
- `GET /agents` - List all agents
- `POST /agents` - Create custom agent
- `PUT /agents/:id` - Update agent
- `DELETE /agents/:id` - Delete agent

---

### 7. Agent Library (Screenshot 7.42.41)
**Route:** `/agents/library`

**Components:**
- Header: "Agent Library" with search
- Filter dropdown: "All Categories"
- Agent grid (2 columns):
  - **Sales Intelligence Agent** (Sales, 82% match)
    - Description: Query CRM systems...
    - Connectors: Salesforce, HubSpot, Pipedrive
    - Capabilities: Deal Analysis, Lead Scoring, Revenue Forecasting
    - Est. Cost: $0.015/run, Latency: 1.2s
  - **Email Outreach Agent** (Communication, 85% match)
    - Connectors: Outlook, Gmail, SendGrid
    - Capabilities: Personalization, RAG Citations, A/B Testing
    - Est. Cost: $0.010/run, Latency: 2.6s
  - **Data Retrieval Agent** (Data, 76% match)
  - **Generic Action Agent** (Integration, 72% match)

**Features:**
- Match percentage based on usage patterns
- Filter by category, connectors, capabilities
- Sort by cost, latency, match %

**API Calls:**
- `GET /agents/library` - Browse agent catalog with filters

---

### 8. Knowledge Base (Screenshot 7.42.45)
**Route:** `/knowledge-base` or `/documents`

**Components:**
- Header: "Knowledge Base" with "Upload Documents" button
- Search bar
- Empty state:
  - Document icon
  - "No documents uploaded"
  - Description: "Upload PDFs, text files, or Word documents..."
  - "Upload Your First Document" button
- When populated:
  - Document list with:
    - File name
    - File type
    - Size
    - Upload date
    - Actions (view, delete)

**Features:**
- Drag-and-drop upload
- Multiple file upload
- File type validation (PDF, TXT, DOCX)
- Upload progress indicators

**Libraries:**
- react-dropzone for file uploads

**API Calls:**
- `GET /documents` - List documents
- `POST /documents/upload` - Upload document
- `DELETE /documents/:id` - Delete document

---

## Theme Configuration (MUI)

```javascript
// theme/theme.js
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#4F46E5', // Indigo (from screenshots)
      light: '#6366F1',
      dark: '#4338CA',
    },
    secondary: {
      main: '#10B981', // Green (for success states)
      light: '#34D399',
      dark: '#059669',
    },
    error: {
      main: '#EF4444', // Red (for failures)
    },
    warning: {
      main: '#F59E0B', // Orange
    },
    success: {
      main: '#10B981', // Green
    },
    background: {
      default: '#F9FAFB', // Light gray background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111827',
      secondary: '#6B7280',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none', // Keep original case
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        },
      },
    },
  },
});
```

---

## API Client Setup

```javascript
// api/client.js
import axios from 'axios';

const client = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
```

---

## React Query Setup

```javascript
// App.js
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
      {/* App content */}
    </QueryClientProvider>
  );
}
```

---

## Custom Hooks Examples

```javascript
// hooks/useWorkflows.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWorkflows, createWorkflow, updateWorkflow, deleteWorkflow } from '../api/workflows';

export const useWorkflows = () => {
  return useQuery({
    queryKey: ['workflows'],
    queryFn: getWorkflows,
  });
};

export const useCreateWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });
};

// Similar patterns for other resources
```

---

## Routing Structure

```javascript
// App.js
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme/theme';
import Layout from './components/common/Layout';
import PrivateRoute from './components/auth/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WorkflowList from './pages/WorkflowList';
import WorkflowBuilder from './pages/WorkflowBuilder';
import Templates from './pages/Templates';
import Executions from './pages/Executions';
import Analytics from './pages/Analytics';
import AgentManager from './pages/AgentManager';
import AgentLibrary from './pages/AgentLibrary';
import KnowledgeBase from './pages/KnowledgeBase';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workflows" element={<WorkflowList />} />
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
    </ThemeProvider>
  );
}

export default App;
```

---

## Implementation Phases

### Phase 1: Foundation (Days 1-2)
- ✅ Set up project with CRA or Vite
- ✅ Install all dependencies
- ✅ Configure MUI theme
- ✅ Set up React Router
- ✅ Create API client with Axios
- ✅ Set up React Query
- ✅ Build Layout component (Sidebar + Header)
- ✅ Build auth flow (Login, PrivateRoute)

### Phase 2: Core Pages (Days 3-5)
- ✅ Dashboard page with metrics
- ✅ Workflow List page
- ✅ Templates page
- ✅ Executions page
- ✅ Agent Library page
- ✅ Knowledge Base page

### Phase 3: Workflow Builder (Days 6-8)
- ✅ Integrate React Flow
- ✅ Build agent palette (drag source)
- ✅ Build workflow canvas (drop target)
- ✅ Implement node connections
- ✅ Add agent configuration panel
- ✅ Save/load workflow functionality

### Phase 4: Analytics & Agent Manager (Days 9-10)
- ✅ Analytics dashboard
- ✅ Integrate Recharts
- ✅ Build all chart components
- ✅ Agent Manager page
- ✅ Custom agent creation

### Phase 5: Polish & Features (Days 11-12)
- ✅ Animations with Framer Motion
- ✅ Toast notifications
- ✅ Error boundaries
- ✅ Loading states
- ✅ Empty states
- ✅ Responsive design
- ✅ Performance optimization

### Phase 6: Testing & Deployment (Days 13-14)
- ✅ Manual testing all flows
- ✅ Fix bugs
- ✅ Performance testing
- ✅ Build production bundle
- ✅ Documentation
- ✅ Deployment setup

---

## Key Design Patterns

### 1. Consistent Card Layout
All list items use a consistent card design:
- White background
- Rounded corners (12px)
- Subtle shadow
- Hover effect
- Icon/avatar on left
- Title and description
- Metadata badges
- Actions on right

### 2. Color-Coded Status
- **Blue**: Running, Info
- **Green**: Success, Completed
- **Red**: Failed, Error
- **Orange**: Warning, Pending
- **Purple**: Custom, Special

### 3. Empty States
Every list/collection has an empty state with:
- Icon illustration
- Clear message
- Description
- CTA button

### 4. Loading States
- Skeleton loaders for lists
- Spinner for page loads
- Progress bars for uploads

### 5. Responsive Design
- Desktop-first (screen references are desktop)
- Sidebar collapses on mobile
- Grid -> Stack on small screens

---

## Performance Considerations

1. **Code Splitting**
   - Lazy load pages with React.lazy()
   - Suspense boundaries

2. **Memoization**
   - useMemo for expensive calculations
   - React.memo for heavy components
   - useCallback for event handlers

3. **Virtualization**
   - Use react-virtual for long lists
   - Pagination for large datasets

4. **Image Optimization**
   - Use WebP format
   - Lazy load images
   - Responsive images

5. **Bundle Size**
   - Tree-shaking enabled
   - Analyze bundle with webpack-bundle-analyzer
   - Consider MUI's tree-shakeable imports

---

## Accessibility (a11y)

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Focus management
- Color contrast ratios (WCAG AA)
- Screen reader testing

---

## Testing Strategy

1. **Component Tests** - Jest + React Testing Library
2. **Integration Tests** - Test user flows
3. **E2E Tests** - Cypress or Playwright (optional)
4. **Visual Regression** - Chromatic or Percy (optional)

---

## Deployment

### Development
```bash
npm start
```

### Production Build
```bash
npm run build
```

### Environment Variables
```
REACT_APP_API_URL=https://api.superagent.com
REACT_APP_WS_URL=wss://api.superagent.com/ws
```

---

## Next Steps

1. Start with Phase 1: Foundation setup
2. Build core layout and navigation
3. Implement Dashboard as first complete page
4. Iterate through remaining pages
5. Polish and optimize

Let's begin! 🚀
