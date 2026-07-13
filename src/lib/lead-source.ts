// Classify a lead as paid or organic from its captured attribution.
//
// Paid  = a Google Ads click id (gclid) is present, OR the utm_medium is a
//         known paid channel (cpc/ppc/paid*/display/cpm/retargeting).
// Organic = everything else: no attribution, organic/referral/direct/email
//           traffic, on-site popups, etc.
//
// Paid leads are forwarded to the sales team's ops webhook; organic leads stay
// with the care team and trigger the usual email alert. Pure module (no Node
// built-ins) so it is safe to import anywhere.

import type { LeadAttribution } from "@/lib/lead-types";

export type LeadSource = "paid" | "organic";

// Matches cpc, ppc, paid, paidsearch, paid_search, paid-search, paidsocial,
// paid_social, display, cpm, retargeting, remarketing (case-insensitive).
const PAID_MEDIUM =
  /^(cpc|ppc|paid|paid[_-]?search|paid[_-]?social|display|cpm|retargeting|remarketing)$/i;

export function classifyLeadSource(attr?: LeadAttribution | null): LeadSource {
  if (!attr) return "organic";
  // Any ad-click identifier means a paid click. Google now often sends gbraid
  // or wbraid instead of gclid (iOS / consent mode); msclkid is Microsoft Ads.
  if (
    (attr.gclid && attr.gclid.trim()) ||
    (attr.gbraid && attr.gbraid.trim()) ||
    (attr.wbraid && attr.wbraid.trim()) ||
    (attr.msclkid && attr.msclkid.trim())
  ) {
    return "paid";
  }
  const medium = attr.utm_medium?.trim();
  if (medium && PAID_MEDIUM.test(medium)) return "paid";
  return "organic";
}

export function isPaidLead(attr?: LeadAttribution | null): boolean {
  return classifyLeadSource(attr) === "paid";
}
