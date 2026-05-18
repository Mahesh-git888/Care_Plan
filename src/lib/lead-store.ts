// Server-side lead store. Uses node:fs and outbound fetch — DO NOT import
// this file from a "use client" component. Client code that only needs the
// types should import from "@/lib/lead-types" instead.

import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";

import {
  LIFECYCLE_STATUSES,
  type LeadAttribution,
  type LeadRecord,
  type LifecycleStatus,
} from "@/lib/lead-types";

// Re-export types for files that already import from "@/lib/lead-store".
export {
  LIFECYCLE_STATUSES,
  type LeadAttribution,
  type LeadKind,
  type LeadRecord,
  type LifecycleStatus,
} from "@/lib/lead-types";

function leadsFilePath() {
  const configured = process.env.PORTEA_LEADS_FILE?.trim();
  if (configured) return configured;
  return path.join(os.tmpdir(), "portea-leads.jsonl");
}

async function ensureLeadsFile(filePath: string) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.appendFile(filePath, "", { encoding: "utf8" });
}

export async function appendLead(record: LeadRecord) {
  const filePath = leadsFilePath();
  try {
    await ensureLeadsFile(filePath);
    const line = JSON.stringify(record) + "\n";
    await fs.appendFile(filePath, line, { encoding: "utf8" });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[lead-store] local file append failed", err);
  }

  await Promise.allSettled([
    forwardToSheetWebhook(record),
    forwardToPorteaCrm(record),
  ]);
}

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
      "[lead-store] PORTEA_LEADS_WEBHOOK_URL invalid (fix env var, no leading space):",
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
      signal: AbortSignal.timeout(10_000),
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

async function forwardToPorteaCrm(record: LeadRecord) {
  const raw = process.env.PORTEA_CRM_API_URL?.trim();
  if (!raw) return;
  let url: URL;
  try {
    url = new URL(raw);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[lead-store] PORTEA_CRM_API_URL invalid:", JSON.stringify(raw), err);
    return;
  }
  const apiKey = process.env.PORTEA_CRM_API_KEY?.trim();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Portea-Source": "portea-care-plan-lp",
  };
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
  const payload = { ...record, source: "portea-care-plan-lp" };
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

function asStatus(value: SheetRow[string]): LifecycleStatus {
  const s = asString(value)?.toLowerCase().replace(/[\s-]+/g, "_");
  if (s && (LIFECYCLE_STATUSES as string[]).includes(s)) {
    return s as LifecycleStatus;
  }
  return "new";
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
  let followUp: string | undefined;
  const fuRaw = row.follow_up_date;
  if (fuRaw instanceof Date) followUp = fuRaw.toISOString();
  else if (typeof fuRaw === "string" && fuRaw) followUp = fuRaw;

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
    status: asStatus(row.status),
    care_manager: asString(row.care_manager),
    follow_up_date: followUp,
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
    console.error("[lead-store] read URL invalid:", webhookRaw);
    return [];
  }
  url.searchParams.set("secret", secret);
  url.searchParams.set("limit", String(limit));
  try {
    const response = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(10_000),
      redirect: "follow",
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
