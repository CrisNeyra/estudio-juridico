# ADR 0002 — Supabase para datos, autenticación y documentos

- Estado: aceptado
- Fecha: 2026-09-27

## Contexto

Los turnos necesitan persistencia y evitar reservas dobles. El portal necesita usuarios, roles (cliente, abogado,
admin), expedientes y archivos confidenciales. Los datos de clientes de un estudio jurídico son sensibles.

## Decisión

Supabase (Postgres administrado) con:

- **Row Level Security en todas las tablas** como segunda barrera, además de las verificaciones en el servidor.
- **Auth** con contraseña o magic link, sin registro público (`shouldCreateUser: false`): el estudio invita a sus
  clientes. **MFA TOTP obligatorio** para abogados y admins.
- **Storage** en bucket privado; se sirven URLs firmadas de 60 segundos.
- **Funciones RPC `security definer`** acotadas (`booked_slots`, `book_appointment`) para que un visitante anónimo pueda
  reservar sin leer la tabla de turnos.
- Índice único parcial sobre `starts_at` para que la base impida la doble reserva aunque haya concurrencia.
- Auditoría por triggers en `audit_log`.

La app usa solo la **anon key**; la service role key no se carga en el servidor.

## Alternativas

- **Neon/Postgres + Auth.js + S3**: más piezas que integrar y asegurar.
- **Firebase**: modelo NoSQL menos natural para expedientes relacionales y reglas más difíciles de testear.

## Consecuencias

- Las políticas RLS son código crítico: se testean con pgTAP (`supabase/tests/rls.test.sql`).
- Los roles se asignan manualmente desde el dashboard ([runbook](../runbooks/asignar-roles.md)).
- Elegir la región `sa-east-1` (São Paulo) por latencia desde Argentina.
