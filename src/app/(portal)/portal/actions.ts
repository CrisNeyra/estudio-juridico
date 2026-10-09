"use server";

import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn, signOut as nextSignOut } from "@/auth";
import { clearMfaVerified, safeNext } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { features } from "@/lib/env";

export type AuthState = { status: "idle" | "error" | "sent"; message?: string };

const credentials = z.object({
  email: z.email(),
  password: z.string().min(8).max(200),
});

const GENERIC_ERROR = "Email o contraseña incorrectos.";

export async function signInWithPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!features.auth) return { status: "error", message: "El portal no está configurado." };

  if (!(await rateLimit("auth", `login:${await clientIp()}`)).success) {
    return { status: "error", message: "Demasiados intentos. Esperá unos minutos." };
  }

  const parsed = credentials.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { status: "error", message: GENERIC_ERROR };

  const next = safeNext(formData.get("next"));
  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirectTo: next,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      logger.warn("auth.login_failed", { reason: error.type });
      return { status: "error", message: GENERIC_ERROR };
    }
    throw error;
  }
  return { status: "idle" };
}

export async function sendMagicLink(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!features.auth) return { status: "error", message: "El portal no está configurado." };
  if (!features.email) {
    return { status: "error", message: "El envío de email no está configurado." };
  }

  if (!(await rateLimit("auth", `magic:${await clientIp()}`)).success) {
    return { status: "error", message: "Demasiados intentos. Esperá unos minutos." };
  }

  const email = z.email().safeParse(formData.get("email"));
  if (!email.success) return { status: "error", message: "Ingresá un email válido." };

  const next = safeNext(formData.get("next"));
  try {
    await signIn("nodemailer", {
      email: email.data.toLowerCase(),
      redirect: false,
      redirectTo: next,
    });
  } catch (error) {
    logger.warn("auth.magic_link_failed", {
      reason: error instanceof Error ? error.message : String(error),
    });
  }

  return {
    status: "sent",
    message: "Si el email está registrado, te enviamos un enlace de acceso.",
  };
}

export async function signOut() {
  await clearMfaVerified();
  await nextSignOut({ redirectTo: "/portal/login" });
}
