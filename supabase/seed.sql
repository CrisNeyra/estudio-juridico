-- Datos de ejemplo para desarrollo local (supabase db reset).
-- Para convertir un usuario en abogado/admin, ver docs/runbooks/asignar-roles.md

insert into public.appointments (name, email, phone, area, starts_at, mode, notes, status)
values
  ('Cliente Demo', 'demo@example.com', '+54 11 0000-0000', 'laboral',
   date_trunc('day', now() + interval '3 days') + interval '13 hours', 'videollamada', 'Turno de ejemplo', 'pendiente');
