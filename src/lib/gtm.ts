// Google Tag Manager helper.
//
// GTM is OFF by default: no container loads unless NEXT_PUBLIC_GTM_ID is
// explicitly set to a real container id. Google Ads tracking is handled
// separately by the direct gtag.js tag (see google-ads-provider.tsx), so the
// site does not depend on a GTM container. To run GA4/remarketing through a
// container later, set NEXT_PUBLIC_GTM_ID to a Portea-owned (or agency)
// container id.

const DEFAULT_GTM_ID = "";

export const GTM_ID = (process.env.NEXT_PUBLIC_GTM_ID ?? DEFAULT_GTM_ID).trim();

export const GTM_ENABLED = GTM_ID.length > 0;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

// Make sure window.dataLayer exists as soon as this module is imported in the
// browser. The GTM init snippet does this too, but initialising here lets any
// component push events before GTM has finished loading.
if (typeof window !== "undefined") {
  window.dataLayer = window.dataLayer ?? [];
}

type DataLayerPayload = Record<string, unknown>;

export function pushDataLayerEvent(eventName: string, payload: DataLayerPayload = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    event: eventName,
    ...payload,
  });
}

// Backwards-compatible alias so older imports keep working.
export const pushDataLayer = pushDataLayerEvent;
