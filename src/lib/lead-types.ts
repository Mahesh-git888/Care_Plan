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
  // Google's newer click ids (iOS / consent mode) and Microsoft Ads' click id.
  gbraid?: string;
  wbraid?: string;
  msclkid?: string;
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

// AI-generated care plan (Feature 3). The model fills these structured fields
// from the doctor's notes + intake + transcript + observations; the app renders
// them into a Portea-branded .docx. Mirrors the portea-care-plan skill.
export type CarePlanRow = { label: string; value: string };
export type CarePlanService = { service: string; plan: string; details: string };
export type CarePlanEquipment = { equipment: string; source: string; status: string };
export type CarePlanSymptom = { symptom: string; assessment: string; management: string };
export type CarePlanEscalation = { trigger: string; action: string };

export type CarePlan = {
  // palliative | post-discharge | dementia | elder-care | cancer | recovery
  vertical: string;
  title: string;
  subtitle: string;
  patient_info: CarePlanRow[];
  clinical_summary: CarePlanRow[];
  care_goals: string[];
  service_plan: CarePlanService[];
  equipment: CarePlanEquipment[];
  symptom_protocol: CarePlanSymptom[];
  escalation_protocol: CarePlanEscalation[];
  communication: CarePlanRow[];
  // Fields the brief did not provide, surfaced so the care team can complete
  // them at the first visit.
  gaps: string[];
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
  // Post-call data captured by the care manager. The transcript is generated
  // from the recording (URL or uploaded file); the audio itself is never
  // stored on our side.
  notes?: string;
  call_recording_url?: string;
  call_observations?: string;
  call_transcript?: string;
  call_transcript_at?: string;
  // Feature 3: AI care plan.
  care_plan?: CarePlan;
  care_plan_at?: string;
  care_plan_notes?: string;
  // Lead routing by source. Paid leads are forwarded to the sales team's ops
  // webhook and shown with a "Sent to sales team" badge; organic leads stay
  // with the care team. sales_forward_status records the webhook outcome.
  routed_to?: LeadRoutedTo;
  sales_forwarded_at?: string;
  sales_forward_status?: string;
};

export type LeadRoutedTo = "sales" | "care_team";
