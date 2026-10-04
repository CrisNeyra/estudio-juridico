"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getAuthContext } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";

export type PasswordState = { status: "idle" | "error" | "ok"; message?: string };

const schemaPw = z.object({
  current: z.string().min(8),
  next: z.string().min(8).max(200),
});

export async function changePassword(
  _prev: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const ctx = await getAuthContext();
  if (!ctx.configured || !ctx.user)
    return { status: "error", message: "Tenés que iniciar sesión." };
  const db = getDb();
  if (!db) return { status: "error", message: "Base de datos no configurada." };

  const parsed = schemaPw.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
  });
  if (!parsed.success) return { status: "error", message: "Revisá las contraseñas." };

  const [user] = await db
    .select({ passwordHash: schema.users.passwordHash })
    .from(schema.users)
    .where(eq(schema.users.id, ctx.user.id))
    .limit(1);
  if (!user?.passwordHash) return { status: "error", message: "No hay contraseña configurada." };

  const ok = await bcrypt.compare(parsed.data.current, user.passwordHash);
  if (!ok) return { status: "error", message: "La contraseña actual no es correcta." };

  const passwordHash = await bcrypt.hash(parsed.data.next, 12);
  await db.update(schema.users).set({ passwordHash }).where(eq(schema.users.id, ctx.user.id));
  return { status: "ok", message: "Contraseña actualizada." };
}
