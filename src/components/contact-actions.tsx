"use client";

import type { ReactNode } from "react";

import { IntakeChatbot } from "@/components/intake-chatbot";
import { ChatIcon, PhoneIcon, WhatsAppIcon } from "@/components/ui-icons";
import type { VerticalConfig } from "@/data/verticals";
import { getPhoneContact, getWhatsAppContact } from "@/lib/contact";

function BaseButton({
  href,
  children,
  kind = "secondary",
}: {
  href: string;
  children: ReactNode;
  kind?: "primary" | "secondary";
}) {
  const className =
    kind === "primary"
      ? "inline-flex items-center justify-center gap-2 rounded-full bg-[#ff5b2e] px-6 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_-22px_rgba(255,91,46,0.95)] transition hover:bg-[#ec4e22]"
      : "inline-flex items-center justify-center gap-2 rounded-full border border-[#c8dde0] bg-white px-5 py-4 text-sm font-semibold text-[#0f2d36] transition hover:border-[#8db9bf] hover:bg-[#f7fbfb]";

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

export function ContactActions({
  vertical,
  compact = false,
}: {
  vertical: VerticalConfig;
  compact?: boolean;
}) {
  const phone = getPhoneContact();
  const whatsapp = getWhatsAppContact();

  return (
    <div className={compact ? "space-y-4" : "space-y-5"}>
      <div className="flex flex-wrap items-center gap-3">
        <IntakeChatbot
          vertical={vertical}
          triggerContent={
            <>
              <ChatIcon className="h-4 w-4" />
              <span>{vertical.ctaLabel}</span>
            </>
          }
          triggerClassName="inline-flex items-center justify-center gap-2 rounded-full bg-[#ff5b2e] px-6 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_-22px_rgba(255,91,46,0.95)] transition hover:bg-[#ec4e22]"
        />

        {whatsapp ? (
          <BaseButton href={whatsapp.href}>
            <WhatsAppIcon className="h-4 w-4 text-[#18a957]" />
            <span>WhatsApp us</span>
          </BaseButton>
        ) : (
          <IntakeChatbot
            vertical={vertical}
            triggerContent={
              <>
                <WhatsAppIcon className="h-4 w-4 text-[#18a957]" />
                <span>Request WhatsApp follow-up</span>
              </>
            }
            triggerClassName="inline-flex items-center justify-center gap-2 rounded-full border border-[#c8dde0] bg-white px-5 py-4 text-sm font-semibold text-[#0f2d36] transition hover:border-[#8db9bf] hover:bg-[#f7fbfb]"
          />
        )}

        <BaseButton href={phone.href}>
          <PhoneIcon className="h-4 w-4" />
          <span>Call {phone.label}</span>
        </BaseButton>
      </div>

      {!compact ? (
        <p className="text-sm leading-7 text-[#54727a]">{vertical.responseNote}</p>
      ) : null}
    </div>
  );
}

export function FloatingContactButtons({ vertical }: { vertical: VerticalConfig }) {
  const whatsapp = getWhatsAppContact();

  return (
    <>
      {whatsapp ? (
        <a
          href={whatsapp.href}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-5 left-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#1abc5b] text-white shadow-[0_22px_45px_-24px_rgba(26,188,91,0.9)] transition hover:scale-[1.03]"
          aria-label="WhatsApp Portea"
        >
          <WhatsAppIcon className="h-7 w-7" />
        </a>
      ) : null}

      <div className="fixed bottom-5 right-5 z-40">
        <IntakeChatbot
          vertical={vertical}
          triggerContent={<ChatIcon className="h-6 w-6" />}
          triggerClassName="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#0f9aa8] text-white shadow-[0_22px_45px_-24px_rgba(15,154,168,0.92)] transition hover:scale-[1.03]"
        />
      </div>
    </>
  );
}
