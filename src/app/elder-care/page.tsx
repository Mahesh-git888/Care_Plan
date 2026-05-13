import type { Metadata } from "next";
import Script from "next/script";

import { LandingPage } from "@/components/landing-page";
import { verticals } from "@/data/verticals";
import { breadcrumbLd, buildVerticalMetadata, faqLd, serviceLd } from "@/lib/seo";

const vertical = verticals["elder-care"];

export const metadata: Metadata = buildVerticalMetadata(vertical);

export default function ElderCarePage() {
  return (
    <>
      <LandingPage vertical={vertical} />
      <Script
        id="ld-service-elder-care"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd(vertical)) }}
      />
      <Script
        id="ld-faq-elder-care"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd(vertical)) }}
      />
      <Script
        id="ld-breadcrumb-elder-care"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd(vertical)) }}
      />
    </>
  );
}
