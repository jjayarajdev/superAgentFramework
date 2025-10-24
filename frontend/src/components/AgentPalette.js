import React, { useState } from 'react';
import './AgentPalette.css';

const iconMap = {
  'chart-line': '📊',
  'users': '👥',
  'database': '💾',
  'wrench': '🔧',
  'message': '💬',
  'tasks': '✓',
  'bullhorn': '📢',
  'headset': '🎧',
  'mail': '✉️'
};

export default function AgentPalette({ agentTypes }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'data_retrieval', 'communication', 'action'];

  const onDragStart = (event, agentType) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(agentType));
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredAgents = agentTypes.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          agent.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="agent-palette">
      <div className="palette-header">
        <h2>🤖 Agents</h2>
        <input
          type="text"
          placeholder="Search agents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="palette-search"
        />
      </div>

      <div className="palette-filters">
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-button ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === 'all' ? 'All' : cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="palette-agents">
        {filteredAgents.length === 0 ? (
          <div className="no-agents">No agents found</div>
        ) : (
          filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className="palette-agent"
              draggable
              onDragStart={(event) => onDragStart(event, agent)}
            >
              <div className="palette-agent-icon">
                {iconMap[agent.icon] || '🤖'}
              </div>
              <div className="palette-agent-info">
                <div className="palette-agent-name">{agent.name}</div>
                <div className="palette-agent-description">{agent.description}</div>
                <div className="palette-agent-category">{agent.category}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="palette-footer">
        <div className="palette-count">{filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''}</div>
        <div className="palette-hint">💡 Drag agents to canvas</div>
      </div>
    </div>
  );
}
