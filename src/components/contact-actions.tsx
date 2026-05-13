"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import { IntakeChatbot } from "@/components/intake-chatbot";
import { ChatIcon, PhoneIcon, WhatsAppIcon } from "@/components/ui-icons";
import type { VerticalConfig } from "@/data/verticals";
import { getPhoneContact, getWhatsAppContact } from "@/lib/contact";

function BaseButton({
  href,
  children,
  kind = "secondary",
  ariaLabel,
}: {
  href: string;
  children: ReactNode;
  kind?: "primary" | "secondary" | "whatsapp";
  ariaLabel?: string;
}) {
  const className =
    kind === "primary"
      ? "inline-flex items-center justify-center gap-2 rounded-full bg-[#ff5b2e] px-6 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_-22px_rgba(255,91,46,0.95)] transition hover:bg-[#ec4e22]"
      : kind === "whatsapp"
        ? "inline-flex items-center justify-center gap-2 rounded-full bg-[#1abc5b] px-6 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_-22px_rgba(26,188,91,0.85)] transition hover:bg-[#149c4b]"
        : "inline-flex items-center justify-center gap-2 rounded-full border border-[#c8dde0] bg-white px-5 py-4 text-sm font-semibold text-[#0f2d36] transition hover:border-[#8db9bf] hover:bg-[#f7fbfb]";

  return (
    <a
      href={href}
      className={className}
      aria-label={ariaLabel}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer noopener" : undefined}
    >
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
  const whatsapp = getWhatsAppContact(vertical.whatsAppMessage);

  return (
    <div className={compact ? "space-y-3" : "space-y-5"}>
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

        <BaseButton href={phone.href} ariaLabel={`Call Portea on ${phone.label}`}>
          <PhoneIcon className="h-4 w-4" />
          <span>Call {phone.label}</span>
        </BaseButton>

        {whatsapp ? (
          <BaseButton href={whatsapp.href} kind="whatsapp" ariaLabel="WhatsApp a Portea care manager">
            <WhatsAppIcon className="h-4 w-4 text-white" />
            <span>WhatsApp us</span>
          </BaseButton>
        ) : null}
      </div>

      {!compact ? (
        <p className="text-sm leading-7 text-[#54727a]">{vertical.responseNote}</p>
      ) : null}
    </div>
  );
}

export function FloatingContactButtons({ vertical }: { vertical: VerticalConfig }) {
  const phone = getPhoneContact();
  const whatsapp = getWhatsAppContact(vertical.whatsAppMessage);
  const [open, setOpen] = useState(false);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40">
      <div className="pointer-events-auto mx-auto flex max-w-7xl items-end justify-between px-3 pb-4 sm:px-6">
        <div className="hidden md:block" />

        <div className="flex flex-col items-end gap-3">
          {open ? (
            <div className="flex flex-col items-end gap-3">
              <a
                href={phone.href}
                data-track="call"
                className="inline-flex items-center gap-3 rounded-full bg-[#0f9aa8] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#0b7c87]"
                aria-label={`Call Portea on ${phone.label}`}
              >
                <PhoneIcon className="h-4 w-4" />
                <span>Call {phone.label}</span>
              </a>
              {whatsapp ? (
                <a
                  href={whatsapp.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-3 rounded-full bg-[#1abc5b] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#149c4b]"
                  aria-label="WhatsApp Portea"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  <span>WhatsApp us</span>
                </a>
              ) : null}
              <IntakeChatbot
                vertical={vertical}
                triggerContent={
                  <span className="inline-flex items-center gap-3">
                    <ChatIcon className="h-4 w-4" />
                    <span>Chat with us</span>
                  </span>
                }
                triggerClassName="inline-flex items-center gap-3 rounded-full bg-[#0f9aa8] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#0b7c87]"
              />
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setOpen((s) => !s)}
            className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#ff5b2e] text-white shadow-[0_22px_45px_-22px_rgba(255,91,46,0.9)] transition hover:bg-[#ec4e22]"
            aria-label={open ? "Close contact options" : "Open contact options"}
            aria-expanded={open}
          >
            {open ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <ChatIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
