"use client";

import type { ReactNode } from "react";
import { useRef } from "react";

import type { VerticalConfig } from "@/data/verticals";
import { pushDataLayerEvent } from "@/lib/gtm";

// Lightweight button that dispatches the global "portea:open-chatbot" event.
// The actual chatbot modal is mounted once per page via <IntakeChatbot>; this
// component can be rendered as many times as needed without duplicating state
// or causing repeat submissions.

type Props = {
  vertical: VerticalConfig;
  triggerLabel?: string;
  triggerClassName?: string;
  triggerContent?: ReactNode;
};

// Module-level flag so form_start fires at most once per page load, even when
// the visitor clicks several trigger buttons across the page.
let formStartFired = false;

export function ChatbotTrigger({
  vertical,
  triggerLabel,
  triggerClassName,
  triggerContent,
}: Props) {
  const ariaLabelRef = useRef(triggerLabel || vertical.ctaLabel);

  function handleClick() {
    if (!formStartFired) {
      formStartFired = true;
      pushDataLayerEvent("form_start", {
        form_name: "intake_chatbot",
        vertical: vertical.slug,
      });
    }
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("portea:open-chatbot", {
        detail: { vertical: vertical.slug },
      }),
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        triggerClassName ||
        `inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white transition ${vertical.theme.accentStrong} shadow-lg`
      }
      aria-haspopup="dialog"
      aria-label={ariaLabelRef.current}
    >
      {triggerContent || triggerLabel || vertical.ctaLabel}
    </button>
  );
}
