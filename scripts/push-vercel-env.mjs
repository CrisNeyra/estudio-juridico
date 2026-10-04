/**
 * Push selected vars from .env.local to Vercel (production + preview).
 * Usage: node --env-file=.env.local scripts/push-vercel-env.mjs
 */
import { spawnSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const PROJECT = "estudiosardoflorencia";
const SCOPE = "crisneyra13-projects";
const KEYS = [
  "GMAIL_USER",
  "GMAIL_APP_PASSWORD",
  "CONTACT_TO_EMAIL",
  "CONTACT_FROM_EMAIL",
  "DATABASE_URL",
  "AUTH_SECRET",
];

const vercelBin = join(process.cwd(), "node_modules", "vercel", "dist", "vc.js");

function setEnv(key, value) {
  const tmp = join(tmpdir(), `vercel-env-${key}-${Date.now()}.txt`);
  writeFileSync(tmp, value, "utf8");
  try {
    const r = spawnSync(
      process.execPath,
      [
        vercelBin,
        "env",
        "add",
        key,
        "production,preview",
        "--project",
        PROJECT,
        "--scope",
        SCOPE,
        "--yes",
        "--force",
        "--sensitive",
      ],
      {
        encoding: "utf8",
        input: value,
        windowsHide: true,
      },
    );
    if (r.status !== 0) {
      console.error(r.stderr || r.stdout || r.error);
      throw new Error(`Failed ${key} (${r.status})`);
    }
    console.log((r.stdout || "").trim() || `OK ${key}`);
  } finally {
    try {
      unlinkSync(tmp);
    } catch {
      /* ignore */
    }
  }
}

for (const key of KEYS) {
  const value = process.env[key];
  if (!value) {
    console.warn(`SKIP ${key}: vacío`);
    continue;
  }
  console.log(`SET ${key} → production,preview`);
  setEnv(key, value);
}

console.log("OK: variables actualizadas en Vercel.");
