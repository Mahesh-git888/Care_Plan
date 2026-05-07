import Image from "next/image";
import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { ArrowUpRightIcon, CheckIcon } from "@/components/ui-icons";
import { homeStats, verticalList } from "@/data/verticals";

export function HomePage() {
  return (
    <main className="min-h-screen bg-[#eef5f6] text-[#102a31]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,154,168,0.12),_transparent_32%),linear-gradient(180deg,#edf5f6_0%,#f8fbfc_58%,#eef4f5_100%)]" />
        <div className="relative mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-10">
          <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <BrandLogo />
            <nav className="flex flex-wrap items-center gap-3 text-sm text-[#4e6970]">
              <a href="#programs" className="transition hover:text-[#102a31]">
                Care programs
              </a>
              <a href="#why-portea" className="transition hover:text-[#102a31]">
                Why families choose Portea
              </a>
            </nav>
          </header>

          <div className="grid gap-12 pb-14 pt-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-16 lg:pb-16 lg:pt-14">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-[#cfe4e7] bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#0f7f89] shadow-sm backdrop-blur">
                Portea managed home care
              </span>
              <h1 className="mt-6 text-[3.1rem] font-semibold leading-[0.98] tracking-[-0.06em] text-[#10212d] sm:text-[4.05rem] lg:text-[5.15rem]">
                Find the right care path for what your family is dealing with now.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-9 text-[#567178]">
                Start from the care situation, not a generic home-care form. Each
                vertical has its own page, story, and next step so families can move
                forward with more clarity.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/elder-care"
                  className="inline-flex items-center gap-2 rounded-full bg-[#ff5b2e] px-6 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_-22px_rgba(255,91,46,0.95)] transition hover:bg-[#ec4e22]"
                >
                  Explore elder care
                  <ArrowUpRightIcon className="h-4 w-4" />
                </Link>
                <a
                  href="#programs"
                  className="inline-flex items-center rounded-full border border-[#c8dde0] bg-white px-6 py-4 text-sm font-semibold text-[#0f2d36] transition hover:border-[#8db9bf] hover:bg-[#f7fbfb]"
                >
                  Compare care programs
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-3 text-sm font-medium text-[#29434b] shadow-sm ring-1 ring-[#d8e9eb] backdrop-blur">
                  <CheckIcon className="h-4 w-4 text-[#0f9aa8]" />
                  <span>Customer-facing vertical pages for each care need</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-3 text-sm font-medium text-[#29434b] shadow-sm ring-1 ring-[#d8e9eb] backdrop-blur">
                  <CheckIcon className="h-4 w-4 text-[#0f9aa8]" />
                  <span>Call, WhatsApp, or chatbot to begin</span>
                </div>
              </div>
            </div>

            <div className="grid gap-5">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white p-3 shadow-[0_30px_60px_-28px_rgba(16,42,49,0.22)]">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem]">
                  <Image
                    src="/elder-care-home.webp"
                    alt="Portea caregiver helping an elderly woman at home"
                    width={1400}
                    height={1040}
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.7rem] border border-[#d7e7ea] bg-white/90 p-5 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#0f7f89]">
                    Better first step
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[#5b747a]">
                    Families can choose a page that matches their situation instead of
                    trying to interpret one broad service page on their own.
                  </p>
                </div>
                <div className="rounded-[1.7rem] border border-[#d7e7ea] bg-white/90 p-5 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#0f7f89]">
                    Real next actions
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[#5b747a]">
                    The vertical pages are designed to help people actually contact,
                    ask, and decide, not just read.
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

      <section id="programs" className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#0f7f89]">
            Care programs
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#102a31] sm:text-4xl">
            Three entry points, each built around a different family concern
          </h2>
          <p className="mt-4 text-base leading-8 text-[#58737a]">
            Choose the path that matches the care situation most closely, then move
            into a dedicated page built for that conversation.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {verticalList.map((vertical) => (
            <article
              key={vertical.slug}
              className="overflow-hidden rounded-[2rem] border border-[#d7e7ea] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_28px_60px_-30px_rgba(16,42,49,0.24)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={vertical.image.src}
                  alt={vertical.image.alt}
                  width={1200}
                  height={900}
                  className="h-full w-full object-cover transition duration-500 hover:scale-[1.04]"
                  style={{ objectPosition: vertical.imagePosition }}
                />
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0f7f89]">
                  {vertical.heroLabel}
                </p>
                <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.03em] text-[#102a31]">
                  {vertical.name}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#58737a]">{vertical.overview}</p>
                <ul className="mt-5 space-y-3 text-sm leading-7 text-[#4e6970]">
                  {vertical.quickFacts.map((fact) => (
                    <li key={fact} className="flex gap-3">
                      <CheckIcon className="mt-1 h-4 w-4 flex-none text-[#0f9aa8]" />
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/${vertical.slug}`}
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#c8dde0] bg-white px-5 py-3 text-sm font-semibold text-[#0f2d36] transition hover:border-[#8db9bf] hover:bg-[#f7fbfb]"
                >
                  View this page
                  <ArrowUpRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="why-portea" className="bg-[#f7fbfb]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-[1.9rem] border border-[#d7e7ea] bg-white p-6 shadow-sm">
              <p className="text-lg font-semibold tracking-[-0.03em] text-[#102a31]">
                One coordinated experience
              </p>
              <p className="mt-3 text-sm leading-7 text-[#58737a]">
                The story, actions, and intake flow should feel like one joined-up
                system rather than a collection of generic blocks.
              </p>
            </div>
            <div className="rounded-[1.9rem] border border-[#d7e7ea] bg-white p-6 shadow-sm">
              <p className="text-lg font-semibold tracking-[-0.03em] text-[#102a31]">
                Built around family decisions
              </p>
              <p className="mt-3 text-sm leading-7 text-[#58737a]">
                The pages focus on what families are unsure about, what support
                actually covers, and how the first week usually unfolds.
              </p>
            </div>
            <div className="rounded-[1.9rem] border border-[#d7e7ea] bg-white p-6 shadow-sm">
              <p className="text-lg font-semibold tracking-[-0.03em] text-[#102a31]">
                Better customer-facing presentation
              </p>
              <p className="mt-3 text-sm leading-7 text-[#58737a]">
                Stronger hierarchy, more breathing room, proper imagery, and clearer
                call, WhatsApp, and chatbot actions make the pages feel more real.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
