# Dra. Paula Florencia Sardo y asociadxs

Sitio institucional del estudio jurídico de la **Dra. Paula Florencia Sardo** (CPACF T° 152 F° 256, CAAL T° V F° 69). Presenta las cinco áreas de práctica, un buscador en lenguaje cotidiano, un asistente con IA, reserva de turnos, blog, contacto por WhatsApp y un portal privado para clientes.

Atención publicada: Ciudad Autónoma de Buenos Aires y Provincia de Buenos Aires.  
Contacto publicado: [paula.f.sardo@gmail.com](mailto:paula.f.sardo@gmail.com) · WhatsApp +54 9 11 6660-2795.

Repositorio: [github.com/CrisNeyra/estudio-juridico](https://github.com/CrisNeyra/estudio-juridico).

## Qué hace el sitio

| Superficie | Ruta                               | Comportamiento                                                           |
| ---------- | ---------------------------------- | ------------------------------------------------------------------------ |
| Inicio     | `/`                                | Frase principal, video de fondo, buscador de áreas y índice de servicios |
| Áreas      | `/servicios` y `/servicios/[slug]` | Laboral, familia, penal, civil y daños, sucesiones                       |
| Estudio    | `/estudio`                         | Presentación y criterios de trabajo                                      |
| Equipo     | `/equipo`                          | Ficha de la Dra. Sardo y matrículas                                      |
| Novedades  | `/blog`                            | Artículos en MDX                                                         |
| Contacto   | `/contacto`                        | Formulario con validación en el servidor                                 |
| Turnos     | `/turnos`                          | Agenda de lunes a viernes, confirmación por email e `.ics`               |
| Portal     | `/portal`, `/admin`                | Casos y documentos. Sin Supabase muestra “Próximamente”                  |
| Asistente  | botón flotante                     | Orientación general, sin asesoramiento legal                             |
| WhatsApp   | botón bajo el asistente            | Abre `wa.me/5491166602795`                                               |

La navegación (Inicio, Áreas, Estudio, Equipo, Novedades, Contacto) está en el encabezado de escritorio y en el menú de pantallas chicas. “Pedir turno” y “Clientes” siguen disponibles.

## Diseño

Paleta clara, sin modo oscuro:

- **Blanco** como fondo principal.
- **Azul** para texto, enlaces y el botón principal.
- **Violeta** como acento secundario (la frase del inicio).

Tipografía: Instrument Serif en títulos y Geist en el texto. El movimiento de entrada se apaga si el sistema pide menos animación. El video del inicio tampoco se reproduce en ese caso.

## Stack

| Capa           | Tecnología                                                 |
| -------------- | ---------------------------------------------------------- |
| Framework      | Next.js 16 (App Router, Server Actions), React 19          |
| Lenguaje       | TypeScript estricto                                        |
| UI             | Tailwind CSS v4, shadcn/ui (Radix), Motion, Lenis          |
| IA             | Vercel AI SDK + Google Gemini                              |
| Datos y acceso | Supabase (Postgres con RLS, Auth con MFA, Storage privado) |
| Servicios      | Resend (email), Upstash (rate limit), Cloudflare Turnstile |
| Calidad        | Vitest, Playwright + axe, Lighthouse CI, ESLint, Prettier  |
| Deploy         | Vercel                                                     |

Las decisiones de arquitectura están en [`docs/adr/`](docs/adr). La paleta y la ausencia de modo oscuro de esta versión reemplazan la dirección visual descrita en el ADR 0004.

## Cómo correrlo

Requisitos: Node.js 22 o superior.

```bash
npm install
npm run dev
```

El sitio queda en http://localhost:3000. Sin variables de entorno:

- el asistente avisa que no está disponible y el sitio igual ofrece WhatsApp;
- con `AI_MOCK=1` el asistente responde textos simulados (lo usa el E2E);
- contacto y turnos imprimen el email en la consola del servidor;
- los turnos se guardan en memoria y se pierden al reiniciar;
- el portal muestra “Próximamente”.

Copiá [`.env.example`](.env.example) a `.env.local` para activar integraciones. Ese archivo no se sube a Git.

## Scripts

| Comando                           | Qué hace                                                 |
| --------------------------------- | -------------------------------------------------------- |
| `npm run dev`                     | Desarrollo                                               |
| `npm run build` / `npm run start` | Build y servidor de producción                           |
| `npm run check`                   | Lint, tipos y tests unitarios                            |
| `npm run test`                    | Vitest                                                   |
| `npm run test:e2e`                | Playwright + axe (hace falta `npm run build` y Chromium) |
| `npm run format`                  | Prettier                                                 |

La primera vez del E2E: `npx playwright install chromium`.

## Dónde va el video del inicio

Nombre exacto:

```text
public/videos/hero.mp4
```

Opcional, el primer fotograma mientras carga el video:

```text
public/videos/hero-poster.jpg
```

El video se reproduce en loop, silenciado y en línea (`playsInline`, para que el celular no lo abra en pantalla completa). Entra con un fundido de 1,2 segundos y una veladura blanca para que el texto siga legible. Si el archivo no está, el inicio se ve igual sobre blanco.

## Dónde van las fotos de fondo

Carpeta:

```text
public/images/fondos/
```

| Archivo              | Sección                             |
| -------------------- | ----------------------------------- |
| `servicios.webp`     | Listado de áreas                    |
| `laboral.webp`       | Derecho Laboral                     |
| `familia.webp`       | Derecho de Familia                  |
| `penal.webp`         | Derecho Penal                       |
| `civil-y-danos.webp` | Derecho Civil y Daños               |
| `sucesiones.webp`    | Sucesiones y Derechos Patrimoniales |
| `estudio.webp`       | El estudio                          |
| `equipo.webp`        | Equipo                              |
| `contacto.webp`      | Contacto                            |
| `turnos.webp`        | Pedir turno                         |
| `blog.webp`          | Novedades                           |

Formato recomendado: WebP, horizontal, alrededor de 2000 px del lado mayor. Se muestran muy suaves, debajo de una capa blanca. Si falta un archivo, esa página queda blanca.

## Contenido editable

| Qué                                      | Dónde                                                                         |
| ---------------------------------------- | ----------------------------------------------------------------------------- |
| Nombre, email, WhatsApp, ubicación       | `src/content/site.ts`                                                         |
| Equipo, valores, cifras                  | `src/content/site.ts`                                                         |
| Áreas, casos, palabras del buscador, FAQ | `src/content/services.ts`                                                     |
| Horarios de turnos                       | `src/lib/schedule.ts`                                                         |
| Reglas del asistente                     | `src/lib/ai/system-prompt.ts`                                                 |
| Colores                                  | `src/app/globals.css`                                                         |
| Artículos                                | `content/blog/*.mdx` (el campo `area` tiene que ser un slug de `services.ts`) |
| Textos legales                           | `src/app/(site)/privacidad` y `aviso-legal`                                   |

Las palabras clave de cada área alimentan el buscador y las sugerencias del asistente. Conviene usar el lenguaje de quien consulta (“me echaron”, “choqué”), no solo el término técnico.

## Variables de entorno

Todas son opcionales en desarrollo. En producción, email y Supabase dejan de ser opcionales si se quieren recibir consultas y usar el portal.

| Variable                                                    | Para qué                                  |
| ----------------------------------------------------------- | ----------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                                      | URL canónica, sitemap y Open Graph        |
| `GOOGLE_GENERATIVE_AI_API_KEY`, `GEMINI_MODEL`              | Asistente real                            |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`  | Emails de contacto y turnos               |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`        | Límite de uso compartido entre instancias |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`    | Control anti-bots                         |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Turnos persistentes y portal              |

No cargues la clave `service_role` de Supabase en esta app. La clave anónima es pública y queda limitada por las políticas de la base.

## Seguridad

- Cabeceras y CSP en `next.config.ts`.
- Formularios validados con Zod en el servidor, con campo trampa, límite de intentos y Turnstile cuando está configurado.
- El asistente descarta todo lo que no sea texto, limita el tamaño y no debe dar asesoramiento concreto.
- Portal: políticas por fila, chequeo de rol en cada acción, MFA obligatorio para el equipo, documentos con enlace firmado de 60 segundos y auditoría por triggers.

Detalle en [ADR 0005](docs/adr/0005-seguridad.md).

## Llevarlo a producción

Guía por fases (PASO / Ubicación / Acción / Verificación):
[docs/runbooks/produccion-fases.md](docs/runbooks/produccion-fases.md).

Orden resumido:

1. **Dominio y Vercel.** Importar este repositorio y definir `NEXT_PUBLIC_SITE_URL` con el dominio final (con `https`). Guía: [docs/runbooks/deploy.md](docs/runbooks/deploy.md).
2. **Email (Resend).** Verificar el dominio del remitente y cargar `RESEND_API_KEY`, `CONTACT_TO_EMAIL` y `CONTACT_FROM_EMAIL`. Sin esto, en producción el formulario no envía la consulta.
3. **Asistente (Gemini).** Cargar `GOOGLE_GENERATIVE_AI_API_KEY`. Revisar el system prompt con la Dra. antes de abrirlo al público.
4. **Supabase.** Proyecto en São Paulo, migración `supabase/migrations/20260927000000_init.sql`, Auth sin registro público y MFA para el equipo. Guía: [docs/runbooks/supabase-setup.md](docs/runbooks/supabase-setup.md) y [docs/runbooks/asignar-roles.md](docs/runbooks/asignar-roles.md). Correr `npx supabase test db` antes de cargar datos reales.
5. **Abuso.** Upstash para el rate limit (en Vercel hay más de una instancia) y Turnstile en los formularios.
6. **Legales.** Revisar privacidad (Ley 25.326) y aviso legal con la Dra. Hoy son modelos.
7. **Contenido.** Subir `hero.mp4` y las fotos de `public/images/fondos/`. Confirmar que no queden cifras, direcciones ni redes que el estudio no haya dado.
8. **Chequeo.** Enviar un contacto de prueba, reservar y cancelar un turno, entrar al portal con MFA, y pasar el sitio por [securityheaders.com](https://securityheaders.com) y Search Console.

El WhatsApp y el correo ya están publicados a pedido del estudio. Cualquier entorno de prueba que sea indexable va a recibir mensajes reales.

## Estructura

```text
content/blog/          Artículos MDX
public/videos/         hero.mp4 y hero-poster.jpg
public/images/fondos/  Fotos de fondo por sección
src/app/(site)/        Sitio público
src/app/(portal)/      Portal y administración
src/app/api/chat/      Asistente en streaming
src/components/        Layout, formularios, IA, secciones
src/content/           site.ts y services.ts
src/lib/               Validación, agenda, SEO, auth, Supabase
src/proxy.ts           Sesión y protección de /portal y /admin
supabase/              Migración, seed y tests de RLS
tests/                 Unitarios y E2E
docs/                  ADRs y runbooks
```

## Convenciones

Commits en [Conventional Commits](https://www.conventionalcommits.org/es/), validados por commitlint. `lint-staged` formatea y lintea antes de cada commit. CI en GitHub Actions corre formato, lint, tipos, tests, build, E2E y Lighthouse.
