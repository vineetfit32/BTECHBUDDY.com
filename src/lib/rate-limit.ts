import { NextResponse } from "next/server";

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

type Store = Map<string, number[]>;

const globalStore = globalThis as unknown as { __btbRateLimit?: Store; __btbRateLimitSweep?: number };
const store: Store = globalStore.__btbRateLimit ?? new Map();
globalStore.__btbRateLimit = store;

function sweep(now: number) {
  if (globalStore.__btbRateLimitSweep && now - globalStore.__btbRateLimitSweep < 60_000) return;
  globalStore.__btbRateLimitSweep = now;
  for (const [key, hits] of store) {
    if (hits.length === 0 || now - hits[hits.length - 1] > 24 * 60 * 60 * 1000) store.delete(key);
  }
}

// Sliding-window log kept in process memory; run one app instance or front it with a shared limiter.
export function rateLimit(key: string, { limit, windowMs }: RateLimitOptions, now = Date.now()): RateLimitResult {
  sweep(now);
  const windowStart = now - windowMs;
  const hits = (store.get(key) ?? []).filter((t) => t > windowStart);

  if (hits.length >= limit) {
    store.set(key, hits);
    return { ok: false, remaining: 0, retryAfterSeconds: Math.max(1, Math.ceil((hits[0] + windowMs - now) / 1000)) };
  }

  hits.push(now);
  store.set(key, hits);
  return { ok: true, remaining: limit - hits.length, retryAfterSeconds: 0 };
}

export function resetRateLimit(key?: string) {
  if (key) store.delete(key);
  else store.clear();
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export function tooManyRequests(result: RateLimitResult, message = "Too many requests. Please slow down and try again shortly.") {
  return NextResponse.json(
    { error: message },
    { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } }
  );
}

/** Returns a 429 response when any of the given buckets is exhausted, otherwise null. */
export function enforceRateLimits(
  buckets: Array<{ key: string } & RateLimitOptions>,
  message?: string
): NextResponse | null {
  for (const bucket of buckets) {
    const result = rateLimit(bucket.key, bucket);
    if (!result.ok) return tooManyRequests(result, message);
  }
  return null;
}
