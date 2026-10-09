import "server-only";
import { env, features } from "@/lib/env";

/** Production without Turnstile fails closed. Local/test without keys still skip. */
export async function verifyTurnstile(
  token: FormDataEntryValue | null,
  ip?: string,
): Promise<boolean> {
  if (env.NODE_ENV === "production" && !features.turnstile) return false;
  if (!features.turnstile) return true;
  if (typeof token !== "string" || token.length === 0) return false;

  const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY!, response: token });
  if (ip) body.set("remoteip", ip);

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(5000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
