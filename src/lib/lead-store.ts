// Server-side lead store.
// Every intake submission and every Call/WhatsApp click on a landing page
// is appended here as a single JSON line. The /admin/leads dashboard reads
// this file. If PORTEA_LEADS_WEBHOOK_URL is set, every record is also POSTed
// to that webhook (Slack incoming webhook, Zapier catch-hook, CRM endpoint).
//
// This is intentionally simple: one append-only file. The team picks up new
// leads from /admin/leads, and a future revision can replace this with the
// Portea CRM writeback that the engineering design doc specifies.

import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";

export type LeadKind = "intake" | "call_click" | "whatsapp_click";

export type LeadAttribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  referrer?: string;
  landing_path?: string;
};

export type LeadRecord = {
  id: string;
  kind: LeadKind;
  created_at: string;
  vertical?: string;
  full_name?: string;
  phone?: string;
  city?: string;
  elder_name?: string;
  condition?: string;
  needs?: string;
  relationship?: string;
  situation?: string;
  ab_variant?: string;
  consent_given?: boolean;
  status?: string;
  attribution?: LeadAttribution;
  // Click events (for kind === "call_click" | "whatsapp_click")
  click_target?: string;
  user_agent?: string;
  ip_hash?: string;
};

function leadsFilePath() {
  const configured = process.env.PORTEA_LEADS_FILE?.trim();
  if (configured) return configured;
  return path.join(os.tmpdir(), "portea-leads.jsonl");
}

async function ensureLeadsFile(filePath: string) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  // Touch the file so subsequent reads don't fail with ENOENT.
  await fs.appendFile(filePath, "", { encoding: "utf8" });
}

export async function appendLead(record: LeadRecord) {
  const filePath = leadsFilePath();
  // The JSONL backup file is best-effort — on serverless platforms like Vercel
  // where /tmp is ephemeral and read-only outside /tmp, a write failure
  // shouldn't block the intake response or the webhook forward.
  try {
    await ensureLeadsFile(filePath);
    const line = JSON.stringify(record) + "\n";
    await fs.appendFile(filePath, line, { encoding: "utf8" });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[lead-store] local file append failed", err);
  }

  // Fan out to every configured destination in parallel. Each forwarder is
  // best-effort and independent — if the Sheet webhook is down, the CRM still
  // gets the lead, and vice versa.
  await Promise.allSettled([
    forwardToSheetWebhook(record),
    forwardToPorteaCrm(record),
  ]);
}

// ---------------------------------------------------------------------------
// Forwarder 1 — Google Sheet via Apps Script Web App (MVP source of truth).
// ---------------------------------------------------------------------------
async function forwardToSheetWebhook(record: LeadRecord) {
  const raw = process.env.PORTEA_LEADS_WEBHOOK_URL?.trim();
  if (!raw) {
    // eslint-disable-next-line no-console
    console.warn("[lead-store] PORTEA_LEADS_WEBHOOK_URL is empty — not forwarding to Sheet");
    return;
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(
      "[lead-store] PORTEA_LEADS_WEBHOOK_URL is not a valid URL — fix env var (no leading space):",
      JSON.stringify(raw),
      err,
    );
    return;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
      signal: AbortSignal.timeout(10_000), // Apps Script cold-start headroom
      redirect: "follow",
    });
    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.warn(
        "[lead-store] sheet webhook non-2xx",
        response.status,
        await response.text().catch(() => ""),
      );
    } else {
      // eslint-disable-next-line no-console
      console.log("[lead-store] sheet ok", response.status, "kind:", record.kind);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[lead-store] sheet webhook failed", err);
  }
}

// ---------------------------------------------------------------------------
// Forwarder 2 — Portea CRM (production destination).
//
// Wire-format (subject to confirmation from engineering — see the
// "integration brief" doc):
//
//   POST {PORTEA_CRM_API_URL}
//   Authorization: Bearer {PORTEA_CRM_API_KEY}
//   Content-Type: application/json
//
//   { ...LeadRecord, source: "portea-care-plan-lp" }
//
// When PORTEA_CRM_API_URL is unset, this is a no-op so the MVP keeps working.
// ---------------------------------------------------------------------------
async function forwardToPorteaCrm(record: LeadRecord) {
  const raw = process.env.PORTEA_CRM_API_URL?.trim();
  if (!raw) return; // not yet configured — MVP mode

  let url: URL;
  try {
    url = new URL(raw);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(
      "[lead-store] PORTEA_CRM_API_URL is not a valid URL:",
      JSON.stringify(raw),
      err,
    );
    return;
  }

  const apiKey = process.env.PORTEA_CRM_API_KEY?.trim();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Portea-Source": "portea-care-plan-lp",
  };
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

  const payload = {
    ...record,
    source: "portea-care-plan-lp",
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.warn(
        "[lead-store] CRM non-2xx",
        response.status,
        await response.text().catch(() => ""),
      );
    } else {
      // eslint-disable-next-line no-console
      console.log("[lead-store] CRM ok", response.status, "kind:", record.kind);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[lead-store] CRM forward failed", err);
  }
}

// --- Reading leads ---------------------------------------------------------

// The admin dashboard prefers the Google Sheet (durable, shared across all
// Vercel instances) over the local JSONL file (ephemeral on serverless). If
// PORTEA_LEADS_READ_SECRET is set we read from the Sheet via the Apps Script
// doGet endpoint; otherwise we fall back to the local file (handy for local
// dev).

type SheetRow = Record<string, string | number | boolean | Date | null | undefined>;

function asString(value: SheetRow[string]): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function asAttribution(row: SheetRow) {
  const a: LeadAttribution = {};
  const keys: Array<keyof LeadAttribution> = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "gclid",
    "fbclid",
    "referrer",
    "landing_path",
  ];
  for (const k of keys) {
    const v = asString(row[k]);
    if (v) a[k] = v;
  }
  return a;
}

function sheetRowToLead(row: SheetRow): LeadRecord {
  const kind = (asString(row.kind) as LeadRecord["kind"]) || "intake";
  const createdAtRaw = row.received_at;
  let createdAt: string;
  if (createdAtRaw instanceof Date) {
    createdAt = createdAtRaw.toISOString();
  } else if (createdAtRaw && typeof createdAtRaw === "string") {
    const parsed = new Date(createdAtRaw);
    createdAt = isNaN(parsed.getTime()) ? createdAtRaw : parsed.toISOString();
  } else {
    createdAt = new Date().toISOString();
  }
  return {
    id: `${createdAt}-${asString(row.phone) ?? asString(row.kind) ?? "row"}`,
    kind,
    created_at: createdAt,
    vertical: asString(row.vertical),
    full_name: asString(row.full_name),
    phone: asString(row.phone),
    city: asString(row.city),
    elder_name: asString(row.elder_name),
    condition: asString(row.condition),
    needs: asString(row.needs),
    relationship: asString(row.relationship),
    ab_variant: asString(row.ab_variant),
    status: asString(row.status),
    attribution: asAttribution(row),
  };
}

export async function readLeadsFromSheet(limit = 500): Promise<LeadRecord[]> {
  const webhookRaw = process.env.PORTEA_LEADS_WEBHOOK_URL?.trim();
  const secret = process.env.PORTEA_LEADS_READ_SECRET?.trim();
  if (!webhookRaw || !secret) return [];

  let url: URL;
  try {
    url = new URL(webhookRaw);
  } catch {
    // eslint-disable-next-line no-console
    console.error("[lead-store] read URL is invalid (probably leading space):", webhookRaw);
    return [];
  }
  url.searchParams.set("secret", secret);
  url.searchParams.set("limit", String(limit));

  try {
    const response = await fetch(url, {
      method: "GET",
      // Apps Script cold-start headroom.
      signal: AbortSignal.timeout(10_000),
      redirect: "follow",
      // Always re-fetch — admin page should never serve cached data.
      cache: "no-store",
    });
    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.warn("[lead-store] sheet read non-2xx", response.status);
      return [];
    }
    const body = (await response.json()) as { ok: boolean; rows?: SheetRow[] };
    if (!body.ok || !Array.isArray(body.rows)) return [];
    return body.rows.map(sheetRowToLead);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[lead-store] sheet read failed", err);
    return [];
  }
}

export async function readLeadsFromFile(limit = 500): Promise<LeadRecord[]> {
  const filePath = leadsFilePath();
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const lines = raw.split(/\r?\n/).filter(Boolean);
    const slice = lines.slice(-limit).reverse();
    const records: LeadRecord[] = [];
    for (const line of slice) {
      try {
        records.push(JSON.parse(line) as LeadRecord);
      } catch {
        /* ignore malformed line */
      }
    }
    return records;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

// Unified reader used by the admin dashboard. Picks the right backend based
// on what's configured. The Sheet is the source of truth on Vercel; the local
// JSONL is a convenient fallback for local dev.
export async function readLeads(limit = 500): Promise<LeadRecord[]> {
  if (process.env.PORTEA_LEADS_READ_SECRET) {
    const fromSheet = await readLeadsFromSheet(limit);
    if (fromSheet.length > 0) return fromSheet;
  }
  return readLeadsFromFile(limit);
}

export function maskPhone(phone?: string) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "***";
  return `${digits.slice(0, 2)}******${digits.slice(-2)}`;
}
";
  return `${digits.slice(0, 2)}******${digits.slice(-2)}`;
}
