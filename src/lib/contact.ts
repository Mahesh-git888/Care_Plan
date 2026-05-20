// Portea contact details. Single source of truth for the phone and WhatsApp
// number used across the entire website. Change it here and it updates
// everywhere: announcement bar, hero CTAs, footer, mobile menu, chatbot.

const PORTEA_PHONE_DISPLAY = "+91 91871 16003";
// E.164 digits, no plus. Used for tel: links and WhatsApp.
const PORTEA_CONTACT_DIGITS = "919187116003";
const PORTEA_PHONE_HREF = `tel:+${PORTEA_CONTACT_DIGITS}`;

export function getPhoneContact() {
  return {
    label: PORTEA_PHONE_DISPLAY,
    href: PORTEA_PHONE_HREF,
    raw: PORTEA_CONTACT_DIGITS,
  };
}

export function getWhatsAppContact(prefilledMessage?: string) {
  const message =
    prefilledMessage?.trim() ||
    "Hello, I would like to speak to a Portea care manager about home care support.";

  return {
    label: "WhatsApp a care manager",
    href: `https://wa.me/${PORTEA_CONTACT_DIGITS}?text=${encodeURIComponent(message)}`,
    digits: PORTEA_CONTACT_DIGITS,
  };
}
