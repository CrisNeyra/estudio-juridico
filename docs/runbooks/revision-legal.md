# Runbook — Fase 6: revisión legal con la Dra.

Guía para alinear el sitio con la **Ley 25.326** (Protección de los Datos
Personales), el secreto profesional y el alcance del asesoramiento online.
**No es asesoramiento legal**: la Dra. decide y aprueba los textos finales.

Páginas en producción:

- [https://estudiosardoflorencia.vercel.app/privacidad](https://estudiosardoflorencia.vercel.app/privacidad)
- [https://estudiosardoflorencia.vercel.app/aviso-legal](https://estudiosardoflorencia.vercel.app/aviso-legal)

Código:

- `src/app/(site)/privacidad/page.tsx`
- `src/app/(site)/aviso-legal/page.tsx`
- Checkbox de consentimiento: `src/components/forms/consent-checkbox.tsx`
- Prompt del asistente: `src/lib/ai/system-prompt.ts`

---

## 1. Para qué sirve esta fase

El sitio ya está online y recoge datos reales (contacto, turnos, portal, chat).
La Fase 6 no “habilita” tecnología: **valida el relato legal** frente a lo que
el sistema hace de verdad, para que:

1. La política de privacidad diga con honestidad qué se recoge, para qué, quién
   lo ve y cómo ejercer derechos.
2. El aviso legal deje claro que **información ≠ patrocinio** y cuándo nace la
   relación abogado-cliente.
3. La Dra. asuma (o ajuste) responsable, contacto de datos, plazos y proveedores.
4. Antes de campañas fuertes, no haya un desfasaje grave entre marketing y
   textos legales.

Hasta que ella apruebe, el sitio puede seguir online; conviene **no empujar
tráficos grandes** al formulario si los textos aún no están firmados.

---

## 2. Mapa de datos del producto (lo que el código hace hoy)

| Canal                  | Datos típicos                                                               | Dónde viven                                                             | Quién los ve                                    |
| ---------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------- |
| Formulario `/contacto` | Nombre, email, teléfono, área, texto de consulta, consentimiento, Turnstile | Email (Resend) → bandeja configurada (`CONTACT_TO`)                     | Quien reciba ese mail                           |
| Formulario `/turnos`   | Igual + fecha/hora/modalidad                                                | Neon (`appointments`) + email de aviso                                  | Staff con portal; Gmail/Resend                  |
| Asistente (chat)       | Mensajes de la conversación                                                 | Proveedor Gemini (streaming); **no** se guardan como expediente en Neon | Google (procesamiento); no el panel del estudio |
| Portal `/portal`       | Cuenta, casos, eventos, documentos                                          | Neon + Auth.js + Vercel Blob                                            | Cliente dueño + staff (abogado/admin) con MFA   |
| Analytics              | Métricas de uso/rendimiento                                                 | Vercel Analytics / Speed Insights                                       | Cuenta Vercel del proyecto                      |
| Anti-abuso             | Token Turnstile / IP en verificación                                        | Cloudflare                                                              | Cloudflare (verificación)                       |

Consentimiento en formularios (texto actual):

- Contacto: uso de datos **solo para responder la consulta**.
- Turnos: uso de datos **para gestionar el turno**.
- Ambos enlazan a `/privacidad`.

---

## 3. Qué ya cubren los textos (base razonable)

### Política de privacidad

- Responsable: Dra. Paula Florencia Sardo; email `paula.f.sardo@gmail.com`.
- Marco: Ley 25.326 + mención AAIP.
- Categorías: formularios, turnos, portal, analytics sin cookies publicitarias.
- Finalidades: responder, turnos, WhatsApp/email a pedido, servicio a clientes.
- IA: Gemini, no datos sensibles, no es asesoramiento, no es expediente.
- Proveedores genéricos; secreto profesional; derechos ARCO-like; HTTPS.

### Aviso legal

- Identificación profesional (matrículas CPACF / CAAL).
- Contenidos e IA = informativos; no generan relación abogado-cliente.
- Relación recién con aceptación expresa del caso y honorarios.
- Propiedad intelectual, enlaces, jurisdicción Argentina / CABA.

---

## 4. Gaps y decisiones para la Dra. (priorizados)

### A — Decidir en reunión (bloquean “texto final”)

1. **Responsable y domicilio**
   ¿El responsable es solo ella? ¿Hay que publicar un domicilio físico / legal
   además de “CABA y PBA”? ¿El email de datos es el mismo que el comercial?
2. **Inscripción AAIP (Registro Nacional de Bases de Datos)**
   La Ley 25.326 exige inscripción de ciertos bancos/archivos privados.  
   Decisión: ¿el estudio ya está inscripto / va a inscribirse / lo evalúa
   aparte? El sitio no reemplaza ese trámite; como máximo puede decir que
   los datos se tratan conforme a la ley y se puede ejercer derechos ante el
   responsable y la AAIP.
3. **Plazos de conservación**
   Hoy no están escritos. Propuestas típicas a validar:

- Consultas web no convertidas en cliente: X meses.
- Turnos cancelados / no confirmados: Y meses.
- Clientes / casos / documentos: mientras dure el vínculo + Z años
  (archivo profesional / obligaciones legales).
- Logs técnicos / analytics: según proveedor.

4. **Transferencias / proveedores nombrados**
   Hoy dice “proveedores” sin nombres. Para transparencia conviene listar
   categorías o nombres, con sede/región si ella lo quiere:

| Proveedor             | Uso                      | Nota                                    |
| --------------------- | ------------------------ | --------------------------------------- |
| Vercel                | Hosting + Analytics      | EE.UU. / edge global                    |
| Resend                | Email transaccional      | Según región del proveedor              |
| Neon + Auth.js + Blob | DB + auth + documentos   | Neon (región elegida); Blob en Vercel   |
| Cloudflare Turnstile  | Anti-bots en formularios | Verificación en Cloudflare              |
| Google Gemini         | Asistente orientativo    | Procesamiento por Google; no expediente |

Decisión: ¿nombres comerciales en la política o solo categorías
(“hosting”, “correo”, “IA”)? 5. **WhatsApp**
Canal activo. Meta trata datos bajo sus términos. ¿Se aclara en
privacidad que, si la persona escribe por WhatsApp, aplica también la
política de Meta? 6. **Jurisdicción del aviso**
El checklist habla CABA/PBA; el texto actual solo menciona tribunales de
CABA. ¿Dejar CABA, o “CABA o PBA según corresponda”?

### B — Ajustes de redacción recomendados (si ella aprueba)

1. **Derecho de información (art. 6)** más explícito en `/privacidad`:

- carácter obligatorio/voluntario de cada dato;
- consecuencias de no facilitarlos (no poder responder / no agendar);
- destinatarios (equipo del estudio + proveedores necesarios).

2. **Datos sensibles**
   Reforzar: no pedir DNI, salud, datos de terceros en formularios ni chat;
   si llegan, se tratan con reserva profesional y se pide no reenviarlos por
   canales inseguros.
3. **Menores**
   Una línea: el sitio no está dirigido a menores; si se detecta, se
   contactará al adulto responsable / no se dará curso.
4. **Portal**
   Aclarar: documentos del caso los carga el estudio; acceso con cuenta
   invitada; staff con MFA; el cliente puede pedir baja/rectificación
   escribiendo al email de datos.
5. **Analytics**
   Confirmar con ella que Vercel Analytics (sin cookies publicitarias) es
   aceptable sin banner de cookies. Si pide opt-out, hay que implementar
   cambio técnico aparte.

### C — Fuera de estas dos páginas (relacionado)

1. TextTextos del checkbox** — ¿el wording actual alcanza o quiere una frase
   más cercana al art. 6?
2. **Prompt del chat** — ya prohíbe datos sensibles; ella puede pedir tono
   más restrictivo.
3. **Email `CONTACT_TO`** — hoy en pruebas puede ir a un mail técnico; en
   producción debería ser el del estudio (suele requerir dominio en Resend).

---

## 5. Checklist de reunión (usar tal cual)

Imprimir o compartir con la Dra. Marcar Sí / No / Ajuste.

| #   | Pregunta                                                              | Estado actual en el sitio | Decisión |
| --- | --------------------------------------------------------------------- | ------------------------- | -------- |
| 1   | ¿Responsable = Dra. Paula F. Sardo y email `paula.f.sardo@gmail.com`? | Sí                        |          |
| 2   | ¿Publicar domicilio físico?                                           | No (solo CABA/PBA)        |          |
| 3   | ¿Inscripción AAIP hecha / en curso / fuera de alcance del sitio?      | No mencionado             |          |
| 4   | ¿Finalidades OK: consulta, turnos, portal, sin ads?                   | Sí                        |          |
| 5   | ¿Listar proveedores por nombre?                                       | Solo genérico             |          |
| 6   | ¿Plazos de conservación?                                              | No escritos               |          |
| 7   | ¿Texto IA / Gemini OK?                                                | Sí, básico                |          |
| 8   | ¿Mención WhatsApp/Meta?                                               | Implícita (contacto)      |          |
| 9   | ¿Derechos + AAIP OK?                                                  | Sí                        |          |
| 10  | ¿Aviso: no relación hasta aceptación + honorarios?                    | Sí                        |          |
| 11  | ¿Jurisdicción CABA solo o CABA/PBA?                                   | Solo CABA                 |          |
| 12  | ¿Checkbox de formularios OK?                                          | Sí, corto                 |          |
| 13  | ¿Autoriza ir a campañas / ads con estos textos?                       | —                         |          |

---

## 6. Pre-lectura corta para enviar a la Dra.

Asunto sugerido: _Revisión textos web — privacidad y aviso legal_

> Hola Paula,  
> El sitio ya tiene política de privacidad y aviso legal en  
> [https://estudiosardoflorencia.vercel.app/privacidad](https://estudiosardoflorencia.vercel.app/privacidad) y  
> [https://estudiosardoflorencia.vercel.app/aviso-legal](https://estudiosardoflorencia.vercel.app/aviso-legal)
>
> Necesitamos tu OK (o cambios) sobre: responsable y mail de datos; qué datos  
> pedimos en contacto/turnos/portal; uso del asistente con Gemini (solo  
> orientación, sin datos sensibles); proveedores técnicos; plazos de  
> guardado; y que el aviso deje claro que el sitio no crea por sí solo la  
> relación abogado-cliente.
>
> Cuando apruebes, actualizamos los textos en el sitio con la fecha del día.

---

## 7. Después de la reunión (implementación)

1. Anotar decisiones del checklist (aunque sea en este archivo, sección
   “Acta”).
2. Pedir al asistente: **“aplicá los cambios de Fase 6 según el acta”**.
3. Editar `privacidad/page.tsx` y/o `aviso-legal/page.tsx`.
4. Actualizar el prop `updated` a la fecha de aprobación.
5. Si cambian checkboxes o prompt, tocar esos archivos también.
6. Commit + push → Vercel redeploy.
7. Verificación: releer ambas URLs en producción.

### Acta (completar en la reunión)

- Fecha: 29 de septiembre de 2026 (implementación técnica de defaults del runbook)
- Participantes: equipo técnico (pendiente OK formal de la Dra.)
- Decisiones (bullet):
  - Proveedores nombrados (Vercel, Gmail/Resend, Neon, Blob, Turnstile, Gemini)
  - Plazos: consultas 12 meses; turnos cancelados 6 meses; clientes mientras dure el vínculo
  - WhatsApp/Meta mencionado; menores y datos sensibles reforzados
  - Jurisdicción CABA o PBA según corresponda
  - Checkbox: “tratamiento de estos datos…” + link a privacidad
- Textos aprobados sin cambios: no (ampliados)
- Cambios pedidos: pendientes de confirmación de la Dra.
- Autoriza campañas: pendiente

---

## 8. Riesgos si se saltea esta fase

- Describir mal a Gemini/Neon/Resend → reclamo de falta de información.
- Prometer “no cedemos a terceros” sin aclarar encargados técnicos.
- Usuario cree que el chat = patrocinio → conflicto ético/profesional.
- Campañas con formularios sin consentimiento claro o sin política alineada.
- Portal con documentos sensibles sin MFA/roles (mitigado en código; el texto
  debe acompañarlo).
