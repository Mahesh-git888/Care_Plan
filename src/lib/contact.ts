// Portea contact details. Single source of truth for the phone and WhatsApp
// numbers used across the website.
//
// Numbers are source-aware:
//  - organic (default): the care team line (Akshita). Also what every
//    server-rendered spot uses — footer, schema, thank-you — so the site's NAP
//    stays consistent for SEO.
//  - paid: the sales team's toll-free line + WhatsApp, shown to visitors who
//    arrived from an ad. Swapped in on the client via useSourceContact().

export type ContactSource = "organic" | "paid";

// Care team (organic / default).
const ORGANIC_PHONE_DISPLAY = "+91 91871 16003";
const ORGANIC_DIGITS = "919187116003";

// Sales team (paid). The toll-free call number is dialled without a +91 prefix;
// the WhatsApp number is a separate line.
const SALES_PHONE_DISPLAY = "1800 121 2323";
const SALES_PHONE_DIGITS = "18001212323";
const SALES_WA_DIGITS = "917411516311";

export function getPhoneContact(source: ContactSource = "organic") {
  if (source === "paid") {
    return {
      label: SALES_PHONE_DISPLAY,
      href: `tel:${SALES_PHONE_DIGITS}`,
      raw: SALES_PHONE_DIGITS,
    };
  }
  return {
    label: ORGANIC_PHONE_DISPLAY,
    href: `tel:+${ORGANIC_DIGITS}`,
    raw: ORGANIC_DIGITS,
  };
}

export function getWhatsAppContact(
  prefilledMessage?: string,
  source: ContactSource = "organic",
) {
  const message =
    prefilledMessage?.trim() ||
    "Hello, I would like to speak to a Portea care manager about home care support.";
  const digits = source === "paid" ? SALES_WA_DIGITS : ORGANIC_DIGITS;

  return {
    label: "WhatsApp a care manager",
    href: `https://wa.me/${digits}?text=${encodeURIComponent(message)}`,
    digits,
  };
}
