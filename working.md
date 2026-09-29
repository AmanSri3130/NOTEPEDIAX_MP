# NotepediaX — Technical Architecture & Operational Guide ("working")

Welcome to **NotepediaX**, an AI-native EdTech platform for Indian learners ("Built for Bharat"). This document provides a complete overview of the codebase, Supabase database architecture, API endpoints, authentication flows, free AI Tools Zone, and execution pipelines.

---

## 1. System Architecture & Tech Stack

```mermaid
graph TD
    Client["Client: Web (React + Vite + Tailwind CSS) & Mobile (Expo/React Native)"]
    Gateway["API Gateway: Node.js + Express (Port 5000, Helmet, CORS, Correlation IDs)"]
    
    subgraph Supabase Cloud Platform (PostgreSQL)
      SupaAuth["Supabase Client & Auth SDK (@supabase/supabase-js)"]
      SupaDB["Supabase PostgreSQL Database (Port 5432)"]
      PgVector["pgvector Extension (HNSW Cosine Vector Index)"]
    end
    
    subgraph Core Product Modules
      AI_Tools["AI Tools Zone (10 Independent Tools)"]
      RAG_Engine["Grounded RAG Pipeline (NotepediaX Verified Notes)"]
      Courses["Course & Syllabus Taxonomy"]
      Leaderboards["Outcome-Mapped Leaderboards"]
      Payments["UPI & GST Payments Engine"]
    end

    Client --> Gateway
    Gateway --> SupaAuth
    Gateway --> SupaDB
    SupaDB --> PgVector
    Gateway --> Core Product Modules
```

### Core Technologies
- **Web Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons, i18next (English & Hindi support), Framer Motion.
- **Backend API Gateway:** Express.js (Node.js ES Modules), JWT Authentication, Helmet security headers, CORS protection, correlation ID tracing (`X-Correlation-ID`).
- **Database & Vector Search:** **Supabase PostgreSQL** with **`pgvector`** extension (HNSW vector similarity indexing for RAG retrieval).

---

## 2. Supabase Database Schema & Tables Structure

The database is built on Supabase PostgreSQL (`db.hhstcwiifurczvytolnj.supabase.co`) with dedicated tables for roles, content, payments, and vector embeddings:

### Core Tables Overview
| Table Name | Purpose & Key Columns |
|---|---|
| **`public.users`** | Core identity table mapping auth accounts. Columns: `id`, `name`, `email`, `phone`, `role` (`student`, `teacher`, `admin`, `school_admin`, `content_editor`), `student_id`, `teacher_id`, `admin_id`. |
| **`public.students`** | Specialized student profiles. Columns: `target_exam` (`JEE_MAIN`, `NEET_UG`, etc.), `xp`, `level`, `streak`, `language_preference`, `is_minor`, `parent_consent`, `dpdp_consent`. |
| **`public.teachers`** | Teacher/instructor profiles. Columns: `full_name`, `subjects_handled`, `qualification`, `experience_years`, `bio`, `is_verified`. |
| **`public.admins`** | Admin profiles. Columns: `full_name`, `department`, `permissions`, `is_super_admin`. |
| **`public.exams`** | Exam taxonomy catalog (`JEE_MAIN`, `NEET_UG`, `NDA`, `UPSC`, `CBSE_CLASS_12`). |
| **`public.courses`** | Course definitions, pricing, thumbnail, and instructor foreign key. |
| **`public.subjects`**, **`chapters`**, **`lessons`** | Course hierarchy and media streaming links. |
| **`public.e_notes`** | Standalone and course-linked PDF/Markdown note library. |
| **`public.note_chunks`** | Document chunks embedded with `vector(1536)` embeddings, heading paths, page offsets, and HNSW cosine index (`idx_note_chunks_embedding`). |
| **`public.orders`**, **`payments`**, **`subscriptions`** | Razorpay/Cashfree/UPI payment transactions, GST fields, idempotency keys, active plans. |
| **`public.tool_quotas`** | Server-side sliding daily quotas per user and tool (5 free daily credits). |
| **`public.quiz_attempts`**, **`leaderboard_snapshots`** | Outcome-mapped performance rankings. |

---

## 3. Grounded RAG & AI Tools Engine

### Grounded RAG Pipeline
1. **Query Processing:** User query (text, voice, or image OCR) is parsed and translated to retrieval language if needed.
2. **Vector Matching:** Query embeddings are matched against `public.note_chunks` using Supabase RPC function `match_note_chunks(query_embedding, match_threshold, match_count, filter_exam_code)`.
3. **Similarity Check:** If similarity $\ge 0.78$, answer is generated with direct section/note citations (`[Section Title](link)`). If similarity $< 0.75$, system explicitly flags an uncited general explanation fallback.

### 10 AI Tools in AI Studio (`/ai-tools`)
1. **AI Note Summariser:** Generates high-yield study bullets from notes/transcripts.
2. **AI Doubt Solver:** Step-by-step conceptual solver grounded in textbook chapters.
3. **AI Quiz Generator:** Custom exam-pattern MCQs with explanations.
4. **AI Flashcard Maker:** Active-recall virtual index cards.
5. **AI Assignment Writer:** Structured thesis paper & homework writer.
6. **AI Mentor Chatbot:** Study gap analysis & revision counselor.
7. **AI Study Planner:** Exam-date-aware monthly time-slot optimizer.
8. **AI Resume Builder:** ATS resume ranking optimizer for internships.
9. **AI Note Translator:** Translates English notes into Hindi/regional Indian dialects.
10. **AI Voice Explainer:** Text-to-speech Audio explanations.

---

## 4. Operational & Running Commands

### Environment Configuration (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=supersecretjwtkey123
JWT_REFRESH_SECRET=supersecretrefreshjwtkey123

# Supabase PostgreSQL Connection
SUPABASE_URL=https://hhstcwiifurczvytolnj.supabase.co
SUPABASE_ANON_KEY=sb_publishable_TR4tFNCVyVaubp5efP0J7A_19zmjoCM
SUPABASE_SERVICE_ROLE_KEY=sb_publishable_TR4tFNCVyVaubp5efP0J7A_19zmjoCM
DATABASE_URL=postgresql://postgres:NoteX%40123_456@db.hhstcwiifurczvytolnj.supabase.co:5432/postgres
```

### Running Locally
- **Backend API Gateway (Port 5000):**
  ```bash
  cd backend
  npm run dev
  ```
- **Web Frontend (Port 5173):**
  ```bash
  cd frontend
  npm run dev
  ```

---

## 5. Verification & Health Probes

- **Web Frontend:** [`http://localhost:5173`](http://localhost:5173/)
- **Backend Health Check:** [`http://localhost:5000/healthz`](http://localhost:5000/healthz)
- **Backend Readiness Probe:** [`http://localhost:5000/readyz`](http://localhost:5000/readyz)

---

## 6. Recent Integration Status

- **Supabase Hybrid RAG Pipeline:** Updated `backend/services/ragService.js` to integrate `SupabaseService.searchNoteChunksVector` calling Supabase RPC `match_note_chunks` over `public.note_chunks`.
- **Dual Fallback Engine:** Maintains smooth fallback to local TF-IDF / Mongoose index when offline or vector query is omitted.
- **Backend API Gateway:** Probes verified with correlation ID middleware and full route coverage (`/api/auth`, `/api/courses`, `/api/chatbot`, `/api/payment`).

