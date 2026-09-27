import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import { env, features } from "@/lib/env";

export type LimitResult = { success: boolean; remaining: number; reset: number };

type Policy = { limit: number; windowSeconds: number };

export const policies = {
  contact: { limit: 5, windowSeconds: 60 * 10 },
  appointment: { limit: 5, windowSeconds: 60 * 10 },
  chat: { limit: 20, windowSeconds: 60 * 10 },
  auth: { limit: 10, windowSeconds: 60 * 10 },
} satisfies Record<string, Policy>;

type PolicyName = keyof typeof policies;

// In-memory fallback: only reliable for a single instance (local dev). Production should
// configure Upstash so limits are shared across serverless instances.
const memory = new Map<string, number[]>();

function memoryLimit(key: string, { limit, windowSeconds }: Policy): LimitResult {
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;
  const hits = (memory.get(key) ?? []).filter((t) => t > windowStart);
  const success = hits.length < limit;
  if (success) hits.push(now);
  memory.set(key, hits);
  return {
    success,
    remaining: Math.max(0, limit - hits.length),
    reset: (hits[0] ?? now) + windowSeconds * 1000,
  };
}

const limiters = new Map<PolicyName, Ratelimit>();

function upstashLimiter(name: PolicyName): Ratelimit {
  let limiter = limiters.get(name);
  if (!limiter) {
    const { limit, windowSeconds } = policies[name];
    limiter = new Ratelimit({
      redis: new Redis({ url: env.UPSTASH_REDIS_REST_URL!, token: env.UPSTASH_REDIS_REST_TOKEN! }),
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
      prefix: `rl:${name}`,
      analytics: false,
    });
    limiters.set(name, limiter);
  }
  return limiter;
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "anonymous";
}

export async function rateLimit(name: PolicyName, identifier?: string): Promise<LimitResult> {
  const id = identifier ?? (await clientIp());
  if (features.redis) {
    const r = await upstashLimiter(name).limit(id);
    return { success: r.success, remaining: r.remaining, reset: r.reset };
  }
  return memoryLimit(`${name}:${id}`, policies[name]);
}

export const __test = { memoryLimit, memory };
