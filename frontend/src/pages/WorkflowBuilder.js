import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import AgentNode from '../components/AgentNode';
import AgentPalette from '../components/AgentPalette';
import ConfigPanel from '../components/ConfigPanel';
import ExampleWorkflows from '../components/ExampleWorkflows';
import './WorkflowBuilder.css';

const nodeTypes = {
  agent: AgentNode,
};

function WorkflowBuilderInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [agentTypes, setAgentTypes] = useState([]);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showExamples, setShowExamples] = useState(false);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Load agent types from API
  useEffect(() => {
    fetch('/api/v1/agents/types')
      .then(res => res.json())
      .then(data => setAgentTypes(data.agent_types))
      .catch(err => console.error('Failed to load agents:', err));
  }, []);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const agentType = JSON.parse(type);
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `${agentType.id}_${Date.now()}`,
        type: 'agent',
        position,
        data: {
          label: agentType.name,
          agentType: agentType.id,
          icon: agentType.icon,
          config: {},
          agentMeta: agentType,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const updateNodeConfig = useCallback((nodeId, config) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              config,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const saveWorkflow = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      // Transform nodes and edges to API format
      const workflowAgents = nodes.map(node => ({
        id: node.id,
        type: node.data.agentType,
        name: node.data.label,
        config: node.data.config || {},
        position: { x: node.position.x, y: node.position.y }
      }));

      const workflowEdges = edges.map(edge => ({
        source: edge.source,
        target: edge.target
      }));

      const workflow = {
        name: workflowName,
        description: `Workflow with ${nodes.length} agents`,
        agents: workflowAgents,
        edges: workflowEdges
      };

      const response = await fetch('/api/v1/workflows/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow)
      });

      if (response.ok) {
        const result = await response.json();
        setSaveMessage(`✅ Saved! Workflow ID: ${result.id}`);
        localStorage.setItem('last_workflow_id', result.id);
      } else {
        setSaveMessage('❌ Failed to save workflow');
      }
    } catch (error) {
      setSaveMessage('❌ Error: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const loadExample = useCallback((exampleData) => {
    setWorkflowName(exampleData.name);
    setNodes(exampleData.nodes);
    setEdges(exampleData.edges);

    if (exampleData.workflowId) {
      localStorage.setItem('last_workflow_id', exampleData.workflowId);
      localStorage.setItem('sample_input', exampleData.sampleInput || '');
      setSaveMessage(`✅ Loaded example! Workflow ID: ${exampleData.workflowId}`);
    }
  }, [setNodes, setEdges]);

  return (
    <div className="workflow-builder">
      <div className="workflow-header">
        <input
          type="text"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          className="workflow-name-input"
          placeholder="Workflow Name"
        />
        <button onClick={() => setShowExamples(true)} className="example-button">
          📚 Load Example
        </button>
        <button onClick={saveWorkflow} disabled={isSaving} className="save-button">
          {isSaving ? 'Saving...' : '💾 Save Workflow'}
        </button>
        {saveMessage && <span className="save-message">{saveMessage}</span>}
      </div>

      <div className="workflow-content">
        <AgentPalette agentTypes={agentTypes} />

        <div className="flow-container" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        <ConfigPanel
          selectedNode={selectedNode}
          onConfigChange={updateNodeConfig}
        />
      </div>

      <ExampleWorkflows
        isOpen={showExamples}
        onClose={() => setShowExamples(false)}
        onLoad={loadExample}
      />
    </div>
  );
}

export default function WorkflowBuilder() {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderInner />
    </ReactFlowProvider>
  );
}
