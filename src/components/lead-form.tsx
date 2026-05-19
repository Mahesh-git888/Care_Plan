"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { isValidIndianMobile } from "@/lib/chatbot";
import { getIntakeApiUrl } from "@/lib/api";
import { pushDataLayerEvent } from "@/lib/gtm";
import { readAttribution } from "@/lib/utm";
import type { VerticalConfig, VerticalSlug } from "@/data/verticals";

type Status = "idle" | "submitting";

type Props = {
  vertical: VerticalConfig;
  // When provided, the form shows a 3-pill selector so the visitor can pick
  // which program applies. Used on the home page where the vertical isn't
  // implicit from the URL.
  verticalOptions?: VerticalConfig[];
  headline?: string;
  helperText?: string;
};

export function LeadForm({
  vertical,
  verticalOptions,
  headline = "Get a callback in 4 hours",
  helperText = "A care manager will call you back. No call centre.",
}: Props) {
  const router = useRouter();
  const [selectedSlug, setSelectedSlug] = useState<VerticalSlug>(vertical.slug);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const formStartFiredRef = useRef(false);

  function handleFirstFocus() {
    if (formStartFiredRef.current) return;
    formStartFiredRef.current = true;
    pushDataLayerEvent("form_start", {
      form_name: "lead_form",
      vertical: selectedSlug,
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();
    const trimmedCity = city.trim();

    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }
    if (!isValidIndianMobile(trimmedPhone)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (!trimmedCity) {
      setError("Please enter your city.");
      return;
    }
    if (!consent) {
      setError("Please tick the consent box so we can call you back.");
      return;
    }

    setStatus("submitting");
    try {
      const response = await fetch(getIntakeApiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: trimmedName,
          phone: trimmedPhone,
          city: trimmedCity,
          situation: "Landing page lead form submission.",
          vertical: selectedSlug,
          consent_given: true,
          attribution: readAttribution(),
        }),
      });
      const body = (await response.json()) as { error?: string; patient_id?: string };
      if (!response.ok) {
        throw new Error(body.error || "We couldn't submit your request. Please try again.");
      }
      // /thank-you fires generate_lead via GTM. Use router.push so attribution
      // cookies survive the navigation.
      router.push("/thank-you");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "We couldn't submit your request. Please try again.",
      );
      setStatus("idle");
    }
  }

  const submitting = status === "submitting";

  return (
    <form
      onSubmit={handleSubmit}
      onFocus={handleFirstFocus}
      noValidate
      aria-label="Request a callback"
      className="rounded-[1.7rem] border border-[#d7e7ea] bg-white p-6 shadow-[0_30px_60px_-28px_rgba(16,42,49,0.22)] sm:p-7"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0b7c87]">
        Request a callback
      </p>
      <h3 className="mt-2 text-xl font-semibold leading-tight tracking-[-0.02em] text-[#10242b] sm:text-2xl">
        {headline}
      </h3>
      <p className="mt-2 text-sm font-medium leading-6 text-[#455e67]">{helperText}</p>

      {verticalOptions && verticalOptions.length > 1 ? (
        <fieldset className="mt-5">
          <legend className="text-xs font-semibold uppercase tracking-[0.18em] text-[#445d66]">
            What kind of care?
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {verticalOptions.map((opt) => {
              const active = opt.slug === selectedSlug;
              return (
                <button
                  key={opt.slug}
                  type="button"
                  onClick={() => setSelectedSlug(opt.slug)}
                  aria-pressed={active}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "bg-[#10242b] text-white shadow-sm"
                      : "border border-[#d7e7ea] bg-white text-[#10242b] hover:bg-[#f4f9fa]"
                  }`}
                >
                  {opt.shortName}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <div className="mt-5 space-y-3">
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#445d66]">
            Your name
          </span>
          <input
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Priya Sharma"
            className="mt-1.5 w-full rounded-full border border-[#d7e7ea] bg-white px-4 py-3 text-sm text-[#10242b] outline-none transition focus:border-[#0f9aa8] focus:ring-2 focus:ring-[#0f9aa8]/20"
          />
        </label>

        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#445d66]">
            Phone number
          </span>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={13}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-digit mobile"
            className="mt-1.5 w-full rounded-full border border-[#d7e7ea] bg-white px-4 py-3 text-sm text-[#10242b] outline-none transition focus:border-[#0f9aa8] focus:ring-2 focus:ring-[#0f9aa8]/20"
          />
        </label>

        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#445d66]">
            City
          </span>
          <input
            type="text"
            autoComplete="address-level2"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Bangalore"
            className="mt-1.5 w-full rounded-full border border-[#d7e7ea] bg-white px-4 py-3 text-sm text-[#10242b] outline-none transition focus:border-[#0f9aa8] focus:ring-2 focus:ring-[#0f9aa8]/20"
          />
        </label>
      </div>

      <label className="mt-4 flex items-start gap-3 text-xs font-medium leading-5 text-[#455e67]">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 flex-none rounded border-[#cfd9dc] text-[#0f9aa8] focus:ring-[#0f9aa8]/30"
        />
        <span>
          I agree that Portea may call me about home care on the number I shared, and
          process my details under Portea&apos;s privacy policy.
        </span>
      </label>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#ff5b2e] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_-22px_rgba(255,91,46,0.95)] transition hover:bg-[#ec4e22] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Sending..." : "Get a callback in 4 hours"}
      </button>

      <p className="mt-3 text-center text-[11px] font-medium text-[#7a8c92]">
        We respond Mon to Sat, 8:00 AM to 8:00 PM IST.
      </p>
    </form>
  );
}
