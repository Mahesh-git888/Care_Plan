import type { Metadata } from "next";
import Script from "next/script";

import { LandingPage } from "@/components/landing-page";
import { verticals } from "@/data/verticals";
import { breadcrumbLd, buildVerticalMetadata, faqLd, serviceLd } from "@/lib/seo";

const vertical = verticals["post-discharge"];

export const metadata: Metadata = buildVerticalMetadata(vertical);

export default function PostDischargePage() {
  return (
    <>
      <LandingPage vertical={vertical} />
      <Script
        id="ld-service-post-discharge"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd(vertical)) }}
      />
      <Script
        id="ld-faq-post-discharge"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd(vertical)) }}
      />
      <Script
        id="ld-breadcrumb-post-discharge"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd(vertical)) }}
      />
    </>
  );
}
