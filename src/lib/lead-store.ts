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
  await ensureLeadsFile(filePath);
  const line = JSON.stringify(record) + "\n";
  await fs.appendFile(filePath, line, { encoding: "utf8" });

  // Best-effort webhook forwarding. Failure does not block the request.
  const webhook = process.env.PORTEA_LEADS_WEBHOOK_URL?.trim();
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
        // 3-second cap so a slow webhook can't hold up the intake response.
        signal: AbortSignal.timeout(3_000),
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("[lead-store] webhook forward failed", err);
    }
  }
}

export async function readLeads(limit = 500): Promise<LeadRecord[]> {
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

export function maskPhone(phone?: string) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "***";
  return `${digits.slice(0, 2)}******${digits.slice(-2)}`;
}
