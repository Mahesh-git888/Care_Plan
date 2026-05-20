#!/usr/bin/env node
// One-time migration: copy existing leads from the Google Sheet into Postgres.
//
// Run this ONCE, after you have added a Postgres database to the project.
// It is idempotent: each Sheet row is keyed by a content hash, so running it
// again will not create duplicates.
//
// Usage:
//   1. vercel env pull .env.local      (downloads all env vars locally)
//   2. npm install                     (gets the `pg` driver)
//   3. node --env-file=.env.local scripts/migrate-sheets-to-postgres.mjs
//
// Required env vars:
//   PORTEA_LEADS_WEBHOOK_URL  Apps Script Web App URL of the Sheet
//   PORTEA_LEADS_READ_SECRET  read secret configured in that Apps Script
//   POSTGRES_URL              Postgres connection string (or DATABASE_URL)

import crypto from "node:crypto";
import { Pool } from "pg";

const WEBHOOK = (process.env.PORTEA_LEADS_WEBHOOK_URL || "").trim();
const SECRET = (process.env.PORTEA_LEADS_READ_SECRET || "").trim();
const PG_URL = (process.env.POSTGRES_URL || process.env.DATABASE_URL || "").trim();

function fail(msg) {
  console.error("ERROR: " + msg);
  process.exit(1);
}

if (!WEBHOOK) fail("PORTEA_LEADS_WEBHOOK_URL is not set.");
if (!SECRET) fail("PORTEA_LEADS_READ_SECRET is not set.");
if (!PG_URL) fail("POSTGRES_URL (or DATABASE_URL) is not set.");

const VALID_STATUSES = [
  "new",
  "cm_contacted",
  "plan_shared",
  "follow_up",
  "converted",
  "active",
  "lost",
];

function asStr(v) {
  if (v === undefined || v === null || v === "") return null;
  return String(v).trim();
}

function toIso(v) {
  if (!v) return new Date().toISOString();
  const d = new Date(v);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function normStatus(v) {
  const s = asStr(v);
  if (!s) return "new";
  const norm = s.toLowerCase().replace(/[\s-]+/g, "_");
  return VALID_STATUSES.includes(norm) ? norm : "new";
}

async function fetchRows() {
  const url = new URL(WEBHOOK);
  url.searchParams.set("secret", SECRET);
  url.searchParams.set("limit", "5000");
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) fail(`Apps Script returned HTTP ${res.status}`);
  let body;
  try {
    body = await res.json();
  } catch {
    fail("Apps Script response was not JSON. Check the doGet handler + secret.");
  }
  if (!body.ok || !Array.isArray(body.rows)) {
    fail("Apps Script did not return { ok: true, rows: [...] }.");
  }
  return body.rows;
}

async function main() {
  console.log("Fetching rows from the Google Sheet...");
  const rows = await fetchRows();
  console.log(`Fetched ${rows.length} row(s).`);
  if (rows.length === 0) {
    console.log("Nothing to migrate.");
    return;
  }

  const isLocal = PG_URL.includes("localhost") || PG_URL.includes("127.0.0.1");
  const pool = new Pool({
    connectionString: PG_URL,
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
  });

  // Ensure the leads table exists (same shape as src/lib/db.ts).
  await pool.query(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL DEFAULT 'intake',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      vertical TEXT, full_name TEXT, phone TEXT, city TEXT,
      elder_name TEXT, condition TEXT, needs TEXT, relationship TEXT,
      situation TEXT, ab_variant TEXT, consent_given BOOLEAN,
      status TEXT DEFAULT 'new', care_manager TEXT, follow_up_date TEXT,
      click_target TEXT, user_agent TEXT, ip_hash TEXT,
      attribution JSONB DEFAULT '{}'::jsonb, notes TEXT,
      updated_at TIMESTAMPTZ, updated_by TEXT
    );
  `);

  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    // Content-hash id: re-running the script will not duplicate unchanged rows.
    const id =
      "sheet-" +
      crypto.createHash("sha1").update(JSON.stringify(row)).digest("hex").slice(0, 24);

    const createdAt = toIso(row.received_at);
    const phone = asStr(row.phone);

    const attribution = {};
    for (const k of [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "gclid",
      "fbclid",
      "referrer",
      "landing_path",
    ]) {
      const v = asStr(row[k]);
      if (v) attribution[k] = v;
    }

    const res = await pool.query(
      `INSERT INTO leads (
        id, kind, created_at, vertical, full_name, phone, city,
        elder_name, condition, needs, relationship, situation, ab_variant,
        status, care_manager, follow_up_date, click_target, attribution
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18::jsonb)
      ON CONFLICT (id) DO NOTHING`,
      [
        id,
        asStr(row.kind) || "intake",
        createdAt,
        asStr(row.vertical),
        asStr(row.full_name),
        phone,
        asStr(row.city),
        asStr(row.elder_name),
        asStr(row.condition),
        asStr(row.needs),
        asStr(row.relationship),
        asStr(row.situation),
        asStr(row.ab_variant),
        normStatus(row.status),
        asStr(row.care_manager),
        asStr(row.follow_up_date),
        asStr(row.click_target),
        JSON.stringify(attribution),
      ],
    );
    if (res.rowCount > 0) inserted++;
    else skipped++;
  }

  console.log("");
  console.log(`Migration complete.`);
  console.log(`  Inserted: ${inserted}`);
  console.log(`  Skipped:  ${skipped} (already in Postgres)`);
  await pool.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
