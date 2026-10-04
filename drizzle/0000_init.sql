CREATE TYPE "public"."app_role" AS ENUM('cliente', 'abogado', 'admin');
CREATE TYPE "public"."appointment_status" AS ENUM('pendiente', 'confirmado', 'cancelado');
CREATE TYPE "public"."appointment_mode" AS ENUM('presencial', 'videollamada');
CREATE TYPE "public"."case_status" AS ENUM('abierto', 'en_tramite', 'cerrado');

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text,
  "email" text NOT NULL UNIQUE,
  "email_verified" timestamptz,
  "image" text,
  "password_hash" text
);

CREATE TABLE "accounts" (
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "type" text NOT NULL,
  "provider" text NOT NULL,
  "provider_account_id" text NOT NULL,
  "refresh_token" text,
  "access_token" text,
  "expires_at" integer,
  "token_type" text,
  "scope" text,
  "id_token" text,
  "session_state" text,
  PRIMARY KEY ("provider", "provider_account_id")
);

CREATE TABLE "sessions" (
  "session_token" text PRIMARY KEY NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "expires" timestamptz NOT NULL
);

CREATE TABLE "verification_tokens" (
  "identifier" text NOT NULL,
  "token" text NOT NULL,
  "expires" timestamptz NOT NULL,
  PRIMARY KEY ("identifier", "token")
);

CREATE TABLE "profiles" (
  "id" uuid PRIMARY KEY NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "email" text DEFAULT '' NOT NULL,
  "full_name" text DEFAULT '' NOT NULL,
  "phone" text,
  "role" "app_role" DEFAULT 'cliente' NOT NULL,
  "totp_secret" text,
  "totp_enabled" boolean DEFAULT false NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE "appointments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "client_id" uuid REFERENCES "profiles"("id") ON DELETE set null,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text NOT NULL,
  "area" text NOT NULL,
  "starts_at" timestamptz NOT NULL,
  "mode" "appointment_mode" NOT NULL,
  "notes" text DEFAULT '' NOT NULL,
  "status" "appointment_status" DEFAULT 'pendiente' NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX "appointments_unique_slot" ON "appointments" ("starts_at") WHERE "status" <> 'cancelado';
CREATE INDEX "appointments_starts_at_idx" ON "appointments" ("starts_at");

CREATE TABLE "cases" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "client_id" uuid NOT NULL REFERENCES "profiles"("id") ON DELETE restrict,
  "lawyer_id" uuid REFERENCES "profiles"("id") ON DELETE set null,
  "title" text NOT NULL,
  "area" text NOT NULL,
  "reference" text,
  "status" "case_status" DEFAULT 'abierto' NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX "cases_client_idx" ON "cases" ("client_id");

CREATE TABLE "case_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "case_id" uuid NOT NULL REFERENCES "cases"("id") ON DELETE cascade,
  "author_id" uuid REFERENCES "profiles"("id") ON DELETE set null,
  "title" text NOT NULL,
  "description" text DEFAULT '' NOT NULL,
  "occurred_at" timestamptz DEFAULT now() NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX "case_events_case_idx" ON "case_events" ("case_id", "occurred_at" DESC);

CREATE TABLE "documents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "case_id" uuid NOT NULL REFERENCES "cases"("id") ON DELETE cascade,
  "uploaded_by" uuid REFERENCES "profiles"("id") ON DELETE set null,
  "name" text NOT NULL,
  "storage_path" text NOT NULL UNIQUE,
  "size_bytes" bigint NOT NULL,
  "mime_type" text NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX "documents_case_idx" ON "documents" ("case_id");

CREATE TABLE "audit_log" (
  "id" bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "actor_id" uuid,
  "action" text NOT NULL,
  "table_name" text NOT NULL,
  "record_id" text,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER cases_touch BEFORE UPDATE ON "cases"
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
