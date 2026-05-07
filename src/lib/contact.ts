const PORTEA_PHONE_DISPLAY = "1800 121 2323";
const PORTEA_PHONE_HREF = "tel:18001212323";

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function getPhoneContact() {
  return {
    label: PORTEA_PHONE_DISPLAY,
    href: PORTEA_PHONE_HREF,
  };
}

export function getWhatsAppContact() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim();
  if (!number) {
    return null;
  }

  const digits = digitsOnly(number);
  if (!digits) {
    return null;
  }

  const message =
    "Hello, I would like to speak to a care manager about home care support.";

  return {
    label: "WhatsApp a care manager",
    href: `https://wa.me/${digits}?text=${encodeURIComponent(message)}`,
  };
}
