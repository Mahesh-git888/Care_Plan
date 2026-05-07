import Image from "next/image";
import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { homePrinciples, homeStats, verticalList } from "@/data/verticals";

export function HomePage() {
  const featured = verticalList[0];

  return (
    <main className="min-h-screen bg-[#f5fbfb] text-slate-900">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,143,134,0.12),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(12,123,149,0.08),_transparent_36%)]" />
        <div className="relative mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-10">
          <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <BrandLogo />
            <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <a href="#verticals" className="transition hover:text-slate-950">
                Care programs
              </a>
              <a href="#how-it-works" className="transition hover:text-slate-950">
                How it works
              </a>
              <a href="#trust" className="transition hover:text-slate-950">
                Why families trust this
              </a>
            </nav>
          </header>

          <div className="grid gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-16">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#0b5c56] shadow-sm ring-1 ring-[#d7ece9]">
                Portea managed care
              </span>
              <h1 className="mt-6 text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Home care journeys built around what families need right now
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Explore dedicated pathways for elder care, dementia support, and
                post-discharge recovery so families can get to the right care
                conversation faster.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/${featured.slug}`}
                  className="rounded-full bg-[#0f8f86] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0f8f86]/20 transition hover:bg-[#0c7b73]"
                >
                  Explore elder care
                </Link>
                <a
                  href="#verticals"
                  className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                >
                  Compare care pathways
                </a>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {homeStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[1.6rem] border border-white/80 bg-white/90 p-4 shadow-sm backdrop-blur"
                  >
                    <p className="text-2xl font-semibold text-slate-950">{stat.value}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-xl">
                <Image
                  src="/elder-care-home.webp"
                  alt="Portea caregiver and elderly woman at home"
                  width={1400}
                  height={960}
                  className="h-full w-full object-cover"
                  priority
                />
                <div className="absolute inset-x-5 bottom-5 rounded-[1.5rem] bg-white/90 p-4 shadow-lg backdrop-blur">
                  <p className="text-sm font-semibold text-slate-950">
                    A guided start instead of an overwhelming first step
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Families can choose the care path that matches their situation,
                    then speak to a care guide with context already in place.
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[2rem] border border-[#dceceb] bg-[#f6fffd] p-5 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#0b5c56]">
                    Trust signals
                  </p>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                    <li>Doctor-guided care planning and escalation pathways</li>
                    <li>Single care manager coordination for the family</li>
                    <li>Designed for both immediate and planning-led inquiries</li>
                  </ul>
                </div>
                <div className="rounded-[2rem] border border-[#d9eaf0] bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-950">
                    Three dedicated entry points
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Instead of one generic home-care page, each vertical gets its
                    own story, concerns, and call-to-action.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="verticals" className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0b5c56]">
            Choose a care journey
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">
            Dedicated pages for the situations families describe most often
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            Each page is tailored to a different decision moment, so the story,
            imagery, and next steps feel relevant instead of broad.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {verticalList.map((vertical) => (
            <article
              key={vertical.slug}
              className="overflow-hidden rounded-[2rem] border border-white bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={vertical.image.src}
                  alt={vertical.image.alt}
                  width={1200}
                  height={900}
                  className="h-full w-full object-cover transition duration-500 hover:scale-105"
                />
                <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 backdrop-blur">
                  {vertical.heroLabel}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-slate-950">{vertical.name}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{vertical.overview}</p>
                <ul className="mt-5 space-y-2 text-sm leading-6 text-slate-600">
                  {vertical.quickFacts.map((fact) => (
                    <li key={fact} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-[#0f8f86]" />
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/${vertical.slug}`}
                  className="mt-6 inline-flex rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:text-slate-950"
                >
                  View {vertical.shortName}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        className="bg-[linear-gradient(180deg,#f7fbfb_0%,#ffffff_100%)]"
      >
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div id="trust">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0b5c56]">
                How it works
              </p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">
                One architecture, three clearly different journeys
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {homePrinciples.map((principle) => (
                <div
                  key={principle.title}
                  className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-lg font-semibold text-slate-950">{principle.title}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {principle.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
