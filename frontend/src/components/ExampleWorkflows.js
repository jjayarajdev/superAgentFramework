import React, { useState, useEffect } from 'react';
import './ExampleWorkflows.css';

export default function ExampleWorkflows({ isOpen, onClose, onLoad }) {
  const [examples, setExamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExample, setSelectedExample] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchExamples();
    }
  }, [isOpen]);

  const fetchExamples = async () => {
    try {
      const response = await fetch('/api/v1/examples/');
      const data = await response.json();
      setExamples(data.examples);
    } catch (error) {
      console.error('Failed to fetch examples:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExample = async (example) => {
    try {
      const response = await fetch(`/api/v1/examples/${example.id}/instantiate`, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();

        // Convert example format to ReactFlow format
        const nodes = example.agents.map(agent => ({
          id: agent.id,
          type: 'agent',
          position: agent.position,
          data: {
            label: agent.name,
            agentType: agent.type,
            config: agent.config,
            agentMeta: {
              id: agent.type,
              name: agent.name,
              config_schema: { properties: {} } // Simplified for example
            }
          }
        }));

        const edges = example.edges.map((edge, idx) => ({
          id: `edge_${idx}`,
          source: edge.source,
          target: edge.target
        }));

        onLoad({
          name: example.name,
          nodes,
          edges,
          workflowId: data.workflow_id,
          sampleInput: data.sample_input
        });

        onClose();
      }
    } catch (error) {
      console.error('Failed to load example:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="example-modal-overlay" onClick={onClose}>
      <div className="example-modal" onClick={(e) => e.stopPropagation()}>
        <div className="example-modal-header">
          <h2>📚 Example Workflows</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="example-modal-body">
          {loading ? (
            <div className="example-loading">Loading examples...</div>
          ) : (
            <div className="examples-grid">
              {examples.map((example) => (
                <div
                  key={example.id}
                  className={`example-card ${selectedExample?.id === example.id ? 'selected' : ''}`}
                  onClick={() => setSelectedExample(example)}
                >
                  <div className="example-card-icon">{example.icon}</div>
                  <h3>{example.name}</h3>
                  <p>{example.description}</p>

                  <div className="example-card-meta">
                    <span className="example-category">{example.category}</span>
                    <span className="example-agents">{example.agents.length} agents</span>
                  </div>

                  {selectedExample?.id === example.id && (
                    <div className="example-details">
                      <div className="example-agents-list">
                        <strong>Agents:</strong>
                        <ul>
                          {example.agents.map((agent, idx) => (
                            <li key={idx}>{agent.name}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="example-sample-input">
                        <strong>Sample Input:</strong>
                        <p className="sample-text">{example.sample_input}</p>
                      </div>

                      <button
                        className="load-example-button"
                        onClick={() => loadExample(example)}
                      >
                        ⚡ Load This Example
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
