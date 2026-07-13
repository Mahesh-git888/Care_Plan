"use client";

// Source-aware contact for the CTA buttons. Organic on the first render (so SSR
// and the initial client render match — no hydration mismatch, and organic /
// SEO visitors never flicker), then upgraded to the paid sales line after mount
// if the visitor came from an ad.

import { useEffect, useState } from "react";

import {
  getPhoneContact,
  getWhatsAppContact,
  type ContactSource,
} from "@/lib/contact";
import { classifyLeadSource } from "@/lib/lead-source";
import { readAttribution } from "@/lib/utm";

// Paid if the current URL carries an ad click id / paid medium (first landing,
// before the attribution cookie is written) OR the persisted cookie says so
// (return visits and client-side navigation).
function detectSource(): ContactSource {
  if (typeof window === "undefined") return "organic";
  const params = new URL(window.location.href).searchParams;
  const fromUrl = {
    gclid: params.get("gclid") ?? undefined,
    gbraid: params.get("gbraid") ?? undefined,
    wbraid: params.get("wbraid") ?? undefined,
    msclkid: params.get("msclkid") ?? undefined,
    utm_medium: params.get("utm_medium") ?? undefined,
  };
  if (classifyLeadSource(fromUrl) === "paid") return "paid";
  return classifyLeadSource(readAttribution());
}

export function useSourceContact(whatsAppMessage?: string) {
  const [source, setSource] = useState<ContactSource>("organic");

  useEffect(() => {
    setSource(detectSource());
  }, []);

  return {
    source,
    phone: getPhoneContact(source),
    whatsapp: getWhatsAppContact(whatsAppMessage, source),
  };
}
