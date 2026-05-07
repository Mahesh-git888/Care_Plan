import Image from "next/image";
import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { ContactActions, FloatingContactButtons } from "@/components/contact-actions";
import {
  ArrowUpRightIcon,
  CheckIcon,
  PhoneIcon,
} from "@/components/ui-icons";
import { homeStats, verticalList, type VerticalConfig } from "@/data/verticals";

function renderHeadline(text: string, accentPhrase: string) {
  const parts = text.split(accentPhrase);

  if (parts.length === 1) {
    return text;
  }

  return (
    <>
      {parts[0]}
      <span className="text-[#0f9aa8]">{accentPhrase}</span>
      {parts[1]}
    </>
  );
}

function SectionIntro({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#0f7f89]">
        {label}
      </p>
      <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#102a31] sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-8 text-[#58737a]">{description}</p>
      ) : null}
    </div>
  );
}

export function LandingPage({ vertical }: { vertical: VerticalConfig }) {
  return (
    <main className="min-h-screen bg-[#eef5f6] text-[#102a31]">
      <FloatingContactButtons vertical={vertical} />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,154,168,0.14),_transparent_34%),linear-gradient(180deg,#eff6f7_0%,#f7fbfc_52%,#eef4f5_100%)]" />
        <div className="relative mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-10">
          <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <BrandLogo />
              <Link
                href="/"
                className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-medium text-[#33535d] shadow-sm backdrop-blur transition hover:bg-white"
              >
                Explore all care programs
              </Link>
            </div>

            <nav className="flex flex-wrap gap-2">
              {verticalList.map((item) => {
                const isActive = item.slug === vertical.slug;

                return (
                  <Link
                    key={item.slug}
                    href={`/${item.slug}`}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-[#102a31] text-white shadow-lg"
                        : "border border-white/70 bg-white/70 text-[#46636b] shadow-sm hover:bg-white"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </header>

          <div className="grid gap-12 pb-12 pt-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-16 lg:pb-16 lg:pt-14">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-[#cfe4e7] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#0f7f89] shadow-sm backdrop-blur">
                Portea {vertical.heroLabel}
              </span>
              <h1 className="mt-6 text-[3.2rem] font-semibold leading-[0.97] tracking-[-0.06em] text-[#10212d] sm:text-[4.15rem] lg:text-[5.4rem]">
                {renderHeadline(vertical.headline, vertical.accentPhrase)}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-9 text-[#557077]">
                {vertical.subheadline}
              </p>

              <div className="mt-8">
                <ContactActions vertical={vertical} />
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {vertical.quickFacts.map((fact) => (
                  <div
                    key={fact}
                    className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-3 text-sm font-medium text-[#29434b] shadow-sm ring-1 ring-[#d8e9eb] backdrop-blur"
                  >
                    <CheckIcon className="h-4 w-4 text-[#0f9aa8]" />
                    <span>{fact}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div
                className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white p-3 shadow-[0_30px_60px_-28px_rgba(16,42,49,0.22)]"
                style={{ aspectRatio: vertical.imageAspect }}
              >
                <div className="relative h-full w-full overflow-hidden rounded-[1.5rem]">
                  <Image
                    src={vertical.image.src}
                    alt={vertical.image.alt}
                    width={1400}
                    height={1040}
                    className="h-full w-full object-cover"
                    style={{ objectPosition: vertical.imagePosition }}
                    priority
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-[1.7rem] border border-[#d4e7ea] bg-white/90 p-5 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#0f7f89]">
                    Why families choose this path
                  </p>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-[#4e6970]">
                    {vertical.trustSignals.slice(0, 3).map((signal) => (
                      <li key={signal} className="flex gap-3">
                        <span className="mt-3 h-1.5 w-1.5 rounded-full bg-[#0f9aa8]" />
                        <span>{signal}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[1.7rem] border border-dashed border-[#c8d9dc] bg-[#f8fbfc] p-5 shadow-sm">
                  <p className="text-sm font-semibold text-[#102a31]">One more visual will fit here</p>
                  <p className="mt-3 text-sm leading-7 text-[#5b747a]">
                    {vertical.imageSlotLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/70 bg-white/55 backdrop-blur">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-6 sm:px-6 lg:grid-cols-4 lg:px-10">
          {homeStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[1.5rem] border border-[#d9e8ea] bg-white/85 p-5 shadow-sm"
            >
              <p className="text-2xl font-semibold tracking-[-0.04em] text-[#102a31]">
                {stat.value}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#58737a]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <SectionIntro
            label="What this care helps with"
            title="Structured support that feels reassuring, not overwhelming"
            description="The page should answer the questions families actually have when they are deciding whether to take the next step."
          />

          <div className="grid gap-4 sm:grid-cols-3">
            {vertical.highlights.map((item) => (
              <article
                key={item.title}
                className="rounded-[1.9rem] border border-[#d7e7ea] bg-white p-6 shadow-sm"
              >
                <p className="text-xl font-semibold leading-8 tracking-[-0.03em] text-[#102a31]">
                  {item.title}
                </p>
                <p className="mt-3 text-sm leading-7 text-[#58737a]">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7fbfb]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
          <SectionIntro
            label="How the first week usually works"
            title="Clear next steps, a faster start, and less chasing for the family"
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-4">
            {vertical.howItWorks.map((step) => (
              <article
                key={step.title}
                className="rounded-[1.9rem] border border-[#d8e8ea] bg-white p-6 shadow-sm"
              >
                <p className="text-lg font-semibold leading-8 tracking-[-0.03em] text-[#102a31]">
                  {step.title}
                </p>
                <p className="mt-3 text-sm leading-7 text-[#58737a]">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.98fr_1.02fr] lg:items-start">
          <div className="rounded-[2rem] border border-[#d9e8ea] bg-white p-7 shadow-sm">
            <SectionIntro
              label="When families usually reach out"
              title={vertical.forWho.title}
              description={vertical.forWho.intro}
            />
            <ul className="mt-8 space-y-4 text-sm leading-7 text-[#4e6970]">
              {vertical.forWho.items.map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckIcon className="mt-1 h-5 w-5 flex-none text-[#0f9aa8]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <div className="rounded-[2rem] border border-[#d9e8ea] bg-white p-7 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#6b7f84]">
                Another useful expectation
              </p>
              <div className="mt-5 space-y-5">
                {vertical.whatToExpect.map((step) => (
                  <div key={step.title}>
                    <p className="text-lg font-semibold tracking-[-0.03em] text-[#102a31]">
                      {step.title}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[#58737a]">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#d9e8ea] bg-[#fffaf4] p-7 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#7a5c43]">
                Not the best fit when
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-[#6e6259]">
                {vertical.notForWho.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-3 h-1.5 w-1.5 rounded-full bg-[#c38d60]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
          <SectionIntro
            label="What relief looks like"
            title="What families usually tell us once support settles in"
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {vertical.familyVoices.map((item, index) => (
              <article
                key={item.title}
                className="rounded-[1.9rem] border border-[#d9e8ea] bg-[#fbfdfd] p-6 shadow-sm"
              >
                <p className="text-xl font-semibold leading-8 tracking-[-0.03em] text-[#102a31]">
                  {item.title}
                </p>
                <p className="mt-4 text-sm leading-7 text-[#58737a]">{item.description}</p>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-[#7d9298]">
                  {index === 0
                    ? "Common feedback from daughters"
                    : index === 1
                      ? "Common feedback from spouses"
                      : "Common feedback from families coordinating remotely"}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.96fr_1.04fr] lg:items-start">
          <div className="rounded-[2rem] border border-[#d9e8ea] bg-white p-7 shadow-sm">
            <SectionIntro
              label="Frequently asked questions"
              title="The details families often want before they speak to us"
            />
            <div className="mt-8 space-y-3">
              {vertical.faqs.map((item) => (
                <details
                  key={item.question}
                  className="rounded-[1.5rem] border border-[#d9e8ea] bg-[#fbfdfd] p-4 open:bg-white"
                >
                  <summary className="cursor-pointer list-none text-base font-semibold text-[#102a31]">
                    {item.question}
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-[#58737a]">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#d7e7ea] bg-[linear-gradient(180deg,#ffffff_0%,#f2f8f9_100%)] p-7 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#0f7f89]">
              Ready to take the next step?
            </p>
            <h3 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#102a31] sm:text-4xl">
              Choose the easiest way for your family to start
            </h3>
            <p className="mt-4 text-base leading-8 text-[#58737a]">
              If the situation feels urgent, call. If you want a lighter-touch start,
              send a WhatsApp message. If you want the care manager to have the right
              context before speaking to you, use the chatbot.
            </p>

            <div className="mt-8 space-y-4">
              <ContactActions vertical={vertical} compact />
              <div className="rounded-[1.6rem] border border-[#dbe8ea] bg-white/90 p-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-[#102a31]">
                  <PhoneIcon className="h-4 w-4 text-[#0f7f89]" />
                  Portea bookings and service queries
                </p>
                <p className="mt-2 text-sm leading-7 text-[#58737a]">
                  The public bookings line is available for families who want to talk
                  through the situation before starting the care plan conversation.
                </p>
                <a
                  href="https://www.portea.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0f7f89] transition hover:text-[#0b6972]"
                >
                  See official Portea information
                  <ArrowUpRightIcon className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
