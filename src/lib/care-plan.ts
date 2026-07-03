// AI care plan generation (Feature 3).
//
// Turns the medical team's inputs (doctor's notes + intake + call transcript +
// care-manager observations) into a structured care plan. The structured JSON
// is rendered to a Portea-branded .docx by @/lib/care-plan-docx. Mirrors the
// portea-care-plan skill: parse -> detect vertical -> fill sections, with strict
// "never fabricate, flag gaps" clinical safety rules. A clinician reviews and
// signs off; this produces the draft.
//
// Provider: Google Gemini via @google/genai. Works on the AI Studio key today
// (GEMINI_API_KEY) and switches to Vertex AI with no code change by setting
// GOOGLE_GENAI_USE_VERTEXAI=true + GOOGLE_CLOUD_PROJECT (+ optional
// GOOGLE_CLOUD_LOCATION). Vertex is recommended for production because patient
// data is not used for training and it carries GCP's compliance posture.
//
// Do NOT import this file from a "use client" component.

import { GoogleGenAI } from "@google/genai";

import type { CarePlan, LeadRecord } from "@/lib/lead-types";

// Care plans are higher-stakes than the pre-call brief, so default to the
// stronger reasoning model. Override with CARE_PLAN_MODEL if needed.
const MODEL = process.env.CARE_PLAN_MODEL?.trim() || "gemini-2.5-pro";

function geminiKey(): string {
  return process.env.GEMINI_API_KEY?.trim() || "";
}

function useVertex(): boolean {
  return (
    process.env.GOOGLE_GENAI_USE_VERTEXAI === "true" &&
    Boolean(process.env.GOOGLE_CLOUD_PROJECT?.trim())
  );
}

// True once an AI backend is configured (Vertex project or AI Studio key).
export function isCarePlanLive(): boolean {
  return useVertex() || geminiKey().length > 0;
}

function makeClient(): GoogleGenAI {
  if (useVertex()) {
    return new GoogleGenAI({
      vertexai: true,
      project: process.env.GOOGLE_CLOUD_PROJECT?.trim(),
      location: process.env.GOOGLE_CLOUD_LOCATION?.trim() || "us-central1",
    });
  }
  return new GoogleGenAI({ apiKey: geminiKey() });
}

function val(v: string | undefined | null, fallback = "Not specified in referral brief"): string {
  const t = (v ?? "").trim();
  return t.length > 0 ? t : fallback;
}

const VERTICAL_LABELS: Record<string, string> = {
  "elder-care": "Elder care / wellness",
  dementia: "Dementia / cognitive care",
  "post-discharge": "Post-discharge recovery",
};

const SYSTEM_PROMPT = `You are a clinical documentation assistant for Portea, an Indian home healthcare company. You generate a structured home CARE PLAN from the medical team's inputs (a doctor's notes or brief, the patient intake, a call transcript, and care-manager observations). A Portea clinician reviews and signs off on every plan, so your job is to organise and structure the inputs faithfully and completely, never to invent.

STEP 1 - PARSE the inputs. Extract, where present: patient name, age, gender; family SPOC name, relationship, phone; primary diagnosis, staging/classification, date of diagnosis; disease timeline (diagnosis, surgeries, treatments, recurrences, complications in order); current status (progression, functional status, weight/cachexia, cognitive status); comorbidities with parameters; surgical history; treatment history (chemo, radiation, targeted, immunotherapy); respiratory status (O2, BIPAP/CPAP, ventilator, nebulizer); recent hospitalisations/infections; service plan (doctor visits + frequency, nursing, nursing attendant, equipment, labs); equipment (Portea-provided vs patient-owned); medications listed; treating external doctors + hospital; special requests.

STEP 2 - DETECT the care vertical (one of: palliative, post-discharge, dementia, elder-care, cancer, recovery):
- palliative: terminal/end-of-life, advanced metastatic disease, hospice, comfort care.
- post-discharge: recent hospitalisation/surgery, discharge instructions, rehab goals.
- dementia: dementia, Alzheimer's, cognitive decline, behavioural symptoms.
- elder-care: general elderly/preventive/chronic, daily-living support.
- cancer: active treatment, chemo/radiation, oncology.
- recovery: physiotherapy, stroke/fracture, post-surgical rehab.
If ambiguous, choose the most clinically appropriate and reflect it in the title. Verticals can overlap (e.g. palliative + cancer).

CLINICAL SAFETY RULES (critical, non-negotiable):
- NEVER fabricate or infer clinical information that is not in the inputs.
- If a required field is missing, set its value to a clear placeholder ("To be assessed at first visit" or "Not specified in referral brief") AND add a short line about it to "gaps".
- Do NOT guess staging, grading, or prognosis.
- Do NOT add medications not mentioned in the inputs.
- Use plain, professional language. No marketing tone.

STEP 3 - FILL the structured plan. Only include rows that the inputs support; do not pad with generic entries. Adapt to the vertical:
- palliative: include end-of-life goals; escalation must include "Signs of Active Dying" and "Death" (with declaration process if the family requested it).
- post-discharge: focus symptom_protocol on recovery milestones, wound care if relevant, medication reconciliation.
- dementia: include cognitive stimulation, behavioural management, home-safety and wandering prevention in goals/symptom_protocol.

Output ONLY valid JSON in EXACTLY this shape, no text before or after:
{
  "vertical": "palliative | post-discharge | dementia | elder-care | cancer | recovery",
  "title": "e.g. Palliative Care Plan",
  "subtitle": "e.g. Home-Based Palliative and End-of-Life Care",
  "patient_info": [{"label": "Patient name", "value": "..."}, {"label": "Age / Gender", "value": "..."}, {"label": "Family SPOC", "value": "..."}, {"label": "Treating doctor(s)", "value": "..."}, {"label": "Assigned Portea doctor", "value": "..."}],
  "clinical_summary": [{"label": "Primary diagnosis", "value": "..."}, {"label": "Disease timeline", "value": "..."}, {"label": "Current status", "value": "..."}, {"label": "Comorbidities", "value": "..."}, {"label": "Surgical history", "value": "..."}, {"label": "Treatment history", "value": "..."}, {"label": "Functional status", "value": "..."}, {"label": "Respiratory status", "value": "..."}, {"label": "Recent hospitalisations", "value": "..."}],
  "care_goals": ["specific goal derived from the inputs", "..."],
  "service_plan": [{"service": "Doctor visits", "plan": "frequency + assigned doctor", "details": "..."}, {"service": "Nursing", "plan": "...", "details": "..."}],
  "equipment": [{"equipment": "...", "source": "Portea / Patient-owned", "status": "..."}],
  "symptom_protocol": [{"symptom": "Pain", "assessment": "...", "management": "..."}],
  "escalation_protocol": [{"trigger": "...", "action": "..."}],
  "communication": [{"label": "Family SPOC", "value": "..."}, {"label": "Specialist coordination", "value": "..."}, {"label": "Visit reporting", "value": "..."}],
  "gaps": ["field that was missing and should be completed at the first visit"]
}`;

function buildUserMessage(lead: LeadRecord, notes: string): string {
  const program = lead.vertical
    ? VERTICAL_LABELS[lead.vertical] ?? lead.vertical
    : "not specified";
  return [
    "Generate a care plan from the following inputs.",
    "",
    "INTAKE",
    `- Patient / elder: ${val(lead.elder_name)}`,
    `- Condition / diagnosis: ${val(lead.condition)}`,
    `- Help needed: ${val(lead.needs)}`,
    `- Family caller (SPOC): ${val(lead.full_name)} (${val(lead.relationship, "relationship not specified")})`,
    `- City / area: ${val(lead.city)}`,
    `- Program enquired: ${program}`,
    `- Intake notes: ${val(lead.situation, "none")}`,
    "",
    "DOCTOR'S CLINICAL NOTES / BRIEF",
    notes.trim() || "(none provided)",
    "",
    "CARE MANAGER OBSERVATIONS",
    val(lead.call_observations, "(none)"),
    "",
    "CALL TRANSCRIPT",
    val(lead.call_transcript, "(none)"),
  ].join("\n");
}

// --- Stub (used when no AI backend is configured) -------------------------

function stubCarePlan(lead: LeadRecord): CarePlan {
  const title = lead.vertical
    ? `${VERTICAL_LABELS[lead.vertical] ?? "Home"} Care Plan`
    : "Home Care Plan";
  return {
    vertical: lead.vertical || "elder-care",
    title,
    subtitle: "Home-Based Care and Daily Living Support",
    patient_info: [
      { label: "Patient name", value: val(lead.elder_name) },
      { label: "Family SPOC", value: val(lead.full_name) },
      { label: "Assigned Portea doctor", value: "To be assigned" },
    ],
    clinical_summary: [
      { label: "Primary diagnosis", value: val(lead.condition) },
      { label: "Current status", value: "To be assessed at first visit" },
    ],
    care_goals: [
      "Stabilise day-to-day care and safety at home",
      "Confirm clinical needs and build the personalised plan at the first visit",
    ],
    service_plan: [
      { service: "Care manager", plan: "Assigned", details: val(lead.needs) },
    ],
    equipment: [],
    symptom_protocol: [],
    escalation_protocol: [
      { trigger: "Any acute medical emergency", action: "Advise the family to call 108 or go to the nearest hospital." },
    ],
    communication: [
      { label: "Family SPOC", value: `${val(lead.full_name)} (${val(lead.relationship, "relationship not specified")})` },
    ],
    gaps: ["Sample plan. Connect an AI backend (Gemini key or Vertex) for the real generation."],
    generated_by: "stub",
  };
}

// --- Live generation -------------------------------------------------------

function asRows(v: unknown): { label: string; value: string }[] {
  if (!Array.isArray(v)) return [];
  const out: { label: string; value: string }[] = [];
  for (const item of v) {
    if (item && typeof item === "object") {
      const r = item as Record<string, unknown>;
      const label = String(r.label ?? "").trim();
      const value = String(r.value ?? "").trim();
      if (label) out.push({ label, value: value || "Not specified in referral brief" });
    }
  }
  return out;
}

function asStrings(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((s) => String(s ?? "").trim()).filter((s) => s.length > 0);
}

function asObjects<T extends Record<string, string>>(
  v: unknown,
  keys: (keyof T)[],
): T[] {
  if (!Array.isArray(v)) return [];
  const out: T[] = [];
  for (const item of v) {
    if (item && typeof item === "object") {
      const r = item as Record<string, unknown>;
      const obj = {} as T;
      let any = false;
      for (const k of keys) {
        const s = String(r[k as string] ?? "").trim();
        obj[k] = s as T[keyof T];
        if (s) any = true;
      }
      if (any) out.push(obj);
    }
  }
  return out;
}

async function callGemini(lead: LeadRecord, notes: string): Promise<CarePlan> {
  const ai = makeClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: buildUserMessage(lead, notes),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      temperature: 0.2,
      maxOutputTokens: 8192,
    },
  });

  const text = (response.text ?? "").trim();
  if (!text) throw new Error("AI returned an empty response");

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error("AI did not return valid JSON");
  }

  const plan: CarePlan = {
    vertical: String(parsed.vertical ?? lead.vertical ?? "elder-care").trim(),
    title: String(parsed.title ?? "Home Care Plan").trim() || "Home Care Plan",
    subtitle: String(parsed.subtitle ?? "").trim(),
    patient_info: asRows(parsed.patient_info),
    clinical_summary: asRows(parsed.clinical_summary),
    care_goals: asStrings(parsed.care_goals),
    service_plan: asObjects(parsed.service_plan, ["service", "plan", "details"]),
    equipment: asObjects(parsed.equipment, ["equipment", "source", "status"]),
    symptom_protocol: asObjects(parsed.symptom_protocol, ["symptom", "assessment", "management"]),
    escalation_protocol: asObjects(parsed.escalation_protocol, ["trigger", "action"]),
    communication: asRows(parsed.communication),
    gaps: asStrings(parsed.gaps),
    generated_by: useVertex() ? `vertex:${MODEL}` : MODEL,
  };

  if (plan.patient_info.length === 0 && plan.clinical_summary.length === 0) {
    throw new Error("AI returned an incomplete care plan");
  }
  return plan;
}

// Generate a care plan for one lead. notes is the doctor's free-text brief.
// Calls the AI backend when configured, otherwise returns the stub.
export async function generateCarePlan(
  lead: LeadRecord,
  notes: string,
): Promise<CarePlan> {
  if (isCarePlanLive()) {
    return callGemini(lead, notes);
  }
  return stubCarePlan(lead);
}
