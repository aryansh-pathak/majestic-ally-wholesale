import type { Config } from "drizzle-kit";

// Migrations target real Postgres (Neon). The local PGlite preview DB applies
// the same generated SQL at startup.
export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgres://localhost:5432/placeholder",
  },
} satisfies Config;
