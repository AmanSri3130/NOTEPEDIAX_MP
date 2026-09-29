# NotepediaX — System Architecture

NotepediaX is an AI-native EdTech platform for Indian learners ("Built for Bharat"). It combines course catalog management, standalone e-notes, a free 10-tool AI Zone, a grounded RAG engine, multi-step LangGraph agents, outcome-mapped leaderboards, and vernacular-first language pipelines.

```mermaid
graph TD
    Client["Clients: Web (Next.js/React) & Mobile (Expo/React Native)"]
    Gateway["API Gateway: Node.js + Express (JWT Auth, RBAC, Rate Limiter, Helmet)"]
    
    subgraph Product Modules
        Courses["Courses Module (Exam -> Subject -> Chapter -> Lesson)"]
        ENotes["E-Notes Module (Standalone & Linked)"]
        AITools["AI Tools Zone (10 Independent Tools)"]
        Leaderboard["Outcome-Mapped Leaderboards"]
        News["Current Affairs & News Briefs"]
    end
    
    subgraph AI & RAG Engine
        Agent["LangGraph Agent (Student Companion & Teacher Assistant)"]
        RAG["RAG Orchestrator (LangChain / Embedding Pipeline)"]
        LLMRouter["LLM Router (Frontier Reasoning vs. Open-Weight Volume)"]
    end
    
    subgraph Storage & Infrastructure
        Mongo["MongoDB Atlas (Users, Content, Progress, Attempts, Vector Index)"]
        Redis["Redis (Cache, Sessions, Rate Limits, Leaderboard Sorted Sets)"]
        S3["AWS S3 + CloudFront CDN (HLS Video, PDFs, Scanned Images)"]
        Workers["BullMQ Workers (Ingestion, OCR, Speech, PPT, TTS)"]
    end

    Client --> Gateway
    Gateway --> Product Modules
    Gateway --> Agent
    Product Modules --> RAG
    Agent --> RAG
    RAG --> LLMRouter
    RAG --> Mongo
    Leaderboard --> Redis
    Product Modules --> Mongo
    Product Modules --> S3
    RAG --> Workers
```

## Core Layers

1. **Client Layer:**
   - Web App (`apps/web` / `frontend`): React / Next.js with Tailwind CSS, shadcn/ui design components, and i18next vernacular support.
   - Mobile App (`apps/mobile`): React Native (Expo) sharing `packages/shared-types` and `packages/api-client`.

2. **API Gateway Layer (`backend` / `apps/api`):**
   - Node.js + Express with TypeScript DTO validations.
   - Authentication: Phone OTP (primary for India), Email/Password, Google OAuth, JWT with short-lived access tokens and HTTP-only rotating refresh tokens.
   - Security: Helmet headers, Redis token-bucket rate limiting per IP/User/Tool, CORS allowlists, OWASP sanitized inputs.

3. **Product Modules:**
   - **Courses:** Hierarchical taxonomy: Exam $\rightarrow$ Course $\rightarrow$ Subject $\rightarrow$ Chapter $\rightarrow$ Lesson.
   - **E-Notes:** Standalone & linked PDF/markdown notes with heading-level chunking.
   - **AI Tools Zone:** 10 modular tools exposing internal service interfaces.
   - **Leaderboard:** Redis Sorted Set powered outcome-mapped ranking based on exam accuracy and test attempts.
   - **News & Current Affairs:** Verified RSS/licensed news ingestion with AI summaries tagged by exam relevance.

4. **AI & RAG Engine (`packages/ai-core`):**
   - **Ingestion Pipeline:** PDF/Doc/Transcript chunking by heading $\rightarrow$ embeddings generation $\rightarrow$ MongoDB Atlas Vector Search indexing.
   - **LLM Router:** Routes simple high-volume requests to open-weight models and complex reasoning/evaluation tasks to frontier models.
   - **LangGraph Agents:** Persistent Study Companion (student persona) and Classroom Assistant (teacher persona) with short-term Redis state and long-term MongoDB memory.

5. **Storage & Infrastructure:**
   - **MongoDB Atlas:** Primary data store & vector search engine.
   - **Redis:** Session cache, token revocation list, rate limiting, and leaderboard sorted sets.
   - **AWS S3 + CDN:** Signed URLs for secure video streaming and note downloads.
   - **BullMQ Workers:** Asynchronous processing queue for ingestion, OCR, PPT generation, TTS, and evals.
