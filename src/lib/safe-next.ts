/** Only allows same-site relative paths to avoid open redirects. */
export function safeNext(next: unknown, fallback = "/portal"): string {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
