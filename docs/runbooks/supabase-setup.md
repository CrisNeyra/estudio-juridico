# Runbook — Configurar Supabase

Activa los turnos persistentes y el portal de clientes. Tiempo estimado: 15 minutos.

---

**PASO 1 — Crear el proyecto**

- Ubicación: https://supabase.com/dashboard → **New project**
- Acción: nombre `estudio-juridico`, región **South America (São Paulo)**, generá una contraseña de base fuerte y
  guardala en tu gestor de contraseñas.
- Verificación: el proyecto aparece como "Healthy" en el dashboard.

**PASO 2 — Ejecutar la migración**

- Ubicación: dashboard del proyecto → **SQL Editor** → **New query**
- Acción: pegá el contenido completo de `supabase/migrations/20260927000000_init.sql` y tocá **Run**.
- Verificación: en **Table Editor** aparecen `profiles`, `appointments`, `cases`, `case_events`, `documents` y
  `audit_log`, todas con el candado de RLS activo. En **Storage** aparece el bucket `documents` (privado).

**PASO 3 — Configurar Auth**

- Ubicación: **Authentication** → **Sign In / Providers** y **URL Configuration**
- Acción:
  1. En **Email**, desactivá **Allow new users to sign up** (el estudio invita a sus clientes).
  2. En **URL Configuration**, poné **Site URL** = tu dominio (ej. `https://tu-sitio.vercel.app`) y agregá en
     **Redirect URLs**: `https://tu-sitio.vercel.app/portal/auth/callback` y `http://localhost:3000/portal/auth/callback`.
  3. En **Multi-Factor**, verificá que **TOTP** esté habilitado.
- Verificación: los cambios quedan guardados sin errores.

**PASO 4 — Copiar las claves**

- Ubicación: **Project Settings** → **API**
- Acción: copiá **Project URL** y la clave **anon public**. No copies la `service_role`.
- Verificación: tenés dos valores, uno que empieza con `https://` y otro largo que empieza con `eyJ`.

**PASO 5 — Cargar las variables**

- Ubicación: local en `.env.local`; en producción en Vercel → Project → **Settings** → **Environment Variables**
- Acción: definí `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`. En Vercel hacé un **Redeploy**.
- Verificación: `/portal/login` muestra el formulario de ingreso en lugar de "Próximamente".

**PASO 6 — Crear tu usuario y hacerte admin**

- Seguí [asignar-roles.md](asignar-roles.md).

## Tests de RLS (opcional, recomendado antes de producción)

Requiere [Supabase CLI](https://supabase.com/docs/guides/local-development) y Docker Desktop:

```bash
npx supabase init          # solo la primera vez, si no existe supabase/config.toml
npx supabase start
npx supabase test db
```

Verificación: `supabase/tests/rls.test.sql` informa 16 tests OK.
