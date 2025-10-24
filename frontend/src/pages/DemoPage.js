import React, { useState, useEffect } from 'react';
import './DemoPage.css';

export default function DemoPage() {
  const [examples, setExamples] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchExamples();
  }, []);

  const fetchExamples = async () => {
    try {
      const response = await fetch('/api/v1/examples/');
      const data = await response.json();
      setExamples(data.examples);
    } catch (error) {
      console.error('Failed to fetch examples:', error);
    }
  };

  const runAllExamples = async () => {
    setIsRunning(true);
    setResults(null);
    setProgress(0);

    try {
      const response = await fetch('/api/v1/examples/run-all', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
        setProgress(100);
      } else {
        console.error('Failed to run examples');
      }
    } catch (error) {
      console.error('Error running examples:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runSingleExample = async (exampleId) => {
    try {
      // Instantiate
      const instantiateRes = await fetch(`/api/v1/examples/${exampleId}/instantiate`, {
        method: 'POST'
      });

      if (!instantiateRes.ok) return;

      const { workflow_id, sample_input } = await instantiateRes.json();

      // Execute
      const executeRes = await fetch('/api/v1/executions/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow_id,
          input: sample_input
        })
      });

      if (executeRes.ok) {
        const execution = await executeRes.json();

        // Update results with single execution
        const exampleData = examples.find(ex => ex.id === exampleId);
        const singleResult = {
          summary: {
            total_examples: 1,
            successful: execution.status === 'completed' ? 1 : 0,
            failed: execution.status === 'completed' ? 0 : 1,
            total_tokens: execution.metrics?.total_tokens || 0,
            total_cost: execution.metrics?.total_cost || 0
          },
          results: [{
            example_id: exampleId,
            example_name: exampleData.name,
            category: exampleData.category,
            icon: exampleData.icon,
            workflow_id,
            execution_id: execution.id,
            status: execution.status,
            input: sample_input,
            metrics: execution.metrics,
            agent_count: exampleData.agents.length,
            agents_executed: execution.agent_executions?.length || 0,
            success: execution.status === 'completed'
          }]
        };

        setResults(singleResult);
      }
    } catch (error) {
      console.error('Error running example:', error);
    }
  };

  return (
    <div className="demo-page">
      <div className="demo-header">
        <h1>🎭 Interactive Demo</h1>
        <p>Run all example workflows and see live results</p>

        <button
          onClick={runAllExamples}
          disabled={isRunning}
          className="run-all-button"
        >
          {isRunning ? '⏳ Running All Examples...' : '🚀 Run All Examples'}
        </button>
      </div>

      <div className="demo-content">
        {/* Examples Grid */}
        <div className="examples-section">
          <h2>📚 Available Examples ({examples.length})</h2>

          <div className="examples-demo-grid">
            {examples.map((example) => (
              <div key={example.id} className="example-demo-card">
                <div className="example-demo-header">
                  <span className="example-demo-icon">{example.icon}</span>
                  <div>
                    <h3>{example.name}</h3>
                    <span className="example-demo-category">{example.category}</span>
                  </div>
                </div>

                <p className="example-demo-description">{example.description}</p>

                <div className="example-demo-meta">
                  <span>👥 {example.agents.length} agents</span>
                  <span>🔗 {example.edges.length} connections</span>
                </div>

                <div className="example-demo-input">
                  <strong>Input:</strong>
                  <div className="input-preview">{example.sample_input}</div>
                </div>

                <button
                  onClick={() => runSingleExample(example.id)}
                  className="run-single-button"
                  disabled={isRunning}
                >
                  ▶️ Run This One
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="results-section">
            <h2>📊 Execution Results</h2>

            {/* Summary Cards */}
            <div className="summary-cards">
              <div className="summary-card">
                <div className="summary-icon">✅</div>
                <div className="summary-value">{results.summary.successful}</div>
                <div className="summary-label">Successful</div>
              </div>

              <div className="summary-card">
                <div className="summary-icon">❌</div>
                <div className="summary-value">{results.summary.failed}</div>
                <div className="summary-label">Failed</div>
              </div>

              <div className="summary-card">
                <div className="summary-icon">🪙</div>
                <div className="summary-value">{results.summary.total_tokens.toLocaleString()}</div>
                <div className="summary-label">Total Tokens</div>
              </div>

              <div className="summary-card">
                <div className="summary-icon">💰</div>
                <div className="summary-value">${results.summary.total_cost.toFixed(4)}</div>
                <div className="summary-label">Total Cost</div>
              </div>
            </div>

            {/* Individual Results */}
            <div className="individual-results">
              {results.results.map((result, idx) => (
                <div
                  key={idx}
                  className={`result-card ${result.success ? 'success' : 'failed'}`}
                >
                  <div className="result-header">
                    <span className="result-icon">{result.icon}</span>
                    <div className="result-title">
                      <h4>{result.example_name}</h4>
                      <span className={`result-status status-${result.status}`}>
                        {result.status}
                      </span>
                    </div>
                  </div>

                  {result.success ? (
                    <>
                      <div className="result-metrics">
                        <div className="metric">
                          <span className="metric-label">Tokens</span>
                          <span className="metric-value">{result.metrics?.total_tokens || 0}</span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Cost</span>
                          <span className="metric-value">${(result.metrics?.total_cost || 0).toFixed(4)}</span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Latency</span>
                          <span className="metric-value">{result.metrics?.total_latency_ms || 0}ms</span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Agents</span>
                          <span className="metric-value">{result.agents_executed}/{result.agent_count}</span>
                        </div>
                      </div>

                      <div className="result-input">
                        <strong>Input:</strong> {result.input}
                      </div>

                      <div className="result-ids">
                        <code>Workflow: {result.workflow_id}</code>
                        <code>Execution: {result.execution_id}</code>
                      </div>
                    </>
                  ) : (
                    <div className="result-error">
                      ❌ Error: {result.error || 'Execution failed'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
