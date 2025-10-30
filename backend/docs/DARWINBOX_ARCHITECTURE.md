# Darwinbox Integration Architecture

## Table of Contents
1. [Architecture Options](#architecture-options)
2. [Recommended Approach](#recommended-approach)
3. [Implementation Strategy](#implementation-strategy)
4. [Workflow Examples](#workflow-examples)
5. [Technical Specifications](#technical-specifications)

---

## Architecture Options

### **Option 1: Single Agent + Action-Based (RECOMMENDED ⭐)**

**Structure:**
- **1 Darwinbox Agent** with configurable `action` parameter
- Actions: `get_employees`, `create_leave`, `approve_expense`, etc.
- Connector layer handles all module complexity

**Pros:**
- ✅ Simpler workflow builder UI (1 agent type)
- ✅ Easier maintenance (single codebase)
- ✅ Consistent authentication across all operations
- ✅ Flexible - can add new actions without new agents
- ✅ Better for workflow reusability

**Cons:**
- ⚠️ Action dropdown could get long (50+ actions)
- ⚠️ Less intuitive for non-technical users
- ⚠️ Config schema needs to handle all action types

**Best For:**
- Developer-focused platforms
- API-style integrations
- Platforms with good search/filtering in UI

---

### **Option 2: Module-Based Agents**

**Structure:**
- **12 specialized agents** (one per module)
  - DarwinboxEmployeeAgent
  - DarwinboxLeaveAgent
  - DarwinboxRecruitmentAgent
  - etc.

**Pros:**
- ✅ More intuitive for business users
- ✅ Clear separation of concerns
- ✅ Targeted config schemas per module
- ✅ Better discoverability in agent library

**Cons:**
- ❌ 12 agents to maintain
- ❌ Duplicated authentication logic
- ❌ Harder to add cross-module operations
- ❌ More cluttered agent library

**Best For:**
- Business user-focused platforms
- HR-specific workflow tools
- When you want granular agent categories

---

### **Option 3: Hybrid Approach (Best of Both Worlds)**

**Structure:**
- **3-4 High-Level Agents** (by use case)
  - DarwinboxHRAgent (Core HR, Leave, Attendance)
  - DarwinboxTalentAgent (Recruitment, Onboarding, Performance)
  - DarwinboxFinanceAgent (Payroll, Compensation, Expenses)
  - DarwinboxEngagementAgent (Learning, Engagement, Recognition)

**Pros:**
- ✅ Balanced discoverability and maintainability
- ✅ Groups related operations logically
- ✅ Not too many agents (3-4 vs 12)
- ✅ Clear domain boundaries

**Cons:**
- ⚠️ Some subjectivity in grouping
- ⚠️ Still requires action parameter within each agent

**Best For:**
- Enterprise platforms with diverse users
- When you want domain-driven design
- Platforms with workflow templates by department

---

## Draw.io Diagrams

### **Architecture Comparison Diagram**

```xml
<!-- Paste this into Draw.io (https://app.diagrams.net/) -->
<mxfile host="app.diagrams.net">
  <diagram name="Architecture Comparison" id="architecture">
    <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1600" pageHeight="1200">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>

        <!-- Title -->
        <mxCell id="title" value="Darwinbox Integration Architecture Options" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;fontSize=24;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="500" y="20" width="600" height="40" as="geometry"/>
        </mxCell>

        <!-- OPTION 1: Single Agent -->
        <mxCell id="opt1-container" value="" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;verticalAlign=top;align=left;spacingLeft=10;spacingTop=5;" vertex="1" parent="1">
          <mxGeometry x="50" y="100" width="450" height="400" as="geometry"/>
        </mxCell>
        <mxCell id="opt1-title" value="Option 1: Single Agent (Action-Based)" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;fontSize=16;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="60" y="110" width="300" height="30" as="geometry"/>
        </mxCell>

        <!-- Darwinbox Agent -->
        <mxCell id="opt1-agent" value="Darwinbox Agent" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=14;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="150" y="160" width="250" height="60" as="geometry"/>
        </mxCell>

        <!-- Actions -->
        <mxCell id="opt1-actions" value="action: get_employees&#xa;action: create_leave&#xa;action: approve_expense&#xa;action: submit_performance&#xa;action: ...50+ actions" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;fontSize=11;align=left;verticalAlign=top;spacingLeft=10;spacingTop=5;" vertex="1" parent="1">
          <mxGeometry x="150" y="240" width="250" height="100" as="geometry"/>
        </mxCell>

        <!-- Connector Layer -->
        <mxCell id="opt1-connector" value="Darwinbox Connector&#xa;(12 modules)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=12;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="150" y="360" width="250" height="60" as="geometry"/>
        </mxCell>

        <!-- Darwinbox API -->
        <mxCell id="opt1-api" value="Darwinbox API" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e1d5e7;strokeColor=#9673a6;fontSize=12;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="150" y="440" width="250" height="40" as="geometry"/>
        </mxCell>

        <!-- Arrows -->
        <mxCell id="opt1-arrow1" value="" style="endArrow=classic;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;strokeWidth=2;" edge="1" parent="1" source="opt1-agent" target="opt1-actions">
          <mxGeometry width="50" height="50" relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="opt1-arrow2" value="" style="endArrow=classic;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;strokeWidth=2;" edge="1" parent="1" source="opt1-actions" target="opt1-connector">
          <mxGeometry width="50" height="50" relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="opt1-arrow3" value="" style="endArrow=classic;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;strokeWidth=2;" edge="1" parent="1" source="opt1-connector" target="opt1-api">
          <mxGeometry width="50" height="50" relative="1" as="geometry"/>
        </mxCell>

        <!-- OPTION 2: Module-Based -->
        <mxCell id="opt2-container" value="" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;verticalAlign=top;align=left;spacingLeft=10;spacingTop=5;" vertex="1" parent="1">
          <mxGeometry x="550" y="100" width="450" height="400" as="geometry"/>
        </mxCell>
        <mxCell id="opt2-title" value="Option 2: Module-Based Agents" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;fontSize=16;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="560" y="110" width="300" height="30" as="geometry"/>
        </mxCell>

        <!-- Multiple Agents -->
        <mxCell id="opt2-agent1" value="Employee Agent" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=11;" vertex="1" parent="1">
          <mxGeometry x="570" y="160" width="130" height="40" as="geometry"/>
        </mxCell>
        <mxCell id="opt2-agent2" value="Leave Agent" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=11;" vertex="1" parent="1">
          <mxGeometry x="720" y="160" width="130" height="40" as="geometry"/>
        </mxCell>
        <mxCell id="opt2-agent3" value="Recruitment Agent" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=11;" vertex="1" parent="1">
          <mxGeometry x="570" y="220" width="130" height="40" as="geometry"/>
        </mxCell>
        <mxCell id="opt2-agent4" value="Payroll Agent" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=11;" vertex="1" parent="1">
          <mxGeometry x="720" y="220" width="130" height="40" as="geometry"/>
        </mxCell>
        <mxCell id="opt2-agent5" value="Performance Agent" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=11;" vertex="1" parent="1">
          <mxGeometry x="570" y="280" width="130" height="40" as="geometry"/>
        </mxCell>
        <mxCell id="opt2-more" value="...7 more agents" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;fontSize=11;fontStyle=2" vertex="1" parent="1">
          <mxGeometry x="720" y="280" width="130" height="40" as="geometry"/>
        </mxCell>

        <!-- Connector Layer -->
        <mxCell id="opt2-connector" value="Darwinbox Connector (Shared)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=12;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="600" y="350" width="250" height="40" as="geometry"/>
        </mxCell>

        <!-- Darwinbox API -->
        <mxCell id="opt2-api" value="Darwinbox API" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e1d5e7;strokeColor=#9673a6;fontSize=12;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="600" y="410" width="250" height="40" as="geometry"/>
        </mxCell>

        <!-- Arrows -->
        <mxCell id="opt2-arrow1" value="" style="endArrow=classic;html=1;exitX=0.5;exitY=1;entryX=0.25;entryY=0;strokeWidth=1;" edge="1" parent="1" source="opt2-agent1" target="opt2-connector">
          <mxGeometry width="50" height="50" relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="opt2-arrow2" value="" style="endArrow=classic;html=1;exitX=0.5;exitY=1;entryX=0.75;entryY=0;strokeWidth=1;" edge="1" parent="1" source="opt2-agent2" target="opt2-connector">
          <mxGeometry width="50" height="50" relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="opt2-arrow3" value="" style="endArrow=classic;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;strokeWidth=2;" edge="1" parent="1" source="opt2-connector" target="opt2-api">
          <mxGeometry width="50" height="50" relative="1" as="geometry"/>
        </mxCell>

        <!-- OPTION 3: Hybrid -->
        <mxCell id="opt3-container" value="" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;verticalAlign=top;align=left;spacingLeft=10;spacingTop=5;" vertex="1" parent="1">
          <mxGeometry x="1050" y="100" width="450" height="400" as="geometry"/>
        </mxCell>
        <mxCell id="opt3-title" value="Option 3: Hybrid (Domain-Based)" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;fontSize=16;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="1060" y="110" width="300" height="30" as="geometry"/>
        </mxCell>

        <!-- Domain Agents -->
        <mxCell id="opt3-agent1" value="HR Agent&#xa;(Core, Leave, Attendance)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=11;" vertex="1" parent="1">
          <mxGeometry x="1070" y="160" width="180" height="50" as="geometry"/>
        </mxCell>
        <mxCell id="opt3-agent2" value="Talent Agent&#xa;(Recruit, Onboard, Perf)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=11;" vertex="1" parent="1">
          <mxGeometry x="1270" y="160" width="180" height="50" as="geometry"/>
        </mxCell>
        <mxCell id="opt3-agent3" value="Finance Agent&#xa;(Payroll, Comp, Expenses)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=11;" vertex="1" parent="1">
          <mxGeometry x="1070" y="230" width="180" height="50" as="geometry"/>
        </mxCell>
        <mxCell id="opt3-agent4" value="Engagement Agent&#xa;(Learning, Survey, Recog)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=11;" vertex="1" parent="1">
          <mxGeometry x="1270" y="230" width="180" height="50" as="geometry"/>
        </mxCell>

        <!-- Connector Layer -->
        <mxCell id="opt3-connector" value="Darwinbox Connector (12 modules)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=12;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="1120" y="320" width="280" height="50" as="geometry"/>
        </mxCell>

        <!-- Darwinbox API -->
        <mxCell id="opt3-api" value="Darwinbox API" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e1d5e7;strokeColor=#9673a6;fontSize=12;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="1120" y="390" width="280" height="40" as="geometry"/>
        </mxCell>

        <!-- Arrows -->
        <mxCell id="opt3-arrow1" value="" style="endArrow=classic;html=1;exitX=0.5;exitY=1;entryX=0.25;entryY=0;strokeWidth=1;" edge="1" parent="1" source="opt3-agent1" target="opt3-connector">
          <mxGeometry width="50" height="50" relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="opt3-arrow2" value="" style="endArrow=classic;html=1;exitX=0.5;exitY=1;entryX=0.75;entryY=0;strokeWidth=1;" edge="1" parent="1" source="opt3-agent2" target="opt3-connector">
          <mxGeometry width="50" height="50" relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="opt3-arrow3" value="" style="endArrow=classic;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;strokeWidth=2;" edge="1" parent="1" source="opt3-connector" target="opt3-api">
          <mxGeometry width="50" height="50" relative="1" as="geometry"/>
        </mxCell>

        <!-- Legend -->
        <mxCell id="legend-container" value="" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;verticalAlign=top;align=left;spacingLeft=10;spacingTop=5;" vertex="1" parent="1">
          <mxGeometry x="50" y="540" width="1450" height="120" as="geometry"/>
        </mxCell>
        <mxCell id="legend-title" value="Comparison Summary" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;fontSize=14;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="60" y="550" width="200" height="30" as="geometry"/>
        </mxCell>

        <mxCell id="legend-opt1" value="✅ Single Agent: Best for developers, flexible, easy maintenance&#xa;⚠️ Long action list, less intuitive for business users" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=top;whiteSpace=wrap;fontSize=11;spacingLeft=5;" vertex="1" parent="1">
          <mxGeometry x="70" y="585" width="420" height="50" as="geometry"/>
        </mxCell>

        <mxCell id="legend-opt2" value="✅ Module Agents: Intuitive for business users, clear separation&#xa;⚠️ 12 agents to maintain, duplicated logic" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=top;whiteSpace=wrap;fontSize=11;spacingLeft=5;" vertex="1" parent="1">
          <mxGeometry x="540" y="585" width="420" height="50" as="geometry"/>
        </mxCell>

        <mxCell id="legend-opt3" value="✅ Hybrid: Balanced approach, domain-driven, 3-4 agents&#xa;⭐ RECOMMENDED for enterprise platforms" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=top;whiteSpace=wrap;fontSize=11;spacingLeft=5;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="1010" y="585" width="420" height="50" as="geometry"/>
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

---

### **Workflow Example Diagram**

```xml
<!-- Paste this into Draw.io (https://app.diagrams.net/) -->
<mxfile host="app.diagrams.net">
  <diagram name="Workflow Example" id="workflow">
    <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1600" pageHeight="900">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>

        <!-- Title -->
        <mxCell id="title" value="Example Workflow: New Employee Onboarding" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;fontSize=20;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="500" y="20" width="600" height="40" as="geometry"/>
        </mxCell>

        <!-- START -->
        <mxCell id="start" value="START" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=14;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="730" y="80" width="140" height="60" as="geometry"/>
        </mxCell>

        <!-- Agent 1: Create Employee -->
        <mxCell id="agent1" value="Darwinbox HR Agent&#xa;&#xa;action: create_employee&#xa;data: {name, email, dept, title}" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=12;verticalAlign=top;spacingTop=10;" vertex="1" parent="1">
          <mxGeometry x="680" y="180" width="240" height="80" as="geometry"/>
        </mxCell>

        <!-- Agent 2: Send Welcome Email -->
        <mxCell id="agent2" value="Email Outreach Agent&#xa;&#xa;action: send_email&#xa;to: {{employee.email}}&#xa;template: welcome_message" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=12;verticalAlign=top;spacingTop=10;" vertex="1" parent="1">
          <mxGeometry x="680" y="300" width="240" height="90" as="geometry"/>
        </mxCell>

        <!-- Agent 3: Create Slack Account -->
        <mxCell id="agent3" value="Slack Agent&#xa;&#xa;action: create_user&#xa;channels: #general, #{{dept}}" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e1d5e7;strokeColor=#9673a6;fontSize=12;verticalAlign=top;spacingTop=10;" vertex="1" parent="1">
          <mxGeometry x="680" y="430" width="240" height="80" as="geometry"/>
        </mxCell>

        <!-- Agent 4: Assign Onboarding Tasks -->
        <mxCell id="agent4" value="Darwinbox HR Agent&#xa;&#xa;action: create_onboarding&#xa;employee_id: {{employee.id}}&#xa;template: standard_onboarding" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=12;verticalAlign=top;spacingTop=10;" vertex="1" parent="1">
          <mxGeometry x="680" y="550" width="240" height="90" as="geometry"/>
        </mxCell>

        <!-- Agent 5: Create Jira Ticket -->
        <mxCell id="agent5" value="Jira Agent&#xa;&#xa;action: create_ticket&#xa;title: IT Setup for {{employee.name}}&#xa;assign: IT team" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;fontSize=12;verticalAlign=top;spacingTop=10;" vertex="1" parent="1">
          <mxGeometry x="680" y="680" width="240" height="90" as="geometry"/>
        </mxCell>

        <!-- END -->
        <mxCell id="end" value="END" style="ellipse;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;fontSize=14;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="730" y="810" width="140" height="60" as="geometry"/>
        </mxCell>

        <!-- Arrows -->
        <mxCell id="arrow1" value="" style="endArrow=classic;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;strokeWidth=3;strokeColor=#82b366;" edge="1" parent="1" source="start" target="agent1">
          <mxGeometry width="50" height="50" relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="arrow2" value="employee_id" style="endArrow=classic;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;strokeWidth=2;strokeColor=#6c8ebf;" edge="1" parent="1" source="agent1" target="agent2">
          <mxGeometry width="50" height="50" relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="arrow3" value="user_data" style="endArrow=classic;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;strokeWidth=2;strokeColor=#9673a6;" edge="1" parent="1" source="agent2" target="agent3">
          <mxGeometry width="50" height="50" relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="arrow4" value="employee_id" style="endArrow=classic;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;strokeWidth=2;strokeColor=#6c8ebf;" edge="1" parent="1" source="agent3" target="agent4">
          <mxGeometry width="50" height="50" relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="arrow5" value="employee_details" style="endArrow=classic;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;strokeWidth=2;strokeColor=#b85450;" edge="1" parent="1" source="agent4" target="agent5">
          <mxGeometry width="50" height="50" relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="arrow6" value="" style="endArrow=classic;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;strokeWidth=3;strokeColor=#b85450;" edge="1" parent="1" source="agent5" target="end">
          <mxGeometry width="50" height="50" relative="1" as="geometry"/>
        </mxCell>

        <!-- Side notes -->
        <mxCell id="note1" value="Notice: Same Darwinbox&#xa;agent used twice with&#xa;different actions" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;fontSize=10;fontStyle=2;verticalAlign=top;align=left;spacingLeft=5;spacingTop=3;" vertex="1" parent="1">
          <mxGeometry x="970" y="220" width="150" height="70" as="geometry"/>
        </mxCell>
        <mxCell id="note1-arrow" value="" style="endArrow=classic;html=1;strokeWidth=1;strokeColor=#d79b00;dashed=1;" edge="1" parent="1" source="note1" target="agent1">
          <mxGeometry width="50" height="50" relative="1" as="geometry"/>
        </mxCell>

        <mxCell id="note2" value="Multi-system&#xa;orchestration in&#xa;one workflow" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;fontSize=10;fontStyle=2;verticalAlign=top;align=left;spacingLeft=5;spacingTop=3;" vertex="1" parent="1">
          <mxGeometry x="970" y="450" width="150" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="note2-arrow" value="" style="endArrow=classic;html=1;strokeWidth=1;strokeColor=#d79b00;dashed=1;" edge="1" parent="1" source="note2" target="agent3">
          <mxGeometry width="50" height="50" relative="1" as="geometry"/>
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

---

## Recommended Approach

### **✅ Hybrid Architecture (Option 3)**

**Rationale:**
1. **Balance:** Not too many agents (3-4) vs single agent with 50+ actions
2. **Domain-Driven:** Aligns with HR organizational structure
3. **Discoverability:** Users can find "Talent Agent" easier than scrolling through actions
4. **Maintainability:** Shared connector layer, but domain-specific logic separated
5. **Scalability:** Easy to add new modules to existing domain agents

---

## Implementation Strategy

### **Phase 1: Create Connector Layer** (Week 1)

```
/backend/connectors/darwinbox/
├── __init__.py
├── client.py                      # Auth + HTTP client
├── modules/
│   ├── __init__.py
│   ├── employees.py               # Employee Core
│   ├── recruitment.py             # Recruitment
│   ├── onboarding.py              # Onboarding
│   ├── leave.py                   # Leave Management
│   ├── attendance.py              # Attendance
│   ├── performance.py             # Performance
│   ├── payroll.py                 # Payroll
│   ├── compensation.py            # Compensation
│   ├── learning.py                # Learning
│   ├── engagement.py              # Engagement
│   ├── expenses.py                # Expenses
│   └── travel.py                  # Travel
├── models.py                      # Pydantic models
├── exceptions.py                  # Custom exceptions
└── utils.py                       # Helpers
```

**Key Components:**

1. **client.py** - Authentication & HTTP
```python
class DarwinboxClient:
    def __init__(self, admin_email, secret_key, base_url):
        self.admin_email = admin_email
        self.secret_key = secret_key
        self.base_url = base_url

    def _generate_token(self):
        # SHA512 token generation
        pass

    def request(self, method, endpoint, data=None):
        # HTTP request with auth
        pass
```

2. **modules/employees.py** - Employee operations
```python
class EmployeeModule:
    def __init__(self, client: DarwinboxClient):
        self.client = client

    async def get_employee(self, employee_id):
        return await self.client.request('GET', f'/employees/{employee_id}')

    async def create_employee(self, data):
        return await self.client.request('POST', '/employees', data)

    # ...more methods
```

---

### **Phase 2: Create Domain Agents** (Week 2)

**Agent Structure:**

```python
# agents/darwinbox_hr_agent.py
@register_agent
class DarwinboxHRAgent(BaseAgent):
    """
    Darwinbox HR Agent

    Handles core HR operations:
    - Employee management
    - Leave requests
    - Attendance tracking
    """
    agent_type = "darwinbox_hr"
    name = "Darwinbox HR Agent"
    description = "Core HR operations (employees, leave, attendance)"
    category = AgentCategory.DATA_RETRIEVAL
    supported_connectors = ["darwinbox"]

    config_schema = DarwinboxHRConfig

    async def execute(self, input_data, context):
        action = self.config.action

        # Get connector instance
        connector = get_darwinbox_connector(self.config.connector_id)

        # Route to appropriate module
        if action.startswith('employee_'):
            return await self._handle_employee_action(connector, action, input_data)
        elif action.startswith('leave_'):
            return await self._handle_leave_action(connector, action, input_data)
        elif action.startswith('attendance_'):
            return await self._handle_attendance_action(connector, action, input_data)
```

**Config Schema:**

```python
class DarwinboxHRConfig(AgentConfigSchema):
    connector_id: str = Field(description="Darwinbox connector instance ID")

    action: str = Field(
        description="HR action to perform",
        json_schema_extra={
            "enum": [
                # Employee actions
                "employee_get",
                "employee_create",
                "employee_update",
                "employee_search",
                # Leave actions
                "leave_get_balance",
                "leave_request",
                "leave_approve",
                "leave_cancel",
                # Attendance actions
                "attendance_clock_in",
                "attendance_clock_out",
                "attendance_get_summary"
            ]
        }
    )

    params: Dict[str, Any] = Field(
        default_factory=dict,
        description="Action-specific parameters"
    )
```

---

### **Phase 3: Create 4 Domain Agents**

#### **1. Darwinbox HR Agent** 🏢
**Modules:** Employee Core, Leave, Attendance
**Actions:** ~15 actions

#### **2. Darwinbox Talent Agent** 🎯
**Modules:** Recruitment, Onboarding, Performance
**Actions:** ~18 actions

#### **3. Darwinbox Finance Agent** 💰
**Modules:** Payroll, Compensation, Expenses
**Actions:** ~12 actions

#### **4. Darwinbox Engagement Agent** 💬
**Modules:** Learning, Engagement, Travel
**Actions:** ~10 actions

---

## Workflow Examples

### **Example 1: Employee Onboarding** (See diagram above)

**Flow:**
1. Darwinbox HR Agent → create_employee
2. Email Agent → send welcome email
3. Slack Agent → create user
4. Darwinbox HR Agent → create onboarding tasks
5. Jira Agent → create IT ticket

---

### **Example 2: Leave Approval Workflow**

```
START
  ↓
[Darwinbox HR Agent: leave_request]
  ↓ (employee_id, dates)
[Darwinbox HR Agent: leave_check_balance]
  ↓ (validation)
[IF balance sufficient]
  ↓
[Slack Agent: notify_manager]
  ↓
[Darwinbox HR Agent: leave_approve] (manual or auto)
  ↓
[Email Agent: send_confirmation]
  ↓
END
```

---

### **Example 3: Performance Review Cycle**

```
START (Quarterly trigger)
  ↓
[Darwinbox Talent Agent: performance_start_cycle]
  ↓ (all employees)
[Darwinbox Talent Agent: performance_assign_goals]
  ↓
[Email Agent: notify_employees]
  ↓
[Wait 30 days]
  ↓
[Darwinbox Talent Agent: performance_collect_self_reviews]
  ↓
[Darwinbox Talent Agent: performance_collect_manager_reviews]
  ↓
[Darwinbox Talent Agent: performance_calculate_ratings]
  ↓
[Darwinbox Finance Agent: compensation_calculate_bonus]
  ↓
END
```

---

## Technical Specifications

### **Connector Configuration**

**Storage:** Database table `connectors`

```python
{
    "id": "conn_darwinbox_001",
    "org_id": "org_demo",
    "type": "darwinbox",
    "name": "Production Darwinbox",
    "config": {
        "admin_email": "admin@company.com",
        "secret_key": "encrypted_secret",
        "base_url": "https://mycompany.darwinbox.in",
        "auth_method": "sha512"
    },
    "is_active": true,
    "created_at": "2025-01-15T10:00:00Z"
}
```

---

### **Agent Execution Example**

**Input:**
```json
{
    "agent_type": "darwinbox_hr",
    "config": {
        "connector_id": "conn_darwinbox_001",
        "action": "employee_create",
        "params": {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@company.com",
            "department": "Engineering",
            "title": "Software Engineer",
            "hire_date": "2025-02-01"
        }
    }
}
```

**Output:**
```json
{
    "success": true,
    "output": {
        "employee_id": "emp_12345",
        "status": "active",
        "created_at": "2025-01-15T10:30:00Z"
    },
    "tokens_used": 0,
    "cost": 0.0,
    "sources": null
}
```

---

## Migration Path

### **From Current to Hybrid Architecture**

**Step 1:** Build connector layer (no agent changes)
**Step 2:** Create 4 new hybrid agents
**Step 3:** Deprecate old `darwinbox` agent (keep for backward compatibility)
**Step 4:** Update documentation and examples

---

## Summary

| Aspect | Recommendation |
|--------|----------------|
| **Architecture** | Hybrid (3-4 domain agents) |
| **Agents to Create** | DarwinboxHRAgent, DarwinboxTalentAgent, DarwinboxFinanceAgent, DarwinboxEngagementAgent |
| **Connector Structure** | Centralized connector layer with 12 module classes |
| **Total Actions** | ~55 actions across 4 agents |
| **Priority Modules** | Employees, Leave, Attendance, Recruitment, Onboarding |
| **Timeline** | 6-8 weeks for complete implementation |

---

**Next Step:** Start building the connector foundation! 🚀
