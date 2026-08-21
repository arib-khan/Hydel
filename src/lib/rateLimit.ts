// src/lib/rateLimit.ts
//
// A minimal in-memory sliding-window rate limiter for the public inquiry
// endpoint. This is intentionally simple: it works well on a single
// long-lived Node.js server process. If this app is deployed across many
// serverless instances/regions, replace the Map below with a shared store
// (e.g. Upstash Redis) - the limit() function signature can stay the same.
import 'server-only';

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 5;

const hits = new Map<string, number[]>();

export function checkRateLimit(key: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const existing = (hits.get(key) || []).filter((t) => t > windowStart);

  if (existing.length >= MAX_REQUESTS) {
    const retryAfterMs = existing[0] + WINDOW_MS - now;
    return { allowed: false, retryAfterMs };
  }

  existing.push(now);
  hits.set(key, existing);
  return { allowed: true };
}
