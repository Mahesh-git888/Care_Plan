"use client";

// Client CTA bits for the otherwise server-rendered marketing pages, so the
// displayed call / WhatsApp swaps to the sales line for paid visitors. Markup
// mirrors the inline anchors these replace, so the visuals are unchanged.

import { PhoneIcon, WhatsAppIcon } from "@/components/ui-icons";
import { useSourceContact } from "@/lib/use-source-contact";

// The small phone link in the announcement bar (icon + number).
export function SourcePhoneBarLink({ className }: { className?: string }) {
  const { phone } = useSourceContact();
  return (
    <a href={phone.href} className={className}>
      <PhoneIcon className="h-3.5 w-3.5" />
      <span>{phone.label}</span>
    </a>
  );
}

// The home hero's Call + WhatsApp buttons.
export function SourceHeroButtons({
  whatsAppMessage,
}: {
  whatsAppMessage?: string;
}) {
  const { phone, whatsapp } = useSourceContact(whatsAppMessage);
  return (
    <>
      <a
        href={phone.href}
        className="inline-flex items-center gap-2 rounded-full border border-[#0f9aa8] bg-white px-6 py-4 text-sm font-semibold text-[#0b7c87] transition hover:border-[#0b7c87] hover:bg-[#f0fafb]"
      >
        <PhoneIcon className="h-4 w-4" />
        Call {phone.label}
      </a>
      <a
        href={whatsapp.href}
        target="_blank"
        rel="noreferrer noopener"
        data-hide-on-paid=""
        className="inline-flex items-center gap-2 rounded-full bg-[#25d366] px-6 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_-22px_rgba(37,211,102,0.85)] transition hover:bg-[#1da851]"
      >
        <WhatsAppIcon className="h-4 w-4 text-white" />
        WhatsApp us
      </a>
    </>
  );
}
