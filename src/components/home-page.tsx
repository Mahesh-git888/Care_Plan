import Image from "next/image";
import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { DoctorsSection } from "@/components/doctors-section";
import { HandwrittenNote } from "@/components/handwritten-note";
import {
  ArrowUpRightIcon,
  CheckIcon,
  ClockIcon,
  HeartIcon,
  PhoneIcon,
  ShieldIcon,
  StethoscopeIcon,
  WhatsAppIcon,
} from "@/components/ui-icons";
import { StatsStrip } from "@/components/stats-strip";
import { homeTrustBadges, verticalList } from "@/data/verticals";
import { getPhoneContact, getWhatsAppContact } from "@/lib/contact";

export function HomePage() {
  const [elderCare, dementiaCare, postDischargeCare] = verticalList;
  const phone = getPhoneContact();
  const whatsapp = getWhatsAppContact(
    "Hi Portea, I'd like to learn about home care for my family.",
  );

  return (
    <main className="min-h-screen bg-[#f4f9fa] pb-20 text-[#10242b]">
      {/* Announcement bar */}
      <div className="gradient-banner text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-2 text-xs font-semibold sm:px-6 lg:px-10">
          <p className="truncate">
            Doctor-designed home care · Trained by Dementia India Alliance · 40+ Indian cities
          </p>
          <a href={phone.href} className="hidden items-center gap-2 sm:inline-flex">
            <PhoneIcon className="h-3.5 w-3.5" />
            <span>{phone.label}</span>
          </a>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-10">
          <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <BrandLogo />
            <nav className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[#4b656d]" aria-label="Primary">
              <a href="#programs" className="transition hover:text-[#10242b]">
                Care programs
              </a>
              <a href="#why-portea" className="transition hover:text-[#10242b]">
                Why Portea
              </a>
              <a href="#how-it-works" className="transition hover:text-[#10242b]">
                How it works
              </a>
              <a href="#reviews" className="transition hover:text-[#10242b]">
                Reviews
              </a>
              <a
                href={phone.href}
                data-track="call"
                className="inline-flex items-center gap-2 rounded-full bg-[#0f9aa8] px-4 py-2 text-white shadow-sm transition hover:bg-[#0b7c87]"
              >
                <PhoneIcon className="h-4 w-4" />
                <span>{phone.label}</span>
              </a>
            </nav>
          </header>

          <div className="grid gap-10 pb-14 pt-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-16 lg:pb-20 lg:pt-14">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#cfe4e7] bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#0b7c87] shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0f9aa8]" />
                Portea managed home care
              </span>
              <h1 className="mt-5 text-[2.7rem] font-semibold leading-[1] tracking-[-0.055em] text-[#0f2028] sm:text-[3.4rem] lg:text-[4.4rem]">
                Home care your family can actually <span className="text-[#ff5b2e]">trust</span>.
              </h1>
              <p className="mt-5 max-w-2xl text-lg font-medium leading-9 text-[#445d66]">
                Daily elder care, specialist dementia care, or recovery after a hospital stay.
                Doctor-designed plans, trained caregivers, and one care manager who stays with
                your family from the first call onward.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/elder-care"
                  className="inline-flex items-center gap-2 rounded-full bg-[#ff5b2e] px-6 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_-22px_rgba(255,91,46,0.95)] transition hover:bg-[#ec4e22]"
                >
                  Explore care programs
                  <ArrowUpRightIcon className="h-4 w-4" />
                </Link>
                <a
                  href={phone.href}
                  className="inline-flex items-center gap-2 rounded-full border border-[#c8dde0] bg-white px-6 py-4 text-sm font-semibold text-[#0f2d36] transition hover:border-[#8db9bf] hover:bg-[#f7fbfb]"
                >
                  <PhoneIcon className="h-4 w-4" />
                  Call {phone.label}
                </a>
                {whatsapp ? (
                  <a
                    href={whatsapp.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 rounded-full bg-[#1abc5b] px-6 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_-22px_rgba(26,188,91,0.85)] transition hover:bg-[#149c4b]"
                  >
                    <WhatsAppIcon className="h-4 w-4 text-white" />
                    WhatsApp us
                  </a>
                ) : null}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e8ea] bg-white/90 px-4 py-2.5 text-sm font-semibold text-[#29424a] shadow-sm">
                  <CheckIcon className="h-4 w-4 text-[#0f9aa8]" />
                  <span>Designed by doctors</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e8ea] bg-white/90 px-4 py-2.5 text-sm font-semibold text-[#29424a] shadow-sm">
                  <CheckIcon className="h-4 w-4 text-[#0f9aa8]" />
                  <span>Trained by Dementia India Alliance</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e8ea] bg-white/90 px-4 py-2.5 text-sm font-semibold text-[#29424a] shadow-sm">
                  <CheckIcon className="h-4 w-4 text-[#0f9aa8]" />
                  <span>One care manager per family</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white p-3 shadow-[0_30px_60px_-28px_rgba(16,42,49,0.22)]">
                <div className="relative aspect-[16/11] overflow-hidden rounded-[1.5rem]">
                  <Image
                    src={elderCare.images[0].src}
                    alt={elderCare.images[0].alt}
                    width={1400}
                    height={980}
                    className="h-full w-full object-cover"
                    style={{ objectPosition: elderCare.images[0].position ?? "center center" }}
                    priority
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.7rem] border border-[#d7e7ea] bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0b7c87]">
                    One family, one plan
                  </p>
                  <p className="mt-3 text-sm font-medium leading-6 text-[#455e67]">
                    A single doctor-led care manager keeps every part of care moving. No
                    bouncing between agents.
                  </p>
                </div>
                <div className="rounded-[1.7rem] border border-[#d7e7ea] bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0b7c87]">
                    Updates families actually use
                  </p>
                  <p className="mt-3 text-sm font-medium leading-6 text-[#455e67]">
                    Structured WhatsApp updates 2× a week, weekly CM call, monthly plan review.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <StatsStrip />

      {/* Programs */}
      <section id="programs" className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0b7c87]">
            Care programs
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#10242b] sm:text-4xl">
            Choose the care path that fits your family today
          </h2>
          <p className="mt-4 text-base font-medium leading-8 text-[#445d66]">
            Each program has its own page so families can read, compare, and reach out in the
            way that feels most comfortable.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {verticalList.map((vertical) => (
            <article
              key={vertical.slug}
              className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-[#d7e7ea] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_28px_60px_-30px_rgba(16,42,49,0.24)]"
            >
              <div className="relative aspect-[16/11] overflow-hidden">
                <Image
                  src={vertical.images[0].src}
                  alt={vertical.images[0].alt}
                  width={1200}
                  height={825}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  style={{ objectPosition: vertical.images[0].position ?? "center center" }}
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0b7c87]">
                  {vertical.heroLabel}
                </p>
                <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.03em] text-[#10242b]">
                  {vertical.name}
                </h3>
                <p className="mt-3 text-sm font-medium leading-7 text-[#455e67]">
                  {vertical.overview}
                </p>
                <ul className="mt-5 space-y-2 text-sm font-medium leading-7 text-[#455e67]">
                  {vertical.quickFacts.slice(0, 3).map((fact) => (
                    <li key={fact} className="flex gap-3">
                      <CheckIcon className="mt-1 h-4 w-4 flex-none text-[#0f9aa8]" />
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/${vertical.slug}`}
                  className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-[#ff5b2e] transition hover:text-[#ec4e22]"
                >
                  <span>Learn more about {vertical.shortName}</span>
                  <ArrowUpRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Why Portea — trust signals */}
      <section id="why-portea" className="bg-[#f7fbfb]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0b7c87]">
              Why Portea
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#10242b] sm:text-4xl">
              Doctors design the plan. The Dementia India Alliance trains the caregivers. Your CM stays the same person.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {homeTrustBadges.map((badge, idx) => {
              const icons = [StethoscopeIcon, ShieldIcon, HeartIcon, ClockIcon];
              const Icon = icons[idx % icons.length];
              return (
                <article
                  key={badge.title}
                  className="rounded-[1.7rem] border border-[#d7e7ea] bg-white p-6 shadow-sm"
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
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0b7c87]">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#10242b] sm:text-4xl">
            A simple, four-step path from inquiry to care at home
          </h2>
          <p className="mt-4 text-base font-medium leading-8 text-[#445d66]">
            Same SOP for every family. Same care, whether you live in Bangalore or your parents
            do and you live in New Jersey.
          </p>
        </div>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Tell us what's happening",
              description:
                "Use the chatbot, WhatsApp, or call us. Share 6 basics so we don't waste your time on the first call.",
            },
            {
              title: "Discovery call within 4 hours",
              description:
                "An MBBS doctor or senior clinician calls you for a 15–30 min discovery and triage conversation.",
            },
            {
              title: "Personalised care plan",
              description:
                "Same-day written plan on WhatsApp covering daily schedule, care team, equipment and itemised weekly price.",
            },
            {
              title: "Care begins with weekly updates",
              description:
                "Trained caregiver placed. Structured WhatsApp updates twice a week, weekly CM call, monthly review.",
            },
          ].map((step, idx) => (
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
      </section>

      <DoctorsSection />

      {/* Real review */}
      <section id="reviews" className="bg-[#fdf8f3]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a66a35]">
                A real note from a real family
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#3a2c14] sm:text-4xl">
                The notes that mean the most are the ones we don&apos;t ask for.
              </h2>
              <p className="mt-4 text-base font-medium leading-8 text-[#5c4a2c]">
                This handwritten note was received by Dr. Kavitha and the Portea team from a
                family whose mother spent her last months in our care. We&apos;re reproducing it
                verbatim, with permission.
              </p>

              <div className="mt-7 grid gap-3">
                <div className="rounded-[1.5rem] border border-[#e9d9c1] bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-[#5a4724]">What we promise every family</p>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-[#3a2c14]">
                    <li className="flex gap-3">
                      <CheckIcon className="mt-1 h-4 w-4 flex-none text-[#ff5b2e]" />
                      A care manager who stays with you through every change.
                    </li>
                    <li className="flex gap-3">
                      <CheckIcon className="mt-1 h-4 w-4 flex-none text-[#ff5b2e]" />
                      Caregivers who treat your elder like their own family.
                    </li>
                    <li className="flex gap-3">
                      <CheckIcon className="mt-1 h-4 w-4 flex-none text-[#ff5b2e]" />
                      A plan that actually adjusts as life at home changes.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <HandwrittenNote />
            </div>
          </div>
        </div>
      </section>

      {/* Three programs CTA strip */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-[1.9rem] border border-[#d7e7ea] bg-[#fbfdfd] p-6 shadow-sm">
              <div className="relative aspect-[16/11] overflow-hidden rounded-[1.4rem]">
                <Image
                  src={dementiaCare.images[0].src}
                  alt={dementiaCare.images[0].alt}
                  width={1200}
                  height={825}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: dementiaCare.images[0].position ?? "center center" }}
                />
              </div>
              <p className="mt-5 text-lg font-semibold tracking-[-0.03em] text-[#10242b]">
                Dementia care that brings calm
              </p>
              <p className="mt-3 text-sm font-medium leading-7 text-[#455e67]">
                Caregivers trained on dementia routines. Pre-placement scoring for every match.
                Doctor-reviewed plan.
              </p>
              <Link
                href="/dementia"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#ff5b2e] hover:text-[#ec4e22]"
              >
                Explore dementia care <ArrowUpRightIcon className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-[1.9rem] border border-[#d7e7ea] bg-[#fbfdfd] p-6 shadow-sm">
              <div className="relative aspect-[16/11] overflow-hidden rounded-[1.4rem]">
                <Image
                  src={postDischargeCare.images[0].src}
                  alt={postDischargeCare.images[0].alt}
                  width={1200}
                  height={825}
                  className="h-full w-full object-cover"
                  style={{
                    objectPosition: postDischargeCare.images[0].position ?? "center center",
                  }}
                />
              </div>
              <p className="mt-5 text-lg font-semibold tracking-[-0.03em] text-[#10242b]">
                Recovery after hospital discharge
              </p>
              <p className="mt-3 text-sm font-medium leading-7 text-[#455e67]">
                Nurse, caregiver, physio and equipment under one plan. Daily updates through the
                first week home.
              </p>
              <Link
                href="/post-discharge"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#ff5b2e] hover:text-[#ec4e22]"
              >
                Explore recovery care <ArrowUpRightIcon className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-[1.9rem] border border-[#d7e7ea] bg-[#fbfdfd] p-6 shadow-sm">
              <div className="relative aspect-[16/11] overflow-hidden rounded-[1.4rem]">
                <Image
                  src={elderCare.images[1].src}
                  alt={elderCare.images[1].alt}
                  width={900}
                  height={1125}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: elderCare.images[1].position ?? "center center" }}
                />
              </div>
              <p className="mt-5 text-lg font-semibold tracking-[-0.03em] text-[#10242b]">
                Three easy ways to reach out
              </p>
              <p className="mt-3 text-sm font-medium leading-7 text-[#455e67]">
                Chat with our care assistant, call us on a toll-free number, or send a WhatsApp.
                Same care manager, whichever path you choose.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <a
                  href={phone.href}
                  data-track="call"
                  className="inline-flex items-center gap-2 rounded-full bg-[#0f9aa8] px-4 py-2 text-xs font-semibold text-white"
                >
                  <PhoneIcon className="h-3.5 w-3.5" />
                  {phone.label}
                </a>
                {whatsapp ? (
                  <a
                    href={whatsapp.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 rounded-full bg-[#1abc5b] px-4 py-2 text-xs font-semibold text-white"
                  >
                    <WhatsAppIcon className="h-3.5 w-3.5" />
                    WhatsApp
                  </a>
                ) : null}
              </div>
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
              {whatsapp ? (
                <li>
                  <a
                    href={whatsapp.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 hover:text-white/80"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    <span>WhatsApp a care manager</span>
                  </a>
                </li>
              ) : null}
              <li className="text-white/70">Mon–Sat · 8:00 AM – 8:00 PM IST</li>
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
