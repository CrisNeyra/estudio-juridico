import "server-only";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { env, features } from "@/lib/env";
import * as schema from "./schema";

export type Db = ReturnType<typeof createDb>;

if (typeof WebSocket !== "undefined") {
  neonConfig.webSocketConstructor = WebSocket;
}

function createDb() {
  const pool = new Pool({ connectionString: env.DATABASE_URL! });
  return drizzle({ client: pool, schema });
}

let cached: Db | null = null;

/** Returns null when DATABASE_URL is missing (portal/turnos degrade gracefully). */
export function getDb(): Db | null {
  if (!features.db) return null;
  if (!cached) cached = createDb();
  return cached;
}

export { schema };
