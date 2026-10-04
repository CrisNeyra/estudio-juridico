"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearMfaVerified, getAuthContext, markMfaVerified, safeNext } from "@/lib/auth";
import { confirmTotpEnrollment, disableTotp, startTotpEnrollment, verifyTotp } from "@/lib/mfa";

export type MfaState = {
  status: "idle" | "error" | "ok";
  message?: string;
  qr?: string;
  secret?: string;
};

export async function enrollTotp(): Promise<MfaState> {
  const ctx = await getAuthContext();
  if (!ctx.configured || !ctx.user || !ctx.profile) {
    return { status: "error", message: "Tenés que iniciar sesión." };
  }
  const { secret, qr } = await startTotpEnrollment(ctx.user.id, ctx.profile.email);
  return { status: "ok", qr, secret };
}

export async function confirmTotp(_prev: MfaState, formData: FormData): Promise<MfaState> {
  const ctx = await getAuthContext();
  if (!ctx.configured || !ctx.user)
    return { status: "error", message: "Tenés que iniciar sesión." };
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
  if (!ctx.configured || !ctx.user)
    return { status: "error", message: "Tenés que iniciar sesión." };
  await disableTotp(ctx.user.id);
  await clearMfaVerified();
  revalidatePath("/portal/seguridad");
  return { status: "ok", message: "Verificación en dos pasos desactivada." };
}
