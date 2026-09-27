-- =============================================================================
-- Estudio Jurídico — esquema inicial
-- Fase 2: turnos | Fase 3: portal de clientes (perfiles, casos, documentos, auditoría)
-- Principio: RLS habilitado en TODAS las tablas. El rol anon no accede a tablas;
-- solo ejecuta funciones RPC acotadas (booked_slots, book_appointment).
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------
create type public.app_role as enum ('cliente', 'abogado', 'admin');
create type public.appointment_status as enum ('pendiente', 'confirmado', 'cancelado');
create type public.appointment_mode as enum ('presencial', 'videollamada');
create type public.case_status as enum ('abierto', 'en_tramite', 'cerrado');

-- ---------------------------------------------------------------------------
-- Perfiles (1:1 con auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  full_name text not null default '',
  phone text,
  role public.app_role not null default 'cliente',
  created_at timestamptz not null default now()
);

-- Crea el perfil automáticamente al registrarse un usuario. El rol SIEMPRE arranca
-- como 'cliente'; se eleva solo desde el dashboard de Supabase (service role).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, lower(coalesce(new.email, '')), coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helpers de autorización (security definer para evitar recursión de RLS).
create or replace function public.my_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select role in ('abogado', 'admin') from public.profiles where id = auth.uid()), false);
$$;

-- ---------------------------------------------------------------------------
-- Turnos
-- ---------------------------------------------------------------------------
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.profiles (id) on delete set null,
  name text not null check (char_length(name) between 2 and 100),
  email text not null check (char_length(email) <= 160),
  phone text not null check (char_length(phone) <= 30),
  area text not null,
  starts_at timestamptz not null,
  mode public.appointment_mode not null,
  notes text not null default '' check (char_length(notes) <= 1000),
  status public.appointment_status not null default 'pendiente',
  created_at timestamptz not null default now()
);

-- Evita la doble reserva del mismo horario a nivel base de datos (no solo en la app).
create unique index appointments_unique_slot
  on public.appointments (starts_at)
  where status <> 'cancelado';

create index appointments_starts_at_idx on public.appointments (starts_at);

-- Devuelve SOLO horarios ocupados (sin datos personales) para un rango acotado.
create or replace function public.booked_slots(range_start timestamptz, range_end timestamptz)
returns table (starts_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select a.starts_at
  from public.appointments a
  where a.status <> 'cancelado'
    and a.starts_at >= range_start
    and a.starts_at < range_end
    and range_end - range_start <= interval '62 days';
$$;

-- Reserva atómica. La validación de agenda (días/horarios) se hace en la app;
-- acá se garantizan unicidad, futuro y límites de datos (checks de la tabla).
create or replace function public.book_appointment(
  p_name text,
  p_email text,
  p_phone text,
  p_area text,
  p_starts_at timestamptz,
  p_mode public.appointment_mode,
  p_notes text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_id uuid;
begin
  if p_starts_at <= now() then
    raise exception 'slot_in_past' using errcode = 'P0001';
  end if;

  insert into public.appointments (client_id, name, email, phone, area, starts_at, mode, notes)
  values (auth.uid(), p_name, lower(p_email), p_phone, p_area, p_starts_at, p_mode, coalesce(p_notes, ''))
  returning id into new_id;

  return new_id;
exception
  when unique_violation then
    raise exception 'slot_taken' using errcode = 'P0002';
end;
$$;

revoke all on function public.booked_slots(timestamptz, timestamptz) from public;
revoke all on function public.book_appointment(text, text, text, text, timestamptz, public.appointment_mode, text) from public;
grant execute on function public.booked_slots(timestamptz, timestamptz) to anon, authenticated;
grant execute on function public.book_appointment(text, text, text, text, timestamptz, public.appointment_mode, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Casos, eventos y documentos (portal)
-- ---------------------------------------------------------------------------
create table public.cases (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete restrict,
  lawyer_id uuid references public.profiles (id) on delete set null,
  title text not null check (char_length(title) between 3 and 160),
  area text not null,
  reference text,
  status public.case_status not null default 'abierto',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index cases_client_idx on public.cases (client_id);

create table public.case_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  title text not null check (char_length(title) between 3 and 160),
  description text not null default '' check (char_length(description) <= 4000),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index case_events_case_idx on public.case_events (case_id, occurred_at desc);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  uploaded_by uuid references public.profiles (id) on delete set null,
  name text not null check (char_length(name) between 1 and 200),
  storage_path text not null unique,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 20971520),
  mime_type text not null,
  created_at timestamptz not null default now()
);
create index documents_case_idx on public.documents (case_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger cases_touch before update on public.cases
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Auditoría (append-only, escrita solo por triggers)
-- ---------------------------------------------------------------------------
create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  table_name text not null,
  record_id text,
  created_at timestamptz not null default now()
);

create or replace function public.audit_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.audit_log (actor_id, action, table_name, record_id)
  values (
    auth.uid(),
    lower(tg_op),
    tg_table_name,
    (case when tg_op = 'DELETE' then old.id else new.id end)::text
  );
  return coalesce(new, old);
end;
$$;

create trigger audit_appointments after insert or update or delete on public.appointments
  for each row execute function public.audit_trigger();
create trigger audit_cases after insert or update or delete on public.cases
  for each row execute function public.audit_trigger();
create trigger audit_case_events after insert or update or delete on public.case_events
  for each row execute function public.audit_trigger();
create trigger audit_documents after insert or update or delete on public.documents
  for each row execute function public.audit_trigger();
create trigger audit_profiles after update on public.profiles
  for each row execute function public.audit_trigger();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.appointments enable row level security;
alter table public.cases enable row level security;
alter table public.case_events enable row level security;
alter table public.documents enable row level security;
alter table public.audit_log enable row level security;

-- profiles
create policy profiles_self_select on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_staff());
create policy profiles_self_update on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());
-- Privilegios por columna: un usuario solo puede editar nombre y teléfono. `role` y `email`
-- no son editables desde la API; los roles se asignan desde el dashboard (docs/runbooks).
revoke update on public.profiles from authenticated, anon;
grant update (full_name, phone) on public.profiles to authenticated;

-- appointments: los clientes ven sus turnos; el staff gestiona todos. Inserción solo vía RPC.
create policy appointments_select on public.appointments
  for select to authenticated using (client_id = auth.uid() or public.is_staff());
create policy appointments_staff_update on public.appointments
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

-- cases
create policy cases_select on public.cases
  for select to authenticated using (client_id = auth.uid() or public.is_staff());
create policy cases_staff_insert on public.cases
  for insert to authenticated with check (public.is_staff());
create policy cases_staff_update on public.cases
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

-- case_events
create policy case_events_select on public.case_events
  for select to authenticated using (
    public.is_staff()
    or exists (select 1 from public.cases c where c.id = case_id and c.client_id = auth.uid())
  );
create policy case_events_staff_insert on public.case_events
  for insert to authenticated with check (public.is_staff() and author_id = auth.uid());

-- documents
create policy documents_select on public.documents
  for select to authenticated using (
    public.is_staff()
    or exists (select 1 from public.cases c where c.id = case_id and c.client_id = auth.uid())
  );
create policy documents_staff_insert on public.documents
  for insert to authenticated with check (public.is_staff() and uploaded_by = auth.uid());
create policy documents_staff_delete on public.documents
  for delete to authenticated using (public.is_staff());

-- audit_log: solo lectura para admin; nadie escribe directo (solo triggers).
create policy audit_admin_select on public.audit_log
  for select to authenticated using (public.my_role() = 'admin');

-- ---------------------------------------------------------------------------
-- Storage: bucket privado de documentos. Ruta: {case_id}/{uuid}-{nombre}
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  20971520,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do nothing;

create policy documents_bucket_select on storage.objects
  for select to authenticated using (
    bucket_id = 'documents'
    and (
      public.is_staff()
      or exists (
        select 1 from public.cases c
        where c.id::text = (storage.foldername(name))[1] and c.client_id = auth.uid()
      )
    )
  );
create policy documents_bucket_insert on storage.objects
  for insert to authenticated with check (bucket_id = 'documents' and public.is_staff());
create policy documents_bucket_delete on storage.objects
  for delete to authenticated using (bucket_id = 'documents' and public.is_staff());
