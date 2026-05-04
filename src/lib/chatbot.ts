export const intakeSteps = [
  {
    key: "name",
    label: "name",
    prompt: "Hi, I can help with that. What is your name?",
    placeholder: "Enter your name",
    type: "text",
  },
  {
    key: "phone",
    label: "phone",
    prompt: "Thanks. What phone number should our care team call?",
    placeholder: "Enter your phone number",
    type: "tel",
  },
  {
    key: "city",
    label: "city",
    prompt: "Which city do you need care support in?",
    placeholder: "Enter your city",
    type: "text",
  },
  {
    key: "situation",
    label: "situation",
    prompt: "Please share a little about the care situation so we can prepare.",
    placeholder: "Describe the care need",
    type: "textarea",
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
  name: "",
  phone: "",
  city: "",
  situation: "",
};
