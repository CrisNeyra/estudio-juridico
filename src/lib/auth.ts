import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Role = "cliente" | "abogado" | "admin";

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: Role;
};

/** Loads the verified user, profile and MFA assurance level once per request. */
export const getAuthContext = cache(async () => {
  await connection();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { configured: false as const };

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { configured: true as const, supabase, user: null };

  const [{ data: profile }, { data: aal }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, full_name, phone, role")
      .eq("id", user.id)
      .single<Profile>(),
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
  ]);

  return {
    configured: true as const,
    supabase,
    user,
    profile: profile ?? null,
    aal: { current: aal?.currentLevel ?? "aal1", next: aal?.nextLevel ?? "aal1" },
  };
});

export function isStaff(role?: Role | null): boolean {
  return role === "abogado" || role === "admin";
}

/** Any authenticated user. Users with MFA enrolled must complete the second factor. */
export async function requireUser() {
  const ctx = await getAuthContext();
  if (!ctx.configured) redirect("/portal/login");
  if (!ctx.user || !ctx.profile) redirect("/portal/login");
  if (ctx.aal.next === "aal2" && ctx.aal.current !== "aal2") redirect("/portal/mfa");
  return { supabase: ctx.supabase, user: ctx.user, profile: ctx.profile, aal: ctx.aal };
}

/** Staff (abogado/admin) always need MFA: they access every client's data. */
export async function requireStaff() {
  const ctx = await requireUser();
  if (!isStaff(ctx.profile.role)) redirect("/portal");
  if (ctx.aal.current !== "aal2") redirect("/portal/seguridad?mfa=required");
  return ctx;
}

/** Only allows same-site relative paths to avoid open redirects. */
export function safeNext(next: unknown, fallback = "/portal"): string {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
