import Image from "next/image";
import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { ContactActions, FloatingContactButtons } from "@/components/contact-actions";
import { CheckIcon } from "@/components/ui-icons";
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
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0b7c87]">
        {label}
      </p>
      <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#10242b] sm:text-4xl">
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

export function LandingPage({ vertical }: { vertical: VerticalConfig }) {
  const [primaryImage, secondaryImage] = vertical.images;

  return (
    <main className="min-h-screen bg-[#f4f9fa] text-[#10242b]">
      <FloatingContactButtons vertical={vertical} />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,154,168,0.14),_transparent_34%),linear-gradient(180deg,#f3f9fa_0%,#fbfdfd_52%,#f3f8f9_100%)]" />
        <div className="relative mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-10">
          <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <BrandLogo />
              <Link
                href="/"
                className="rounded-full border border-white/80 bg-white/90 px-4 py-2 text-sm font-semibold text-[#28424a] shadow-sm transition hover:bg-white"
              >
                Back to all care programs
              </Link>
            </div>

            <nav className="flex flex-wrap gap-2">
              {verticalList.map((item) => {
                const isActive = item.slug === vertical.slug;

                return (
                  <Link
                    key={item.slug}
                    href={`/${item.slug}`}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "bg-[#102a31] text-white shadow-lg"
                        : "border border-white/80 bg-white/80 text-[#4a646c] shadow-sm hover:bg-white"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </header>

          <div className="grid gap-10 pb-12 pt-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-14 lg:pb-16 lg:pt-14">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-[#cae2e5] bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#0b7c87] shadow-sm">
                Portea {vertical.heroLabel}
              </span>
              <h1 className="mt-6 text-[3rem] font-semibold leading-[0.98] tracking-[-0.065em] text-[#0f2028] sm:text-[4rem] lg:text-[5.1rem]">
                {renderHeadline(vertical.headline, vertical.accentPhrase)}
              </h1>
              <p className="mt-6 max-w-2xl text-lg font-medium leading-9 text-[#445d66]">
                {vertical.subheadline}
              </p>

              <div className="mt-8">
                <ContactActions vertical={vertical} />
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {vertical.quickFacts.map((fact) => (
                  <div
                    key={fact}
                    className="inline-flex items-center gap-2 rounded-full border border-[#d7e8ea] bg-white/90 px-4 py-3 text-sm font-semibold text-[#29424a] shadow-sm"
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

              <div className="grid gap-4 sm:grid-cols-[0.92fr_1.08fr]">
                <div
                  className="relative overflow-hidden rounded-[1.8rem] border border-[#d9e8ea] bg-white p-3 shadow-sm"
                  style={{ aspectRatio: secondaryImage.aspect }}
                >
                  <div className="relative h-full w-full overflow-hidden rounded-[1.35rem]">
                    <Image
                      src={secondaryImage.src}
                      alt={secondaryImage.alt}
                      width={900}
                      height={1125}
                      className="h-full w-full object-cover"
                      style={{ objectPosition: secondaryImage.position ?? "center center" }}
                    />
                  </div>
                </div>

                <div className="rounded-[1.8rem] border border-[#d9e8ea] bg-white/92 p-6 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#0b7c87]">
                    Why families feel reassured
                  </p>
                  <ul className="mt-4 space-y-3 text-sm font-medium leading-7 text-[#455e67]">
                    {vertical.trustSignals.map((signal) => (
                      <li key={signal} className="flex gap-3">
                        <span className="mt-3 h-1.5 w-1.5 rounded-full bg-[#0f9aa8]" />
                        <span>{signal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/80 bg-white/70 backdrop-blur">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-6 sm:px-6 lg:grid-cols-4 lg:px-10">
          {homeStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[1.5rem] border border-[#d9e8ea] bg-white/90 p-5 shadow-sm"
            >
              <p className="text-2xl font-semibold tracking-[-0.04em] text-[#10242b]">
                {stat.value}
              </p>
              <p className="mt-2 text-sm font-medium leading-6 text-[#455e67]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <SectionIntro
            label="How we can help"
            title="Support at home that feels steadier from the very beginning"
            description={vertical.overview}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            {vertical.highlights.map((item) => (
              <article
                key={item.title}
                className="rounded-[1.9rem] border border-[#d7e7ea] bg-white p-6 shadow-sm"
              >
                <p className="text-xl font-semibold leading-8 tracking-[-0.03em] text-[#10242b]">
                  {item.title}
                </p>
                <p className="mt-3 text-sm font-medium leading-7 text-[#455e67]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white/70">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div className="rounded-[2rem] border border-[#d9e8ea] bg-white p-7 shadow-sm">
              <SectionIntro
                label="Who this is for"
                title={vertical.forWho.title}
                description={vertical.forWho.intro}
              />
              <ul className="mt-8 space-y-4 text-sm font-medium leading-7 text-[#455e67]">
                {vertical.forWho.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <CheckIcon className="mt-1 h-5 w-5 flex-none text-[#0f9aa8]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[2rem] border border-[#d9e8ea] bg-[#fffaf4] p-7 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a6647]">
                When another option may be better
              </p>
              <h3 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.04em] text-[#2d2620] sm:text-3xl">
                {vertical.notForWho.title}
              </h3>
              <p className="mt-4 text-base font-medium leading-8 text-[#68584c]">
                {vertical.notForWho.intro}
              </p>
              <ul className="mt-8 space-y-4 text-sm font-medium leading-7 text-[#68584c]">
                {vertical.notForWho.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-3 h-1.5 w-1.5 rounded-full bg-[#c48e63]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
        <SectionIntro
          label="What happens next"
          title="A simple start for families who want clarity quickly"
        />

        <div className="mt-10 grid gap-4 lg:grid-cols-4">
          {vertical.howItWorks.map((step) => (
            <article
              key={step.title}
              className="rounded-[1.9rem] border border-[#d8e8ea] bg-white p-6 shadow-sm"
            >
              <p className="text-lg font-semibold leading-8 tracking-[-0.03em] text-[#10242b]">
                {step.title}
              </p>
              <p className="mt-3 text-sm font-medium leading-7 text-[#455e67]">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#f7fbfb]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
            <div>
              <SectionIntro
                label="What families can expect"
                title="Clearer conversations, calmer routines, and less guesswork"
              />
              <div className="mt-8 space-y-5">
                {vertical.whatToExpect.map((step) => (
                  <div
                    key={step.title}
                    className="rounded-[1.7rem] border border-[#d9e8ea] bg-white p-5 shadow-sm"
                  >
                    <p className="text-lg font-semibold tracking-[-0.03em] text-[#10242b]">
                      {step.title}
                    </p>
                    <p className="mt-2 text-sm font-medium leading-7 text-[#455e67]">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white p-3 shadow-[0_26px_55px_-30px_rgba(16,42,49,0.24)]">
              <div className="relative aspect-[16/11] overflow-hidden rounded-[1.5rem]">
                <Image
                  src={secondaryImage.src}
                  alt={secondaryImage.alt}
                  width={1400}
                  height={980}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: secondaryImage.position ?? "center center" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
          <SectionIntro
            label="What families often say"
            title="Relief usually sounds simple, honest, and deeply personal"
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {vertical.familyVoices.map((item) => (
              <article
                key={item.title}
                className="rounded-[1.9rem] border border-[#d9e8ea] bg-[#fbfdfd] p-6 shadow-sm"
              >
                <p className="text-xl font-semibold leading-8 tracking-[-0.03em] text-[#10242b]">
                  {item.title}
                </p>
                <p className="mt-4 text-sm font-medium leading-7 text-[#455e67]">
                  {item.description}
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
              title="The questions families usually ask before taking the next step"
            />
            <div className="mt-8 space-y-3">
              {vertical.faqs.map((item) => (
                <details
                  key={item.question}
                  className="rounded-[1.5rem] border border-[#d9e8ea] bg-[#fbfdfd] p-4 open:bg-white"
                >
                  <summary className="cursor-pointer list-none text-base font-semibold text-[#10242b]">
                    {item.question}
                  </summary>
                  <p className="mt-3 text-sm font-medium leading-7 text-[#455e67]">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#d7e7ea] bg-[linear-gradient(180deg,#ffffff_0%,#f2f8f9_100%)] p-7 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0b7c87]">
              Ready when you are
            </p>
            <h3 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#10242b] sm:text-4xl">
              Choose the easiest way to begin
            </h3>
            <p className="mt-4 text-base font-medium leading-8 text-[#445d66]">
              Call if you want to speak right away, message on WhatsApp if that feels
              easier, or start with the chatbot so the care manager already knows the
              basics before reaching out.
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
