# NotepediaX — AI Agent Architecture (LangGraph)

NotepediaX incorporates two persistent agent personas built on LangGraph:
1. **Study Companion Agent (Student Persona):** Multi-step study assistant that diagnoses weak areas, constructs revision schedules, and coordinates AI tools.
2. **Classroom Assistant Agent (Teacher Persona):** Multi-step assistant that generates exam papers, homework assignments, and class analytics summaries.

## Core Rules & Safety Boundaries
1. **Confirmation Before Transaction:** The agent MUST request explicit user confirmation before taking any action involving purchases, enrollments, or subscriptions.
2. **Service Reuse:** The agent orchestrates existing tool service APIs (`packages/ai-core/services/`) and never duplicates business logic.
3. **Step Capping:** Maximum 5 tool execution steps per agent invocation loop.
4. **Memory Store:** Short-term conversational state preserved in Redis; long-term student memory (weak topics, target exam, historical accuracy) stored in MongoDB.
