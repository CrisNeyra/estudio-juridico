"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearMfaVerified, getAuthContext, markMfaVerified, safeNext } from "@/lib/auth";
import { confirmTotpEnrollment, disableTotp, startTotpEnrollment, verifyTotp } from "@/lib/mfa";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export type MfaState = {
  status: "idle" | "error" | "ok";
  message?: string;
  qr?: string;
  secret?: string;
};

async function limited(userId: string): Promise<boolean> {
  const ip = await clientIp();
  const r = await rateLimit("mfa", `mfa:${userId}:${ip}`);
  return r.success;
}

export async function enrollTotp(): Promise<MfaState> {
  const ctx = await getAuthContext();
  if (!ctx.configured || !ctx.user || !ctx.profile) {
    return { status: "error", message: "Tenés que iniciar sesión." };
  }
  if (ctx.profile.totp_enabled && !ctx.mfaVerified) {
    return { status: "error", message: "Verificá el segundo factor antes de cambiarlo." };
  }
  const { secret, qr } = await startTotpEnrollment(ctx.user.id, ctx.profile.email);
  return { status: "ok", qr, secret };
}

export async function confirmTotp(_prev: MfaState, formData: FormData): Promise<MfaState> {
  const ctx = await getAuthContext();
  if (!ctx.configured || !ctx.user)
    return { status: "error", message: "Tenés que iniciar sesión." };
  if (!(await limited(ctx.user.id))) {
    return { status: "error", message: "Demasiados intentos. Esperá unos minutos." };
  }
  const code = String(formData.get("code") ?? "").replace(/\D/g, "");
  if (code.length !== 6) return { status: "error", message: "Ingresá el código de 6 dígitos." };
  const ok = await confirmTotpEnrollment(ctx.user.id, code);
  if (!ok) return { status: "error", message: "Código incorrecto. Probá de nuevo." };
  await markMfaVerified(ctx.user.id);
  revalidatePath("/portal/seguridad");
  return { status: "ok", message: "Verificación en dos pasos activada." };
}

export async function verifyMfaChallenge(_prev: MfaState, formData: FormData): Promise<MfaState> {
  const ctx = await getAuthContext();
  if (!ctx.configured || !ctx.user)
    return { status: "error", message: "Tenés que iniciar sesión." };
  if (!(await limited(ctx.user.id))) {
    return { status: "error", message: "Demasiados intentos. Esperá unos minutos." };
  }
  const code = String(formData.get("code") ?? "").replace(/\D/g, "");
  const next = safeNext(formData.get("next"), "/portal");
  if (code.length !== 6) return { status: "error", message: "Ingresá el código de 6 dígitos." };
  const ok = await verifyTotp(ctx.user.id, code);
  if (!ok) return { status: "error", message: "Código incorrecto o vencido." };
  await markMfaVerified(ctx.user.id);
  redirect(next);
}

export async function removeTotp(): Promise<MfaState> {
  const ctx = await getAuthContext();
  if (!ctx.configured || !ctx.user || !ctx.profile) {
    return { status: "error", message: "Tenés que iniciar sesión." };
  }
  if (ctx.profile.totp_enabled && !ctx.mfaVerified) {
    return { status: "error", message: "Verificá el segundo factor para desactivarlo." };
  }
  await disableTotp(ctx.user.id);
  await clearMfaVerified();
  revalidatePath("/portal/seguridad");
  return { status: "ok", message: "Verificación en dos pasos desactivada." };
}
