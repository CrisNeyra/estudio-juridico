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
  // Prefer Gmail SMTP (free, no custom domain). Resend remains optional fallback.
  GMAIL_USER: z.email().optional(),
  GMAIL_APP_PASSWORD: z.string().min(8).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  CONTACT_TO_EMAIL: z.email().optional(),
  CONTACT_FROM_EMAIL: z.string().min(3).optional(),
  UPSTASH_REDIS_REST_URL: z.url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
  DATABASE_URL: z.string().min(1).optional(),
  AUTH_SECRET: z.string().min(16).optional(),
  BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),
});

const emptyToUndefined = Object.fromEntries(
  Object.entries(process.env).map(([k, v]) => [k, v === "" ? undefined : v]),
);

export const env = schema.parse(emptyToUndefined);

const gmail = Boolean(env.GMAIL_USER && env.GMAIL_APP_PASSWORD);
const resend = Boolean(env.RESEND_API_KEY);

export const features = {
  ai: Boolean(env.GOOGLE_GENERATIVE_AI_API_KEY) || env.AI_MOCK === "1",
  gmail,
  email: Boolean(env.CONTACT_TO_EMAIL && (gmail || resend)),
  redis: Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN),
  turnstile: Boolean(env.TURNSTILE_SECRET_KEY),
  db: Boolean(env.DATABASE_URL),
  auth: Boolean(env.DATABASE_URL && env.AUTH_SECRET),
  blob: Boolean(env.BLOB_READ_WRITE_TOKEN),
};
