ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "credentials_changed_at" timestamp with time zone;
