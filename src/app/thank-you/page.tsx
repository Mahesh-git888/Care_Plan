import type { Metadata } from "next";
import Link from "next/link";

import { ThankYouConversion } from "@/components/thank-you-conversion";

export const metadata: Metadata = {
  title: "Thank you · Portea",
  description:
    "Thanks for reaching out. A Portea care manager will call you back within 4 hours.",
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-[#f4f9fa] text-[#10242b]">
      <ThankYouConversion />
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-5 py-16 text-center sm:px-6">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#ff5b2e] text-2xl text-white">
          ✓
        </span>
        <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
          Thank you for reaching out.
        </h1>
        <p className="mt-5 max-w-xl text-lg font-medium leading-8 text-[#445d66]">
          Your care manager, a qualified doctor or senior clinician, will call you back
          within four hours. If your situation is urgent, please call us on
          1800 121 2323.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="tel:+918001212323"
            className="inline-flex items-center gap-2 rounded-full bg-[#0f9aa8] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b7c87]"
          >
            Call 1800 121 2323
          </a>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#cfe4e7] bg-white px-6 py-3 text-sm font-semibold text-[#10242b] transition hover:bg-[#f7fbfb]"
          >
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
