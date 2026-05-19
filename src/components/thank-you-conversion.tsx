"use client";

import { useEffect } from "react";

import { pushDataLayerEvent } from "@/lib/gtm";
import { readAttribution } from "@/lib/utm";

// Fires the `generate_lead` event once when the Thank You page loads.
// Useful as a backup conversion signal when a lead form does a redirect
// to /thank-you instead of staying on the same page.

export function ThankYouConversion() {
  useEffect(() => {
    pushDataLayerEvent("generate_lead", {
      lead_source: "thank_you_page",
      attribution: readAttribution(),
    });
  }, []);
  return null;
}
