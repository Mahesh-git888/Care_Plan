// Chatbot intake — aligned with the Managed Elder Care SOP.
// The 6 SOP data points: elder's name, condition, high-level needs, phone,
// city/area, family member name + phone. Plus consent.

export const intakeSteps = [
  {
    key: "elderName",
    label: "elder's name",
    prompt: "Hi, I'm Portea's care assistant. Whom are we caring for? Please share the elder's name.",
    placeholder: "Elder's full name",
    type: "text",
  },
  {
    key: "condition",
    label: "condition or diagnosis",
    prompt: "Got it. What is happening with their health? A diagnosis or a short description is fine.",
    placeholder: "e.g. Alzheimer's, post hip-replacement, low mobility",
    type: "text",
  },
  {
    key: "needs",
    label: "kind of help needed",
    prompt: "What kind of help is most needed at home right now?",
    placeholder: "e.g. caregiver, nurse, physio, full-day support",
    type: "textarea",
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
    prompt: "Thank you. May I have your name?",
    placeholder: "Your name",
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
