"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { isValidIndianMobile, writeQuickFormData } from "@/lib/chatbot";
import { pushDataLayerEvent } from "@/lib/gtm";
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
  headline = "Talk to a care manager today",
  helperText = "Share three quick details. A doctor-led care manager will call you back within 4 hours.",
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

  const showsSelector = Boolean(verticalOptions && verticalOptions.length > 1);

  function handleFirstFocus() {
    if (formStartFiredRef.current) return;
    formStartFiredRef.current = true;
    pushDataLayerEvent("form_start", {
      form_name: "lead_form",
      vertical: selectedSlug,
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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

    // Stash the three fields + consent in sessionStorage for the chatbot to
    // pick up. The chatbot then asks only the four remaining SOP questions
    // (elder name, condition, needs, relationship) and auto-submits.
    writeQuickFormData(selectedSlug, {
      name: trimmedName,
      city: trimmedCity,
      phone: trimmedPhone,
      consentGiven: true,
    });

    if (showsSelector) {
      // Home-page form. Route to the selected vertical's landing page. The
      // chatbot on that page reads the sessionStorage handoff on mount and
      // auto-opens with the three fields pre-filled.
      router.push(`/${selectedSlug}`);
      return;
    }

    // Vertical page. The chatbot lives on this page already. Fire the event
    // and the IntakeChatbot picks it up via its window listener.
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("portea:open-chatbot", {
          detail: {
            vertical: selectedSlug,
            fields: { name: trimmedName, city: trimmedCity, phone: trimmedPhone },
            consentGiven: true,
          },
        }),
      );
    }
    // Reset to idle so the button is clickable again if they close the chatbot.
    setStatus("idle");
  }

  const submitting = status === "submitting";

  return (
    <form
      onSubmit={handleSubmit}
      onFocus={handleFirstFocus}
      noValidate
      aria-label="Request a callback"
      className="rounded-[1.7rem] border border-[#d7e7ea] bg-white p-5 shadow-[0_24px_50px_-26px_rgba(16,42,49,0.22)] sm:p-6"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0b7c87]">
        Request a callback
      </p>
      <h3 className="mt-1.5 text-lg font-semibold leading-snug tracking-[-0.02em] text-[#10242b] sm:text-xl">
        {headline}
      </h3>
      <p className="mt-1.5 text-sm font-medium leading-6 text-[#54727a]">{helperText}</p>

      {showsSelector ? (
        <fieldset className="mt-4">
          <legend className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#445d66]">
            What kind of care?
          </legend>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {verticalOptions!.map((opt) => {
              const active = opt.slug === selectedSlug;
              return (
                <button
                  key={opt.slug}
                  type="button"
                  onClick={() => setSelectedSlug(opt.slug)}
                  aria-pressed={active}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
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

      <div className="mt-4 space-y-2.5">
        <label className="block">
          <span className="sr-only">Your name</span>
          <input
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-full border border-[#d7e7ea] bg-white px-4 py-2.5 text-sm text-[#10242b] outline-none transition focus:border-[#0f9aa8] focus:ring-2 focus:ring-[#0f9aa8]/20"
          />
        </label>

        <label className="block">
          <span className="sr-only">Phone number</span>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={13}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-digit mobile number"
            className="w-full rounded-full border border-[#d7e7ea] bg-white px-4 py-2.5 text-sm text-[#10242b] outline-none transition focus:border-[#0f9aa8] focus:ring-2 focus:ring-[#0f9aa8]/20"
          />
        </label>

        <label className="block">
          <span className="sr-only">City</span>
          <input
            type="text"
            autoComplete="address-level2"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City (e.g. Bangalore)"
            className="w-full rounded-full border border-[#d7e7ea] bg-white px-4 py-2.5 text-sm text-[#10242b] outline-none transition focus:border-[#0f9aa8] focus:ring-2 focus:ring-[#0f9aa8]/20"
          />
        </label>
      </div>

      <label className="mt-3 flex items-start gap-2.5 text-[11px] font-medium leading-5 text-[#54727a]">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 flex-none rounded border-[#cfd9dc] text-[#0f9aa8] focus:ring-[#0f9aa8]/30"
        />
        <span>
          I agree that Portea may call me about home care on the number I shared.
        </span>
      </label>

      {error ? (
        <p
          role="alert"
          className="mt-3 rounded-2xl bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#ff5b2e] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-22px_rgba(255,91,46,0.95)] transition hover:bg-[#ec4e22] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Continuing..." : "Continue"}
      </button>

      <p className="mt-2.5 text-center text-[11px] font-medium text-[#7a8c92]">
        Two more quick questions. Then a care manager calls within 4 hours.
      </p>
    </form>
  );
}
