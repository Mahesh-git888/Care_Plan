import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { IntakeChatbot } from "@/components/intake-chatbot";
import { verticalList, type VerticalConfig } from "@/data/verticals";

export function LandingPage({ vertical }: { vertical: VerticalConfig }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8fafc] text-slate-900">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${vertical.theme.background}`}
        aria-hidden="true"
      />
      <div
        className="absolute -top-24 right-[-8rem] h-72 w-72 rounded-full bg-white/60 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-[-8rem] left-[-6rem] h-72 w-72 rounded-full bg-white/70 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-6 sm:px-6 lg:px-10">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <BrandLogo />
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

        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.2fr_0.8fr] lg:py-16">
          <div className="max-w-3xl">
            <span
              className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] ${vertical.theme.accentSoft}`}
            >
              Portea {vertical.name}
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
              {vertical.headline}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              {vertical.subheadline}
            </p>

            <div className="mt-8">
              <IntakeChatbot vertical={vertical} />
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {vertical.highlights.map((highlight) => (
                <div
                  key={highlight}
                  className={`rounded-[1.75rem] border bg-white/80 p-4 shadow-lg backdrop-blur ${vertical.theme.border}`}
                >
                  <div
                    className={`mb-3 h-2 w-14 rounded-full ${vertical.theme.accent}`}
                    aria-hidden="true"
                  />
                  <p className="text-sm leading-6 text-slate-700">{highlight}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div
              className={`rounded-[2rem] border bg-white/85 p-6 shadow-2xl backdrop-blur ${vertical.theme.border}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-3 w-3 rounded-full ${vertical.theme.accent}`}
                  aria-hidden="true"
                />
                <p className="text-sm font-medium text-slate-600">
                  Intake designed for quick follow-up
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-[1.5rem] bg-slate-100 p-4 text-sm leading-6 text-slate-700">
                  Share a few details in the chatbot and our team can reach out with the
                  right care plan faster.
                </div>
                <div
                  className={`ml-auto max-w-[85%] rounded-[1.5rem] rounded-tr-md p-4 text-sm leading-6 text-white ${vertical.theme.accent}`}
                >
                  I need help understanding the next steps for care at home.
                </div>
                <div className="rounded-[1.5rem] bg-slate-100 p-4 text-sm leading-6 text-slate-700">
                  We’ll ask for your name, phone number, city, and a brief summary of the
                  situation. It only takes a minute.
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.75rem] border border-white/70 bg-white/75 p-5 backdrop-blur">
                <p className="text-sm font-semibold text-slate-900">4-step intake</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Conversational flow with progress tracking and saved progress.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-white/70 bg-white/75 p-5 backdrop-blur">
                <p className="text-sm font-semibold text-slate-900">Mobile-first widget</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Full-screen on mobile and a focused side panel on larger screens.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
