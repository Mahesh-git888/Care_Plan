import Image from "next/image";
import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { ArrowUpRightIcon, CheckIcon } from "@/components/ui-icons";
import { homeStats, verticalList } from "@/data/verticals";

export function HomePage() {
  const [elderCare, dementiaCare, postDischargeCare] = verticalList;

  return (
    <main className="min-h-screen bg-[#f4f9fa] text-[#10242b]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,154,168,0.12),_transparent_32%),linear-gradient(180deg,#f1f8f9_0%,#fbfdfd_58%,#f4f9fa_100%)]" />
        <div className="relative mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-10">
          <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <BrandLogo />
            <nav className="flex flex-wrap items-center gap-4 text-sm font-semibold text-[#4b656d]">
              <a href="#programs" className="transition hover:text-[#10242b]">
                Care programs
              </a>
              <a href="#why-portea" className="transition hover:text-[#10242b]">
                Why Portea
              </a>
            </nav>
          </header>

          <div className="grid gap-12 pb-14 pt-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-16 lg:pb-16 lg:pt-14">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-[#cfe4e7] bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#0b7c87] shadow-sm">
                Portea managed home care
              </span>
              <h1 className="mt-6 text-[3rem] font-semibold leading-[0.98] tracking-[-0.065em] text-[#0f2028] sm:text-[4rem] lg:text-[5rem]">
                Home care that feels clearer, more personal, and easier to trust.
              </h1>
              <p className="mt-6 max-w-2xl text-lg font-medium leading-9 text-[#445d66]">
                Whether your family needs daily elder care, specialised dementia
                support, or recovery help after a hospital stay, start with the page
                that matches what is happening right now.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/elder-care"
                  className="inline-flex items-center gap-2 rounded-full bg-[#ff5b2e] px-6 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_-22px_rgba(255,91,46,0.95)] transition hover:bg-[#ec4e22]"
                >
                  Explore care options
                  <ArrowUpRightIcon className="h-4 w-4" />
                </Link>
                <a
                  href="#programs"
                  className="inline-flex items-center rounded-full border border-[#c8dde0] bg-white px-6 py-4 text-sm font-semibold text-[#0f2d36] transition hover:border-[#8db9bf] hover:bg-[#f7fbfb]"
                >
                  Find the right program
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e8ea] bg-white/90 px-4 py-3 text-sm font-semibold text-[#29424a] shadow-sm">
                  <CheckIcon className="h-4 w-4 text-[#0f9aa8]" />
                  <span>Dedicated pages for each care need</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e8ea] bg-white/90 px-4 py-3 text-sm font-semibold text-[#29424a] shadow-sm">
                  <CheckIcon className="h-4 w-4 text-[#0f9aa8]" />
                  <span>Call, WhatsApp, or chatbot to get started</span>
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
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#0b7c87]">
                    One family, one plan
                  </p>
                  <p className="mt-3 text-sm font-medium leading-7 text-[#455e67]">
                    Start with the concern that feels most urgent and move into a page
                    built for that conversation.
                  </p>
                </div>
                <div className="rounded-[1.7rem] border border-[#d7e7ea] bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#0b7c87]">
                    Easier next steps
                  </p>
                  <p className="mt-3 text-sm font-medium leading-7 text-[#455e67]">
                    Families can read, compare, and reach out in the way that feels
                    most comfortable to them.
                  </p>
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

      <section id="programs" className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0b7c87]">
            Care programs
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#10242b] sm:text-4xl">
            Choose the care path that fits what your family needs today
          </h2>
          <p className="mt-4 text-base font-medium leading-8 text-[#445d66]">
            Each page is designed around a different home-care situation so families
            can understand the support, feel the difference, and take the next step
            with more confidence.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {verticalList.map((vertical) => (
            <article
              key={vertical.slug}
              className="overflow-hidden rounded-[2rem] border border-[#d7e7ea] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_28px_60px_-30px_rgba(16,42,49,0.24)]"
            >
              <div className="relative aspect-[16/11] overflow-hidden">
                <Image
                  src={vertical.images[0].src}
                  alt={vertical.images[0].alt}
                  width={1200}
                  height={825}
                  className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
                  style={{ objectPosition: vertical.images[0].position ?? "center center" }}
                />
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0b7c87]">
                  {vertical.heroLabel}
                </p>
                <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.03em] text-[#10242b]">
                  {vertical.name}
                </h3>
                <p className="mt-3 text-sm font-medium leading-7 text-[#455e67]">
                  {vertical.overview}
                </p>
                <ul className="mt-5 space-y-3 text-sm font-medium leading-7 text-[#455e67]">
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
                  Learn more
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
                Thoughtful care for different situations
              </p>
              <p className="mt-3 text-sm font-medium leading-7 text-[#455e67]">
                Daily support, dementia care, and recovery after discharge each need a
                different conversation and a different kind of reassurance.
              </p>
            </div>

            <div className="rounded-[1.9rem] border border-[#d7e7ea] bg-white p-6 shadow-sm">
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
                Professional support that still feels human
              </p>
              <p className="mt-3 text-sm font-medium leading-7 text-[#455e67]">
                Families want warmth, reliability, and a sense that the team truly
                understands what home life feels like right now.
              </p>
            </div>

            <div className="rounded-[1.9rem] border border-[#d7e7ea] bg-white p-6 shadow-sm">
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
                Easier ways to reach out
              </p>
              <p className="mt-3 text-sm font-medium leading-7 text-[#455e67]">
                Some families want to call. Some prefer WhatsApp. Others want to start
                quietly through chat. The site supports all three.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
