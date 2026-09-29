# NotepediaX — Security Architecture & Guidelines

## Security Controls

1. **Authentication & Token Management:**
   - Short-lived JWT Access Tokens (15-minute expiration).
   - HTTP-only, Secure, SameSite=Strict Refresh Tokens stored in Redis with revocation capability.
   - Passwordless Phone OTP with rate-limited verification attempts (max 3 tries per OTP).

2. **Input Sanitization & Injection Defense:**
   - Strict request body validation via `Zod` DTO schemas on all API endpoints.
   - OWASP Security Headers configured via `Helmet`.
   - RAG Prompt Injection Guard: User uploads and retrieved text are encapsulated as untrusted context and stripped of system instruction overrides.

3. **Rate Limiting & Quota Management:**
   - Global API Rate Limiting: 100 requests / 15 minutes per IP.
   - Sensitive Endpoints (OTP Request): 3 requests / 10 minutes per phone number.
   - AI Tools Quota: Enforced via Redis sliding window (5 queries/day for free users).

4. **Data Protection & Storage:**
   - Media and note assets served strictly via AWS S3 signed URLs with short expiry (15 minutes).
   - Secrets managed via environment variables (never committed to version control).
