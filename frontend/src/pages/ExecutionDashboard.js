import React, { useState } from 'react';
import './ExecutionDashboard.css';

export default function ExecutionDashboard() {
  const [workflowId, setWorkflowId] = useState(localStorage.getItem('last_workflow_id') || '');
  const [inputText, setInputText] = useState(localStorage.getItem('sample_input') || '');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [error, setError] = useState(null);

  const executeWorkflow = async () => {
    if (!workflowId || !inputText) {
      setError('Please provide both workflow ID and input');
      return;
    }

    setIsExecuting(true);
    setError(null);
    setExecutionResult(null);

    try {
      const response = await fetch('/api/v1/executions/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow_id: workflowId,
          input: inputText
        })
      });

      if (response.ok) {
        const result = await response.json();
        setExecutionResult(result);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Execution failed');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="execution-dashboard">
      <div className="dashboard-header">
        <h1>🚀 Execute Workflow</h1>
        <p>Run your multi-agent workflows and see results in real-time</p>
      </div>

      <div className="execution-form">
        <div className="form-group">
          <label>Workflow ID</label>
          <input
            type="text"
            value={workflowId}
            onChange={(e) => setWorkflowId(e.target.value)}
            placeholder="wf_xxxxxxxx"
            className="form-input"
          />
          <small>Get this from the workflow builder after saving</small>
        </div>

        <div className="form-group">
          <label>Input / Instructions</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="E.g., Find Q4 deals over $100K and send check-in emails"
            className="form-textarea"
            rows="4"
          />
        </div>

        <button
          onClick={executeWorkflow}
          disabled={isExecuting || !workflowId || !inputText}
          className="execute-button"
        >
          {isExecuting ? '⏳ Executing...' : '▶️ Execute Workflow'}
        </button>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}
      </div>

      {executionResult && (
        <div className="execution-results">
          <div className="results-header">
            <h2>✅ Execution Results</h2>
            <div className="execution-id">ID: {executionResult.id}</div>
          </div>

          <div className="results-grid">
            <div className="result-card">
              <div className="card-label">Status</div>
              <div className={`card-value status-${executionResult.status}`}>
                {executionResult.status}
              </div>
            </div>

            {executionResult.metrics && (
              <>
                <div className="result-card">
                  <div className="card-label">Total Tokens</div>
                  <div className="card-value">{executionResult.metrics.total_tokens.toLocaleString()}</div>
                </div>

                <div className="result-card">
                  <div className="card-label">Total Cost</div>
                  <div className="card-value">${executionResult.metrics.total_cost.toFixed(4)}</div>
                </div>

                <div className="result-card">
                  <div className="card-label">Latency</div>
                  <div className="card-value">{executionResult.metrics.total_latency_ms}ms</div>
                </div>
              </>
            )}
          </div>

          {executionResult.agent_executions && (
            <div className="agent-timeline">
              <h3>📊 Agent Timeline</h3>
              {executionResult.agent_executions.map((agent, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-marker">{idx + 1}</div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <h4>{agent.agent_name}</h4>
                      <span className={`timeline-status status-${agent.status}`}>
                        {agent.status}
                      </span>
                    </div>
                    <div className="timeline-metrics">
                      <span>🪙 {agent.metrics.tokens_used} tokens</span>
                      <span>💰 ${agent.metrics.cost.toFixed(4)}</span>
                      <span>⏱️ {agent.metrics.latency_ms}ms</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {executionResult.results && (
            <div className="result-output">
              <h3>📄 Output</h3>
              <pre className="output-pre">
                {JSON.stringify(executionResult.results, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
