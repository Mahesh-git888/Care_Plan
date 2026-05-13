import type { Metadata } from "next";
import Script from "next/script";

import { HomePage as MarketingHomePage } from "@/components/home-page";
import { verticalList } from "@/data/verticals";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Portea Managed Elder Care | Doctor-Designed Home Care in India",
  description:
    "Doctor-designed home care for elders, dementia, and post-hospital recovery in 40+ Indian cities. One care manager per family. Trained caregivers. Trusted by 1 million+ families.",
  alternates: { canonical: "/" },
};

const homeLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Portea",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const programsLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: verticalList.map((v, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    url: `${SITE_URL}/${v.slug}`,
    name: v.name,
  })),
};

export default function RootPage() {
  return (
    <>
      <MarketingHomePage />
      <Script
        id="ld-website"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeLd) }}
      />
      <Script
        id="ld-programs"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(programsLd) }}
      />
    </>
  );
}
