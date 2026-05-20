// Chatbot intake. Aligned with the Managed Elder Care SOP.
// The 6 SOP data points: elder's name, condition, high-level needs, phone,
// city/area, family member name + phone. Plus consent.
//
// Step order is intentional: elder-related fields first, then caller fields.
// When the visible landing-page lead form has already captured name/city/phone
// + consent, the chatbot skips those steps automatically (see findNextEmptyStep
// in intake-chatbot.tsx) and only asks the 4 elder-side questions.

export const intakeSteps = [
  {
    key: "elderName",
    label: "elder's name",
    prompt: "Whom are we caring for? Please share their name.",
    placeholder: "Elder's full name",
    type: "text",
  },
  {
    key: "condition",
    label: "condition or diagnosis",
    prompt: "Got it. What's happening with their health? A diagnosis or a short description works.",
    placeholder: "e.g. Alzheimer's, post hip-replacement, low mobility",
    type: "text",
  },
  {
    key: "needs",
    label: "kind of help needed",
    prompt: "What kind of help is most needed at home right now?",
    placeholder: "e.g. caregiver, nurse, physio, full-day support",
    type: "text",
  },
  {
    key: "relationship",
    label: "relationship to the elder",
    prompt: "How are you related to the elder?",
    placeholder: "e.g. Daughter, Son, Spouse",
    type: "text",
  },
  {
    key: "city",
    label: "city / area",
    prompt: "Which city and area is the elder in?",
    placeholder: "e.g. Indiranagar, Bangalore",
    type: "text",
  },
  {
    key: "name",
    label: "your name",
    prompt: "May I have your name?",
    placeholder: "Your name",
    type: "text",
  },
  {
    key: "phone",
    label: "phone number",
    prompt: "What's the best phone number for our care manager to call you on?",
    placeholder: "10-digit phone number",
    type: "tel",
  },
] as const;

export type IntakeStep = (typeof intakeSteps)[number];
export type IntakeFieldKey = IntakeStep["key"];

export type IntakeFields = Record<IntakeFieldKey, string>;

export type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

export const emptyFields: IntakeFields = {
  elderName: "",
  condition: "",
  needs: "",
  city: "",
  name: "",
  relationship: "",
  phone: "",
};

// Strip formatting and the +91 / 91 / leading-0 prefixes families type by habit,
// returning the 10-digit subscriber number.
export function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 13 && digits.startsWith("091")) digits = digits.slice(3);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

export function isValidIndianMobile(raw: string): boolean {
  const d = normalizePhone(raw);
  return d.length === 10 && /^[6-9]/.test(d);
}

// Sanitises raw phone input as the user types. Strips anything that isn't a
// digit, drops a pasted +91 / leading-0 country prefix, and hard-caps the
// result at 10 digits. Bind this to a phone input's onChange so the field can
// never hold more (or non-numeric) characters than a 10-digit mobile number.
export function sanitizePhoneInput(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length > 10 && digits.startsWith("0")) digits = digits.slice(1);
  return digits.slice(0, 10);
}

// --- Quick form handoff -----------------------------------------------------
//
// The visible landing-page lead form captures (name, city, phone) + consent.
// We persist these in sessionStorage keyed by vertical slug so the chatbot can
// read them on open, skip those steps, and auto-submit once the four remaining
// SOP questions are answered.

export type QuickFormData = {
  name: string;
  city: string;
  phone: string;
  consentGiven: boolean;
  ab_variant?: string;
};

const QUICK_FORM_PREFIX = "portea-quick-form:";

export function writeQuickFormData(verticalSlug: string, data: QuickFormData) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(QUICK_FORM_PREFIX + verticalSlug, JSON.stringify(data));
  } catch {
    /* sessionStorage may be unavailable in incognito; non-fatal */
  }
}

export function readQuickFormData(verticalSlug: string): QuickFormData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(QUICK_FORM_PREFIX + verticalSlug);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<QuickFormData>;
    if (!parsed.name || !parsed.city || !parsed.phone) return null;
    return {
      name: parsed.name,
      city: parsed.city,
      phone: parsed.phone,
      consentGiven: Boolean(parsed.consentGiven),
      ab_variant: parsed.ab_variant,
    };
  } catch {
    return null;
  }
}

export function clearQuickFormData(verticalSlug: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(QUICK_FORM_PREFIX + verticalSlug);
  } catch {
    /* noop */
  }
}
