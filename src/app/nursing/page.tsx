import type { Metadata } from "next";

import { NursingLanding, NURSING_FAQS } from "@/components/nursing-landing";
import { SITE_URL } from "@/lib/seo";

const TITLE = "Trained Caregivers and Nurses at Home | Portea Medical";
const DESCRIPTION =
  "Portea-trained nursing attendants and nurses for your parent at home. Background-verified, clinically trained, managed by a dedicated health manager. 135+ Indian cities.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "nurse at home",
    "nursing attendant",
    "home nurse for elderly",
    "patient care attendant",
    "24 hour caregiver",
    "hire nurse post surgery",
    "caregiver for elderly parents",
    "home nursing services India",
  ],
  alternates: { canonical: "/nursing" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Portea",
    url: `${SITE_URL}/nursing`,
    title: TITLE,
    description:
      "Background-verified, clinically trained caregivers managed by a dedicated health manager. 135+ Indian cities.",
    images: [
      { url: "/nursing-hero.png", width: 1200, height: 630, alt: "A Portea caregiver supporting an elder at home" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description:
      "Background-verified, clinically trained caregivers managed by a dedicated health manager.",
    images: ["/nursing-hero.png"],
  },
};

const serviceLd = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  name: "Portea Home Nursing and Caregivers",
  url: `${SITE_URL}/nursing`,
  logo: `${SITE_URL}/portea-logo.svg`,
  telephone: "+91 91871 16003",
  areaServed: "IN",
  medicalSpecialty: ["Nursing", "Geriatrics", "Home Care", "Rehabilitation"],
  description:
    "Background-verified, Portea-trained nursing attendants and nurses, placed and trained on the patient's condition by a dedicated health manager.",
  address: { "@type": "PostalAddress", addressCountry: "IN" },
  provider: { "@type": "Organization", name: "Portea Medical", url: SITE_URL },
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: NURSING_FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Nursing and Caregivers", item: `${SITE_URL}/nursing` },
  ],
};

export default function NursingPage() {
  return (
    <>
      {/* Reveal animations are progressive enhancement; force everything visible
          when JavaScript is off so no content is ever hidden from a user. */}
      <noscript>
        <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
      </noscript>

      <NursingLanding />

      {/* Server-rendered structured data so search engines and AI crawlers read
          it without executing JavaScript. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
    </>
  );
}
