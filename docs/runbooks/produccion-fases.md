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

- Ubicación: Gmail/Resend (From), Turnstile (hostnames), `NEXT_PUBLIC_SITE_URL`
- Acción: actualizá con el dominio nuevo.
- Verificación: contacto, login del portal y captcha siguen funcionando.

---

## Fase 2 — Email (Gmail SMTP recomendado) + Gemini

Proyecto Vercel correcto: **estudiosardoflorencia** (no uses `estudio-juridico`).
Sitio: https://estudiosardoflorencia.vercel.app

**Email sin dominio:** usá Gmail SMTP (gratis). Guía completa:
[gmail-smtp.md](gmail-smtp.md).

Variables Gmail: `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `CONTACT_TO_EMAIL`,
`CONTACT_FROM_EMAIL`. Si están las de Gmail, Resend no es necesario.

### 2.1 Gemini (asistente)

**PASO 1 — Crear la API key**

- Ubicación: https://aistudio.google.com/apikey (cuenta Google)
- Acción: Create API key → copiá la key (solo se ve una vez) y guardala.
- Verificación: tenés un string largo (suele empezar con `AIza`).

**PASO 2 — Pegarla en Vercel**

- Ubicación:
  https://vercel.com/crisneyra13-projects/estudiosardoflorencia/settings/environment-variables
- Acción: editá `GOOGLE_GENERATIVE_AI_API_KEY` → pegá la key → Production
  (y Preview si aparece) → Save. No la dejes en blanco.
- Verificación: la variable figura en la lista (el valor queda oculto).

**PASO 3 — Modelo (opcional)**

| Variable       | Valor recomendado       |
| -------------- | ----------------------- |
| `GEMINI_MODEL` | `gemini-3.5-flash-lite` |

Si `gemini-3.8-flash` responde “high demand”, usá `gemini-3.5-flash-lite`.

### 2.2 Resend (email)

**PASO 1 — Crear la API key**

- Ubicación: https://resend.com/api-keys (login Google o GitHub)
- Acción: Create API Key → nombre ej. `estudio-sardo-prod` → Create → copiá la key.
- Verificación: empieza con `re_`.

**PASO 2 — Pegarla en Vercel**

- Ubicación: misma pantalla de Environment Variables de **estudiosardoflorencia**
- Acción: editá `RESEND_API_KEY` con la key `re_…` → Production → Save.
- Verificación: aparece en la lista.

**PASO 3 — Confirmar remitente**

| Variable             | Valor (prueba sin dominio)                        |
| -------------------- | ------------------------------------------------- |
| `CONTACT_TO_EMAIL`   | el mail de la cuenta Resend (ej. `crisneyra13@…`) |
| `CONTACT_FROM_EMAIL` | `onboarding@resend.dev`                           |

Con From de prueba, Resend **solo** entrega al email de la cuenta Resend. Con
dominio propio: verificá el dominio en Resend, From tipo
`Dra. Paula Sardo <consultas@tudominio.com.ar>` y
`CONTACT_TO_EMAIL` = `paula.f.sardo@gmail.com`.

### 2.3 Redeploy (obligatorio)

- Ubicación:
  https://vercel.com/crisneyra13-projects/estudiosardoflorencia/deployments
- Acción: deployment Production más reciente → ⋯ → **Redeploy**.
- Verificación: estado **Ready** (1–3 min).

### 2.4 Verificar

- Asistente: https://estudiosardoflorencia.vercel.app → “Me despidieron” →
  respuesta en texto (no 503 / “no disponible”).
- Contacto: https://estudiosardoflorencia.vercel.app/contacto → envío de prueba
  → llega el mail.
- Revisá el tono con la Dra. antes de promocionar el chat
  (`src/lib/ai/system-prompt.ts`).

---

## Fase 3 — Turnstile (Upstash opcional)

Proyecto Vercel: **estudiosardoflorencia**  
Sitio: https://estudiosardoflorencia.vercel.app  
Variables en:
https://vercel.com/crisneyra13-projects/estudiosardoflorencia/settings/environment-variables

**Upstash no es obligatorio.** Sin Redis el rate limit usa memoria por
instancia (aceptable si Turnstile está activo). Si más adelante querés Redis
compartido: reusá el DB free de otro proyecto (mismas REST URL/TOKEN) o creá
uno nuevo en https://console.upstash.com.

Las keys de Turnstile pueden figurar en la lista pero estar vacías: hay que
**editarlas** con valores reales.

### 3.1 Cloudflare Turnstile

**PASO 1 — Sitio**

- Ubicación: https://dash.cloudflare.com → Turnstile → Add widget / Add site
- Acción: nombre ej. `Estudio Sardo`. Hostnames:
  - `estudiosardoflorencia.vercel.app`
  - `*.vercel.app` (si lo ofrece)
  - más adelante el dominio propio
    Widget Mode: Managed. Create → copiá **Site Key** y **Secret Key**.
- Verificación: Site Key y Secret Key visibles.

**PASO 2 — Pegar en Vercel**

| Variable                         | Valor      |
| -------------------------------- | ---------- |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | site key   |
| `TURNSTILE_SECRET_KEY`           | secret key |

- Ubicación: Environment Variables de **estudiosardoflorencia**
- Acción: editá ambas → Production (y Preview) → Save. `NEXT_PUBLIC_…` debe ser
  el Site Key (público); el Secret no va en el frontend.
- Verificación: Redeploy → Ready.

### 3.2 Redeploy y verificar

- Ubicación:
  https://vercel.com/crisneyra13-projects/estudiosardoflorencia/deployments
- Acción: ⋯ → Redeploy.
- Verificación:
  - https://estudiosardoflorencia.vercel.app/contacto → aparece el widget
    Turnstile (casilla Cloudflare) y el envío funciona.
  - https://estudiosardoflorencia.vercel.app/turnos → igual.

---

## Fase 4 — Neon + Auth.js + Vercel Blob

Proyecto Vercel: **estudiosardoflorencia**  
Sitio: https://estudiosardoflorencia.vercel.app  
Portal: https://estudiosardoflorencia.vercel.app/portal/login  
Variables:
https://vercel.com/crisneyra13-projects/estudiosardoflorencia/settings/environment-variables

Detalle: [neon-setup.md](neon-setup.md) y [asignar-roles.md](asignar-roles.md).

**PASO 1 — Proyecto Neon**

- Ubicación: https://console.neon.tech → **New project**
- Acción: nombre `estudio-juridico`, región cercana (ej. São Paulo), copiá
  `DATABASE_URL`.
- Verificación: proyecto **Active**.

**PASO 2 — Migración**

- Ubicación: local, con `DATABASE_URL` en `.env.local`
- Acción: `npm run db:migrate` (o `npm run db:push`).
- Verificación: tablas Auth.js + `profiles`, `appointments`, `cases`, etc.

**PASO 3 — Variables en Vercel**

- `DATABASE_URL`, `AUTH_SECRET` (mín. 16 chars), `BLOB_READ_WRITE_TOKEN`
  (Vercel Storage → Blob).
- Redeploy del proyecto.
- Verificación: `/portal/login` muestra el formulario (ya no «Próximamente»).

**PASO 4 — Admin del estudio**

- Desde `/admin` invitá un usuario, o insertá en Neon y elevá rol:

  ```sql
  update public.profiles
  set role = 'admin'
  where email = 'TU-EMAIL@ejemplo.com';
  ```

- Sitio: `/portal/login` → **Seguridad** → MFA TOTP → `/admin`.
- Verificación: Panel del estudio; un turno de prueba en `/turnos` aparece
  y se puede confirmar/cancelar.

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

Guía profunda (mapa de datos, gaps, checklist, mail a la Dra., acta):
[revision-legal.md](revision-legal.md).

URLs:

- https://estudiosardoflorencia.vercel.app/privacidad
- https://estudiosardoflorencia.vercel.app/aviso-legal

Código: `src/app/(site)/privacidad/page.tsx`,
`src/app/(site)/aviso-legal/page.tsx`.

**Qué es:** validar que privacidad + aviso legal digan la verdad sobre el
producto (formularios, turnos, portal, Gemini, Gmail/Resend, Neon, Turnstile,
Analytics) bajo Ley 25.326 y ética profesional. No es un deploy técnico.

**PASO 1 — Leer / preparar**

- Ubicación: [revision-legal.md](revision-legal.md) §§ 2–5
- Acción: repasá el mapa de datos y el checklist; enviá la pre-lectura (§ 6)
  a la Dra. con los dos links.
- Verificación: ella tiene fecha de reunión o feedback por escrito.

**PASO 2 — Reunión / acta**

- Ubicación: checklist § 5 del runbook
- Acción: decidir responsable, AAIP, plazos, proveedores, WhatsApp,
  jurisdicción, OK de campañas. Completar “Acta” al final del runbook.
- Verificación: acta con Sí/No/Ajuste en cada fila.

**PASO 3 — Implementar (después del OK)**

- Acción: pedir al asistente aplicar el acta → editar páginas (y checkbox/
  prompt si aplica) → `updated` con fecha de aprobación → commit + push.
- Verificación: releer ambas URLs en producción.

Hasta la aprobación formal el sitio puede estar online; evitá campañas fuertes
si ella aún no firmó los textos.

---

## Verificación con el asistente

Cuando termines una fase, pedí: **“terminé la Fase N, verificá”** e indicá la
URL pública. No envíes secretos; solo confirmá qué variables cargaste (nombres,
no valores).
