# NotepediaX — Adaptive Learning & Personalization Engine

> **Phase 1, Phase 2 & Phase 3**: End-to-end Adaptive Intelligence Platform featuring Universal Event Ingestion (8 Event Types), Rolling Feature Engineering Pipeline, Exponential Forgetting & Retention Decay Curves, Multi-Factor Activity Recommendation Scoring, and Constraint-Bounded Daily Planning with Dynamic Replanning.

---

## Complete 3-Tier Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                           NotepediaX Clients                                           │
│                 (Next.js Web App · AI Flashcards · E-Notes · Quiz Engine · Doubt Solver)               │
└──────────────────────────────────────────────────┬─────────────────────────────────────────────────────┘
                                                   │ REST / JSON (UniversalLearningEvent & PlanFeedback)
                                                   ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               FastAPI Adaptive Engine (Phase 1, 2 & 3)                                 │
│                                                                                                        │
│  [Phase 1 & 2 Core Endpoints]                                                                          │
│  POST /student/onboard                   ─── Onboard & initialize baseline state                       │
│  POST /student/{id}/diagnostic           ─── Seed diagnostic scores (t=0)                              │
│  POST /student/{id}/event                ─── Ingest event -> Multi-modal scoring -> Update State       │
│  GET  /student/{id}/state                ─── Profile + Real-time Decayed State                         │
│  GET  /student/{id}/revision-due         ─── Ranked revision urgency queue (R < θ)                     │
│  GET  /student/{id}/features/{topic_id}  ─── 7-day ML Feature Vector (Accuracy, RT, Consistency)       │
│                                                                                                        │
│  [Phase 3 Recommendation & Planning Endpoints]                                                         │
│  GET  /student/{id}/recommendations      ─── Multi-factor ranked Next Best Actions with UI Reasons     │
│  POST /student/{id}/optimize-plan        ─── Constraint-Bounded Daily Plan (Time + Prereqs + Breaks)   │
│  GET  /student/{id}/plan/today           ─── Active Daily Plan from MongoDB                            │
│  POST /student/{id}/plan/{act_id}/feedback ─ Submit Outcome & Trigger Adaptive Replanning               │
└───────────────┬───────────────────────────────┬───────────────────────────────┬────────────────────────┘
                │                               │                               │
     ┌──────────┴──────────┐         ┌──────────┴──────────┐         ┌──────────┴──────────┐
     ▼                     ▼         ▼                     ▼         ▼                     ▼
┌──────────────────┐ ┌─────────────┐ ┌─────────────────────┐ ┌─────────────────────────────┐ ┌──────────────────┐
│ Feature Pipeline │ │  Retention  │ │ Candidate Generator │ │ Recommendation Engine (ML)  │ │ Schedule Planner │
│ - Rolling Acc    │ │  - Decay    │ │ - Gaps (<0.50)      │ │ - Multi-factor Scoring      │ │ - Prereq Gates   │
│ - Avg Response   │ │    R=M₀e^-λt│ │ - Retention Risks   │ │   (Gap, Exam, Risk, Goal)   │ │ - Time Budget    │
│ - Consistency    │ │ - Urgency   │ │ - Concept & Practice│ │ - Explainable UI Reasoning  │ │ - Auto Breaks    │
│ - 7-day Vector   │ │   Priority  │ │   Pool              │ │ - GBDT / LightGBM Re-rank   │ │ - Adaptive Replan│
└──────────────────┘ └─────────────┘ └─────────────────────┘ └─────────────────────────────┘ └──────────────────┘
                                                │
                                                ▼ PyMongo
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                MongoDB (`notepediax` database)                                         │
│                                                                                                        │
│  elitestudents / freestudents ─ Existing NotepediaX student profiles (read-only)                      │
│  learner_states ─ Dynamic topic_mastery, retention_scores, last_updated_at                            │
│  learning_events  Immutable append-only stream of all 8 universal event types                          │
│  topic_taxonomy ─ Hierarchical knowledge graph & prerequisite taxonomy                                 │
│  learning_plans ─ Daily adaptive study plans with ordered activity slots & completion status           │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Multi-Factor Recommendation Scoring Formula (Phase 3)

$$\text{Recommendation Score} = 0.30 \cdot G_{\text{knowledge}} + 0.20 \cdot P_{\text{exam}} + 0.15 \cdot R_{\text{forgetting}} + 0.15 \cdot I_{\text{goal}} + 0.10 \cdot E_{\text{engagement}} + 0.10 \cdot C_{\text{preference}}$$

- $G_{\text{knowledge}} = 1.0 - \text{Mastery}_{\text{topic}}$: Magnitude of knowledge gap.
- $P_{\text{exam}}$: Weight derived from student's target exam (JEE Main / Advanced / NEET / Boards).
- $R_{\text{forgetting}} = 1.0 - \text{Retention Score}$: Ebbinghaus memory decay urgency.
- $I_{\text{goal}}$: Potential impact on target score.
- $E_{\text{engagement}}$: Probability of student completing the activity.
- $C_{\text{preference}}$: Match with daily available minutes and preferred formats.

---

## Constraint-Based Planning Engine

1. **Prerequisite Mastery Gate**: Checks `topic_taxonomy.prerequisite_topic_ids`. Topics cannot be scheduled until all prerequisite topics have reached $\text{Mastery} \ge 0.60$.
2. **Knapsack Time Fitting**: Fits top-ranked activities strictly into the student's `daily_available_minutes`.
3. **Cognitive Rest Period**: Automatically injects a 10-minute `BREAK` after every 45–50 minutes of intensive study blocks.
4. **Adaptive Replanning**: When an activity receives `SKIPPED` or `TOO_HARD` feedback, remaining tasks on that topic are dynamically replaced with AI explanations / conceptual notes to support the learner.

---

## REST API Reference

| Phase | Method | Endpoint | Description |
|---|---|---|---|
| **P1** | `POST` | `/student/onboard` | Onboard student & initialize empty state |
| **P1** | `POST` | `/student/{id}/diagnostic` | Submit baseline diagnostic test scores |
| **P1** | `GET` | `/student/{id}/state` | Fetch profile & dynamically decayed learner state |
| **P2** | `POST` | `/student/{id}/event` | Ingest universal event and update mastery & retention |
| **P2** | `GET` | `/student/{id}/revision-due` | Get list of topics below retention threshold ranked by urgency |
| **P2** | `GET` | `/student/{id}/features/{topic_id}` | Fetch 7-day rolling ML feature vector for student × topic |
| **P3** | `GET` | `/student/{id}/recommendations` | Get ranked next best learning activities with UI reasons |
| **P3** | `POST` | `/student/{id}/optimize-plan` | Generate & persist constraint-bounded daily schedule |
| **P3** | `GET` | `/student/{id}/plan/today` | Fetch active daily plan from MongoDB |
| **P3** | `POST` | `/student/{id}/plan/{act_id}/feedback` | Submit activity outcome & trigger real-time adaptive replan |

---

## Quick Start & Setup

### 1. Environment Setup

```bash
cd notepediax_engine
python -m venv .venv

# Activate environment:
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Windows (cmd):
.venv\Scripts\activate.bat
# Linux / macOS:
source .venv/bin/activate

# Install all dependencies (FastAPI, PyMongo, NumPy, Pandas, Scikit-learn, LightGBM, HTTPX)
pip install -r requirements.txt
```

### 2. Configure Credentials

```bash
cp .env.example .env
# Set MONGODB_URI, MONGODB_DATABASE=notepediax and ENGINE_API_KEY in .env.
# Use the same MongoDB URI as the backend and a long random internal API key.
```

The engine reads student profiles from the existing `elitestudents` and
`freestudents` collections and stores adaptive state, events, plans, and topic
taxonomy in MongoDB. It creates the required indexes and seeds the topic
taxonomy at startup. Set the same `ENGINE_API_KEY` in `backend/.env` as
`ADAPTIVE_ENGINE_API_KEY`; never place either value in frontend configuration.

### 3. Launch Development Server

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Health check: `http://127.0.0.1:8000/health`. Student endpoints require the
internal API key and should be accessed through the authenticated NotepediaX
backend. Manual simulation scripts require `STUDENT_ID` to reference an
existing staging account and modify that account's adaptive state.

---

## Running Test Suites

Run test suites in a second terminal while the server is active:

```bash
# 1. Phase 1 Mock Event Tests:
python -m tests.test_mock_events

# 2. Phase 2 7-Day Simulation Tests:
python -m tests.test_phase2_simulation

# 3. Phase 3 Recommendation, Planning & Adaptive Replanning Tests:
python -m tests.test_phase3_simulation
```

---

## Project Structure

```
notepediax_engine/
├── app/
│   ├── __init__.py
│   ├── config.py                 # Settings (weights, thresholds, forgetting rate)
│   ├── database.py               # MongoDB client and collection setup
│   ├── schemas.py                # Contracts for events, recommendations, plans & feedback
│   ├── services/
│   │   ├── __init__.py
│   │   ├── candidate_generator.py # Generates candidate learning activities pool
│   │   ├── recommender.py        # Multi-factor scoring & GBDT ML re-ranking engine
│   │   ├── planner.py            # Constraint-based optimizer & adaptive replanner
│   │   ├── feature_pipeline.py   # Rolling statistical features pipeline
│   │   ├── retention_engine.py   # Ebbinghaus exponential forgetting decay curves
│   │   └── learner_state.py      # Dynamic mastery & state management
│   └── main.py                   # FastAPI REST API endpoints
├── tests/
│   ├── __init__.py
│   ├── test_mock_events.py       # Phase 1 verification tests
│   ├── test_phase2_simulation.py # Phase 2 7-day simulation tests
│   └── test_phase3_simulation.py # Phase 3 planning & replanning simulation
├── .env.example
├── requirements.txt
└── README.md
```

---

## License

MIT License. Built for the NotepediaX Adaptive Learning Platform.
