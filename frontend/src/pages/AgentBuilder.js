import React, { useState } from 'react';
import './AgentBuilder.css';

export default function AgentBuilder() {
  const [step, setStep] = useState(1);
  const [agentData, setAgentData] = useState({
    name: '',
    id: '',
    category: 'action',
    description: '',
    icon: '',
    template: 'custom',
    configFields: []
  });

  const [newField, setNewField] = useState({
    name: '',
    type: 'string',
    description: '',
    required: false,
    default: ''
  });

  const categories = [
    { id: 'data_retrieval', name: 'Data Retrieval', icon: '📊', description: 'Query and fetch data from external sources' },
    { id: 'action', name: 'Action', icon: '⚡', description: 'Perform actions like create, update, delete' },
    { id: 'communication', name: 'Communication', icon: '💬', description: 'Send messages and notifications' },
    { id: 'analysis', name: 'Analysis', icon: '🧠', description: 'Analyze and process data' },
    { id: 'automation', name: 'Automation', icon: '🤖', description: 'Automated workflows and tasks' }
  ];

  const templates = [
    { id: 'custom', name: 'Custom Agent', description: 'Start from scratch' },
    { id: 'rest_api', name: 'REST API Agent', description: 'Query REST APIs and return data' },
    { id: 'webhook', name: 'Webhook Agent', description: 'Send data to webhook endpoints' },
    { id: 'database', name: 'Database Query', description: 'Execute SQL queries' },
    { id: 'file_processor', name: 'File Processor', description: 'Process CSV, JSON, Excel files' },
    { id: 'llm_processor', name: 'LLM Processor', description: 'Use AI to analyze data' }
  ];

  const fieldTypes = [
    { id: 'string', name: 'Text' },
    { id: 'integer', name: 'Number' },
    { id: 'boolean', name: 'True/False' },
    { id: 'array', name: 'List' },
    { id: 'object', name: 'JSON Object' },
    { id: 'enum', name: 'Dropdown' }
  ];

  const handleBasicInfoChange = (field, value) => {
    setAgentData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate ID from name
    if (field === 'name') {
      const autoId = value.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
      setAgentData(prev => ({ ...prev, id: autoId }));
    }
  };

  const addConfigField = () => {
    if (!newField.name) return;

    setAgentData(prev => ({
      ...prev,
      configFields: [...prev.configFields, { ...newField, id: Date.now() }]
    }));

    setNewField({
      name: '',
      type: 'string',
      description: '',
      required: false,
      default: ''
    });
  };

  const removeConfigField = (id) => {
    setAgentData(prev => ({
      ...prev,
      configFields: prev.configFields.filter(f => f.id !== id)
    }));
  };

  const generateAgent = async () => {
    try {
      const response = await fetch('/api/v1/agents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData)
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Agent created successfully!\n\nAgent ID: ${result.agent_id}\n\nRestart the backend to use it.`);
        // Reset form
        setStep(1);
        setAgentData({
          name: '',
          id: '',
          category: 'action',
          description: '',
          icon: '',
          template: 'custom',
          configFields: []
        });
      } else {
        const error = await response.json();
        alert(`Failed to create agent: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error generating agent:', error);
      alert('Error generating agent. Check console for details.');
    }
  };

  const exportCode = () => {
    // Generate Python code preview
    const code = generatePythonCode(agentData);
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agentData.id}_agent.py`;
    a.click();
  };

  const generatePythonCode = (data) => {
    return `"""
${data.description}
"""
from typing import Dict, Any, Optional
from pydantic import Field

from agents.base import (
    BaseAgent, AgentConfigSchema, AgentExecutionResult,
    AgentCategory, register_agent
)


class ${data.name.replace(/\s/g, '')}Config(AgentConfigSchema):
    """Configuration schema for ${data.name}."""

    connector: str = Field(
        default="${data.id}",
        description="Connector to use (${data.id})"
    )
    ${data.configFields.map(f => {
      const fieldType = f.type === 'integer' ? 'int' : f.type === 'boolean' ? 'bool' : 'str';
      return `${f.name}: ${f.required ? fieldType : `Optional[${fieldType}]`} = Field(
        ${f.default ? `default="${f.default}",` : ''}
        description="${f.description}"
    )`;
    }).join('\n    ')}


@register_agent
class ${data.name.replace(/\s/g, '')}(BaseAgent):
    """
    ${data.name}.

    ${data.description}
    """

    agent_type = "${data.id}"
    name = "${data.name}"
    description = "${data.description}"
    icon = "${data.icon || 'box'}"
    category = AgentCategory.${data.category.toUpperCase()}
    supported_connectors = ["${data.id}"]
    config_schema = ${data.name.replace(/\s/g, '')}Config

    async def execute(self, input_data: Any, context: Dict[str, Any]) -> AgentExecutionResult:
        """Execute ${data.name} action."""
        self.log(f"Executing ${data.name}...")

        # TODO: Implement your agent logic here

        return AgentExecutionResult(
            success=True,
            output={"message": "${data.name} executed successfully"},
            tokens_used=0,
            cost=0.0
        )
`;
  };

  return (
    <div className="agent-builder-page">
      <div className="agent-builder-header">
        <h1>🛠️ Agent Builder</h1>
        <p>Create new agents without writing code</p>
      </div>

      <div className="agent-builder-content">
        {/* Progress Steps */}
        <div className="builder-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Basic Info</div>
          </div>
          <div className="step-connector"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Template</div>
          </div>
          <div className="step-connector"></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Configuration</div>
          </div>
          <div className="step-connector"></div>
          <div className={`step ${step >= 4 ? 'active' : ''}`}>
            <div className="step-number">4</div>
            <div className="step-label">Generate</div>
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="builder-step-content">
            <h2>Basic Information</h2>

            <div className="form-group">
              <label>Agent Name *</label>
              <input
                type="text"
                placeholder="e.g., Stripe Payment Agent"
                value={agentData.name}
                onChange={(e) => handleBasicInfoChange('name', e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Agent ID *</label>
              <input
                type="text"
                placeholder="e.g., stripe"
                value={agentData.id}
                onChange={(e) => handleBasicInfoChange('id', e.target.value)}
                className="form-input"
              />
              <small>Unique identifier, auto-generated from name</small>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                placeholder="What does this agent do?"
                value={agentData.description}
                onChange={(e) => handleBasicInfoChange('description', e.target.value)}
                className="form-textarea"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <div className="category-grid">
                {categories.map(cat => (
                  <div
                    key={cat.id}
                    className={`category-card ${agentData.category === cat.id ? 'selected' : ''}`}
                    onClick={() => handleBasicInfoChange('category', cat.id)}
                  >
                    <div className="category-icon">{cat.icon}</div>
                    <div className="category-name">{cat.name}</div>
                    <div className="category-desc">{cat.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Icon (optional)</label>
              <input
                type="text"
                placeholder="e.g., zap, database, mail"
                value={agentData.icon}
                onChange={(e) => handleBasicInfoChange('icon', e.target.value)}
                className="form-input"
              />
              <small>Lucide icon name (see lucide.dev)</small>
            </div>

            <div className="button-group">
              <button
                onClick={() => setStep(2)}
                disabled={!agentData.name || !agentData.description}
                className="btn-primary"
              >
                Next: Choose Template →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Template Selection */}
        {step === 2 && (
          <div className="builder-step-content">
            <h2>Choose a Template</h2>
            <p>Start with a pre-built template or create from scratch</p>

            <div className="template-grid">
              {templates.map(template => (
                <div
                  key={template.id}
                  className={`template-card ${agentData.template === template.id ? 'selected' : ''}`}
                  onClick={() => setAgentData(prev => ({ ...prev, template: template.id }))}
                >
                  <h3>{template.name}</h3>
                  <p>{template.description}</p>
                </div>
              ))}
            </div>

            <div className="button-group">
              <button onClick={() => setStep(1)} className="btn-secondary">
                ← Back
              </button>
              <button onClick={() => setStep(3)} className="btn-primary">
                Next: Configure →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Configuration Fields */}
        {step === 3 && (
          <div className="builder-step-content">
            <h2>Configuration Fields</h2>
            <p>Define what parameters your agent needs</p>

            <div className="config-fields-list">
              {agentData.configFields.map(field => (
                <div key={field.id} className="config-field-item">
                  <div className="field-info">
                    <strong>{field.name}</strong> ({field.type})
                    {field.required && <span className="required-badge">Required</span>}
                    <div className="field-description">{field.description}</div>
                  </div>
                  <button
                    onClick={() => removeConfigField(field.id)}
                    className="btn-remove"
                  >
                    Remove
                  </button>
                </div>
              ))}

              {agentData.configFields.length === 0 && (
                <div className="empty-state">
                  No configuration fields yet. Add your first field below.
                </div>
              )}
            </div>

            <div className="add-field-form">
              <h3>Add Configuration Field</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>Field Name</label>
                  <input
                    type="text"
                    placeholder="e.g., api_key"
                    value={newField.name}
                    onChange={(e) => setNewField(prev => ({ ...prev, name: e.target.value }))}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={newField.type}
                    onChange={(e) => setNewField(prev => ({ ...prev, type: e.target.value }))}
                    className="form-select"
                  >
                    {fieldTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  placeholder="What is this field for?"
                  value={newField.description}
                  onChange={(e) => setNewField(prev => ({ ...prev, description: e.target.value }))}
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Default Value (optional)</label>
                  <input
                    type="text"
                    placeholder="Default value"
                    value={newField.default}
                    onChange={(e) => setNewField(prev => ({ ...prev, default: e.target.value }))}
                    className="form-input"
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={newField.required}
                      onChange={(e) => setNewField(prev => ({ ...prev, required: e.target.checked }))}
                    />
                    Required Field
                  </label>
                </div>
              </div>

              <button
                onClick={addConfigField}
                disabled={!newField.name || !newField.description}
                className="btn-add"
              >
                + Add Field
              </button>
            </div>

            <div className="button-group">
              <button onClick={() => setStep(2)} className="btn-secondary">
                ← Back
              </button>
              <button onClick={() => setStep(4)} className="btn-primary">
                Next: Review & Generate →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Generate */}
        {step === 4 && (
          <div className="builder-step-content">
            <h2>Review & Generate</h2>

            <div className="review-section">
              <h3>Agent Summary</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <label>Name:</label>
                  <span>{agentData.name}</span>
                </div>
                <div className="summary-item">
                  <label>ID:</label>
                  <span>{agentData.id}</span>
                </div>
                <div className="summary-item">
                  <label>Category:</label>
                  <span>{categories.find(c => c.id === agentData.category)?.name}</span>
                </div>
                <div className="summary-item">
                  <label>Template:</label>
                  <span>{templates.find(t => t.id === agentData.template)?.name}</span>
                </div>
                <div className="summary-item full-width">
                  <label>Description:</label>
                  <span>{agentData.description}</span>
                </div>
                <div className="summary-item full-width">
                  <label>Config Fields:</label>
                  <span>{agentData.configFields.length} fields</span>
                </div>
              </div>
            </div>

            <div className="code-preview">
              <h3>Code Preview</h3>
              <pre>{generatePythonCode(agentData)}</pre>
            </div>

            <div className="button-group">
              <button onClick={() => setStep(3)} className="btn-secondary">
                ← Back
              </button>
              <button onClick={exportCode} className="btn-secondary">
                💾 Download Code
              </button>
              <button onClick={generateAgent} className="btn-primary">
                🚀 Generate Agent
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
