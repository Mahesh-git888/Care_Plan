import type { Metadata } from "next";
import Script from "next/script";

import { LandingPage } from "@/components/landing-page";
import { verticals } from "@/data/verticals";
import { breadcrumbLd, buildVerticalMetadata, faqLd, serviceLd } from "@/lib/seo";

const vertical = verticals.dementia;

export const metadata: Metadata = buildVerticalMetadata(vertical);

export default function DementiaPage() {
  return (
    <>
      <LandingPage vertical={vertical} />
      <Script
        id="ld-service-dementia"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd(vertical)) }}
      />
      <Script
        id="ld-faq-dementia"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd(vertical)) }}
      />
      <Script
        id="ld-breadcrumb-dementia"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd(vertical)) }}
      />
    </>
  );
}
