# NotepediaX — AI-Native EdTech Platform ("Built for Bharat")

NotepediaX is an AI-native learning platform for Indian students (Class 6–12, NDA, JEE, NEET, UPSC) and teachers.

## Key Features
- **10 Free AI Tools Zone:** Standalone tools for doubts, quizzes, summaries, flashcards, mind maps, TTS explainer, essay evaluation, study planning, resume building, and PPT generation.
- **Grounded RAG Engine:** Answers cited directly against verified NotepediaX notes and textbook chapters using MongoDB Atlas Vector Search.
- **Dual-Persona Agents:** Persistent Study Companion (student) and Classroom Assistant (teacher) powered by LangGraph.
- **Outcome-Mapped Leaderboards:** Ranked on exam accuracy and test performance rather than vanity points.
- **Vernacular First:** Built-in Hindi & English pipeline.

## Documentation Index
- [Architecture & Layer Overview](docs/ARCHITECTURE.md)
- [Data Model & Schemas](docs/DATA_MODEL.md)
- [Architecture Decision Records (ADR)](docs/DECISIONS.md)
- [Security Guidelines](docs/SECURITY.md)
- [DPDP Act 2023 Compliance](docs/COMPLIANCE.md)
- [Grounded RAG Pipeline](docs/RAG.md)
- [AI Agents Design](docs/AGENTS.md)
- [Outcome-Mapped Leaderboards](docs/LEADERBOARD.md)
- [Operations & Incident Runbook](docs/RUNBOOK.md)
- [Known Gaps & Deferred Scope](docs/KNOWN_GAPS.md)
- [API Specification](docs/API.md)

## Quick Start (Local Development)

### Prerequisites
- Node.js >= 18
- MongoDB Atlas or local MongoDB instance
- Redis Server

### Setup Instructions
1. Clone the repository and install dependencies:
   ```bash
   cd NotepediaX_react
   ```

2. Configure environment variables in `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://127.0.0.1:27017/notepediax
   JWT_SECRET=notepediax_production_jwt_secret_key_2026
   REDIS_URL=redis://127.0.0.1:6379
   ```

3. Start backend API server:
   ```bash
   cd backend
   npm run dev
   ```

4. Start frontend React app:
   ```bash
   cd frontend
   npm run dev
   ```
# NOTEPEDIAX_MP
