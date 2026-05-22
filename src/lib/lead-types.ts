// Pure types + small constants used by both the server (lead-store) and the
// client (cm-dashboard). This file MUST stay free of Node built-ins
// (node:fs, node:path, node:os) so it's safe to import from "use client"
// components.

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

export type LifecycleStatus =
  | "new"
  | "cm_contacted"
  | "plan_shared"
  | "follow_up"
  | "converted"
  | "active"
  | "lost";

export const LIFECYCLE_STATUSES: LifecycleStatus[] = [
  "new",
  "cm_contacted",
  "plan_shared",
  "follow_up",
  "converted",
  "active",
  "lost",
];

// AI-generated pre-call brief: a compact summary table plus recommended
// questions for the care manager's discovery call.
export type AiBriefRow = { label: string; value: string };

export type AiBrief = {
  summary: AiBriefRow[];
  questions: string[];
  // "stub" while running on sample data; the model name once live AI is wired.
  generated_by?: string;
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
  status?: LifecycleStatus;
  care_manager?: string;
  follow_up_date?: string;
  attribution?: LeadAttribution;
  click_target?: string;
  user_agent?: string;
  ip_hash?: string;
  ai_brief?: AiBrief;
  ai_brief_at?: string;
};
