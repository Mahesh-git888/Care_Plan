// Google Tag Manager helper.
//
// The container ID below is the live Portea container. NEXT_PUBLIC_GTM_ID can
// override it from the environment (useful for switching it off in local
// development by setting the var to an empty string).

const DEFAULT_GTM_ID = "GTM-MQGX3H46";

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
