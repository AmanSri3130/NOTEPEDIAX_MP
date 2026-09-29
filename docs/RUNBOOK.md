# NotepediaX — Operations & Incident Runbook

## Health & Probe Endpoints
- **Health Check:** `GET /healthz` (Returns HTTP 200 OK with timestamp and correlation ID)
- **Readiness Check:** `GET /readyz` (Returns HTTP 200 OK with service readiness state)

## Common Incidents & Responses

### 1. Redis Connection Failure
- **Symptoms:** Rate limiters fail open or return 500 errors; leaderboard updates pause.
- **Action:**
  1. Check Redis process status: `redis-cli ping`.
  2. Verify network security group settings on AWS ElastiCache / Redis Cloud.
  3. Restart API Gateway to re-establish connection pool.

### 2. LLM Provider Outage / High Latency
- **Symptoms:** AI Tools requests timing out after 15s.
- **Action:**
  1. Check LLMRouter provider health metrics in Sentry / CloudWatch.
  2. Fallback switch: `LLMRouter` automatically fails over from primary provider to secondary open-weight provider.
