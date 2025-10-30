# How Supervisor Agent Calls Existing Workflows

## 🎯 The Magic: Intelligent Workflow Matching

When a user types a question, the Supervisor Agent uses **3-tier matching** to find and execute existing workflows automatically!

---

## 📊 Workflow Matching Flow

```
User Query: "Onboard John Doe as a new engineer"
     ↓
[1. Intent Classification]
     ↓
Understands: Need to run onboarding process
Entities: name="John Doe", role="engineer"
     ↓
[2. Workflow Matching] ← THE KEY PART!
     ↓
Method 1: Keyword Match → ✅ Found "HR Onboarding Workflow"
     ↓
[3. Execute Workflow]
     ↓
Runs: HR Onboarding Workflow
Params: {name: "John Doe", role: "engineer"}
     ↓
Result: "Onboarding workflow completed for John Doe"
```

---

## 🔍 Three-Tier Matching Strategy

### Tier 1: Keyword Matching (Fast - 10ms)
**How it works:**
- Extract keywords from user query
- Compare with workflow names, descriptions, and tags
- Calculate overlap score

**Example:**
```
User: "onboard new employee"

Workflows in DB:
1. "HR Onboarding Workflow" - tags: [hr, onboarding, employee]
2. "Sales Lead Management" - tags: [sales, crm]
3. "IT Service Management" - tags: [it, tickets]

Match:
- Workflow 1: Keywords match! (onboarding ✓, employee ✓)
- Workflow 2: No match
- Workflow 3: No match

Selected: "HR Onboarding Workflow" ✅
```

### Tier 2: Agent Composition Matching (Medium - 50ms)
**How it works:**
- Analyze which agents the query needs
- Find workflows that contain those agents
- Calculate Jaccard similarity

**Example:**
```
User: "Find high-value deals and notify team on Slack"

Needed agents: [salesforce, slack]

Workflows in DB:
1. "Sales Lead Management"
   Agents: [sales_intelligence, email_outreach, slack]
   Similarity: 1/3 = 33% (slack matches)

2. "Customer Support Routing"
   Agents: [zendesk, jira, slack]
   Similarity: 1/3 = 33%

3. "Sales Outreach Pipeline"
   Agents: [sales_intelligence, slack]
   Similarity: 2/2 = 100% ✅ PERFECT MATCH!

Selected: "Sales Outreach Pipeline" ✅
```

### Tier 3: Semantic Matching (Slow but Accurate - 500ms)
**How it works:**
- Use LLM (GPT-4/Claude) to semantically compare query to workflows
- Understand intent beyond keywords
- Return confidence score

**Example:**
```
User: "Help me get new hires set up in the system"

LLM Analysis:
Query Intent: Employee onboarding, system provisioning
Required Actions: Create accounts, send credentials

Workflow Match:
"HR Onboarding Workflow"
- Creates employee in DarwinBox
- Provisions Slack/Jira accounts
- Sends welcome email

Confidence: 0.92 (92%) ✅

Selected: "HR Onboarding Workflow"
```

---

## 💡 Real-World Examples

### Example 1: Direct Workflow Match
```
User: "Run the customer onboarding process for Acme Corp"

Supervisor:
1. Detects: "customer onboarding" → workflow keyword
2. Finds: "Customer Onboarding Workflow"
3. Extracts: company="Acme Corp"
4. Executes workflow with params

Result: Workflow runs automatically!
```

### Example 2: Agent-Based Match
```
User: "Pull Zendesk tickets and create Jira issues"

Supervisor:
1. Analyzes: Need [zendesk, jira] agents
2. Searches workflows with these agents
3. Finds: "Customer Support Ticket Routing"
   - Has: zendesk → jira → slack
4. Executes workflow

Result: Workflow runs automatically!
```

### Example 3: Semantic Match
```
User: "I need to get a new team member access to all our tools"

Supervisor:
1. LLM interprets: This is about employee onboarding
2. Finds: "HR Onboarding Workflow" (even though words don't match!)
3. Extracts: New employee context
4. Suggests/Executes workflow

Result: Workflow runs automatically!
```

### Example 4: No Match - Create Dynamic Chain
```
User: "Find overdue invoices in Stripe and notify accounting"

Supervisor:
1. No matching workflow found
2. Fallback: Create dynamic agent chain
   - Stripe Agent → Email Agent
3. Executes chain on-the-fly

Result: Agents chain dynamically (no workflow needed)
```

---

## 🔧 Implementation in Code

### Step 1: Get Available Workflows from DB
```python
async def _get_available_workflows(self, context: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Get all workflows for this organization."""
    workflows = db.query(WorkflowDB).filter(
        WorkflowDB.org_id == context['org_id']
    ).all()

    return [
        {
            "id": wf.id,
            "name": wf.name,
            "description": wf.description,
            "agents": [agent['type'] for agent in wf.agents],
            "tags": wf.tags
        }
        for wf in workflows
    ]
```

### Step 2: Match User Query to Workflow
```python
async def _match_workflow(self, intent, context) -> Optional[Dict]:
    """Find best matching workflow."""

    workflows = await self._get_available_workflows(context)

    # Try Method 1: Keywords
    match = self._keyword_match_workflows(intent, workflows)
    if match:
        return match[0]

    # Try Method 2: Agent composition
    match = self._agent_composition_match(intent, workflows)
    if match:
        return match[0]

    # Try Method 3: Semantic (LLM)
    match = await self._semantic_match_workflow(intent, workflows, context)
    return match
```

### Step 3: Execute Matched Workflow
```python
async def _execute_workflow(self, workflow, intent, context):
    """Execute the matched workflow with extracted parameters."""

    # Extract params from user query
    params = self._extract_workflow_params(intent, workflow)
    # e.g., {"employee_name": "John Doe", "start_date": "2025-01-01"}

    # Call workflow execution engine
    execution_result = await execute_workflow_internal(
        workflow_id=workflow['id'],
        input_data=params,
        context=context
    )

    return AgentExecutionResult(
        success=True,
        output={
            "workflow_name": workflow['name'],
            "execution_id": execution_result['id'],
            "status": execution_result['status']
        }
    )
```

---

## 🎭 User Experience

### Before (Manual):
```
1. User goes to Workflows page
2. Finds "HR Onboarding Workflow"
3. Clicks "Execute"
4. Fills in form fields
5. Clicks "Run"
```

### After (Conversational):
```
User: "Onboard John Doe"
Bot: "Running HR Onboarding Workflow for John Doe... ✅ Done!"
```

**Same workflow, 10x faster!**

---

## 🚀 Advanced Features

### Feature 1: Confidence Threshold
```python
# Only execute if confidence > 70%
if match_confidence > 0.7:
    execute_workflow(match)
else:
    # Ask user for confirmation
    return "Did you mean to run 'HR Onboarding Workflow'? (yes/no)"
```

### Feature 2: Parameter Extraction
```python
# Smart entity extraction
User: "Onboard John Doe starting January 15th"

Entities extracted:
{
    "employee_name": "John Doe",
    "start_date": "2025-01-15"
}

# Auto-fill workflow inputs!
```

### Feature 3: Workflow Suggestions
```python
# If multiple matches
User: "I need to onboard someone"

Supervisor: "I found 2 matching workflows:
1. HR Onboarding Workflow (Employee setup)
2. Customer Onboarding Workflow (Client setup)

Which one would you like to run?"
```

### Feature 4: Learning & Improvement
```python
# Track which workflows get used
# Improve matching over time
# Suggest workflow creation for common patterns
```

---

## 📈 Benefits

### For Users:
✅ **No need to remember workflow names**
✅ **Natural language is easier than forms**
✅ **Workflows run faster (one command vs multiple clicks)**
✅ **Mobile-friendly (chat vs complex UI)**

### For Admins:
✅ **Existing workflows get more usage**
✅ **Less training needed**
✅ **Analytics on which workflows are popular**
✅ **Identify gaps (queries with no workflow match)**

---

## 🔮 Future Enhancements

### 1. Multi-turn Conversations
```
User: "I need to onboard someone"
Bot: "Sure! What's their name?"
User: "John Doe"
Bot: "What role?"
User: "Engineer"
Bot: "Got it! Running HR Onboarding Workflow..."
```

### 2. Workflow Recommendations
```
User: "Find deals and notify team" (repeats this often)
Bot: "I noticed you do this a lot. Want me to create a workflow?"
User: "Yes"
Bot: "Created 'Deal Notification Workflow'! Use it with: 'run deal notifications'"
```

### 3. Scheduled Workflows via Chat
```
User: "Run the sales report workflow every Monday at 9am"
Bot: "Scheduled! You'll get sales reports every Monday."
```

---

## 🎯 Summary

The Supervisor Agent makes your platform **10x more powerful** by:

1. **Reusing existing workflows** automatically
2. **Understanding natural language** instead of requiring exact commands
3. **Extracting parameters** from conversations
4. **Falling back to dynamic agents** when no workflow matches

**Result:** Users get AWS Bedrock-style visual workflows + ChatGPT-style conversational interface!

Best of both worlds! 🚀
