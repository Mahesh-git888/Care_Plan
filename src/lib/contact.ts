// Portea contact details. The phone is the public Portea call-centre number.
// WhatsApp number is configured via NEXT_PUBLIC_WHATSAPP_NUMBER (E.164 digits, e.g. 919606111000).
// If not set, we fall back to the public Portea WhatsApp business number.

const PORTEA_PHONE_DISPLAY = "1800 121 2323";
const PORTEA_PHONE_DIGITS = "18001212323";
const PORTEA_PHONE_HREF = `tel:+91${PORTEA_PHONE_DIGITS}`;

// Default Portea WhatsApp business number (India). Override via env var if needed.
const DEFAULT_WHATSAPP = "919606111000";

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function getPhoneContact() {
  return {
    label: PORTEA_PHONE_DISPLAY,
    href: PORTEA_PHONE_HREF,
    raw: PORTEA_PHONE_DIGITS,
  };
}

export function getWhatsAppContact(prefilledMessage?: string) {
  const configured = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim();
  const number = configured && digitsOnly(configured).length >= 10 ? configured : DEFAULT_WHATSAPP;
  const digits = digitsOnly(number);

  if (!digits) {
    return null;
  }

  const message =
    prefilledMessage?.trim() ||
    "Hello, I would like to speak to a Portea care manager about home care support.";

  return {
    label: "WhatsApp a care manager",
    href: `https://wa.me/${digits}?text=${encodeURIComponent(message)}`,
    digits,
  };
}
