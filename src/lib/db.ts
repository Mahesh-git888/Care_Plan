// Postgres data layer.
//
// Single connection pool per serverless instance. The schema is created
// lazily on first use via CREATE TABLE IF NOT EXISTS, so there is no
// separate migration step to run.
//
// Connection string is read from POSTGRES_URL (Vercel Postgres / Neon
// integration sets this automatically), falling back to DATABASE_URL.
//
// This module uses the `pg` driver and Node built-ins. NEVER import it from
// a "use client" component. Client code that only needs types should import
// from "@/lib/lead-types".

import { Pool, type QueryResultRow } from "pg";

let pool: Pool | null = null;

function connectionString(): string {
  const url =
    process.env.POSTGRES_URL?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim() ||
    "";
  if (!url) {
    throw new Error(
      "No Postgres connection string. Set POSTGRES_URL (or DATABASE_URL) in the environment.",
    );
  }
  return url;
}

export function getPool(): Pool {
  if (!pool) {
    const cs = connectionString();
    const isLocal = cs.includes("localhost") || cs.includes("127.0.0.1");
    pool = new Pool({
      connectionString: cs,
      max: 3, // small: serverless instances are short-lived
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
      ssl: isLocal ? undefined : { rejectUnauthorized: false },
    });
  }
  return pool;
}

let schemaReady: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const p = getPool();
      await p.query(`
        CREATE TABLE IF NOT EXISTS leads (
          id              TEXT PRIMARY KEY,
          kind            TEXT NOT NULL DEFAULT 'intake',
          created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
          vertical        TEXT,
          full_name       TEXT,
          phone           TEXT,
          city            TEXT,
          elder_name      TEXT,
          condition       TEXT,
          needs           TEXT,
          relationship    TEXT,
          situation       TEXT,
          ab_variant      TEXT,
          consent_given   BOOLEAN,
          status          TEXT DEFAULT 'new',
          care_manager    TEXT,
          follow_up_date  TEXT,
          click_target    TEXT,
          user_agent      TEXT,
          ip_hash         TEXT,
          attribution     JSONB DEFAULT '{}'::jsonb,
          notes           TEXT,
          updated_at      TIMESTAMPTZ,
          updated_by      TEXT
        );
      `);
      await p.query(
        `CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);`,
      );
      await p.query(`CREATE INDEX IF NOT EXISTS leads_kind_idx ON leads (kind);`);
      await p.query(`
        CREATE TABLE IF NOT EXISTS password_overrides (
          email          TEXT PRIMARY KEY,
          password_hash  TEXT NOT NULL,
          updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_by     TEXT
        );
      `);
      await p.query(`
        CREATE TABLE IF NOT EXISTS login_audit (
          id          BIGSERIAL PRIMARY KEY,
          type        TEXT NOT NULL,
          ts          TIMESTAMPTZ NOT NULL DEFAULT now(),
          email       TEXT,
          user_id     TEXT,
          ip          TEXT,
          user_agent  TEXT,
          reason      TEXT
        );
      `);
      await p.query(
        `CREATE INDEX IF NOT EXISTS login_audit_ts_idx ON login_audit (ts DESC);`,
      );
    })();
  }
  return schemaReady;
}

// Run a query and return the rows.
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  await ensureSchema();
  const res = await getPool().query<T>(text, params);
  return res.rows;
}

// Run a statement (INSERT/UPDATE/DELETE) and return the affected row count.
export async function execute(text: string, params?: unknown[]): Promise<number> {
  await ensureSchema();
  const res = await getPool().query(text, params);
  return res.rowCount ?? 0;
}

// True if a Postgres connection string is configured.
export function isDbConfigured(): boolean {
  return Boolean(
    process.env.POSTGRES_URL?.trim() ||
      process.env.DATABASE_URL?.trim() ||
      process.env.POSTGRES_PRISMA_URL?.trim(),
  );
}
