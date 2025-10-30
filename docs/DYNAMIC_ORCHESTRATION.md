# Dynamic Multi-Agent Orchestration

## Overview

**Dynamic Multi-Agent Orchestration** is a powerful feature that allows SuperAgent to intelligently compose and execute multiple agents on-the-fly, even when no pre-defined workflow exists.

## The Problem It Solves

Traditional workflow systems require users to manually create workflows in advance. But what happens when a user asks:

> "Find all high-value deals in Salesforce and notify the team on Slack"

If no workflow exists for this exact combination, the system would fail. **Dynamic Orchestration solves this**.

## How It Works

### Architecture Flow

```
User Query
    ↓
1. Intent Classification (LLM)
    ↓
2. Workflow Matching (tries to find existing workflow)
    ↓
3. If NO match → Dynamic Orchestration
    ↓
4. LLM creates Execution Plan
    ↓
5. Build Ad-hoc Workflow
    ↓
6. Execute via Orchestrator Engine
    ↓
7. Return Results
```

### Key Components

#### 1. Intent Classification

The Supervisor Agent uses GPT-4 to analyze the user's query and determine:

```json
{
  "execution_type": "multi_agent",  // Single agent, workflow, or multi-agent
  "primary_action": "retrieve_data",
  "entities": {
    "deal_filter": "high_value",
    "notification_channel": "#sales"
  },
  "agent_hints": ["sales_intelligence", "slack"],
  "workflow_hints": []
}
```

#### 2. Execution Plan Creation

If no workflow matches, the system asks the LLM to create a detailed execution plan:

```json
{
  "agents": [
    {
      "type": "sales_intelligence",
      "config": {
        "filter": "high_value",
        "sort_by": "amount"
      }
    },
    {
      "type": "slack",
      "config": {
        "channel": "#sales",
        "message_format": "summary"
      }
    }
  ],
  "data_flow": "sequential",
  "rationale": "First fetch high-value deals, then notify team with results"
}
```

#### 3. Ad-hoc Workflow Construction

The system dynamically creates a temporary `Workflow` object:

```python
workflow = Workflow(
    id="adhoc_abc123",
    name="Dynamic: Find deals and notify team",
    agents=[
        AgentNode(id="agent_1", type=AgentType.SALES_INTELLIGENCE, ...),
        AgentNode(id="agent_2", type=AgentType.SLACK, ...)
    ],
    edges=[
        WorkflowEdge(source="agent_1", target="agent_2")
    ]
)
```

#### 4. Execution via Orchestrator

The ad-hoc workflow is executed using the same `OrchestrationEngine` that handles pre-defined workflows, ensuring:

- Consistent agent execution
- Proper data passing between agents
- Metrics tracking (tokens, cost, latency)
- Error handling
- Audit logging

## Usage Examples

### Example 1: Sales + Notification

**Query**: "Find high-value deals closing this quarter and notify team on Slack"

**Result**:
```
🤖 Dynamic Multi-Agent Orchestration

Intent Detected:
• Type: multi_agent
• Action: retrieve_and_notify
• Entities: {"deal_filter": "high_value", "timeframe": "Q4"}
• Query: "Find high-value deals closing this quarter and notify team"

Execution Plan:
• Agents: 2
• Flow: sequential
• Rationale: First fetch deals, then send Slack notification

Agent Chain:
1. Sales_Intelligence (config: {"filter": "high_value", "quarter": "Q4"})
2. Slack (config: {"channel": "#sales"})

Results:
Found 15 high-value deals worth $2.3M
Notified team on #sales channel

✅ Execution ID: exec_a1b2c3d4
```

### Example 2: HR + Email

**Query**: "Get new hires from Workday and send welcome emails"

**Result**:
- Agent 1: Workday → Fetch new hires (last 7 days)
- Agent 2: Email Outreach → Send personalized welcome emails

### Example 3: Support Ticket + Jira

**Query**: "Find critical ServiceNow incidents and create Jira tickets"

**Result**:
- Agent 1: ServiceNow → Query critical incidents
- Agent 2: Jira → Create tickets with incident details

## Technical Implementation

### File: `backend/agents/supervisor_agent.py`

**Key Methods**:

1. **`_orchestrate_agents()`** (line 556)
   - Main entry point for dynamic orchestration
   - Creates execution plan, builds workflow, executes

2. **`_create_execution_plan()`** (line 681)
   - Calls LLM to determine optimal agent order and configuration
   - Returns structured execution plan

3. **`_build_adhoc_workflow()`** (line 752)
   - Constructs temporary Workflow object from plan
   - Maps agent hints to AgentType enums

4. **`_map_agent_type()`** (line 808)
   - Maps string hints to AgentType enum values

### File: `backend/routers/chat.py`

**Response Formatting** (line 209):
- Special handling for `workflow_type: "dynamic_orchestration"`
- Displays execution plan, agent chain, and results

## Advantages

### 1. **Zero Configuration**
Users don't need to pre-create workflows. The system adapts to any valid agent combination.

### 2. **LLM Intelligence**
The system intelligently determines:
- Which agents to use
- In what order
- With what configuration
- How data should flow

### 3. **Consistent Execution**
Uses the same battle-tested orchestrator as pre-defined workflows.

### 4. **Full Audit Trail**
All dynamic executions are logged with:
- Execution ID
- Input/output
- Metrics (tokens, cost, latency)
- Agent-by-agent breakdown

### 5. **Extensibility**
Add new agents → They're automatically available for dynamic orchestration.

## Comparison: Pre-defined vs Dynamic

| Feature | Pre-defined Workflow | Dynamic Orchestration |
|---------|---------------------|----------------------|
| **Setup Required** | Yes - Manual creation | No - Zero config |
| **Reusability** | High | One-time execution |
| **Customization** | Fixed configuration | Adapts to query |
| **Optimization** | Can be fine-tuned | LLM determines best approach |
| **Audit** | Full history | Full history |
| **Performance** | Faster (no planning) | Slight overhead (LLM planning) |

## Best Practices

### When to Use Dynamic Orchestration

✅ **Good Use Cases**:
- Ad-hoc, one-time queries
- Exploring agent combinations
- Prototyping new workflows
- User doesn't know workflow exists

❌ **Avoid For**:
- Frequent, repeated operations
- Performance-critical paths
- Large-scale batch processing

**Recommendation**: If a query is executed frequently, convert it to a pre-defined workflow for better performance.

### Configuration

The system uses these defaults:

```python
SupervisorConfig(
    llm_provider="openai",
    model="gpt-4",
    workflow_matching_threshold=0.7  # 70% similarity to match workflow
)
```

## Monitoring & Debugging

### Logs

Dynamic orchestration produces detailed logs:

```
[INFO] [chat_supervisor] Orchestrating agents dynamically: ['sales_intelligence', 'slack']
[INFO] [chat_supervisor] Execution plan: {"agents": [...], "data_flow": "sequential"}
[INFO] [chat_supervisor] Dynamic orchestration completed: exec_abc123
```

### Execution Tracking

All executions are stored in the `executions` table:

```sql
SELECT * FROM executions
WHERE workflow_id = 'adhoc_multi_agent'
ORDER BY created_at DESC;
```

### Metrics

Track:
- Total tokens used (LLM planning + agent execution)
- Total cost
- Latency breakdown per agent
- Success/failure rates

## Future Enhancements

### Phase 1 (Current) ✅
- Sequential agent chaining
- LLM-based planning
- Basic configuration

### Phase 2 (Planned)
- Parallel agent execution
- Conditional branching (if-then-else)
- Loop support (for-each)
- Human-in-the-loop approvals

### Phase 3 (Future)
- Learning from executions
- Automatic workflow suggestion ("Convert to workflow?")
- Performance optimization
- Multi-step reasoning

## API Reference

### Chat Endpoint

**POST** `/api/v1/chat/message`

```json
{
  "message": "Find high-value deals and notify team"
}
```

**Response**:

```json
{
  "response": "🤖 Dynamic Multi-Agent Orchestration...",
  "workflow_executed": null,
  "agents_used": ["sales_intelligence", "slack"],
  "execution_id": "exec_abc123",
  "status": "success"
}
```

## Troubleshooting

### Issue: "Need at least 2 agents for dynamic orchestration"

**Cause**: LLM identified only 1 agent

**Solution**: Rephrase query to be more explicit about needing multiple agents

### Issue: Dynamic orchestration fails

**Cause**: Agent hint not mapped to AgentType enum

**Solution**: Add mapping in `_map_agent_type()` method

### Issue: Poor execution plan

**Cause**: LLM hallucination or unclear intent

**Solution**:
1. Check LLM prompt in `_create_execution_plan()`
2. Add more context about available agents
3. Improve intent classification

## Security Considerations

1. **Authorization**: Dynamic workflows respect org/team boundaries
2. **Agent Permissions**: Agents still require proper credentials
3. **Audit Logging**: All executions are logged for compliance
4. **Rate Limiting**: LLM calls are rate-limited to prevent abuse

## Conclusion

Dynamic Multi-Agent Orchestration represents a paradigm shift in workflow automation:

**Before**: Users manually create workflows for every scenario
**After**: System intelligently adapts to any valid agent combination

This makes SuperAgent truly intelligent, flexible, and user-friendly! 🚀
