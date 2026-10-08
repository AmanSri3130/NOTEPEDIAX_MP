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
- Python >= 3.10 (Elite adaptive learning engine)
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
    MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
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

### Elite Adaptive Learning Engine

The adaptive recommendations, spaced-revision queue, study plan, and activity
feedback panel appear on the dashboard for signed-in `elite_student` accounts.
The private FastAPI engine reads existing student profiles and stores adaptive
state in the same MongoDB `notepediax` database; the frontend never receives
the MongoDB URI or internal API key.

1. Copy `notepediax_engine/.env.example` to `notepediax_engine/.env` and set the same server-only `MONGODB_URI` used by the backend, `MONGODB_DATABASE=notepediax`, and a long random `ENGINE_API_KEY`.
2. Set `ADAPTIVE_ENGINE_URL=http://127.0.0.1:8000` and the exact same key as `ADAPTIVE_ENGINE_API_KEY` in `backend/.env`.
4. Install and start the engine from the repository root:
   ```powershell
   cd notepediax_engine
   py -m venv .venv
   .venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
5. Start the Node backend and React frontend in separate terminals as above.

The engine creates its MongoDB indexes and seeds the topic taxonomy at startup.
Never expose the MongoDB URI or engine API key in frontend environment
variables. Its health endpoint reports `degraded` until its MongoDB URI and
internal key are configured.

Elite students also have an Email Agent panel on the dashboard. It drafts from
a natural-language request, saves a private draft under the student's account,
and requires the student to review and confirm before sending. Draft generation
uses the backend `GROQ_API_KEY`; delivery requires `SMTP_HOST`, `SMTP_PORT`,
`SMTP_USER`, `SMTP_PASS`, and `MAIL_FROM` in `backend/.env`. Email credentials
must remain server-side.
# NOTEPEDIAX_MP
