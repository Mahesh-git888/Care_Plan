import Script from "next/script";

// Google Ads gtag.js loader. Separate from GTM: this loads the Google Ads
// global site tag directly so Hiveminds can attribute conversions via gtag()
// calls. GTM and gtag.js coexist fine; both push to the same window.dataLayer.
//
// The conversion ID below is the live Portea Google Ads account
// (AW-977307455) provided by Hiveminds. Override via NEXT_PUBLIC_GOOGLE_ADS_ID
// if it ever changes, or set the env var to an empty string to disable locally.

const DEFAULT_GOOGLE_ADS_ID = "AW-977307455";

export const GOOGLE_ADS_ID = (
  process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? DEFAULT_GOOGLE_ADS_ID
).trim();

export const GOOGLE_ADS_ENABLED = GOOGLE_ADS_ID.length > 0;

declare global {
  interface Window {
    // gtag is implicitly attached to window by the gtag init snippet. Declared
    // here so TypeScript callers (e.g. the thank-you conversion firing) can
    // reach it without "any".
    gtag?: (...args: unknown[]) => void;
  }
}

export function GoogleAdsProvider() {
  if (!GOOGLE_ADS_ENABLED) return null;
  return (
    <>
      {/* Defer the heavy gtag.js file to lazyOnload so its ~0.8s of JS eval
          stays out of the mobile LCP window. The tiny init snippet below stays
          afterInteractive, so window.gtag exists early and a /thank-you
          conversion queues into dataLayer and fires once gtag.js loads. */}
      <Script
        id="google-ads-gtag-src"
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
      />
      <Script id="google-ads-gtag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GOOGLE_ADS_ID}');`}
      </Script>
    </>
  );
}
