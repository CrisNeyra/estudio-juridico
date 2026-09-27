# Runbook — Deploy en Vercel

Cada push a `main` despliega producción y cada Pull Request genera una preview.

---

**PASO 1 — Importar el repositorio**

- Ubicación: https://vercel.com/new
- Acción: **Continue with GitHub** → autorizá el acceso al repositorio `estudio-juridico` → **Import**.
  Framework: Next.js (se detecta solo). No cambies los comandos de build.
- Verificación: aparece la pantalla **Configure Project**.

**PASO 2 — Variables de entorno**

- Ubicación: en la misma pantalla, sección **Environment Variables** (o después en Project → **Settings** →
  **Environment Variables**)
- Acción: cargá como mínimo:

  | Variable                       | Valor                                             |
  | ------------------------------ | ------------------------------------------------- |
  | `NEXT_PUBLIC_SITE_URL`         | `https://<tu-proyecto>.vercel.app` (o tu dominio) |
  | `GOOGLE_GENERATIVE_AI_API_KEY` | clave de https://aistudio.google.com/apikey       |
  | `RESEND_API_KEY`               | clave de https://resend.com/api-keys              |
  | `CONTACT_TO_EMAIL`             | email del estudio que recibe las consultas        |
  | `CONTACT_FROM_EMAIL`           | remitente verificado en Resend                    |

  Recomendadas: Upstash, Turnstile y Supabase (ver [`.env.example`](../../.env.example) y
  [supabase-setup.md](supabase-setup.md)).

- Verificación: las variables aparecen listadas. Las que no empiezan con `NEXT_PUBLIC_` nunca llegan al navegador.

**PASO 3 — Deploy**

- Ubicación: botón **Deploy**
- Acción: esperá a que termine el build (2 a 4 minutos).
- Verificación: la URL abre la home; `/servicios/laboral` muestra la página del área; el asistente responde.

**PASO 4 — Dominio propio (opcional)**

- Ubicación: Project → **Settings** → **Domains** → **Add**
- Acción: ingresá tu dominio (ej. `estudio.com.ar`) y creá en tu proveedor DNS los registros que indica Vercel.
- Verificación: el dominio muestra "Valid Configuration" con HTTPS. Actualizá `NEXT_PUBLIC_SITE_URL` y la **Site URL**
  de Supabase, y hacé **Redeploy**.

**PASO 5 — Chequeo post-deploy**

- [ ] Enviar una consulta desde `/contacto` y confirmar que llega el email.
- [ ] Reservar un turno de prueba en `/turnos` y cancelarlo desde `/admin`.
- [ ] Verificar headers en https://securityheaders.com (objetivo: A).
- [ ] Revisar `/sitemap.xml` y registrarlo en Google Search Console.

## Rollback

Vercel → Project → **Deployments** → el último deploy sano → menú **⋯** → **Promote to Production**.
