# ADR 0003 — Asistente con Vercel AI SDK y Google Gemini

- Estado: aceptado
- Fecha: 2026-09-27

## Contexto

Queremos un asistente que oriente a los visitantes hacia el área correcta y los lleve a pedir un turno. No debe dar
asesoramiento legal (responsabilidad profesional) ni recolectar datos sensibles.

## Decisión

- **Vercel AI SDK** (`streamText` + `useChat`): streaming, cancelación y un proveedor intercambiable en una línea.
- **Google Gemini** (`gemini-3.8-flash`, configurable con `GEMINI_MODEL`): bajo costo y latencia, buen español.
- Guardarraíles:
  - System prompt que prohíbe asesoramiento concreto, pide no compartir datos sensibles, deriva urgencias (911, 144)
    y está redactado para resistir inyecciones de prompt.
  - El servidor descarta todo lo que no sea texto, conserva los últimos 10 mensajes (1500 caracteres cada uno) y
    limita la salida a 400 tokens.
  - Rate limit de 20 mensajes cada 10 minutos por IP.
  - Disclaimer visible permanente en el panel.
- Complemento **sin IA**: el buscador de la home y las sugerencias del chat usan `searchServices` sobre las keywords
  de cada área, así que la orientación funciona aunque el modelo falle.
- `AI_MOCK=1` para E2E y demos sin costo.

## Alternativas

- **OpenAI / Anthropic**: equivalentes en calidad; se eligió Gemini por costo. Cambiar de proveedor es trivial con el SDK.
- **RAG sobre documentos del estudio**: innecesario hoy; el contenido relevante entra en el prompt.

## Consecuencias

- Sin clave, el endpoint responde 503 y la UI deriva a WhatsApp.
- Revisar el prompt cuando se agreguen áreas o cambien los canales de contacto.
