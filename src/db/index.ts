import { drizzle as drizzlePg, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import postgres from "postgres";
import * as schema from "./schema";
import fs from "node:fs";
import path from "node:path";

/**
 * Database connection.
 *
 * Production uses managed Postgres (Neon) via DATABASE_URL.
 * With no DATABASE_URL (or USE_PGLITE=1) we fall back to PGlite — an in-process
 * Postgres that needs zero setup. That makes the app runnable locally with a
 * single `npm run dev`, and is what the sandbox preview uses. Production data
 * always lives in Neon.
 */

// Both drivers share the same Drizzle query API. We expose a single type so
// application code has consistent typing regardless of which driver is active.
type DB = PostgresJsDatabase<typeof schema>;

// Cache the connection on globalThis so every module bundle (server actions,
// route handlers, page renders) shares ONE instance. Without this, PGlite would
// be instantiated per-bundle and writes wouldn't be visible across requests;
// on Neon it avoids opening redundant connections.
const globalForDb = globalThis as unknown as { __maDb?: Promise<DB> };

const usePglite =
  process.env.USE_PGLITE === "1" || !process.env.DATABASE_URL;

async function init(): Promise<DB> {
  if (usePglite) {
    const { PGlite } = await import("@electric-sql/pglite");
    const dataDir = process.env.PGLITE_DIR || path.join(process.cwd(), ".localdb");
    const client = new PGlite(dataDir);
    const db = drizzlePglite(client, { schema });
    await applyMigrations(async (sql) => {
      await client.exec(sql);
    });
    return db as unknown as DB;
  }

  // Production / Neon
  const sql = postgres(process.env.DATABASE_URL!, {
    max: 1, // serverless-friendly
    prepare: false,
  });
  return drizzlePg(sql, { schema });
}

/**
 * Apply generated SQL migrations. Only used for the PGlite preview DB; on real
 * Postgres you run `npm run db:push` (or drizzle-kit migrate) during deploy.
 */
async function applyMigrations(run: (sql: string) => Promise<void>) {
  const dir = path.join(process.cwd(), "drizzle");
  if (!fs.existsSync(dir)) return;
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), "utf8");
    // drizzle splits statements with this marker
    const statements = sql
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const stmt of statements) {
      try {
        await run(stmt);
      } catch (err: unknown) {
        const msg = String(err);
        // Ignore "already exists" so re-runs are safe for the preview DB.
        if (!/already exists|duplicate/i.test(msg)) throw err;
      }
    }
  }
}

export async function getDb(): Promise<DB> {
  if (!globalForDb.__maDb) globalForDb.__maDb = init();
  return globalForDb.__maDb;
}

export { schema };
