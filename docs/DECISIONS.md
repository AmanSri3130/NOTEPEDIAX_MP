# NotepediaX — Architecture Decision Records (ADR)

This log documents key architectural choices, trade-offs, and rationale.

## ADR-001: Monorepo Structure (`pnpm` Workspaces + Turborepo)
- **Status:** Approved
- **Context:** Need clean code sharing between Web (Next.js), Mobile (React Native), API Gateway (Express TS), Workers, and AI Core.
- **Decision:** Use `pnpm` workspaces + Turborepo for fast incremental builds and clear dependency isolation.

## ADR-002: MongoDB Atlas Vector Search First
- **Status:** Approved
- **Context:** Early-stage operations should avoid managing multiple standalone vector databases.
- **Decision:** Use MongoDB Atlas Vector Search as the default vector store. Abstract access behind a standard `VectorStore` interface to allow seamless migration to Qdrant if query volume demands it.

## ADR-003: LLM Router for Cost and Latency Control
- **Status:** Approved
- **Context:** Calling frontier LLMs (Claude 3.5 Sonnet / GPT-4o) for simple query tasks is cost-prohibitive for free-tier users.
- **Decision:** All AI calls go through an internal `LLMRouter`. Simple tasks (summaries, flashcard generation, mind maps) route to fast open-weight models (Llama 3 70B via Groq/Together). Complex reasoning (doubt solving, evaluation rubrics) routes to frontier models with strict daily quotas.

## ADR-004: India-First Phone OTP Authentication
- **Status:** Approved
- **Context:** Indian students primarily use mobile phones and WhatsApp/SMS for login rather than passwords.
- **Decision:** Phone OTP is the primary authentication path, supplemented by Email OTP and Google OAuth. Passwordless design reduces friction and fake account creation.

## ADR-005: Asynchronous Processing via BullMQ & Redis
- **Status:** Approved
- **Context:** PDF parsing, vector embedding generation, PPT export, and TTS processing can cause API gateway latency spikes if run synchronously.
- **Decision:** All long-running operations are offloaded to BullMQ workers with automatic retry and backoff mechanisms.

## ADR-006: Primary Database & Vector Search Migration to Supabase (PostgreSQL + pgvector)
- **Status:** Approved (User Selected)
- **Context:** The team chose to migrate primary relational storage and vector search from MongoDB Atlas to Supabase (PostgreSQL + pgvector).
- **Decision:** Use Supabase JavaScript Client (`@supabase/supabase-js`) in backend and frontend. Define PostgreSQL schemas for users, exams, courses, e-notes, and vector embeddings (`note_chunks` with HNSW `pgvector` indexing and RPC `match_note_chunks` search function).

