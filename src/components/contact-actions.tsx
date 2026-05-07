"use client";

import { IntakeChatbot } from "@/components/intake-chatbot";
import type { VerticalConfig } from "@/data/verticals";
import { getPhoneContact, getWhatsAppContact } from "@/lib/contact";

export function ContactActions({
  vertical,
  compact = false,
}: {
  vertical: VerticalConfig;
  compact?: boolean;
}) {
  const phone = getPhoneContact();
  const whatsapp = getWhatsAppContact();

  const baseSecondary =
    "inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:text-slate-950";

  return (
    <div className={compact ? "flex flex-wrap gap-3" : "space-y-4"}>
      <div className="flex flex-wrap gap-3">
        <a href={phone.href} className={baseSecondary}>
          Call {phone.label}
        </a>

        {whatsapp ? (
          <a
            href={whatsapp.href}
            className={baseSecondary}
            target="_blank"
            rel="noreferrer"
          >
            {whatsapp.label}
          </a>
        ) : (
          <IntakeChatbot
            vertical={vertical}
            triggerLabel="Request WhatsApp follow-up"
            triggerClassName={baseSecondary}
          />
        )}

        <IntakeChatbot
          vertical={vertical}
          triggerLabel={vertical.ctaLabel}
          triggerClassName={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white transition shadow-lg ${vertical.theme.accentStrong}`}
        />
      </div>

      {!compact ? (
        <p className="max-w-2xl text-sm leading-7 text-slate-600">
          Families can call now, request a WhatsApp follow-up, or start with the
          chatbot so a care manager already has the right context before calling back.
        </p>
      ) : null}
    </div>
  );
}
