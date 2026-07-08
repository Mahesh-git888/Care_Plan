import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { BrandLogo } from "@/components/brand-logo";
import { getPhoneContact, getWhatsAppContact } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Elder Care Cost and Pricing in India",
  description:
    "Portea managed care is ₹1,999/month for a dedicated care manager and two doctor consults. Caregivers, clinical services and equipment are billed as per your care plan.",
  keywords: [
    "elder care cost India",
    "elder care price",
    "home care charges",
    "care manager cost",
    "Portea pricing",
  ],
  alternates: { canonical: "/pricing" },
};

const INCLUDED = [
  "A dedicated care manager who knows your parent's case",
  "A home assessment and a personalised, doctor-designed care plan",
  "Two doctor consultations every month",
  "Coordinating and scheduling every service your parent needs",
  "Training your caregivers on your parent's specific condition",
  "Weekly WhatsApp updates to your family",
];

const SEPARATE = [
  {
    name: "Caregivers and nursing",
    note: "Charged by shift or by month, only when your care plan needs them.",
  },
  {
    name: "Doctor and specialist visits",
    note: "Beyond the two monthly consults already included in care management.",
  },
  {
    name: "Physiotherapy, labs and equipment",
    note: "Recommended in your care plan and billed as they are used.",
  },
];

const PRICING_FAQS = [
  {
    q: "How much does Portea elder care cost?",
    a: "Care management is ₹1,999 per month. That covers your dedicated care manager, the home assessment, a personalised care plan, two doctor consultations a month, coordination of all services, caregiver training and weekly family updates. Clinical services, caregivers and equipment are recommended in your care plan and billed separately, so you only pay for what your parent actually needs.",
  },
  {
    q: "Are caregivers and clinical services included in the ₹1,999?",
    a: "No. The monthly fee is for care management. Caregivers, nursing, doctor visits beyond the two included consults, physiotherapy, lab tests and equipment are billed as per your care plan. Your care manager walks you through every cost before anything is arranged.",
  },
  {
    q: "Is there a lock-in or a long contract?",
    a: "No lock-in. Care management is month to month and clinical services follow your care plan. You can adjust, pause or stop care at the end of any week.",
  },
  {
    q: "Do you share pricing before we commit?",
    a: "Yes. Your care manager shares the full plan and its costs upfront, so there are no surprises. You approve the plan before any service is booked.",
  },
];

export default function PricingPage() {
  const phone = getPhoneContact();
  const wa = getWhatsAppContact();

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PRICING_FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main className="bg-[#faf6f1] text-[#10242b]">
      <header className="sticky top-0 z-40 border-b border-[#eadfce] bg-[#faf6f1]/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3 sm:px-6">
          <Link href="/" aria-label="Portea home">
            <BrandLogo />
          </Link>
          <a
            href={phone.href}
            className="rounded-full bg-[#0f9aa8] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0b7c87]"
          >
            Call {phone.label}
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-14 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0b7c87]">
          Simple, upfront pricing
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
          Elder care pricing, made clear
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-[#455e67]">
          One monthly fee for care management. Everything else follows your parent&apos;s
          care plan and is billed only as it is used, so you always know what you are
          paying for.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          {/* Price card */}
          <div className="rounded-[1.8rem] border border-[#e2d8c8] bg-white p-7 shadow-[0_24px_50px_-30px_rgba(16,42,49,0.25)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7a8c92]">
              Care management
            </p>
            <p className="mt-3 text-5xl font-semibold tracking-[-0.04em]">
              ₹1,999
              <span className="text-xl font-medium text-[#54727a]">/month</span>
            </p>
            <p className="mt-3 text-sm leading-7 text-[#455e67]">
              For the person who runs your parent&apos;s whole care, so your family
              manages one relationship instead of five.
            </p>
            <ul className="mt-6 space-y-2.5">
              {INCLUDED.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-[#10242b]">
                  <span className="mt-0.5 flex-none text-[#0f9aa8]">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
              <Link
                href="/#callback"
                className="flex-1 rounded-full bg-[#0f9aa8] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#0b7c87]"
              >
                Talk to a care manager
              </Link>
              <a
                href={wa.href}
                className="flex-1 rounded-full border border-[#cfe3e6] bg-white px-5 py-3 text-center text-sm font-semibold text-[#0b7c87] transition hover:bg-[#f2fafb]"
              >
                WhatsApp us
              </a>
            </div>
          </div>

          {/* Billed separately */}
          <div className="rounded-[1.8rem] border border-[#e2d8c8] bg-[#f4ecdf] p-7">
            <h2 className="text-lg font-semibold tracking-[-0.02em]">
              Billed separately, as your plan needs
            </h2>
            <p className="mt-2 text-sm leading-7 text-[#455e67]">
              Clinical care is recommended in your care plan and billed as used. You
              only pay for what your parent actually needs.
            </p>
            <ul className="mt-5 space-y-4">
              {SEPARATE.map((s) => (
                <li key={s.name} className="rounded-2xl bg-white/70 p-4">
                  <p className="text-sm font-semibold text-[#10242b]">{s.name}</p>
                  <p className="mt-1 text-sm leading-6 text-[#54727a]">{s.note}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-14">
          <h2 className="text-2xl font-semibold tracking-[-0.03em]">Pricing questions</h2>
          <div className="mt-5 divide-y divide-[#e6dccb] rounded-[1.5rem] border border-[#e2d8c8] bg-white">
            {PRICING_FAQS.map((f) => (
              <details key={f.q} className="group px-6 py-4">
                <summary className="cursor-pointer list-none text-base font-semibold text-[#10242b]">
                  {f.q}
                </summary>
                <p className="mt-2 text-sm leading-7 text-[#455e67]">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[#eadfce] bg-[#10242b] text-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-white/70">
            Doctor-led home care, trusted by families across 135+ Indian cities.
          </p>
          <div className="flex gap-4">
            <Link href="/" className="text-white/80 hover:text-white">
              Home
            </Link>
            <a href={phone.href} className="text-white/80 hover:text-white">
              Call {phone.label}
            </a>
          </div>
        </div>
      </footer>

      <Script
        id="ld-pricing-faq"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
    </main>
  );
}
