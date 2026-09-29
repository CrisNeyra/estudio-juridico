import "server-only";
import { z } from "zod";

/**
 * Server-side environment. Every integration is optional so the site runs locally with zero
 * configuration; features degrade gracefully (see README > Variables de entorno).
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1).optional(),
  GEMINI_MODEL: z.string().min(1).default("gemini-3.5-flash-lite"),
  AI_MOCK: z.enum(["0", "1"]).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  CONTACT_TO_EMAIL: z.email().optional(),
  CONTACT_FROM_EMAIL: z.string().min(3).optional(),
  UPSTASH_REDIS_REST_URL: z.url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
});

const emptyToUndefined = Object.fromEntries(
  Object.entries(process.env).map(([k, v]) => [k, v === "" ? undefined : v]),
);

export const env = schema.parse(emptyToUndefined);

export const features = {
  ai: Boolean(env.GOOGLE_GENERATIVE_AI_API_KEY) || env.AI_MOCK === "1",
  email: Boolean(env.RESEND_API_KEY && env.CONTACT_TO_EMAIL),
  redis: Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN),
  turnstile: Boolean(env.TURNSTILE_SECRET_KEY),
  supabase: Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
};
