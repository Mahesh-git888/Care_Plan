import Image from "next/image";
import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { ContactActions } from "@/components/contact-actions";
import { verticalList, type VerticalConfig } from "@/data/verticals";

function SectionHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0b5c56]">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">
        {title}
      </h2>
      {intro ? (
        <p className="mt-4 text-base leading-8 text-slate-600">{intro}</p>
      ) : null}
    </div>
  );
}

export function LandingPage({ vertical }: { vertical: VerticalConfig }) {
  return (
    <main className="min-h-screen bg-[#f7fbfb] text-slate-900">
      <section className="relative overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${vertical.theme.background}`}
          aria-hidden="true"
        />
        <div
          className="absolute left-[-10rem] top-[-8rem] h-72 w-72 rounded-full blur-3xl"
          style={{ backgroundColor: vertical.theme.tint }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-[-8rem] right-[-8rem] h-80 w-80 rounded-full bg-white/70 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-10">
          <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <BrandLogo />
              <Link
                href="/"
                className="rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white"
              >
                All care programs
              </Link>
            </div>

            <nav className="flex flex-wrap gap-2">
              {verticalList.map((item) => {
                const isActive = item.slug === vertical.slug;

                return (
                  <Link
                    key={item.slug}
                    href={`/${item.slug}`}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? `border-transparent text-white shadow-lg ${item.theme.accent}`
                        : "border-white/80 bg-white/70 text-slate-700 hover:bg-white"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </header>

          <div className="grid gap-10 py-12 lg:grid-cols-[1.03fr_0.97fr] lg:items-center lg:py-16">
            <div className="max-w-3xl">
              <span
                className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] ${vertical.theme.accentSoft} ${vertical.theme.accentText}`}
              >
                Portea {vertical.heroLabel}
              </span>
              <h1 className="mt-6 text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
                {vertical.headline}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                {vertical.subheadline}
              </p>

              <div className="mt-8">
                <ContactActions vertical={vertical} />
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {vertical.quickFacts.map((fact) => (
                  <div
                    key={fact}
                    className={`rounded-[1.75rem] border bg-white/85 p-4 shadow-sm backdrop-blur ${vertical.theme.border}`}
                  >
                    <div
                      className={`mb-3 h-2 w-14 rounded-full ${vertical.theme.accent}`}
                      aria-hidden="true"
                    />
                    <p className="text-sm leading-6 text-slate-700">{fact}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1.05fr_0.95fr]">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-2xl">
                <Image
                  src={vertical.image.src}
                  alt={vertical.image.alt}
                  width={1400}
                  height={1040}
                  className="h-full w-full object-cover"
                  priority
                />
                <div className="absolute inset-x-5 bottom-5 rounded-[1.5rem] bg-white/92 p-4 shadow-lg backdrop-blur">
                  <p className="text-sm font-semibold text-slate-950">
                    Built for the moment when families need clarity quickly
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {vertical.overview}
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <div
                  className={`rounded-[2rem] border bg-gradient-to-br p-5 shadow-sm ${vertical.theme.border} ${vertical.theme.surface}`}
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-700">
                    Trust signals
                  </p>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                    {vertical.trustSignals.map((signal) => (
                      <li key={signal} className="flex gap-3">
                        <span
                          className={`mt-2 h-2 w-2 rounded-full ${vertical.theme.accent}`}
                        />
                        <span>{signal}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/80 p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-950">Additional image slot</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {vertical.imageSlotLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
        <SectionHeader
          eyebrow="Why families stay"
          title="A care model that explains what happens next"
          intro="The page should help a family recognise themselves quickly, understand what support is meant to do, and feel that the process is both warm and organised."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {vertical.highlights.map((item) => (
            <article
              key={item.title}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <p className="text-xl font-semibold text-slate-950">{item.title}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
          <div className="rounded-[2rem] border border-slate-200 bg-[#f8fbfb] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0b5c56]">
              {vertical.forWho.title}
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-600">{vertical.forWho.intro}</p>
            <ul className="mt-6 space-y-4 text-sm leading-7 text-slate-700">
              {vertical.forWho.items.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#0f8f86]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-[#fffdfa] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">
              {vertical.notForWho.title}
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              {vertical.notForWho.intro}
            </p>
            <ul className="mt-6 space-y-4 text-sm leading-7 text-slate-700">
              {vertical.notForWho.items.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-2.5 w-2.5 rounded-full bg-slate-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <SectionHeader
              eyebrow="How it works"
              title="A guided flow from first message to day-one care"
            />
            <div className="mt-8 space-y-4">
              {vertical.howItWorks.map((step) => (
                <div
                  key={step.title}
                  className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-lg font-semibold text-slate-950">{step.title}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionHeader
              eyebrow="What to expect"
              title="Concise, useful, and designed not to overload the family"
            />
            <div className="mt-8 space-y-4">
              {vertical.whatToExpect.map((step) => (
                <div
                  key={step.title}
                  className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-lg font-semibold text-slate-950">{step.title}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#f7fbfb_0%,#ffffff_100%)]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
          <SectionHeader
            eyebrow="What families value"
            title="Relief usually comes from coordination, clarity, and steadier updates"
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {vertical.familyVoices.map((item) => (
              <article
                key={item.title}
                className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <p className="text-xl font-semibold leading-8 text-slate-950">
                  {item.title}
                </p>
                <p className="mt-4 text-sm leading-7 text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0b5c56]">
              Frequently asked questions
            </p>
            <div className="mt-6 space-y-3">
              {vertical.faqs.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-[1.5rem] border border-slate-200 bg-[#fbfcfc] p-4"
                >
                  <summary className="cursor-pointer list-none text-base font-semibold text-slate-900">
                    {item.question}
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>

          <div
            className={`rounded-[2rem] border bg-gradient-to-br p-6 shadow-sm ${vertical.theme.border} ${vertical.theme.surface}`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">
              Ready to talk?
            </p>
            <h3 className="mt-4 text-3xl font-semibold text-slate-950">
              Choose the contact style that feels easiest for your family
            </h3>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Start with a phone call if the situation feels urgent, request a
              WhatsApp follow-up if you want a lighter-touch start, or use the
              chatbot to share context before the care manager speaks to you.
            </p>
            <div className="mt-8">
              <ContactActions vertical={vertical} compact />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
