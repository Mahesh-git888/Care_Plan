"use client";

import { useEffect } from "react";

import { pushDataLayerEvent } from "@/lib/gtm";
import { readAttribution } from "@/lib/utm";

// Fires the `generate_lead` event once when the Thank You page loads. This is
// the single source of truth for the conversion event so we don't double-count
// in GA4 / Google Ads. The chatbot and any future HTML lead form should
// redirect here on success with context query params.

type Payload = {
  event: "generate_lead";
  lead_source: string;
  vertical?: string;
  patient_id?: string;
  ab_variant?: string;
  city?: string;
  attribution: ReturnType<typeof readAttribution>;
};

export function ThankYouConversion() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const payload: Omit<Payload, "event"> = {
      lead_source: params.get("source") || "direct",
      vertical: params.get("vertical") || undefined,
      patient_id: params.get("patient_id") || undefined,
      ab_variant: params.get("ab_variant") || undefined,
      city: params.get("city") || undefined,
      attribution: readAttribution(),
    };

    pushDataLayerEvent("generate_lead", payload as Record<string, unknown>);

    // Google Ads conversion fire. Activates once Hiveminds shares the
    // conversion label and we set NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL in
    // Vercel. Until then this is a no-op (the label env var is empty).
    const conversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL?.trim();
    const googleAdsId = (process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? "AW-977307455").trim();
    if (conversionLabel && typeof window.gtag === "function") {
      window.gtag("event", "conversion", {
        send_to: `${googleAdsId}/${conversionLabel}`,
      });
    }
  }, []);
  return null;
}
