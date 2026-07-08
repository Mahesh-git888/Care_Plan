import type { Metadata } from "next";

import type { VerticalConfig } from "@/data/verticals";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://care.portea.com";

export function buildVerticalMetadata(vertical: VerticalConfig): Metadata {
  const path = `/${vertical.slug}`;
  const url = `${SITE_URL}${path}`;
  const ogImage = vertical.images[0]?.src ?? "/elder-care-1.webp";

  return {
    title: vertical.metaTitle,
    description: vertical.metaDescription,
    keywords: vertical.keywords,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url,
      siteName: "Portea",
      title: vertical.metaTitle,
      description: vertical.metaDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: vertical.images[0]?.alt ?? vertical.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: vertical.metaTitle,
      description: vertical.metaDescription,
      images: [ogImage],
    },
  };
}

export function serviceLd(vertical: VerticalConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: `Portea ${vertical.name}`,
    description: vertical.metaDescription,
    url: `${SITE_URL}/${vertical.slug}`,
    telephone: "+91-1800-121-2323",
    areaServed: "IN",
    medicalSpecialty: ["Geriatrics", "Home Care", "Rehabilitation"],
    serviceType: vertical.name,
    provider: {
      "@type": "Organization",
      name: "Portea Medical",
      url: SITE_URL,
      logo: `${SITE_URL}/portea-logo.svg`,
    },
  };
}

export function faqLd(vertical: VerticalConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: vertical.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function breadcrumbLd(vertical: VerticalConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: vertical.name,
        item: `${SITE_URL}/${vertical.slug}`,
      },
    ],
  };
}
