# Arce & Valdés — Estudio Jurídico

Sitio web de un estudio jurídico con foco en sus **10 áreas de práctica**, asistente con IA, reserva de turnos, blog y
portal privado para clientes.

> Los datos del estudio (nombre, equipo, dirección, teléfonos) son **placeholders**. Ver
> [Personalizar el contenido](#personalizar-el-contenido).

## Stack

| Capa        | Tecnología                                                   |
| ----------- | ------------------------------------------------------------ |
| Framework   | Next.js 16 (App Router, Server Actions, Turbopack), React 19 |
| Lenguaje    | TypeScript estricto                                          |
| UI          | Tailwind CSS v4, shadcn/ui (Radix), Motion, Lenis            |
| IA          | Vercel AI SDK + Google Gemini                                |
| Datos, auth | Supabase (Postgres + RLS, Auth con MFA, Storage)             |
| Servicios   | Resend (email), Upstash (rate limit), Cloudflare Turnstile   |
| Calidad     | Vitest, Playwright + axe, Lighthouse CI, ESLint, Prettier    |
| Deploy      | Vercel                                                       |

Las decisiones y sus alternativas están en [`docs/adr/`](docs/adr).

## Empezar

Requisitos: Node.js 22 o superior y npm.

```bash
npm install
npm run dev          # http://localhost:3000
```

Sin ninguna variable de entorno el sitio funciona completo en modo local:

- **Asistente IA**: muestra un aviso y deriva a WhatsApp. Con `AI_MOCK=1` responde con textos simulados.
- **Contacto y turnos**: los emails se imprimen en la consola del servidor.
- **Turnos**: se guardan en memoria (se pierden al reiniciar).
- **Portal de clientes**: muestra "Próximamente" hasta que se configure Supabase.

Para activar cada integración copiá `.env.example` como `.env.local` y completá lo que necesites.

## Scripts

| Comando                 | Qué hace                                             |
| ----------------------- | ---------------------------------------------------- |
| `npm run dev`           | Servidor de desarrollo                               |
| `npm run build`         | Build de producción                                  |
| `npm run start`         | Sirve el build                                       |
| `npm run check`         | Lint + tipos + tests unitarios (lo mismo que CI)     |
| `npm run test`          | Tests unitarios (Vitest)                             |
| `npm run test:coverage` | Tests unitarios con cobertura                        |
| `npm run test:e2e`      | E2E + accesibilidad (requiere `npm run build` antes) |
| `npm run format`        | Formatea con Prettier                                |

La primera vez que corras E2E instalá el navegador: `npx playwright install chromium`.

## Variables de entorno

Todas son opcionales. Detalle y enlaces en [`.env.example`](.env.example).

| Variable                                                    | Activa                                   |
| ----------------------------------------------------------- | ---------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                                      | URLs canónicas, sitemap y Open Graph     |
| `GOOGLE_GENERATIVE_AI_API_KEY`, `GEMINI_MODEL`              | Asistente IA real                        |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`  | Envío de emails                          |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`        | Rate limit compartido entre instancias   |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`    | Captcha invisible en formularios         |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Turnos persistentes y portal de clientes |

En producción, sin `RESEND_API_KEY` los formularios fallan con un mensaje claro en vez de perder consultas en silencio.

## Estructura

```
content/blog/          Artículos del blog (MDX con frontmatter validado)
src/app/(site)/        Sitio público: home, servicios, estudio, equipo, contacto, turnos, blog, legales
src/app/(portal)/      Portal de clientes (/portal) y panel del estudio (/admin)
src/app/api/chat/      Endpoint del asistente (streaming)
src/components/        UI: layout, secciones, formularios, IA, portal, shadcn (ui/)
src/content/           Contenido editable: site.ts (datos del estudio) y services.ts (áreas)
src/lib/               Lógica: validación, rate limit, email, agenda, SEO, auth, Supabase
src/proxy.ts           Refresco de sesión y protección de /portal y /admin
supabase/              Migraciones SQL, seed y tests de RLS (pgTAP)
tests/                 unit/ (Vitest) y e2e/ (Playwright + axe)
docs/                  ADRs y runbooks
```

## Personalizar el contenido

| Qué                                | Dónde                                             |
| ---------------------------------- | ------------------------------------------------- |
| Nombre, contacto, dirección, redes | `src/content/site.ts` → `site`                    |
| Equipo, valores, cifras            | `src/content/site.ts` → `team`, `values`, `stats` |
| Áreas de práctica, keywords, FAQ   | `src/content/services.ts`                         |
| Horarios de atención para turnos   | `src/lib/schedule.ts`                             |
| Comportamiento del asistente       | `src/lib/ai/system-prompt.ts`                     |
| Colores y tipografías              | `src/app/globals.css` y `src/app/layout.tsx`      |
| Artículos                          | `content/blog/*.mdx`                              |
| Textos legales                     | `src/app/(site)/privacidad` y `aviso-legal`       |

Las `keywords` de cada servicio alimentan el buscador de la home y las sugerencias del asistente: agregá las palabras
que usan los clientes ("me echaron", "choque"), no solo los términos técnicos.

## Seguridad

- CSP y headers estrictos en `next.config.ts`.
- Validación con Zod en el servidor, honeypot, rate limit y Turnstile en todos los formularios.
- El asistente no recibe datos personales, tiene límites de tamaño y rate limit, y su prompt resiste inyecciones.
- Portal: RLS en todas las tablas, verificación de rol en cada Server Action, MFA obligatorio para el staff,
  documentos en bucket privado con URLs firmadas de 60 segundos y auditoría por triggers.

Más detalle en [ADR 0005](docs/adr/0005-seguridad.md).

## Documentación operativa

- [Configurar Supabase](docs/runbooks/supabase-setup.md)
- [Deploy en Vercel](docs/runbooks/deploy.md)
- [Asignar roles al equipo](docs/runbooks/asignar-roles.md)

## Convenciones

Commits con [Conventional Commits](https://www.conventionalcommits.org/es/) (validados por commitlint en el hook
`commit-msg`). `lint-staged` formatea y lintea en cada commit.
