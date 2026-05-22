// AI pre-call brief generation.
//
// Turns a raw intake lead into a care manager's pre-call brief: a compact
// summary table plus a set of recommended questions for the discovery call.
//
// CURRENT STATE: stub implementation. generateBrief() returns a structured
// brief built from the lead's own fields plus sensible placeholder questions.
// It needs no API key, no account and no network call, so the whole feature
// (database, API route, dashboard card) can be built and tested right now.
//
// GOING LIVE: replace the body of generateBrief() with a real Gemini (Vertex
// AI) call. The input (LeadRecord) and output (AiBrief) shapes do not change,
// so nothing else in the app needs touching.
//
// This module uses no Node built-ins beyond what Next.js route handlers
// already allow. Do NOT import it from a "use client" component.

import type { AiBrief, LeadRecord } from "@/lib/lead-types";

function val(v: string | undefined | null, fallback = "Not provided"): string {
  const t = (v ?? "").trim();
  return t.length > 0 ? t : fallback;
}

const VERTICAL_LABELS: Record<string, string> = {
  "elder-care": "Managed elder care",
  dementia: "Dementia care",
  "post-discharge": "Post-discharge recovery care",
};

// True once a real AI provider is configured. Until then generateBrief()
// returns the stub brief. Kept here so the route/UI can show the right copy.
export function isAiBriefLive(): boolean {
  return Boolean(process.env.GCP_PROJECT_ID?.trim());
}

// Stub brief. Builds the summary table from the lead's real fields (that part
// never needed AI) and supplies generic but sensible discovery-call questions.
function stubBrief(lead: LeadRecord): AiBrief {
  const caller =
    lead.full_name && lead.relationship
      ? `${lead.full_name} (${lead.relationship})`
      : val(lead.full_name);

  const summary: AiBrief["summary"] = [
    { label: "Elder", value: val(lead.elder_name) },
    { label: "Condition", value: val(lead.condition) },
    { label: "Main need", value: val(lead.needs) },
    { label: "Caller", value: caller },
    { label: "Location", value: val(lead.city) },
    {
      label: "Program fit",
      value: lead.vertical
        ? VERTICAL_LABELS[lead.vertical] ?? lead.vertical
        : "To confirm on call",
    },
    { label: "Urgency", value: "Review on call (sample)" },
  ];

  const questions: string[] = [
    "What is happening right now, and what prompted the family to reach out?",
    "How is the elder managing day to day: mobility, meals, daily routine?",
    "Has the family tried any home care or support before?",
    "Who is the main caregiver at home currently, and where are the gaps?",
    "Are there medications or an ongoing treatment plan we should know about?",
    "What does the family most want from this: safety, recovery, or companionship?",
  ];

  return { summary, questions, generated_by: "stub" };
}

// Generate a pre-call brief for one lead.
//
// Currently always returns the stub. When the Vertex AI credentials are set,
// swap the body for a real Gemini call that returns the same AiBrief shape.
export async function generateBrief(lead: LeadRecord): Promise<AiBrief> {
  // --- Live AI call goes here once GCP credentials are configured. ---
  // if (isAiBriefLive()) {
  //   return callGeminiForBrief(lead);
  // }
  return stubBrief(lead);
}
