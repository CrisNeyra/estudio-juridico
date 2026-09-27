"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { site } from "@/content/site";
import { safeNext } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthState = { status: "idle" | "error" | "sent"; message?: string };

const credentials = z.object({
  email: z.email(),
  password: z.string().min(8).max(200),
});

const GENERIC_ERROR = "Email o contraseña incorrectos.";

export async function signInWithPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "El portal no está configurado." };

  if (!(await rateLimit("auth", `login:${await clientIp()}`)).success) {
    return { status: "error", message: "Demasiados intentos. Esperá unos minutos." };
  }

  const parsed = credentials.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { status: "error", message: GENERIC_ERROR };

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    logger.warn("auth.login_failed", { reason: error.code ?? error.message });
    return { status: "error", message: GENERIC_ERROR };
  }
  redirect(safeNext(formData.get("next")));
}

export async function sendMagicLink(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "El portal no está configurado." };

  if (!(await rateLimit("auth", `magic:${await clientIp()}`)).success) {
    return { status: "error", message: "Demasiados intentos. Esperá unos minutos." };
  }

  const email = z.email().safeParse(formData.get("email"));
  if (!email.success) return { status: "error", message: "Ingresá un email válido." };

  const next = safeNext(formData.get("next"));
  const { error } = await supabase.auth.signInWithOtp({
    email: email.data,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${site.url}/portal/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) logger.warn("auth.magic_link_failed", { reason: error.code ?? error.message });

  // Same response whether the account exists or not (prevents user enumeration).
  return {
    status: "sent",
    message: "Si el email está registrado, te enviamos un enlace de acceso.",
  };
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/portal/login");
}
