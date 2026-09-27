# ADR 0005 — Seguridad desde el día uno

- Estado: aceptado
- Fecha: 2026-09-27

## Contexto

Un estudio jurídico maneja información confidencial y está sujeto a la Ley 25.326 de Protección de Datos Personales.
Los formularios públicos y el endpoint de IA son blancos de spam y abuso de costos.

## Decisión

Defensa en profundidad, alineada con OWASP Top 10:

| Riesgo                   | Control                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| Control de acceso roto   | `requireUser()` / `requireStaff()` en cada Server Action y página, más RLS en la base             |
| Autenticación débil      | Sin registro público, MFA TOTP obligatorio para staff (aal2), mensajes genéricos anti-enumeración |
| Inyección / XSS          | Zod en el servidor, React escapa por defecto, JSON-LD con `<` escapado, CSP estricta              |
| Open redirect            | `safeNext()` solo acepta rutas relativas                                                          |
| Clickjacking             | `frame-ancestors 'none'` y `X-Frame-Options: DENY`                                                |
| Abuso / costos           | Rate limit por política, Turnstile, honeypot, límites de tamaño en el chat                        |
| Exposición de archivos   | Bucket privado, URLs firmadas de 60 s, whitelist de MIME, 20 MB máximo, nombres saneados          |
| Secretos                 | Solo en variables de entorno de Vercel; `.env*` ignorado por git; sin service role key            |
| Trazabilidad             | `audit_log` escrito por triggers; logs JSON con PII redactada en producción                       |
| Dependencias vulnerables | Dependabot semanal y `npm audit` en CI                                                            |

La CSP no usa nonces para que las páginas públicas sigan siendo estáticas; por eso `script-src` incluye
`'unsafe-inline'`. Es un compromiso aceptado: no hay HTML generado por usuarios en las páginas públicas.

## Consecuencias

- Revisar la CSP al agregar cualquier script o servicio externo.
- Antes de cargar datos reales: correr los tests de RLS, activar Upstash y Turnstile y revisar los textos legales
  con un profesional.
