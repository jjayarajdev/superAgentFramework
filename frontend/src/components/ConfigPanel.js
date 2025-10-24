import React, { useState, useEffect } from 'react';
import './ConfigPanel.css';

export default function ConfigPanel({ selectedNode, onConfigChange }) {
  const [config, setConfig] = useState({});

  useEffect(() => {
    if (selectedNode) {
      setConfig(selectedNode.data.config || {});
    }
  }, [selectedNode]);

  if (!selectedNode) {
    return (
      <div className="config-panel">
        <div className="config-empty">
          <div className="config-empty-icon">⚙️</div>
          <h3>No Agent Selected</h3>
          <p>Click on an agent to configure its settings</p>
        </div>
      </div>
    );
  }

  const agentMeta = selectedNode.data.agentMeta;
  const schema = agentMeta?.config_schema || {};
  const properties = schema.properties || {};

  const handleFieldChange = (field, value) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    onConfigChange(selectedNode.id, newConfig);
  };

  const renderField = (fieldName, fieldSchema) => {
    const currentValue = config[fieldName] ?? fieldSchema.default;

    // Handle enum (select)
    if (fieldSchema.enum) {
      return (
        <select
          value={currentValue || ''}
          onChange={(e) => handleFieldChange(fieldName, e.target.value)}
          className="config-select"
        >
          {fieldSchema.enum.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    }

    // Handle boolean (checkbox)
    if (fieldSchema.type === 'boolean') {
      return (
        <label className="config-checkbox-label">
          <input
            type="checkbox"
            checked={currentValue || false}
            onChange={(e) => handleFieldChange(fieldName, e.target.checked)}
            className="config-checkbox"
          />
          <span>{fieldSchema.description || fieldName}</span>
        </label>
      );
    }

    // Handle number
    if (fieldSchema.type === 'integer' || fieldSchema.type === 'number') {
      return (
        <input
          type="number"
          value={currentValue ?? ''}
          onChange={(e) => handleFieldChange(fieldName, parseInt(e.target.value))}
          placeholder={fieldSchema.description}
          min={fieldSchema.minimum}
          max={fieldSchema.maximum}
          className="config-input"
        />
      );
    }

    // Handle string (text input)
    return (
      <input
        type="text"
        value={currentValue || ''}
        onChange={(e) => handleFieldChange(fieldName, e.target.value)}
        placeholder={fieldSchema.description}
        className="config-input"
      />
    );
  };

  return (
    <div className="config-panel">
      <div className="config-header">
        <h3>⚙️ Configure Agent</h3>
        <div className="config-agent-name">{selectedNode.data.label}</div>
      </div>

      <div className="config-body">
        {Object.keys(properties).length === 0 ? (
          <div className="config-no-fields">
            This agent has no configurable fields.
          </div>
        ) : (
          <div className="config-fields">
            {Object.entries(properties).map(([fieldName, fieldSchema]) => (
              <div key={fieldName} className="config-field">
                <label className="config-label">
                  {fieldName}
                  {fieldSchema.description && (
                    <span className="config-help">ⓘ {fieldSchema.description}</span>
                  )}
                </label>
                {renderField(fieldName, fieldSchema)}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="config-footer">
        <button
          onClick={() => {
            setConfig({});
            onConfigChange(selectedNode.id, {});
          }}
          className="config-reset-button"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
