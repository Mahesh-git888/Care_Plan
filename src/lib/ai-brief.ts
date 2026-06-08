// AI pre-call brief generation.
//
// Turns a raw intake lead into a care manager's pre-call brief: a compact
// summary table plus recommended questions for the discovery call.
//
// Provider: Google Gemini (AI Studio). Reads GEMINI_API_KEY from the
// environment. When that key is absent the module falls back to a stub brief
// built from the lead's own fields, so the feature still works in local dev
// or before the key is configured.
//
// Do NOT import this file from a "use client" component.

import { GoogleGenAI } from "@google/genai";

import type { AiBrief, AiBriefRow, LeadRecord } from "@/lib/lead-types";

// Model is overridable so a renamed or retired model can be fixed without a
// code change. If you hit a "model not found" error, set GEMINI_MODEL to the
// exact name shown in Google AI Studio.
const MODEL = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";

function geminiKey(): string {
  return process.env.GEMINI_API_KEY?.trim() || "";
}

// True once the Gemini API key is configured. Until then generateBrief()
// returns the stub brief instead of calling the model.
export function isAiBriefLive(): boolean {
  return geminiKey().length > 0;
}

function val(v: string | undefined | null, fallback = "Not provided"): string {
  const t = (v ?? "").trim();
  return t.length > 0 ? t : fallback;
}

const VERTICAL_LABELS: Record<string, string> = {
  "elder-care": "Managed elder care",
  dementia: "Dementia care",
  "post-discharge": "Post-discharge recovery care",
};

const SYSTEM_PROMPT = `You are a clinical intake assistant for Portea, an Indian home healthcare company that runs a managed elder care service. Every new family is called by a care manager. A Portea care manager is a medically trained clinician with roughly one year of experience, working under doctor supervision, not a senior specialist. Write the brief so it actively guides a relatively junior clinician: be clear, specific, and explicit about anything that needs attention. Do not assume senior clinical judgment.

Portea runs three home care programs:
- Managed elder care: ongoing daily support for ageing parents at home (caregivers, nursing, physiotherapy, nutrition).
- Dementia care: specialist care for elders with dementia or Alzheimer's, with trained dementia caregivers.
- Post-discharge recovery care: structured support for the weeks after a hospital stay or surgery.

Urgency has three levels:
- Low (routine): a planning enquiry, nothing time-sensitive, the family is exploring options.
- Medium (urgent, non-emergency): a recent surgery or discharge, a sharp decline, a fall without serious injury, medication or safety gaps, or a family under visible strain. Needs prompt attention.
- High (emergency): signs of an acute medical crisis (chest pain, breathing difficulty, stroke signs, severe bleeding, loss of consciousness, a fall with injury). Portea does not provide emergency response. For High, the brief must clearly tell the care manager to advise the family to call 108 or go to a hospital.

CLINICAL CONTEXT FOR QUESTION GENERATION

The 5 to 6 recommended questions are the brief's main value. Every question must earn its place: it should be specific to THIS elder's condition and situation, and surface something a junior care manager might not think to ask on their own. Do NOT include basic, generic questions that any care manager already asks by default, such as preferred language, religion or faith or cultural preferences, or vague "how is the elder doing" prompts. Those add no value and only clutter the brief, so leave them out entirely.

Useful general areas, but only when they are specific and genuinely relevant to this elder, never as a routine checklist: past surgeries and hospitalisations, current comorbidities, a recent change in energy, appetite, sleep, mobility or falls, and which vitals are being monitored at home and by whom.

Condition-specific clinical depth — this is your unique value. These probes turn a basic intake into a highly personalised care plan: which specialist-trained attendant fits the case, which equipment is needed, which vitals and monitoring schedule are appropriate, and which clinical signals should escalate to a doctor. Use only the sections that match THIS elder's actual condition; never list every possible question.

Post-surgical / post-discharge:
- Why the surgery happened and how recent; pain level, inflammation, itching at the site.
- Mobility status: bed-bound, wheelchair, walker, independent. Equipment needs (functional bed and recliner for age 80+, air mattress for bed-bound, walker, wheelchair).
- For knee replacement: one knee or both.
- For hip surgery: urinary catheter management, urine colour and quantity, diaper use, bed-sore risk and grade if already present.
- Lung, kidney, heart, and digestive function post-surgery.
- Any recent unintended weight loss.

Diabetes:
- Years since diagnosis (long-term, roughly 10+ years, raises neuropathy and retinopathy risk).
- On insulin and how many units per day. Most recent HbA1c value if known.
- Vision check recency for long-term diabetics; urine output.

Hypertension, heart, cholesterol:
- Most recent lipid profile values and date.

Obesity-related:
- Height, weight, BMI; recent lipid profile.

Female patients (where age-appropriate):
- Thyroid status. UTI history.
- Menstrual or menopausal context, including hysterectomy and post-menopausal symptoms (mood swings, white discharge, pain, sleep disruption).

Age 80 and above:
- Hearing and vision.
- Behavioural change in recent weeks (agitation, aggression, recognition of family).
- Recent falls.

Dementia and Alzheimer's:
- Stage and any existing dementia therapist or specialist support.
- Memory, recognition of family, agitation, wandering, sundowning.
- Mobility, food intake, bladder and catheter management.
- If bed-ridden: presence of an air mattress or ICU cot with side rails.
- Routine doctor visits and vitals monitoring cadence.

Cancer:
- Stage; whether the family is looking for active treatment support, palliative, or supportive care.
- Emotional state of the patient and the primary family caregiver. Pain management plan.

Nutrition and digestion (probe if appetite, energy, bowel or bladder seems off):
- Reason for low appetite; whether the family has consulted a nutritionist; daily water intake.
- Bowel pattern (constipation, or loose stools). For loose stools in elders 80+, consider anaemia and a prompt doctor consult.
- Whether macro and micro nutrients are balanced for the specific condition.

Nursing care specifics (only if a catheter, feeding tube or bed-sore is mentioned):
- Catheter type and change schedule (silicon catheters typically a one-month change).
- Feeding tube route (stomach or nasal) and care routine.
- Bed sore presence and grade.

Red flags that push urgency to Medium or High:
- Bed sores already present, any grade.
- Recent unintended weight loss.
- Catheter or feeding tube in use without a clear monitoring plan.
- Long-standing uncontrolled diabetes with vision or foot complications.
- Bed-bound elder without an air mattress.
- Age 80+ with sudden behavioural decline.

Your output has two parts:
1. A summary table with exactly these 7 rows: Elder, Condition, Main need, Caller, Location, Program fit, Urgency.
2. Five to six recommended questions, tailored to this elder's specific condition, for the care manager to ask on the discovery call.

Rules:
- Be concise and concrete. Each table value is one short line.
- Use plain, professional language. No jargon, no marketing tone.
- Do not invent medical facts. If something is missing from the intake, write "Not provided" or turn it into a question instead.
- "Program fit" must be one of the three programs above, with a 3 to 6 word reason.
- "Urgency" must start with Low, Medium, or High, followed by a short, clear reason. The care manager is junior and will rely on this line, so make the reason easy to act on. If High, include the advice to direct the family to emergency care.
- Each of the 5 to 6 questions must be specific and non-obvious, focused on this elder's condition, clinical picture, and situation, drawing on the CLINICAL CONTEXT reference above. Do NOT include generic intake questions a care manager would already ask by default (preferred language, religion or faith, basic "how are they doing"); those waste a slot. If the intake is thin on clinical detail, ask the specific clinical or situational questions needed to fill the most important gaps, not generic checklist items.
- Questions must be clearly worded so a junior care manager can ask them directly and understand why each one matters. Avoid clinical jargon. Where a particular answer would be a concern, phrase the question so the care manager naturally probes for it. The condition-specific probes are your unique value: they should reveal what drives personalised care plan decisions, like which specialist-trained attendant fits this case, which equipment is needed, which vitals and monitoring schedule are appropriate, and which clinical signals to escalate.
- Return ONLY valid JSON in exactly this shape, with no extra text before or after:

{
  "summary": [
    {"label": "Elder", "value": "..."},
    {"label": "Condition", "value": "..."},
    {"label": "Main need", "value": "..."},
    {"label": "Caller", "value": "..."},
    {"label": "Location", "value": "..."},
    {"label": "Program fit", "value": "..."},
    {"label": "Urgency", "value": "..."}
  ],
  "questions": ["...", "...", "...", "...", "...", "..."]
}`;

function buildUserMessage(lead: LeadRecord): string {
  const program = lead.vertical
    ? VERTICAL_LABELS[lead.vertical] ?? lead.vertical
    : "not specified";
  return [
    "New intake record:",
    `- Elder's name: ${val(lead.elder_name)}`,
    `- Condition / diagnosis: ${val(lead.condition)}`,
    `- Help needed: ${val(lead.needs)}`,
    `- Caller's name: ${val(lead.full_name)}`,
    `- Caller's relationship to the elder: ${val(lead.relationship)}`,
    `- City / area: ${val(lead.city)}`,
    `- Program enquired through: ${program}`,
    `- Free-text notes: ${val(lead.situation, "none")}`,
  ].join("\n");
}

// --- Stub (used when no API key is configured) -----------------------------

function stubBrief(lead: LeadRecord): AiBrief {
  const caller =
    lead.full_name && lead.relationship
      ? `${lead.full_name} (${lead.relationship})`
      : val(lead.full_name);

  const summary: AiBriefRow[] = [
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

// --- Live Gemini call ------------------------------------------------------

function asBriefRows(v: unknown): AiBriefRow[] {
  if (!Array.isArray(v)) return [];
  const rows: AiBriefRow[] = [];
  for (const item of v) {
    if (item && typeof item === "object") {
      const rec = item as Record<string, unknown>;
      const label = String(rec.label ?? "").trim();
      const value = String(rec.value ?? "").trim();
      if (label && value) rows.push({ label, value });
    }
  }
  return rows;
}

function asQuestions(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((q) => String(q ?? "").trim()).filter((q) => q.length > 0);
}

async function callGemini(lead: LeadRecord): Promise<AiBrief> {
  const ai = new GoogleGenAI({ apiKey: geminiKey() });
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: buildUserMessage(lead),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      temperature: 0.4,
      maxOutputTokens: 2048,
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  const text = (response.text ?? "").trim();
  if (!text) throw new Error("Gemini returned an empty response");

  let parsed: { summary?: unknown; questions?: unknown };
  try {
    parsed = JSON.parse(text) as { summary?: unknown; questions?: unknown };
  } catch {
    throw new Error("Gemini did not return valid JSON");
  }

  const summary = asBriefRows(parsed.summary);
  const questions = asQuestions(parsed.questions);
  if (summary.length === 0 || questions.length === 0) {
    throw new Error("Gemini returned an incomplete brief");
  }

  return { summary, questions, generated_by: MODEL };
}

// Generate a pre-call brief for one lead. Calls Gemini when the API key is
// configured, otherwise returns the stub brief.
export async function generateBrief(lead: LeadRecord): Promise<AiBrief> {
  if (isAiBriefLive()) {
    return callGemini(lead);
  }
  return stubBrief(lead);
}
