import type { NextRequest } from "next/server";

/**
 * Best-effort per-process rate limiting for small deployments.
 * Serverless instances do not share memory; configure a CDN/WAF or shared
 * rate-limit store for enforceable limits across multiple instances.
 */
type WindowEntry = { count: number; resetAt: number };
const windows = new Map<string, WindowEntry>();
let lastCleanup = 0;

export function getClientKey(request: Request | NextRequest): string {
  // On managed hosts, the platform should sanitize forwarding headers. Prefer
  // x-real-ip where available; x-forwarded-for is a fallback.
  const realIp = request.headers.get("x-real-ip")?.trim();
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return realIp || forwarded || "unknown";
}

export function checkRateLimit(
  key: string,
  options: { limit: number; windowMs: number; namespace: string },
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  if (now - lastCleanup > 60_000) {
    for (const [entryKey, entry] of windows) {
      if (entry.resetAt <= now) windows.delete(entryKey);
    }
    lastCleanup = now;
  }

  const storageKey = `${options.namespace}:${key}`;
  const current = windows.get(storageKey);
  if (!current || current.resetAt <= now) {
    windows.set(storageKey, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (current.count >= options.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }
  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
