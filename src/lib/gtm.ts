// Google Tag Manager helper.
//
// Set NEXT_PUBLIC_GTM_ID in your environment (e.g. "GTM-ABCD123") to switch
// the container on. Leave it unset to disable tracking entirely, which is
// the right default in local dev and preview environments.

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID?.trim() || "";

export const GTM_ENABLED = GTM_ID.length > 0;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

type DataLayerPayload = Record<string, unknown>;

export function pushDataLayer(event: string, payload: DataLayerPayload = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...payload });
}
