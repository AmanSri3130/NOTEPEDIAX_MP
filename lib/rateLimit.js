/**
 * Simple in-memory sliding-window rate limiter.
 *
 * NOTE: memory is per server instance. On serverless platforms (Vercel) each
 * instance has its own counter, so this is a best-effort guard. For strict
 * global limits swap this for Upstash Redis / Vercel KV (same function shape).
 */
const buckets = new Map();

export function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);

  if (hits.length >= limit) {
    const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - hits[0])) / 1000));
    buckets.set(key, hits);
    return { ok: false, retryAfterSec };
  }

  hits.push(now);
  buckets.set(key, hits);

  // Opportunistic cleanup so the map cannot grow forever.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (!v.length || now - v[v.length - 1] > windowMs) buckets.delete(k);
    }
  }
  return { ok: true, remaining: limit - hits.length };
}

export function getClientKey(request) {
  const fwd = request.headers.get('x-forwarded-for');
  const ip = fwd ? fwd.split(',')[0].trim() : request.headers.get('x-real-ip') || 'local';
  return ip;
}
