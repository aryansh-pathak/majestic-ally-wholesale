import "server-only";
import { headers } from "next/headers";

/**
 * Best-effort in-memory rate limiter (sliding window). Good enough to slow
 * naive abuse of the login and public form. NOTE: memory is per serverless
 * instance, so for strong protection add a shared store (e.g. Upstash Redis) —
 * see the README "Hardening" section.
 */
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) {
    buckets.set(key, arr);
    return false; // limited
  }
  arr.push(now);
  buckets.set(key, arr);
  return true; // allowed
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}
