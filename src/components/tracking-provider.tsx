"use client";

import { useEffect } from "react";

import { pushDataLayer } from "@/lib/gtm";
import { captureAttributionFromUrl, readAttribution } from "@/lib/utm";

// Mounts a global click listener that fires a sendBeacon to /api/v1/track
// whenever the user clicks a tel: or wa.me link, so the marketing team can
// attribute call/WhatsApp activity to the ad that drove the visit.
//
// Also runs once on mount to capture UTM/gclid/fbclid from the URL into
// sessionStorage. The chatbot reads them on submit so every full intake
// also carries attribution.

type ClickKind = "call_click" | "whatsapp_click";

function classify(href: string | null): ClickKind | null {
  if (!href) return null;
  if (href.startsWith("tel:")) return "call_click";
  if (
    href.startsWith("https://wa.me/") ||
    href.startsWith("https://api.whatsapp.com/") ||
    href.startsWith("whatsapp://")
  ) {
    return "whatsapp_click";
  }
  return null;
}

function detectVertical(): string {
  if (typeof window === "undefined") return "";
  const segment = window.location.pathname.split("/")[1] ?? "";
  if (segment === "elder-care" || segment === "dementia" || segment === "post-discharge") {
    return segment;
  }
  return "home";
}

function send(kind: ClickKind, target: string) {
  const vertical = detectVertical();
  const attribution = readAttribution();

  // Push to GTM/GA4 first so Google sees the event even if the beacon
  // fails. Match the spec event names: click_call and whatsapp_click.
  pushDataLayer(kind === "call_click" ? "click_call" : "whatsapp_click", {
    target,
    vertical,
    attribution,
  });

  const payload = JSON.stringify({
    kind,
    target,
    vertical,
    attribution,
  });

  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([payload], { type: "application/json" });
      const ok = navigator.sendBeacon("/api/v1/track", blob);
      if (ok) return;
    }
  } catch {
    /* fall through to fetch */
  }

  // sendBeacon unavailable or failed. Fall back to fire-and-forget fetch.
  try {
    void fetch("/api/v1/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    });
  } catch {
    /* swallow. Tracking is best-effort. */
  }
}

export function TrackingProvider() {
  useEffect(() => {
    captureAttributionFromUrl();

    const handler = (event: MouseEvent) => {
      // Find the closest anchor in the event path.
      const target = event.target as Element | null;
      if (!target) return;
      const anchor = target.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;

      const kind = classify(anchor.getAttribute("href"));
      if (!kind) return;

      send(kind, anchor.href);
    };

    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);

  return null;
}
