# ADR 0002 — Supabase para datos, autenticación y documentos

- Estado: **superseded** por [0006-neon-auth-blob.md](0006-neon-auth-blob.md)
- Fecha: 2026-09-27
- Superseded: 2026-10-04

## Contexto

Los turnos necesitaban persistencia y el portal usuarios, roles y documentos.
Inicialmente se eligió Supabase (Postgres + Auth + Storage + RLS).

## Decisión (histórica)

Supabase con RLS, Auth (password/magic link, MFA) y Storage privado; solo anon key
en la app.

## Por qué se supersedió

Se migró a Neon + Auth.js + Vercel Blob para desacoplar Auth/Storage del proveedor
de Postgres y centralizar la autorización en el servidor Next.js. Ver ADR 0006.
