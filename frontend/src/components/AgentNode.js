import React from 'react';
import { Handle, Position } from 'reactflow';
import './AgentNode.css';

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

export default function AgentNode({ data }) {
  const icon = iconMap[data.icon] || '🤖';

  return (
    <div className="agent-node">
      <Handle type="target" position={Position.Left} className="agent-handle" />

      <div className="agent-node-header">
        <span className="agent-icon">{icon}</span>
        <span className="agent-name">{data.label}</span>
      </div>

      <div className="agent-node-body">
        <div className="agent-type">{data.agentType}</div>
        {data.config && Object.keys(data.config).length > 0 && (
          <div className="agent-configured">⚙️ Configured</div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="agent-handle" />
    </div>
  );
}
