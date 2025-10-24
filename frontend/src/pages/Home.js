import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const [apiStatus, setApiStatus] = useState('checking...');
  const [agentCount, setAgentCount] = useState(0);
  const [ragStats, setRagStats] = useState(null);

  useEffect(() => {
    // Check API connection
    fetch('/health')
      .then(res => res.json())
      .then(data => setApiStatus(data.status))
      .catch(() => setApiStatus('disconnected'));

    // Get agent count
    fetch('/api/v1/agents/types')
      .then(res => res.json())
      .then(data => setAgentCount(data.agent_types.length))
      .catch(() => setAgentCount(0));

    // Get RAG stats
    fetch('/api/v1/documents/stats/rag')
      .then(res => res.json())
      .then(data => setRagStats(data))
      .catch(() => setRagStats(null));
  }, []);

  return (
    <div className="home">
      <div className="hero">
        <h1>🤖 Welcome to Super Agent Framework</h1>
        <p className="hero-subtitle">Build powerful multi-agent workflows with visual drag-and-drop</p>

        <div className="hero-actions">
          <Link to="/builder" className="hero-button primary">
            🎨 Start Building
          </Link>
          <Link to="/execute" className="hero-button secondary">
            🚀 Execute Workflow
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏥</div>
          <div className="stat-label">API Status</div>
          <div className={`stat-value ${apiStatus === 'healthy' ? 'healthy' : 'unhealthy'}`}>
            {apiStatus}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🤖</div>
          <div className="stat-label">Registered Agents</div>
          <div className="stat-value">{agentCount}</div>
        </div>

        {ragStats && (
          <>
            <div className="stat-card">
              <div className="stat-icon">📄</div>
              <div className="stat-label">Documents Indexed</div>
              <div className="stat-value">{ragStats.documents_count}</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🧩</div>
              <div className="stat-label">Vector Chunks</div>
              <div className="stat-value">{ragStats.total_chunks}</div>
            </div>
          </>
        )}
      </div>

      <div className="features">
        <h2>✨ Features</h2>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Visual Workflow Builder</h3>
            <p>Drag and drop agents onto a canvas. Connect them to create complex multi-agent workflows.</p>
            <Link to="/builder" className="feature-link">Try it →</Link>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚙️</div>
            <h3>Auto-Generated Forms</h3>
            <p>Agent configuration forms are automatically generated from JSON Schema. Zero hardcoding.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔗</div>
            <h3>Agent-to-Agent Data Passing</h3>
            <p>Output from one agent automatically becomes input to the next. Seamless data flow.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>RAG Pipeline</h3>
            <p>Upload documents and get context-aware responses. Powered by Chroma vector database.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Metrics & Tracking</h3>
            <p>Track tokens, costs, and latency for every agent execution. Complete audit trail.</p>
            <Link to="/execute" className="feature-link">Execute →</Link>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔌</div>
            <h3>Extensible Architecture</h3>
            <p>Add new agents in ~60 lines of code. Plugin architecture with auto-discovery.</p>
          </div>
        </div>
      </div>

      <div className="progress">
        <h2>📋 Development Progress</h2>

        <div className="progress-list">
          <div className="progress-item completed">
            <span className="progress-check">✅</span>
            <div>
              <strong>Week 1: Backend Scaffold</strong>
              <p>9 agents, mock data (SFDC, Darwinbox, Outlook)</p>
            </div>
          </div>

          <div className="progress-item completed">
            <span className="progress-check">✅</span>
            <div>
              <strong>Week 2: Multi-Agent Orchestrator</strong>
              <p>Sequential execution, data passing, metrics tracking</p>
            </div>
          </div>

          <div className="progress-item completed">
            <span className="progress-check">✅</span>
            <div>
              <strong>Week 3: RAG Pipeline</strong>
              <p>Document upload, chunking, Chroma vector store, semantic search</p>
            </div>
          </div>

          <div className="progress-item current">
            <span className="progress-check">🚧</span>
            <div>
              <strong>Week 4-5: Visual UI (Current)</strong>
              <p>React Flow workflow builder, agent palette, config forms, execution dashboard</p>
            </div>
          </div>

          <div className="progress-item">
            <span className="progress-check">📅</span>
            <div>
              <strong>Week 6: Polish</strong>
              <p>Animations, example workflows, demo video, screenshots</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
