# Runbook — Invitar clientes y asignar roles

Los roles (`cliente`, `abogado`, `admin`) se asignan en la base (Neon). El alta
de usuarios se hace desde el panel del estudio (`/admin`), no hay registro
público.

---

**PASO 0 — Primer admin (base vacía)**

Sin un admin previo no podés usar `/admin` para invitar. Creá el primero con el
script (necesita `DATABASE_URL` en `.env.local`):

```bat
cmd.exe /c "set SEED_ADMIN_EMAIL=tu@gmail.com&& set SEED_ADMIN_PASSWORD=TuPasswordSegura123&& set SEED_ADMIN_NAME=Admin&& npm run db:seed-admin"
```

Luego: `/portal/login` → `/portal/seguridad` (activar MFA) → `/admin`.

---

**PASO 1 — Invitar a la persona**

- Ubicación: el sitio → `/admin` (con sesión staff + MFA) → **Invitar usuario**
- Acción: email, nombre y rol inicial (`cliente` / `abogado` / `admin`). Opcional:
  contraseña temporal; si no, Auth.js puede enviar magic link (Gmail SMTP).
- Verificación: la persona aparece en Neon (`users` + `profiles`) y puede entrar
  en `/portal/login`.

**PASO 2 — Cambiar rol (solo si hace falta)**

- Ubicación: Neon → **SQL Editor** (o cualquier cliente Postgres con `DATABASE_URL`)
- Acción:

  ```sql
  update public.profiles set role = 'abogado' where email = 'persona@estudio.com.ar';
  ```

- Verificación: `select email, role from public.profiles;` muestra el rol nuevo.

**PASO 3 — Activar MFA (obligatorio para abogados y admins)**

- Ubicación: el sitio → **Clientes** → ingresar → **Seguridad** (`/portal/seguridad`)
- Acción: **Activar**, escanear el QR (Google Authenticator, 1Password, Authy) e
  ingresar el código de 6 dígitos.
- Verificación: `/admin` muestra el **Panel del estudio**. Sin MFA, redirige a
  Seguridad o al desafío TOTP.

**PASO 4 — Abrir un caso para un cliente**

- Ubicación: `/admin` → **Nuevo caso**
- Acción: email del cliente (ya invitado), área y título.
- Verificación: el cliente ve el caso en `/portal` al ingresar.

## Quitar acceso

- Rol: `update public.profiles set role = 'cliente' where email = '...';`
- Acceso total: borrar o deshabilitar el usuario en Neon (`users` / `profiles`).
  Borrar un usuario con casos puede estar restringido por FK; preferí bajar el
  rol y cambiar la contraseña / invalidar sesiones.
