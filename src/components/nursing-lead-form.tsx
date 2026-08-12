"use client";

import { useRef, useState } from "react";

import { isValidIndianMobile, sanitizePhoneInput } from "@/lib/chatbot";
import { pushDataLayerEvent } from "@/lib/gtm";
import { readAttribution } from "@/lib/utm";

const NEED_OPTIONS = [
  { value: "", label: "Select" },
  { value: "Nursing Attendant", label: "Nursing Attendant" },
  { value: "Nurse", label: "Nurse" },
  { value: "Physiotherapist", label: "Physiotherapist" },
  { value: "Care Manager", label: "Care Manager" },
  { value: "Not sure", label: "I don't know" },
];

const DURATION_OPTIONS = [
  { value: "", label: "Select" },
  { value: "A few days", label: "A few days" },
  { value: "A few weeks", label: "A few weeks" },
  { value: "A few months", label: "A few months" },
  { value: "Long-term", label: "Long-term" },
  { value: "Not sure", label: "I don't know" },
];

const inputClass =
  "w-full rounded-lg border border-[#e5e7eb] bg-white px-3.5 py-3 text-[15px] text-[#10242b] outline-none transition focus:border-[#0f9aa8] focus:ring-2 focus:ring-[#0f9aa8]/15";

export function NursingLeadForm() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [need, setNeed] = useState("");
  const [duration, setDuration] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const startedRef = useRef(false);

  function onFirstFocus() {
    if (startedRef.current) return;
    startedRef.current = true;
    pushDataLayerEvent("form_start", { form_name: "nursing_lp" });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const name = fullName.trim();
    const ph = phone.trim();
    const c = city.trim();
    if (!name) return setError("Please enter your name.");
    if (!isValidIndianMobile(ph))
      return setError("Please enter a valid 10-digit Indian mobile number.");
    if (!c) return setError("Please enter your city.");

    setStatus("submitting");
    try {
      const res = await fetch("/api/v1/nursing-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: name,
          phone: ph,
          city: c,
          need,
          duration,
          attribution: readAttribution(),
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Something went wrong. Please call us instead.");
      }
      pushDataLayerEvent("generate_lead", { form_name: "nursing_lp" });
      setStatus("done");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Please try again or call us.");
    }
  }

  if (status === "done") {
    return (
      <div className="mx-auto max-w-[520px] rounded-2xl border border-[#e5e7eb] bg-white p-10 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f6f7] text-[#0b7c87]">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l4.5 4.5L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#10242b]">Thank you. We have your request.</h2>
        <p className="mt-2 text-sm leading-6 text-[#54727a]">
          A Portea health manager will call you shortly to understand your parent&apos;s needs and
          recommend the right caregiver. If it is urgent, call{" "}
          <a href="tel:+919187116003" className="font-semibold text-[#0b7c87]">+91 91871 16003</a>.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      onFocus={onFirstFocus}
      noValidate
      className="mx-auto max-w-[520px] rounded-2xl border border-[#e5e7eb] bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:p-10"
    >
      <h2 className="text-center text-2xl font-extrabold text-[#10242b]">Get a free assessment</h2>
      <p className="mx-auto mt-1.5 max-w-md text-center text-sm leading-6 text-[#54727a]">
        Share a few details. Your health manager will call to understand your parent&apos;s needs and
        recommend the right caregiver.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-[#10242b]">Your name</label>
          <input className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" autoComplete="name" />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-[#10242b]">Phone number</label>
            <input className={inputClass} type="tel" inputMode="numeric" autoComplete="tel" value={phone} onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))} placeholder="10-digit mobile" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-[#10242b]">City</label>
            <input className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} placeholder="Your parent's city" autoComplete="address-level2" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-[#10242b]">
              What do you need? <span className="font-normal text-[#9ca3af]">Optional</span>
            </label>
            <select className={inputClass} value={need} onChange={(e) => setNeed(e.target.value)}>
              {NEED_OPTIONS.map((o) => (
                <option key={o.label} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-[#10242b]">
              For how long? <span className="font-normal text-[#9ca3af]">Optional</span>
            </label>
            <select className={inputClass} value={duration} onChange={(e) => setDuration(e.target.value)}>
              {DURATION_OPTIONS.map((o) => (
                <option key={o.label} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700">{error}</p>
      ) : null}

      <p className="mt-5 text-xs leading-5 text-[#9ca3af]">
        By continuing, I agree that Portea may call me about home care on the number I shared.
      </p>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-4 w-full rounded-[10px] bg-[#0f9aa8] px-5 py-3.5 text-base font-bold text-white transition hover:bg-[#0b7c87] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Sending..." : "Get a free assessment"}
      </button>

      <p className="mt-4 text-center text-[13px] text-[#9ca3af]">
        Or <a href="tel:+919187116003" className="font-semibold text-[#0b7c87]">call +91 91871 16003</a>
      </p>
    </form>
  );
}
