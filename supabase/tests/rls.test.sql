-- Tests de Row Level Security (pgTAP). Ejecutar con: supabase test db
begin;
create extension if not exists pgtap with schema extensions;
select plan(16);

-- Fixtures: dos clientes y un abogado -----------------------------------------
insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'ana@example.com', '{"full_name":"Ana"}'),
  ('22222222-2222-2222-2222-222222222222', 'beto@example.com', '{"full_name":"Beto"}'),
  ('33333333-3333-3333-3333-333333333333', 'abogada@example.com', '{"full_name":"Dra. Paz"}');

update public.profiles set role = 'abogado' where id = '33333333-3333-3333-3333-333333333333';

insert into public.cases (id, client_id, title, area) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Caso de Ana', 'laboral'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Caso de Beto', 'penal');

insert into public.case_events (case_id, title) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Demanda presentada'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Audiencia fijada');

insert into public.documents (case_id, name, storage_path, size_bytes, mime_type) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'poder.pdf', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/x-poder.pdf', 100, 'application/pdf'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'acta.pdf', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/y-acta.pdf', 100, 'application/pdf');

create function pg_temp.login(uid uuid) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
  set local role authenticated;
$$;

-- Anónimo ---------------------------------------------------------------------
set local role anon;
select is((select count(*) from public.cases)::int, 0, 'anon no ve casos');
select throws_ok(
  $$ insert into public.appointments (name, email, phone, area, starts_at, mode)
     values ('Intruso', 'x@x.com', '1', 'penal', now() + interval '2 days', 'presencial') $$,
  '42501', null, 'anon no inserta turnos directo en la tabla'
);
select lives_ok(
  $$ select public.book_appointment('Carla', 'carla@example.com', '1155550000', 'laboral',
       date_trunc('hour', now()) + interval '3 days', 'presencial', '') $$,
  'anon reserva vía RPC'
);
select throws_ok(
  $$ select public.book_appointment('Otra', 'otra@example.com', '1155550001', 'laboral',
       date_trunc('hour', now()) + interval '3 days', 'presencial', '') $$,
  'P0002', null, 'no se puede reservar dos veces el mismo horario'
);
select is((select count(*) from public.appointments)::int, 0, 'anon no lee turnos');
reset role;

-- Cliente Ana -----------------------------------------------------------------
select pg_temp.login('11111111-1111-1111-1111-111111111111');
select results_eq('select title from public.cases', $$ values ('Caso de Ana') $$, 'Ana ve solo su caso');
select is((select count(*) from public.case_events)::int, 1, 'Ana ve solo eventos de su caso');
select is((select count(*) from public.documents)::int, 1, 'Ana ve solo documentos de su caso');
select is((select count(*) from public.profiles)::int, 1, 'Ana ve solo su perfil');
select throws_ok(
  $$ update public.profiles set role = 'admin' where id = auth.uid() $$,
  '42501', null, 'Ana no puede elevar su rol'
);
select lives_ok(
  $$ update public.profiles set full_name = 'Ana María' where id = auth.uid() $$,
  'Ana puede editar su nombre'
);
select throws_ok(
  $$ insert into public.cases (client_id, title, area)
     values ('11111111-1111-1111-1111-111111111111', 'Caso falso', 'penal') $$,
  '42501', null, 'un cliente no crea casos'
);
select is((select count(*) from public.audit_log)::int, 0, 'un cliente no lee la auditoría');
reset role;

-- Abogada ---------------------------------------------------------------------
select pg_temp.login('33333333-3333-3333-3333-333333333333');
select is((select count(*) from public.cases)::int, 2, 'el staff ve todos los casos');
select lives_ok(
  $$ insert into public.case_events (case_id, author_id, title)
     values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', auth.uid(), 'Nueva novedad') $$,
  'el staff agrega eventos firmados por sí mismo'
);
select throws_ok(
  $$ insert into public.case_events (case_id, author_id, title)
     values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Suplantación') $$,
  '42501', null, 'el staff no puede firmar eventos como otro usuario'
);
reset role;

select * from finish();
rollback;
