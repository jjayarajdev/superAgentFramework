import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home';
import WorkflowBuilder from './pages/WorkflowBuilder';
import ExecutionDashboard from './pages/ExecutionDashboard';
import DemoPage from './pages/DemoPage';
import AgentBuilder from './pages/AgentBuilder';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="navbar-brand">
            <span className="navbar-logo">🤖</span>
            <span className="navbar-title">Super Agent Framework</span>
          </div>
          <div className="navbar-links">
            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              🏠 Home
            </NavLink>
            <NavLink to="/builder" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              🎨 Workflow Builder
            </NavLink>
            <NavLink to="/execute" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              🚀 Execute
            </NavLink>
            <NavLink to="/demo" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              🎭 Demo
            </NavLink>
            <NavLink to="/agent-builder" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              🛠️ Agent Builder
            </NavLink>
            <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="nav-link external">
              📚 API Docs
            </a>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/builder" element={<WorkflowBuilder />} />
          <Route path="/execute" element={<ExecutionDashboard />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/agent-builder" element={<AgentBuilder />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
