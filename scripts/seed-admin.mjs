/**
 * One-shot: create or update the first portal admin in Neon.
 *
 * Usage (PowerShell / cmd):
 *   set SEED_ADMIN_EMAIL=tu@gmail.com
 *   set SEED_ADMIN_PASSWORD=TuPasswordSegura123
 *   npm run db:seed-admin
 *
 * Optional: SEED_ADMIN_NAME (default "Admin")
 */
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const email = String(process.env.SEED_ADMIN_EMAIL ?? "")
  .toLowerCase()
  .trim();
const password = String(process.env.SEED_ADMIN_PASSWORD ?? "");
const fullName = String(process.env.SEED_ADMIN_NAME ?? "Admin").trim() || "Admin";
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Falta DATABASE_URL (cargá .env.local o exportala).");
  process.exit(1);
}
if (!email || !email.includes("@")) {
  console.error("Definí SEED_ADMIN_EMAIL con un email válido.");
  process.exit(1);
}
if (password.length < 8) {
  console.error("Definí SEED_ADMIN_PASSWORD con al menos 8 caracteres.");
  process.exit(1);
}

const sql = neon(databaseUrl);
const passwordHash = await bcrypt.hash(password, 12);

const existing = await sql`
  select id from users where email = ${email} limit 1
`;

let userId;
if (existing[0]?.id) {
  userId = existing[0].id;
  await sql`
    update users
    set
      name = ${fullName},
      password_hash = ${passwordHash},
      email_verified = coalesce(email_verified, now())
    where id = ${userId}
  `;
  await sql`
    insert into profiles (id, email, full_name, role, totp_enabled)
    values (${userId}, ${email}, ${fullName}, 'admin', false)
    on conflict (id) do update set
      email = excluded.email,
      full_name = excluded.full_name,
      role = 'admin'
  `;
  console.log(`Admin actualizado: ${email}`);
} else {
  const inserted = await sql`
    insert into users (name, email, email_verified, password_hash)
    values (${fullName}, ${email}, now(), ${passwordHash})
    returning id
  `;
  userId = inserted[0].id;
  await sql`
    insert into profiles (id, email, full_name, role, totp_enabled)
    values (${userId}, ${email}, ${fullName}, 'admin', false)
  `;
  console.log(`Admin creado: ${email}`);
}

console.log("Entrá en /portal/login con ese email y contraseña.");
console.log("Después: /portal/seguridad → activar MFA → /admin.");
