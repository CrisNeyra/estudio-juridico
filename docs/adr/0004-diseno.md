# ADR 0004 — Sistema de diseño editorial y minimalista

- Estado: aceptado
- Fecha: 2026-09-27

## Contexto

El pedido fue un sitio "minimalista, único, de vanguardia, intuitivo y dinámico", priorizando los servicios. Los sitios
de estudios jurídicos suelen ser genéricos (azul marino, fotos de stock, martillos).

## Decisión

- **Dirección editorial**: tipografía display serif (Instrument Serif) con Geist para texto, mucho espacio en blanco
  y numeración de las áreas (01–10) como un índice de revista.
- **Paleta**: marfil y tinta con un único acento bordó (`--brand`), definida en oklch; modo oscuro completo.
- **Servicios primero**: la home abre con un buscador en lenguaje natural ("¿Qué necesitás resolver?") y el índice
  interactivo de las 10 áreas; cada área tiene página propia con casos, proceso y FAQ.
- **Movimiento sutil**: revelados al hacer scroll (Motion) y scroll suave (Lenis). Todo se desactiva con
  `prefers-reduced-motion`.
- **Accesibilidad WCAG 2.2 AA** como requisito: contraste verificado con axe en claro y oscuro, skip link, foco visible,
  formularios con errores asociados (`aria-describedby`) y el chat como diálogo navegable con teclado.

## Consecuencias

- Sin fotos: el sitio carga rápido y no depende de material que el estudio todavía no tiene. Si se suman fotos del
  equipo, usar `next/image` y retratos consistentes en blanco y negro.
- Los tokens viven en `src/app/globals.css`; cambiar el acento es cambiar dos variables.
