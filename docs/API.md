# NotepediaX — API Specification (REST & WebSocket)

## Authentication Endpoints

### `POST /api/auth/send-otp`
Sends a 6-digit login/registration OTP to the specified Indian phone number.
- **Request:** `{ "phone": "+919876543210" }`
- **Response:** `{ "success": true, "message": "OTP sent successfully" }`

### `POST /api/auth/verify-otp`
Verifies phone OTP and returns JWT tokens.
- **Request:** `{ "phone": "+919876543210", "otp": "123456", "dpdpConsent": true }`
- **Response:** `{ "success": true, "token": "<JWT_ACCESS_TOKEN>", "user": { ... } }`

---

## Health & System Probes

### `GET /healthz`
Returns gateway health status and correlation ID.
- **Response:** `{ "status": "OK", "timestamp": "2026-09-20T20:00:00.000Z", "correlationId": "npx-1234" }`

### `GET /readyz`
Returns readiness status.
- **Response:** `{ "ready": true, "service": "notepediax-api" }`

---

## Courses & E-Notes Endpoints

### `GET /api/courses`
Returns catalog of published courses filtered by target exam.
- **Query Params:** `examCode=JEE_MAIN`
- **Response:** `{ "success": true, "data": [ ... ] }`

### `GET /api/notes`
Returns standalone e-notes catalog.
- **Query Params:** `subject=Physics&isFree=true`
- **Response:** `{ "success": true, "data": [ ... ] }`

---

## AI Tools Zone Endpoints

### `POST /api/chatbot/query`
Main RAG query interface powering AI Doubt Solver & Summarizer.
- **Headers:** `Authorization: Bearer <token>`, `x-lang: hi`
- **Request:** `{ "toolId": "doubt", "prompt": "Explain Huygens Principle in Hindi", "noteId": "651a..." }`
- **Response:** `{ "success": true, "output": "...", "citations": [ { "noteId": "...", "headingPath": "..." } ] }`
