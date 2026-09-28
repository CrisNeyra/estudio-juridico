# Runbook — Producción por fases

Guía operativa para publicar el estudio. El código ya está en
https://github.com/CrisNeyra/estudio-juridico. Las claves van solo en Vercel
(Settings → Environment Variables → Production) o en `.env.local`. **Nunca las
pegues en el chat ni en Git.**

Después de cada cambio de variables: **Redeploy** en Vercel.

---

## Fase 1 — Vercel (sitio online)

**PASO 1 — Importar el repo**

- Ubicación: https://vercel.com/new
- Acción: ingresá con GitHub (cuenta CrisNeyra) → Importá `estudio-juridico`.
  Framework Next.js (automático). No cambies build/output.
- Verificación: aparece **Configure Project**.

**PASO 2 — Variable mínima**

- Ubicación: Environment Variables (en el asistente o en Settings)
- Acción: `NEXT_PUBLIC_SITE_URL` = la URL que te dé Vercel
  (`https://….vercel.app`). Si el primer deploy aún no la tiene, usá un valor
  provisional, deployá, copiá la URL real, actualizá la variable y redeploy.
- Verificación: la variable aparece en Production.

**PASO 3 — Deploy**

- Ubicación: botón **Deploy**
- Acción: esperá 2–4 minutos.
- Verificación: la home muestra “Paula Sardo”; `/servicios/laboral` carga;
  se ve el video del hero; `/contacto` tiene fondo; WhatsApp abre el chat.

**PASO 4 — Conectar Git (si no quedó automático)**

- Ubicación: Project → Settings → Git
- Acción: conectá el repo para que cada push a `main` despliegue solo.
- Verificación: un commit nuevo dispara un deployment.

---

## Fase 1B — Dominio propio (cuando lo tengas)

**PASO 1 — Agregar dominio**

- Ubicación: Vercel → Settings → Domains → Add
- Acción: ingresá el dominio y creá en tu DNS los registros que indique Vercel.
- Verificación: estado **Valid Configuration** con HTTPS.

**PASO 2 — Actualizar URL canónica**

- Ubicación: Environment Variables
- Acción: `NEXT_PUBLIC_SITE_URL` = `https://tudominio.com.ar` → Redeploy.
- Verificación: el sitio responde en el dominio; el sitemap usa esa URL.

**PASO 3 — Propagar a otros servicios**

- Ubicación: Resend (From), Supabase (Site URL / Redirect URLs), Turnstile (hostnames)
- Acción: actualizá con el dominio nuevo.
- Verificación: contacto, login del portal y captcha siguen funcionando.

---

## Fase 2 — Resend + Gemini

### 2.1 Resend (email)

**PASO 1 — Cuenta y API key**

- Ubicación: https://resend.com → API Keys
- Acción: creá una key y guardala en el gestor de contraseñas.
- Verificación: la key empieza con `re_`.

**PASO 2 — Remitente**

- Ubicación: Resend → Domains (o remitente de prueba)
- Acción:
  - Sin dominio propio: From de prueba `onboarding@resend.dev` (solo a tu propio mail).
  - Con dominio: verificá el dominio (DNS) y usá
    `Dra. Paula Sardo <consultas@tudominio.com.ar>`.
- Verificación: el dominio figura como Verified, o aceptás el límite del From de prueba.

**PASO 3 — Variables en Vercel**

| Variable             | Valor                     |
| -------------------- | ------------------------- |
| `RESEND_API_KEY`     | la API key                |
| `CONTACT_TO_EMAIL`   | `paula.f.sardo@gmail.com` |
| `CONTACT_FROM_EMAIL` | el From verificado        |

- Verificación: Redeploy OK. Enviá `/contacto` → llega el mail. Pedí un turno de
  prueba → mail al estudio y al visitante.

### 2.2 Gemini (asistente)

**PASO 1 — API key**

- Ubicación: https://aistudio.google.com/apikey
- Acción: creá la key.
- Verificación: la key se muestra una vez; guardala.

**PASO 2 — Variables**

| Variable                       | Valor                                        |
| ------------------------------ | -------------------------------------------- |
| `GOOGLE_GENERATIVE_AI_API_KEY` | la key                                       |
| `GEMINI_MODEL`                 | `gemini-3.8-flash` (opcional; es el default) |

- Verificación: Redeploy → Asistente → “me despidieron” → respuesta en streaming
  (no 503). Revisá el tono con la Dra. antes de promocionar el chat
  (`src/lib/ai/system-prompt.ts`).

---

## Fase 3 — Upstash + Turnstile

### 3.1 Upstash

**PASO 1 — Redis**

- Ubicación: https://console.upstash.com → Redis → Create
- Acción: región cercana (South America si está disponible).
- Verificación: el database figura Active.

**PASO 2 — Variables**

| Variable                   | Valor      |
| -------------------------- | ---------- |
| `UPSTASH_REDIS_REST_URL`   | REST URL   |
| `UPSTASH_REDIS_REST_TOKEN` | REST TOKEN |

- Verificación: Redeploy sin errores.

### 3.2 Cloudflare Turnstile

**PASO 1 — Sitio**

- Ubicación: https://dash.cloudflare.com → Turnstile → Add site
- Acción: agregá `*.vercel.app` y, si aplica, el dominio propio.
- Verificación: Site Key y Secret Key visibles.

**PASO 2 — Variables**

| Variable                         | Valor      |
| -------------------------------- | ---------- |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | site key   |
| `TURNSTILE_SECRET_KEY`           | secret key |

- Verificación: Redeploy → `/contacto` y `/turnos` muestran el widget y envían OK.

---

## Fase 4 — Supabase

Seguí también [supabase-setup.md](supabase-setup.md) y [asignar-roles.md](asignar-roles.md).

**PASO 1 — Proyecto**

- Ubicación: https://supabase.com/dashboard → New project
- Acción: nombre `estudio-juridico`, región **South America (São Paulo)**,
  contraseña fuerte guardada.
- Verificación: estado Healthy.

**PASO 2 — Migración**

- Ubicación: SQL Editor → New query
- Acción: pegá y ejecutá `supabase/migrations/20260927000000_init.sql`.
- Verificación: tablas con RLS; bucket `documents` privado.

**PASO 3 — Auth**

- Ubicación: Authentication → Providers / URL Configuration / MFA
- Acción: desactivá registro público; Site URL = URL de producción;
  Redirect URLs: `https://TU-URL/portal/auth/callback` y
  `http://localhost:3000/portal/auth/callback`; TOTP habilitado.
- Verificación: cambios guardados.

**PASO 4 — Variables (solo anon)**

| Variable                        | Valor       |
| ------------------------------- | ----------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public |

No uses la `service_role` en la app.

- Verificación: Redeploy → `/portal/login` muestra el formulario (no “Próximamente”).

**PASO 5 — Admin**

- Ubicación: Supabase Users + SQL + sitio `/portal/seguridad`
- Acción: invitá el email de la Dra.; `update profiles set role = 'admin' …`;
  activá MFA; entrá a `/admin`.
- Verificación: panel del estudio visible; turno de prueba aparece y se puede
  confirmar/cancelar.

---

## Fase 5 — SEO post-dominio

**PASO 1 — Search Console**

- Ubicación: Google Search Console
- Acción: agregá la propiedad del dominio; enviá `/sitemap.xml`.
- Verificación: sitemap procesado sin errores.

**PASO 2 — Headers (opcional)**

- Ubicación: https://securityheaders.com
- Acción: escaneá la URL de producción.
- Verificación: objetivo grado A.

---

## Fase 6 — Revisión legal con la Dra.

Textos en:

- `src/app/(site)/privacidad/page.tsx`
- `src/app/(site)/aviso-legal/page.tsx`

**Checklist de reunión**

1. Responsable del tratamiento y email de datos (`paula.f.sardo@gmail.com`).
2. Finalidades: consultas, turnos, portal; sin cookies publicitarias.
3. Asistente IA (Gemini): no datos sensibles; orientación general.
4. Derechos Ley 25.326 y cómo ejercerlos.
5. Aviso legal: no crea relación abogado-cliente hasta aceptación expresa;
   jurisdicción CABA / PBA.
6. Si aprueba cambios: editar las páginas, actualizar `updated`, commit y push.

Hasta la aprobación formal, el sitio puede estar online; evitá campañas fuertes
del formulario si ella aún no firmó los textos.

---

## Verificación con el asistente

Cuando termines una fase, pedí: **“terminé la Fase N, verificá”** e indicá la
URL pública. No envíes secretos; solo confirmá qué variables cargaste (nombres,
no valores).
