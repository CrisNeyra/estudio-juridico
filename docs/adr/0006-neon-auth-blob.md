# ADR 0006 — Neon + Auth.js + Vercel Blob

- Estado: aceptado
- Fecha: 2026-10-04
- Supersede: [0002-supabase.md](0002-supabase.md)

## Contexto

Supabase acoplaba Postgres, Auth y Storage. Queremos Postgres administrado sin
depender del Auth/Storage de Supabase, con control total en el servidor Next.js.

## Decisión

- **Neon** (Postgres serverless) + **Drizzle ORM** y migraciones SQL propias.
- **Auth.js v5** (`next-auth`) con adapter Drizzle: credenciales + magic link
  (Nodemailer/Gmail). Sin registro público: solo usuarios invitados.
- **MFA TOTP** propia (`otplib`) para staff; cookie `mfa_ok` tras el segundo factor.
- **Vercel Blob** privado; descarga vía route autenticada (no URL pública permanente).
- Autorización solo en servidor (`requireUser` / `requireStaff`). El navegador
  nunca habla con Neon.

## Alternativas

- Mantener Supabase (Auth + RLS + Storage): más producto gestionado, menos control.
- Clerk/Auth0: costo y vendor lock-in adicionales.

## Consecuencias

- Hay que operar migraciones (`npm run db:migrate`) y secretos
  (`DATABASE_URL`, `AUTH_SECRET`, `BLOB_READ_WRITE_TOKEN`).
- Sin RLS en el cliente: cualquier bug de autorización en Server Actions es crítico.
- Setup: [neon-setup.md](../runbooks/neon-setup.md), roles:
  [asignar-roles.md](../runbooks/asignar-roles.md).
