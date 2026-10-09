import { createHmac, timingSafeEqual } from "node:crypto";

export const MFA_COOKIE = "mfa_ok";
export const MFA_MAX_AGE_SEC = 60 * 60 * 12;

function hmac(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** Signed cookie value: userId.exp.hmac — not a raw UUID. */
export function signMfaCookie(userId: string, secret: string, now = Date.now()): string {
  const exp = Math.floor(now / 1000) + MFA_MAX_AGE_SEC;
  const payload = `${userId}.${exp}`;
  return `${payload}.${hmac(secret, payload)}`;
}

export function verifyMfaCookie(
  value: string | undefined,
  userId: string,
  secret: string,
  now = Date.now(),
): boolean {
  if (!value || !secret || !userId) return false;
  const lastDot = value.lastIndexOf(".");
  if (lastDot <= 0) return false;
  const payload = value.slice(0, lastDot);
  const sig = value.slice(lastDot + 1);
  const sep = payload.indexOf(".");
  if (sep <= 0) return false;
  const id = payload.slice(0, sep);
  const exp = Number(payload.slice(sep + 1));
  if (id !== userId || !Number.isFinite(exp) || exp * 1000 < now) return false;
  const expected = hmac(secret, payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
