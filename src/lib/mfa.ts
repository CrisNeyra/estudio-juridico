import "server-only";
import { eq } from "drizzle-orm";
import { generateSecret, generateURI, verify } from "otplib";
import QRCode from "qrcode";
import { site } from "@/content/site";
import { getDb, schema } from "@/lib/db";

export async function startTotpEnrollment(userId: string, email: string) {
  const db = getDb();
  if (!db) throw new Error("db_not_configured");
  const secret = generateSecret();
  await db
    .update(schema.profiles)
    .set({ totpSecret: secret })
    .where(eq(schema.profiles.id, userId));
  const otpauth = generateURI({
    issuer: site.name,
    label: email,
    secret,
  });
  const qr = await QRCode.toDataURL(otpauth);
  return { secret, qr };
}

export async function confirmTotpEnrollment(userId: string, code: string) {
  const db = getDb();
  if (!db) return false;
  const [profile] = await db
    .select({ secret: schema.profiles.totpSecret })
    .from(schema.profiles)
    .where(eq(schema.profiles.id, userId))
    .limit(1);
  if (!profile?.secret) return false;
  const result = await verify({ token: code, secret: profile.secret });
  if (!result.valid) return false;
  await db.update(schema.profiles).set({ totpEnabled: true }).where(eq(schema.profiles.id, userId));
  return true;
}

export async function verifyTotp(userId: string, code: string) {
  const db = getDb();
  if (!db) return false;
  const [profile] = await db
    .select({ secret: schema.profiles.totpSecret, enabled: schema.profiles.totpEnabled })
    .from(schema.profiles)
    .where(eq(schema.profiles.id, userId))
    .limit(1);
  if (!profile?.secret || !profile.enabled) return false;
  const result = await verify({ token: code, secret: profile.secret });
  return result.valid;
}

export async function disableTotp(userId: string) {
  const db = getDb();
  if (!db) return;
  await db
    .update(schema.profiles)
    .set({ totpSecret: null, totpEnabled: false })
    .where(eq(schema.profiles.id, userId));
}
