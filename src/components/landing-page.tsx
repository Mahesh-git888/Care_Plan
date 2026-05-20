import Image from "next/image";
import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { ContactActions, FloatingContactButtons } from "@/components/contact-actions";
import { DoctorsSection } from "@/components/doctors-section";
import { HandwrittenNote } from "@/components/handwritten-note";
import { IntakeChatbot } from "@/components/intake-chatbot";
import { LeadForm } from "@/components/lead-form";
import { MobileMenu } from "@/components/mobile-menu";
import {
  CheckIcon,
  ClockIcon,
  HeartIcon,
  PhoneIcon,
  QuoteIcon,
  ShieldIcon,
  StarIcon,
  StethoscopeIcon,
} from "@/components/ui-icons";
import { StatsStrip } from "@/components/stats-strip";
import { verticalList, type VerticalConfig } from "@/data/verticals";
import { getPhoneContact, getWhatsAppContact } from "@/lib/contact";

// In-page sections a visitor can jump to from the mobile hamburger menu.
const VERTICAL_NAV_LINKS = [
  { href: "#trust", label: "Why Portea" },
  { href: "#who-its-for", label: "Who it's for" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#reviews", label: "Reviews" },
  { href: "#doctors", label: "Our doctors" },
  { href: "#faq", label: "FAQs" },
  { href: "/", label: "All care programs" },
];

function renderHeadline(text: string, accentPhrase: string) {
  const parts = text.split(accentPhrase);
  if (parts.length === 1) return text;
  return (
    <>
      {parts[0]}
      <span className="text-[#ff5b2e]">{accentPhrase}</span>
      {parts[1]}
    </>
  );
}

function SectionIntro({
  label,
  title,
  description,
  align = "left",
}: {
  label: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`${align === "center" ? "mx-auto text-center" : ""} max-w-3xl`}>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0b7c87]">
        {label}
      </p>
      <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#10242b] sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base font-medium leading-8 text-[#445d66]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function Stars() {
  return (
    <div className="flex items-center gap-0.5 text-[#ff9a3c]" aria-label="5 out of 5 stars">
      {[0, 1, 2, 3, 4].map((i) => (
        <StarIcon key={i} className="h-4 w-4" />
      ))}
    </div>
  );
}

export function LandingPage({ vertical }: { vertical: VerticalConfig }) {
  const [primaryImage, secondaryImage] = vertical.images;
  const phone = getPhoneContact();
  const whatsapp = getWhatsAppContact(vertical.whatsAppMessage);

  return (
    <main className="min-h-screen bg-[#f4f9fa] pb-24 text-[#10242b]">
      {/* Chatbot modal mounted once for the entire page. All trigger buttons
          and the lead form dispatch a window event that this instance handles. */}
      <IntakeChatbot vertical={vertical} />
      {/* Announcement bar */}
      <div className="gradient-banner text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-2 text-xs font-semibold sm:px-6 lg:px-10">
          <p className="truncate">
            Doctor-designed home care · One care manager per family · 40+ Indian cities
          </p>
          <a href={phone.href} className="hidden items-center gap-2 sm:inline-flex">
            <PhoneIcon className="h-3.5 w-3.5" />
            <span>{phone.label}</span>
          </a>
        </div>
      </div>

      <FloatingContactButtons vertical={vertical} />

      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-10">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BrandLogo />
              <Link
                href="/"
                className="hidden rounded-full border border-white/80 bg-white/90 px-4 py-2 text-sm font-semibold text-[#28424a] shadow-sm transition hover:bg-white lg:inline-flex"
              >
                ← All programs
              </Link>
            </div>

            <nav
              className="hidden flex-wrap items-center gap-2 text-sm lg:flex"
              aria-label="Care programs"
            >
              {verticalList.map((item) => {
                const isActive = item.slug === vertical.slug;
                return (
                  <Link
                    key={item.slug}
                    href={`/${item.slug}`}
                    aria-current={isActive ? "page" : undefined}
                    className={`rounded-full px-4 py-2 font-semibold transition ${
                      isActive
                        ? "border border-[#0f9aa8] bg-white text-[#0b7c87] shadow-sm"
                        : "border border-[#cfe1e3] bg-transparent text-[#4a646c] hover:border-[#0f9aa8] hover:text-[#0b7c87]"
                    }`}
                  >
                    {item.shortName}
                  </Link>
                );
              })}
              <a
                href="#callback"
                className="ml-2 hidden items-center gap-2 rounded-full bg-[#0f9aa8] px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-[#0b7c87] lg:inline-flex"
              >
                <PhoneIcon className="h-4 w-4" />
                <span>Talk to care manager</span>
              </a>
            </nav>

            <MobileMenu
              links={VERTICAL_NAV_LINKS}
              phoneHref={phone.href}
              phoneLabel={phone.label}
              whatsappHref={whatsapp?.href}
            />
          </header>

          {/* Hero */}
          <div className="grid gap-10 pb-14 pt-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-14 lg:pb-20 lg:pt-14">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#cae2e5] bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#0b7c87] shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0f9aa8]" />
                Portea · {vertical.heroLabel}
              </span>
              <h1 className="mt-5 text-[2.7rem] font-semibold leading-[1] tracking-[-0.055em] text-[#0f2028] sm:text-[3.4rem] lg:text-[4.4rem]">
                {renderHeadline(vertical.headline, vertical.accentPhrase)}
              </h1>
              <p className="mt-5 max-w-2xl text-lg font-medium leading-9 text-[#445d66]">
                {vertical.subheadline}
              </p>

              <div className="mt-7">
                <ContactActions vertical={vertical} />
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                {vertical.quickFacts.map((fact) => (
                  <div
                    key={fact}
                    className="inline-flex items-center gap-2 rounded-full border border-[#d7e8ea] bg-white/90 px-4 py-2.5 text-sm font-semibold text-[#29424a] shadow-sm"
                  >
                    <CheckIcon className="h-4 w-4 text-[#0f9aa8]" />
                    <span>{fact}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div
                className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white p-3 shadow-[0_30px_60px_-28px_rgba(16,42,49,0.22)]"
                style={{ aspectRatio: primaryImage.aspect }}
              >
                <div className="relative h-full w-full overflow-hidden rounded-[1.55rem]">
                  <Image
                    src={primaryImage.src}
                    alt={primaryImage.alt}
                    width={1400}
                    height={980}
                    className="h-full w-full object-cover"
                    style={{ objectPosition: primaryImage.position ?? "center center" }}
                    priority
                  />
                </div>
              </div>
              <div id="callback" className="scroll-mt-24">
                <LeadForm vertical={vertical} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <StatsStrip />

      {/* Trust badges. Designed by doctors. */}
      <section id="trust" className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0b7c87]">
            Why Portea
          </p>
          <h2 className="mt-3 text-2xl font-semibold leading-snug tracking-[-0.03em] text-[#10242b] sm:text-[1.75rem]">
            Built for families who need not just a service, but end to end support. Our care
            managers will help you navigate your family&apos;s condition, work with our doctors
            to build your custom protocol, and coordinate your services.
          </h2>
        </div>
        <div
          className={`mt-10 grid gap-4 sm:grid-cols-2 ${
            vertical.trustBadges.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
          }`}
        >
          {vertical.trustBadges.map((badge, idx) => {
            const icons = [StethoscopeIcon, ShieldIcon, HeartIcon, ClockIcon];
            const Icon = icons[idx % icons.length];
            return (
              <article
                key={badge.title}
                className="group rounded-[1.7rem] border border-[#d7e7ea] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff1ec] text-[#ff5b2e]">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-base font-semibold leading-7 tracking-[-0.02em] text-[#10242b]">
                  {badge.title}
                </p>
                <p className="mt-2 text-sm font-medium leading-6 text-[#455e67]">
                  {badge.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Who this is for / not for */}
      <section id="who-its-for" className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
          <div className="flex flex-col rounded-[2rem] border border-[#cfe4d6] bg-[#f3fbf6] p-7 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1a7a4f]">
              Who this is for
            </p>
            <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.04em] text-[#0f2a1c] sm:text-3xl">
              {vertical.forWho.title}
            </h3>
            <p className="mt-4 text-base font-medium leading-7 text-[#36584a]">
              {vertical.forWho.intro}
            </p>
            <ul className="mt-6 space-y-3 text-sm font-medium leading-7 text-[#2c4f3e]">
              {vertical.forWho.items.map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckIcon className="mt-1 h-5 w-5 flex-none text-[#1a7a4f]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col rounded-[2rem] border border-[#e6cdb7] bg-[#fffaf2] p-7 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a66a35]">
              Who this isn&apos;t for
            </p>
            <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.04em] text-[#2d2620] sm:text-3xl">
              {vertical.notForWho.title}
            </h3>
            <p className="mt-4 text-base font-medium leading-7 text-[#68584c]">
              {vertical.notForWho.intro}
            </p>
            <ul className="mt-6 space-y-3 text-sm font-medium leading-7 text-[#68584c]">
              {vertical.notForWho.items.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-3 h-1.5 w-1.5 flex-none rounded-full bg-[#c48e63]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-[#f7fbfb]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
          <SectionIntro
            label="How it works"
            title="A simple, four-step path from inquiry to care"
            description="The same four steps for every family. Every care manager runs this flow, every time, in this order."
          />

          <div className="mt-10 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            {/* A real photo of care at home, beside the process */}
            <div
              className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white p-3 shadow-[0_30px_60px_-28px_rgba(16,42,49,0.22)]"
              style={{ aspectRatio: secondaryImage.aspect }}
            >
              <div className="relative h-full w-full overflow-hidden rounded-[1.6rem]">
                <Image
                  src={secondaryImage.src}
                  alt={secondaryImage.alt}
                  width={1200}
                  height={1200}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: secondaryImage.position ?? "center center" }}
                />
              </div>
            </div>

            <ol className="grid gap-4 pt-2 sm:grid-cols-2">
              {vertical.howItWorks.map((step, idx) => (
                <li
                  key={step.title}
                  className="relative rounded-[1.9rem] border border-[#d8e8ea] bg-white p-6 shadow-sm"
                >
                  <span
                    className="absolute -top-4 left-6 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#ff5b2e] text-sm font-bold text-white shadow-md"
                    aria-hidden="true"
                  >
                    {idx + 1}
                  </span>
                  <p className="mt-4 text-base font-semibold leading-7 tracking-[-0.03em] text-[#10242b]">
                    {step.title}
                  </p>
                  <p className="mt-3 text-sm font-medium leading-7 text-[#455e67]">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-10 rounded-[1.9rem] border border-[#d8e8ea] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0b7c87]">
                  Three easy ways to begin
                </p>
                <h3 className="mt-2 text-2xl font-semibold leading-tight tracking-[-0.03em] text-[#10242b]">
                  Chat with our care assistant, call us, or send a WhatsApp
                </h3>
              </div>
              <ContactActions vertical={vertical} compact />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials. Real notes from real families. */}
      <section id="reviews" className="bg-[#fdf8f3]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
          <SectionIntro
            label="Real families. Real notes."
            title="The notes that mean the most are the ones we don't ask for"
            description="A small selection of what families have shared with Portea care managers. Names changed on request; one note is reproduced verbatim from the handwritten letter we received."
            align="center"
          />

          <div className="mt-12 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="flex flex-col items-center justify-center">
              <HandwrittenNote note={vertical.appreciationNote} />
            </div>

            <div className="space-y-5">
              {vertical.testimonials.map((t) => (
                <article
                  key={t.author}
                  className="rounded-[1.9rem] border border-[#e9d9c1] bg-white p-6 shadow-sm"
                >
                  <QuoteIcon className="h-6 w-6 text-[#ff9a3c]" />
                  <p className="mt-3 text-base leading-7 text-[#3a2c14]">“{t.quote}”</p>
                  <div className="mt-5 flex items-center justify-between border-t border-[#f1e2c8] pt-4">
                    <div>
                      <p className="text-sm font-semibold text-[#10242b]">{t.author}</p>
                      <p className="text-xs text-[#7a5e3a]">{t.context}</p>
                    </div>
                    <Stars />
                  </div>
                </article>
              ))}

              <div className="rounded-[1.9rem] border border-dashed border-[#e1cda4] bg-white/60 p-6 text-sm text-[#7a5e3a]">
                <p className="font-semibold text-[#5a4724]">A note on these reviews</p>
                <p className="mt-2 leading-6">
                  We never invent quotes. Every testimonial here is from a real Portea
                  family, including the handwritten note received by Dr. Kavitha&apos;s
                  team. We collect feedback at week one, at month one, and on
                  offboarding.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <DoctorsSection verticalLabel={vertical.shortName} />

      {/* FAQ + final CTA */}
      <section id="faq" className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.96fr_1.04fr] lg:items-start">
          <div className="rounded-[2rem] border border-[#d9e8ea] bg-white p-7 shadow-sm">
            <SectionIntro
              label="Frequently asked questions"
              title="The questions families usually ask before reaching out"
            />
            <div className="mt-8 space-y-3">
              {vertical.faqs.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-[1.5rem] border border-[#d9e8ea] bg-[#fbfdfd] p-4 open:bg-white"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-semibold text-[#10242b]">
                    <span>{item.question}</span>
                    <span
                      aria-hidden="true"
                      className="ml-3 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full border border-[#cfe1e3] text-[#0f9aa8] transition group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm font-medium leading-7 text-[#455e67]">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-[#d7e7ea] bg-[linear-gradient(180deg,#fffdf9_0%,#f2f8f9_100%)] p-7 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0b7c87]">
              Ready when you are
            </p>
            <h3 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#10242b] sm:text-4xl">
              Choose the easiest way to begin
            </h3>
            <p className="mt-4 text-base font-medium leading-8 text-[#445d66]">
              Call if you want to speak right away. Message us on WhatsApp if that's
              easier. Or use the chatbot, 90 seconds, and your care manager will
              know your situation before they pick up the phone.
            </p>

            <div className="mt-7">
              <ContactActions vertical={vertical} compact />
            </div>

            <div className="mt-7 rounded-[1.5rem] border border-[#d7e7ea] bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0b7c87]">
                Speak with a care manager
              </p>
              <p className="mt-2 text-base font-medium text-[#10242b]">
                Active inquiries get a call within{" "}
                <span className="font-semibold text-[#ff5b2e]">12 hours</span>. Planning
                ahead? Within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#10242b] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-6 lg:grid-cols-[1.1fr_1fr_1fr] lg:px-10">
          <div>
            <BrandLogo />
            <p className="mt-4 max-w-md text-sm leading-7 text-white/70">
              Portea is India&apos;s largest organised home healthcare provider, with doctor-led
              elder care, dementia care and post-hospital recovery in 40+ cities.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
              Programs
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {verticalList.map((v) => (
                <li key={v.slug}>
                  <Link href={`/${v.slug}`} className="hover:text-white/80">
                    {v.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
              Reach us
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href={phone.href} className="inline-flex items-center gap-2 hover:text-white/80">
                  <PhoneIcon className="h-4 w-4" />
                  <span>{phone.label}</span>
                </a>
              </li>
              <li className="text-white/70">Mon to Sat, 8:00 AM to 8:00 PM IST</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-5 py-5 text-xs text-white/60 sm:flex-row sm:px-6 lg:px-10">
            <p>© {new Date().getFullYear()} Portea Medical. All rights reserved.</p>
            <p>Doctor-designed, dementia-trained, family-trusted.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
