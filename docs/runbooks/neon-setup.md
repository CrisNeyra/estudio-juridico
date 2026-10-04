# Runbook — Configurar Neon + Auth.js + Vercel Blob

El portal, los turnos persistentes y los documentos usan **Neon** (Postgres),
**Auth.js** (sesiones en la app) y **Vercel Blob** (archivos privados).

---

**PASO 1 — Proyecto Neon**

- Ubicación: https://console.neon.tech → **New project**
- Acción: nombre `estudio-juridico`, región cercana (ej. **São Paulo** si está),
  copiá la connection string `DATABASE_URL` (pooled o directa; ambas sirven con
  el driver serverless).
- Verificación: el proyecto aparece **Active**.

**PASO 2 — Migración del esquema**

- Ubicación: terminal en la raíz del repo, con `DATABASE_URL` en `.env.local`
- Acción:

  ```bash
  npm run db:migrate
  ```

  Alternativa sin historial de migraciones: `npm run db:push`.

- Verificación: en Neon → **Tables** aparecen `users`, `accounts`, `sessions`,
  `verification_tokens`, `profiles`, `appointments`, `cases`, `case_events`,
  `documents`, `audit_log`.

**PASO 3 — Auth.js**

- Ubicación: generá un secreto largo (mín. 16 caracteres), por ejemplo:

  ```bash
  openssl rand -base64 32
  ```

- Acción: cargá `AUTH_SECRET` en `.env.local` y en Vercel (Production + Preview).
- Verificación: `/portal/login` muestra el formulario (ya no «Próximamente»).

**PASO 4 — Vercel Blob (documentos del portal)**

- Ubicación: Vercel → Project → **Storage** → **Blob** → Create
- Acción: conectá el store al proyecto; Vercel inyecta `BLOB_READ_WRITE_TOKEN`.
  En local: copiá el token a `.env.local`.
- Verificación: en `/admin` podés subir un PDF a un caso y abrirlo desde el portal
  (descarga autenticada).

**PASO 5 — Email para magic link / invites**

- Preferido: Gmail SMTP ([gmail-smtp.md](gmail-smtp.md)).
- Variables: `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `CONTACT_TO_EMAIL`.
- Verificación: desde `/admin` invitá un email de prueba; llega el correo de
  Auth.js (magic link) o podés setear contraseña al invitar.

**PASO 6 — Primer admin**

Seguí [asignar-roles.md](asignar-roles.md): invitar usuario → elevar rol a
`admin` en SQL → activar MFA en `/portal/seguridad` → entrar a `/admin`.

## Variables

| Variable                | Uso                                    |
| ----------------------- | -------------------------------------- |
| `DATABASE_URL`          | Neon Postgres                          |
| `AUTH_SECRET`           | Sesiones Auth.js                       |
| `BLOB_READ_WRITE_TOKEN` | Subida/lectura de documentos           |
| Gmail / Resend          | Magic link, invites y avisos de turnos |

Sin `DATABASE_URL` + `AUTH_SECRET` el portal muestra «Próximamente» y los turnos
no se persisten (sí pueden enviar email si el SMTP está configurado).
