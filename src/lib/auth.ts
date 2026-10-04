import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { auth } from "@/auth";
import { getDb, schema } from "@/lib/db";
import { features } from "@/lib/env";
import { safeNext } from "@/lib/safe-next";

export { safeNext };

export type Role = "cliente" | "abogado" | "admin";

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: Role;
  totp_enabled: boolean;
};

async function mfaCookieMatches(userId: string) {
  const jar = await cookies();
  return jar.get("mfa_ok")?.value === userId;
}

/** Loads the verified user, profile and MFA state once per request. */
export const getAuthContext = cache(async () => {
  await connection();
  if (!features.auth) return { configured: false as const };

  const session = await auth();
  if (!session?.user?.id) return { configured: true as const, session: null, user: null };

  const db = getDb();
  if (!db) return { configured: false as const };

  const [profile] = await db
    .select({
      id: schema.profiles.id,
      email: schema.profiles.email,
      full_name: schema.profiles.fullName,
      phone: schema.profiles.phone,
      role: schema.profiles.role,
      totp_enabled: schema.profiles.totpEnabled,
    })
    .from(schema.profiles)
    .where(eq(schema.profiles.id, session.user.id))
    .limit(1);

  const mfaVerified = profile?.totp_enabled ? await mfaCookieMatches(session.user.id) : false;

  return {
    configured: true as const,
    session,
    user: { id: session.user.id, email: session.user.email ?? "" },
    profile: profile ?? null,
    mfaVerified,
  };
});

export function isStaff(role?: Role | null): boolean {
  return role === "abogado" || role === "admin";
}

export async function markMfaVerified(userId: string) {
  const jar = await cookies();
  jar.set("mfa_ok", userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearMfaVerified() {
  const jar = await cookies();
  jar.delete("mfa_ok");
}

/** Any authenticated user. Users with MFA enrolled must complete the second factor. */
export async function requireUser() {
  const ctx = await getAuthContext();
  if (!ctx.configured) redirect("/portal/login");
  if (!ctx.user || !ctx.profile) redirect("/portal/login");
  if (ctx.profile.totp_enabled && !ctx.mfaVerified) redirect("/portal/mfa");
  return { user: ctx.user, profile: ctx.profile, mfaVerified: ctx.mfaVerified };
}

/** Staff (abogado/admin) always need MFA: they access every client's data. */
export async function requireStaff() {
  const ctx = await requireUser();
  if (!isStaff(ctx.profile.role)) redirect("/portal");
  if (!ctx.profile.totp_enabled) redirect("/portal/seguridad?mfa=required");
  if (!ctx.mfaVerified) redirect("/portal/mfa");
  return ctx;
}
