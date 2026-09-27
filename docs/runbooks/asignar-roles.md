# Runbook — Invitar clientes y asignar roles

Los roles (`cliente`, `abogado`, `admin`) **no se pueden cambiar desde la app**: la base lo bloquea a propósito. Se
asignan desde el dashboard de Supabase.

---

**PASO 1 — Invitar a la persona**

- Ubicación: Supabase → **Authentication** → **Users** → **Add user** → **Send invitation**
- Acción: ingresá el email del cliente o integrante del equipo.
- Verificación: el usuario aparece en la lista como "Waiting for verification". Recibe un email para entrar.

Todo usuario nuevo arranca como `cliente` (lo crea el trigger `handle_new_user`).

**PASO 2 — Elevar a abogado o admin (solo equipo del estudio)**

- Ubicación: Supabase → **SQL Editor** → **New query**
- Acción: ejecutá, reemplazando el email y el rol:

  ```sql
  update public.profiles set role = 'abogado' where email = 'persona@estudio.com.ar';
  ```

- Verificación: `select email, role from public.profiles;` muestra el rol nuevo.

**PASO 3 — Activar MFA (obligatorio para abogados y admins)**

- Ubicación: el sitio → **Clientes** → ingresar → **Seguridad** (`/portal/seguridad`)
- Acción: tocá **Activar**, escaneá el QR con Google Authenticator, 1Password o Authy e ingresá el código de 6 dígitos.
- Verificación: al entrar a `/admin` se ve el **Panel del estudio**. Sin MFA, `/admin` redirige a Seguridad.

**PASO 4 — Abrir un caso para un cliente**

- Ubicación: `/admin` → **Nuevo caso**
- Acción: email del cliente (ya invitado), área y título.
- Verificación: el cliente ve el caso en `/portal` al ingresar.

## Quitar acceso

- Rol: `update public.profiles set role = 'cliente' where email = '...';`
- Acceso total: Supabase → **Authentication** → **Users** → menú del usuario → **Ban user** o **Delete user**.
  Borrar un usuario con casos está bloqueado (`on delete restrict`) para no perder expedientes.
