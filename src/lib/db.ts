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
      // Columns added after the initial schema. ALTER ... IF NOT EXISTS keeps
      // existing deployments in sync without a separate migration step.
      await p.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_brief JSONB;`);
      await p.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_brief_at TIMESTAMPTZ;`);
      // Feature 2: post-call data. Recording URL points to wherever the audio
      // lives (the Portea ops portal, etc.). The transcript is what we store;
      // we never keep the audio bytes ourselves. Observations is the CM's
      // structured judgement after the call.
      await p.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS call_recording_url TEXT;`);
      await p.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS call_observations TEXT;`);
      await p.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS call_transcript TEXT;`);
      await p.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS call_transcript_at TIMESTAMPTZ;`);
      // Feature 3: AI-generated care plan. care_plan holds the structured plan
      // (rendered to a branded .docx on download); care_plan_notes holds the
      // doctor's free-text brief used to generate it.
      await p.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS care_plan JSONB;`);
      await p.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS care_plan_at TIMESTAMPTZ;`);
      await p.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS care_plan_notes TEXT;`);
      // Lead routing by source. Paid leads (Google gclid or a paid utm_medium)
      // are forwarded to the sales team's ops webhook and flagged here; organic
      // leads stay with the care team and trigger the usual email alert.
      // routed_to: 'sales' | 'care_team'. sales_forward_status records the
      // webhook outcome ('ok' | 'http:500' | 'error:timeout' | 'skipped:no-url').
      await p.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS routed_to TEXT;`);
      await p.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS sales_forwarded_at TIMESTAMPTZ;`);
      await p.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS sales_forward_status TEXT;`);
      await p.query(`
        CREATE TABLE IF NOT EXISTS users (
          id                    TEXT PRIMARY KEY,
          email                 TEXT NOT NULL UNIQUE,
          name                  TEXT NOT NULL,
          role                  TEXT NOT NULL CHECK (role IN ('admin','cm')),
          password_hash         TEXT NOT NULL,
          must_change_password  BOOLEAN NOT NULL DEFAULT FALSE,
          active                BOOLEAN NOT NULL DEFAULT TRUE,
          created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
          created_by            TEXT,
          updated_at            TIMESTAMPTZ
        );
      `);
      await p.query(`CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);`);
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
      // Aggregate landing-page view counter, bucketed by the hour so the
      // marketing dashboard can filter by hour / day / week. One row per
      // (hour, path, vertical, utm_campaign); stays tiny regardless of traffic
      // and never pollutes the leads table.
      //
      // Migrate the earlier day-bucketed shape (empty on every deployment) to
      // the hourly shape. Idempotent: only fires while the old `day` column
      // still exists, so it runs at most once.
      await p.query(`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'page_views' AND column_name = 'day'
          ) THEN
            DROP TABLE IF EXISTS page_views;
          END IF;
        END $$;
      `);
      await p.query(`
        CREATE TABLE IF NOT EXISTS page_views (
          bucket        TIMESTAMPTZ NOT NULL,
          path          TEXT NOT NULL,
          vertical      TEXT NOT NULL DEFAULT '',
          utm_campaign  TEXT NOT NULL DEFAULT '',
          views         BIGINT NOT NULL DEFAULT 0,
          PRIMARY KEY (bucket, path, vertical, utm_campaign)
        );
      `);
      await p.query(
        `CREATE INDEX IF NOT EXISTS page_views_bucket_idx ON page_views (bucket DESC);`,
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
