import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env, features } from "@/lib/env";
import * as schema from "./schema";

export type Db = ReturnType<typeof createDb>;

function createDb() {
  const sql = neon(env.DATABASE_URL!);
  return drizzle(sql, { schema });
}

let cached: Db | null = null;

/** Returns null when DATABASE_URL is missing (portal/turnos degrade gracefully). */
export function getDb(): Db | null {
  if (!features.db) return null;
  if (!cached) cached = createDb();
  return cached;
}

export { schema };
