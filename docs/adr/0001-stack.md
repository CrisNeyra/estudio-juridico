# ADR 0001 — Stack base: Next.js 16 + TypeScript + Tailwind v4

- Estado: aceptado
- Fecha: 2026-09-27

## Contexto

El sitio necesita buen SEO (captación de clientes por búsquedas), contenido mayormente estático, formularios seguros,
un endpoint de IA con streaming y, más adelante, un portal autenticado. Lo mantiene un equipo chico.

## Decisión

- **Next.js 16 con App Router**. El plan original decía Next 15; al iniciar el proyecto la versión estable era la 16 y
  la adoptamos para no nacer con deuda. Cambios relevantes que usamos: `params`/`searchParams` asíncronos,
  `proxy.ts` en lugar de `middleware.ts` y `next typegen` para tipar rutas.
- **Server Actions + `useActionState`** para formularios, en lugar de react-hook-form: validación única en el servidor
  con Zod, funciona sin JavaScript y hay menos dependencias.
- **Tailwind CSS v4 + shadcn/ui** para componentes accesibles (Radix) que son código propio, no una dependencia opaca.
- **TypeScript estricto** con `noUncheckedIndexedAccess`.
- **Vercel** como hosting: soporte nativo de Next, previews por PR y edge network.

## Alternativas

- **Astro**: excelente para contenido, pero el portal y el streaming de IA se resuelven mejor en Next.
- **Remix / React Router 7**: similar en capacidades, menor ecosistema para este caso.
- **WordPress**: rápido para contenido, pero peor en seguridad, rendimiento y en el portal a medida.

## Consecuencias

- Las páginas públicas se prerenderizan (SSG) y cargan muy rápido.
- Hay que seguir las guías de Next 16, que difieren de muchos tutoriales en internet.
- **Sentry queda diferido**: por ahora logs estructurados (`src/lib/logger.ts`) y Vercel Analytics / Speed Insights.
  Reevaluar cuando el portal tenga usuarios reales.
