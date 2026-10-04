# Runbook — Email gratis con Gmail SMTP

Sin dominio propio. Contacto y turnos llegan a Gmail (o al mail que configures
en `CONTACT_TO_EMAIL`). Guía PASO / Ubicación / Acción / Verificación.

El código prioriza Gmail si hay `GMAIL_USER` + `GMAIL_APP_PASSWORD`. Si no,
usa Resend (opcional).

---

## PASO 1 — Usar una cuenta Gmail del estudio

- Ubicación: https://mail.google.com (recomendado: el de la Dra. o el tuyo
  de prueba, ej. `crisneyra13@gmail.com` / `paula.f.sardo@gmail.com`)
- Acción: iniciá sesión en la cuenta que va a **enviar** los mails.
- Verificación: entrás al inbox sin error.

No uses la contraseña normal de Gmail en la app: solo una **contraseña de
aplicaciones**.

---

## PASO 2 — Activar verificación en 2 pasos

- Ubicación: https://myaccount.google.com/security
- Acción: **Cómo inicias sesión en Google** → **Verificación en 2 pasos** →
  activarla (SMS o app).
- Verificación: aparece “Activada”.

Sin 2 pasos, Google no deja crear contraseñas de aplicaciones.

---

## PASO 3 — Crear la contraseña de aplicaciones

- Ubicación: https://myaccount.google.com/apppasswords  
  (o Seguridad → Verificación en 2 pasos → Contraseñas de aplicaciones)
- Acción:
  1. Nombre: `estudio-juridico` (o `Vercel`).
  2. Crear.
  3. Copiá las **16 letras** (sin espacios al guardar, o con espacios: ambos
     suelen andar; preferí sin espacios: `abcd efgh ijkl mnop` → `abcdefghijklmnop`).
- Verificación: tenés un string de 16 caracteres. **Solo se muestra una vez.**

---

## PASO 4 — Variables en local (`.env.local`)

- Ubicación: `C:\Users\usuario\Documents\estudio-juridico\.env.local`
- Acción: agregá o editá (valores de ejemplo; usá los tuyos):

```env
GMAIL_USER=crisneyra13@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
CONTACT_TO_EMAIL=crisneyra13@gmail.com
CONTACT_FROM_EMAIL=Dra. Paula Sardo <crisneyra13@gmail.com>
```

Notas:

- `GMAIL_USER` = la cuenta de la contraseña de aplicaciones.
- `CONTACT_TO_EMAIL` = quién **recibe** avisos del estudio (puede ser el mismo).
- `CONTACT_FROM_EMAIL` = cómo se ve el remitente; el mail entre `<>` debe ser
  el de `GMAIL_USER`.
- Si tenías `RESEND_API_KEY`, podés dejarla: **Gmail tiene prioridad**.

- Verificación: guardá el archivo. **No lo subas a Git.**

---

## PASO 5 — Reiniciar el servidor local

- Ubicación: terminal en la carpeta del proyecto
- Acción:

```bat
cmd.exe /c "npm run dev"
```

(Next solo lee `.env.local` al arrancar.)

- Verificación: http://localhost:3000 responde; en la consola no hay error de
  `env` al cargar.

---

## PASO 6 — Probar Contacto y Turnos

1. http://localhost:3000/contacto → enviá una consulta de prueba.
2. http://localhost:3000/turnos → reservá un turno.
3. Abrí el inbox de `CONTACT_TO_EMAIL` (y spam).
4. En turnos, el visitante también debería recibir el mail de confirmación
   (con Gmail no hay el límite “solo a la cuenta” de Resend).

Si falla:

- Revisá la terminal del `npm run dev` (buscá `email.gmail_failed`).
- Confirmá 2 pasos + app password de **esa** cuenta.
- Probá “Acceso de aplicaciones menos seguras” no aplica: hace falta app password.
- Cuentas Workspace a veces restringen SMTP: usá una Gmail personal o pedí
  permiso al admin.

---

## PASO 7 — Producción (Vercel)

- Ubicación:
  https://vercel.com/crisneyra13-projects/estudiosardoflorencia/settings/environment-variables
- Acción: agregá las mismas variables para **Production** (y Preview si querés):

| Variable             | Valor                               |
| -------------------- | ----------------------------------- |
| `GMAIL_USER`         | el Gmail                            |
| `GMAIL_APP_PASSWORD` | las 16 letras (Sensitive/Secret OK) |
| `CONTACT_TO_EMAIL`   | mail del estudio                    |
| `CONTACT_FROM_EMAIL` | `Dra. Paula Sardo <ese@gmail.com>`  |

- Redeploy:
  https://vercel.com/crisneyra13-projects/estudiosardoflorencia/deployments
  → ⋯ → **Redeploy**.
- Verificación: formulario en
  https://estudiosardoflorencia.vercel.app/contacto → llega el mail.

---

## Límites (importante)

- Gmail tiene cupo diario de envíos (orden de cientos en cuentas personales).
- Para un estudio con pocas consultas/día alcanza.
- Cuando tengas dominio `.com.ar`, podés pasar a Resend con From profesional;
  hasta entonces Gmail es la opción gratis sin dominio.
