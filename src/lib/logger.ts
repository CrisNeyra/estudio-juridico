type Level = "debug" | "info" | "warn" | "error";

const REDACT = /(email|phone|message|text|notes|token|key|password)/i;

function redact(meta: Record<string, unknown>): Record<string, unknown> {
  if (process.env.NODE_ENV !== "production") return meta;
  return Object.fromEntries(
    Object.entries(meta).map(([k, v]) => [k, REDACT.test(k) ? "[redacted]" : v]),
  );
}

/**
 * Structured JSON logger (one line per event) readable by Vercel Logs / any log drain.
 * PII fields are redacted in production.
 */
function log(level: Level, event: string, meta: Record<string, unknown> = {}) {
  const line = JSON.stringify({ level, event, time: new Date().toISOString(), ...redact(meta) });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (event: string, meta?: Record<string, unknown>) => log("debug", event, meta),
  info: (event: string, meta?: Record<string, unknown>) => log("info", event, meta),
  warn: (event: string, meta?: Record<string, unknown>) => log("warn", event, meta),
  error: (event: string, meta?: Record<string, unknown>) => log("error", event, meta),
};
