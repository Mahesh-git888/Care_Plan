"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ChatMessage,
  clearQuickFormData,
  emptyFields,
  IntakeFieldKey,
  IntakeFields,
  intakeSteps,
  isValidIndianMobile,
  readQuickFormData,
} from "@/lib/chatbot";
import type { VerticalConfig } from "@/data/verticals";
import { getIntakeApiUrl } from "@/lib/api";
import { pushDataLayerEvent } from "@/lib/gtm";
import { readAttribution } from "@/lib/utm";

type FlowPhase = "typing" | "awaiting-input" | "consent" | "submitting" | "submitted";

type PersistedState = {
  currentStep: number;
  fields: IntakeFields;
  messages: ChatMessage[];
  consentGiven: boolean;
  autoSubmit: boolean;
  submittedAt: string | null;
};

type FlowState = PersistedState & {
  isOpen: boolean;
  phase: FlowPhase;
  error: string | null;
};

type FlowAction =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "UPDATE_FIELD"; key: IntakeFieldKey; value: string }
  | { type: "PROMPT_READY" }
  | { type: "ANSWER"; value: string }
  | { type: "CONSENT_TOGGLE"; value: boolean }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS"; submittedAt: string }
  | { type: "SUBMIT_ERROR"; error: string }
  | {
      type: "PREFILL_AND_OPEN";
      fields: Partial<IntakeFields>;
      consentGiven: boolean;
      intro?: string;
    }
  | { type: "RESET" };

const TOTAL_STEPS = intakeSteps.length;

function makeMessage(role: ChatMessage["role"], text: string) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
  };
}

// Find the index of the first step whose field is still empty. Used to skip
// over steps that the visible lead form already captured (city, name, phone).
function findNextEmptyStep(fields: IntakeFields, startIdx: number): number {
  for (let i = startIdx; i < TOTAL_STEPS; i++) {
    const key = intakeSteps[i].key;
    if (!fields[key] || !fields[key].trim()) return i;
  }
  return TOTAL_STEPS;
}

function sanitizePersistedState(raw: string | null): PersistedState {
  const blank: PersistedState = {
    currentStep: 0,
    fields: { ...emptyFields },
    messages: [],
    consentGiven: false,
    autoSubmit: false,
    submittedAt: null,
  };

  if (!raw) return blank;

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      currentStep:
        typeof parsed.currentStep === "number" &&
        parsed.currentStep >= 0 &&
        parsed.currentStep <= TOTAL_STEPS
          ? parsed.currentStep
          : 0,
      fields: { ...emptyFields, ...(parsed.fields ?? {}) },
      messages: Array.isArray(parsed.messages)
        ? parsed.messages.filter(
            (m): m is ChatMessage =>
              Boolean(m) &&
              (m.role === "assistant" || m.role === "user") &&
              typeof m.text === "string" &&
              typeof m.id === "string",
          )
        : [],
      consentGiven: Boolean(parsed.consentGiven),
      autoSubmit: Boolean(parsed.autoSubmit),
      submittedAt: typeof parsed.submittedAt === "string" ? parsed.submittedAt : null,
    };
  } catch {
    return blank;
  }
}

function derivePhase(state: PersistedState): FlowPhase {
  if (state.submittedAt) return "submitted";
  if (state.currentStep >= TOTAL_STEPS) return "consent";
  if (state.messages.length === 0) return "typing";
  return state.messages[state.messages.length - 1]?.role === "user"
    ? "typing"
    : "awaiting-input";
}

function createInitialState(storageKey: string, verticalSlug: string): FlowState {
  if (typeof window === "undefined") {
    return {
      currentStep: 0,
      fields: { ...emptyFields },
      messages: [],
      consentGiven: false,
      autoSubmit: false,
      submittedAt: null,
      isOpen: false,
      phase: "typing",
      error: null,
    };
  }

  const persisted = sanitizePersistedState(window.localStorage.getItem(storageKey));
  const quickForm = readQuickFormData(verticalSlug);

  // If the lead form just handed off data and the chatbot hasn't already
  // submitted, pre-fill the matching fields, jump past them, and auto-open.
  if (quickForm && !persisted.submittedAt) {
    persisted.fields = {
      ...persisted.fields,
      name: quickForm.name,
      city: quickForm.city,
      phone: quickForm.phone,
    };
    persisted.consentGiven = persisted.consentGiven || quickForm.consentGiven;
    persisted.autoSubmit = persisted.autoSubmit || quickForm.consentGiven;
    persisted.currentStep = findNextEmptyStep(persisted.fields, 0);
    persisted.messages = [
      makeMessage(
        "assistant",
        `Thanks${quickForm.name ? `, ${quickForm.name.split(" ")[0]}` : ""}. A few quick questions and your care manager will call you back within 4 hours.`,
      ),
    ];
    // Consume the handoff so a reload after the user closes the modal does not
    // re-pop the chatbot. The chatbot's own localStorage carries the state forward.
    clearQuickFormData(verticalSlug);
    return {
      ...persisted,
      isOpen: true,
      phase: persisted.currentStep >= TOTAL_STEPS ? "submitting" : "typing",
      error: null,
    };
  }

  // Direct-chatbot path: if the user has never interacted, seed a friendly
  // greeting so the very first visible line isn't a question with no context.
  if (persisted.messages.length === 0 && !persisted.submittedAt) {
    persisted.messages = [
      makeMessage(
        "assistant",
        "Hi, I'm Portea's care assistant. I'll ask a few quick questions, then a doctor-led care manager will call you back within 4 hours.",
      ),
    ];
    return {
      ...persisted,
      isOpen: false,
      phase: "typing",
      error: null,
    };
  }

  return {
    ...persisted,
    isOpen: false,
    phase: derivePhase(persisted),
    error: null,
  };
}

function reducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case "OPEN":
      return { ...state, isOpen: true, error: null };
    case "CLOSE":
      return { ...state, isOpen: false, error: null };
    case "UPDATE_FIELD":
      return {
        ...state,
        fields: { ...state.fields, [action.key]: action.value },
        error: null,
      };
    case "PROMPT_READY": {
      const step = intakeSteps[state.currentStep];
      if (!step || state.phase === "submitted") return state;
      const last = state.messages[state.messages.length - 1];
      if (last?.role === "assistant" && last.text === step.prompt) {
        return { ...state, phase: "awaiting-input" };
      }
      return {
        ...state,
        phase: "awaiting-input",
        messages: [...state.messages, makeMessage("assistant", step.prompt)],
      };
    }
    case "ANSWER": {
      const step = intakeSteps[state.currentStep];
      if (!step) return state;
      const nextFields = { ...state.fields, [step.key]: action.value };
      const nextMessages = [...state.messages, makeMessage("user", action.value)];
      const nextStepIdx = findNextEmptyStep(nextFields, state.currentStep + 1);
      const isDone = nextStepIdx >= TOTAL_STEPS;
      const nextPhase: FlowPhase = isDone
        ? state.autoSubmit
          ? "submitting"
          : "consent"
        : "typing";
      return {
        ...state,
        fields: nextFields,
        messages: nextMessages,
        currentStep: nextStepIdx,
        phase: nextPhase,
        error: null,
      };
    }
    case "CONSENT_TOGGLE":
      return { ...state, consentGiven: action.value, error: null };
    case "SUBMIT_START":
      return { ...state, phase: "submitting", error: null };
    case "SUBMIT_SUCCESS":
      return {
        ...state,
        phase: "submitted",
        submittedAt: action.submittedAt,
        error: null,
      };
    case "SUBMIT_ERROR":
      // On failure, drop into the consent panel for both paths. The user sees
      // a clear error message and a Submit button to retry. In the auto-submit
      // path the consent box is already ticked, so retrying is one click.
      return { ...state, phase: "consent", error: action.error };
    case "PREFILL_AND_OPEN": {
      const mergedFields = { ...state.fields, ...action.fields };
      const consent = state.consentGiven || action.consentGiven;
      const nextStepIdx = findNextEmptyStep(mergedFields, 0);
      const intro =
        action.intro ??
        `Thanks${action.fields.name ? `, ${action.fields.name.split(" ")[0]}` : ""}. A few quick questions and your care manager will call you back within 4 hours.`;
      return {
        ...state,
        fields: mergedFields,
        consentGiven: consent,
        autoSubmit: consent,
        currentStep: nextStepIdx,
        messages: [makeMessage("assistant", intro)],
        isOpen: true,
        phase: nextStepIdx >= TOTAL_STEPS ? "submitting" : "typing",
        error: null,
      };
    }
    case "RESET":
      return {
        currentStep: 0,
        fields: { ...emptyFields },
        messages: [],
        consentGiven: false,
        autoSubmit: false,
        submittedAt: null,
        isOpen: true,
        phase: "typing",
        error: null,
      };
    default:
      return state;
  }
}

function currentStepNumber(state: FlowState) {
  return Math.min(state.currentStep + 1, TOTAL_STEPS);
}

export function IntakeChatbot({
  vertical,
  triggerLabel,
  triggerClassName,
  triggerContent,
}: {
  vertical: VerticalConfig;
  triggerLabel?: string;
  triggerClassName?: string;
  triggerContent?: ReactNode;
}) {
  const router = useRouter();
  // v2 bump after the step order was changed. Without this, anyone who
  // started the chatbot under the old order would resume on the wrong step.
  const storageKey = useMemo(() => `portea-intake-v2:${vertical.slug}`, [vertical.slug]);
  const [state, dispatch] = useReducer(reducer, undefined, () =>
    createInitialState(storageKey, vertical.slug),
  );
  const [variant] = useState(() => (Math.random() < 0.5 ? "flow_a" : "flow_b"));
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const formStartFiredRef = useRef(false);

  const activeStep = intakeSteps[state.currentStep];
  const activeValue = activeStep ? state.fields[activeStep.key] : "";

  // Persist (without the autoSubmit + transient fields that should reset on
  // reload after a successful submission)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const persisted: PersistedState = {
      currentStep: state.currentStep,
      fields: state.fields,
      messages: state.messages,
      consentGiven: state.consentGiven,
      autoSubmit: state.autoSubmit,
      submittedAt: state.submittedAt,
    };
    window.localStorage.setItem(storageKey, JSON.stringify(persisted));
  }, [
    state.currentStep,
    state.fields,
    state.messages,
    state.consentGiven,
    state.autoSubmit,
    state.submittedAt,
    storageKey,
  ]);

  // Autoscroll
  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [state.messages, state.phase, state.isOpen]);

  // Typing -> reveal next prompt
  useEffect(() => {
    if (!state.isOpen || state.phase !== "typing") return;
    const t = window.setTimeout(() => dispatch({ type: "PROMPT_READY" }), 380);
    return () => window.clearTimeout(t);
  }, [state.isOpen, state.phase, state.currentStep]);

  // Listen for the form -> chatbot handoff event
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as
        | { vertical?: string; fields?: Partial<IntakeFields>; consentGiven?: boolean }
        | undefined;
      if (detail?.vertical && detail.vertical !== vertical.slug) return;
      const quick = detail?.fields ?? readQuickFormData(vertical.slug);
      if (quick) {
        dispatch({
          type: "PREFILL_AND_OPEN",
          fields: {
            name: quick.name ?? "",
            city: quick.city ?? "",
            phone: quick.phone ?? "",
          },
          consentGiven: detail?.consentGiven ?? Boolean((quick as { consentGiven?: boolean }).consentGiven),
        });
      } else {
        dispatch({ type: "OPEN" });
      }
    };
    window.addEventListener("portea:open-chatbot", handler as EventListener);
    return () => window.removeEventListener("portea:open-chatbot", handler as EventListener);
  }, [vertical.slug]);

  // Submit when entering submitting phase
  useEffect(() => {
    if (state.phase !== "submitting") return;
    let cancelled = false;
    const run = async () => {
      try {
        const response = await fetch(getIntakeApiUrl(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: state.fields.name,
            phone: state.fields.phone,
            city: state.fields.city,
            situation: `${state.fields.condition}. Needs: ${state.fields.needs}. Elder: ${state.fields.elderName}. Caller: ${state.fields.name} (${state.fields.relationship}).`,
            vertical: vertical.slug,
            ab_variant: variant,
            elder_name: state.fields.elderName,
            condition: state.fields.condition,
            needs: state.fields.needs,
            relationship: state.fields.relationship,
            consent_given: true,
            attribution: readAttribution(),
          }),
        });
        const result = (await response.json()) as {
          error?: string;
          patient_id?: string;
          status?: string;
          submittedAt?: string;
        };
        if (!response.ok) throw new Error(result.error || "We couldn't submit your request.");
        if (cancelled) return;

        // Clear handoff data so a refresh doesn't re-trigger the chatbot
        clearQuickFormData(vertical.slug);

        dispatch({
          type: "SUBMIT_SUCCESS",
          submittedAt: result.submittedAt || new Date().toISOString(),
        });

        // Redirect to /thank-you, which fires generate_lead via GTM with the
        // full context. Single source of truth for the conversion event.
        const params = new URLSearchParams({
          source: "intake_chatbot",
          vertical: vertical.slug,
          ab_variant: variant,
        });
        if (result.patient_id) params.set("patient_id", result.patient_id);
        if (state.fields.city) params.set("city", state.fields.city);
        router.push(`/thank-you?${params.toString()}`);
      } catch (err) {
        if (!cancelled) {
          dispatch({
            type: "SUBMIT_ERROR",
            error: err instanceof Error ? err.message : "We couldn't submit your request.",
          });
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [state.phase, state.fields, vertical.slug, variant, router]);

  function handleOpen() {
    if (!formStartFiredRef.current && !state.submittedAt) {
      formStartFiredRef.current = true;
      pushDataLayerEvent("form_start", {
        form_name: "intake_chatbot",
        vertical: vertical.slug,
        ab_variant: variant,
      });
    }
    dispatch({ type: "OPEN" });
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeStep) return;
    const trimmed = activeValue.trim();
    if (!trimmed) {
      dispatch({ type: "SUBMIT_ERROR", error: `Please enter your ${activeStep.label}.` });
      return;
    }
    if (activeStep.key === "phone" && !isValidIndianMobile(trimmed)) {
      dispatch({
        type: "SUBMIT_ERROR",
        error: "Please enter a valid 10-digit Indian mobile number (starts with 6, 7, 8 or 9).",
      });
      return;
    }
    dispatch({ type: "ANSWER", value: trimmed });
  };

  const handleConsentSubmit = () => {
    if (!state.consentGiven) {
      dispatch({ type: "SUBMIT_ERROR", error: "Please confirm consent so we can call you back." });
      return;
    }
    dispatch({ type: "SUBMIT_START" });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={
          triggerClassName ||
          `inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white transition ${vertical.theme.accentStrong} shadow-lg`
        }
        aria-haspopup="dialog"
      >
        {triggerContent || triggerLabel || vertical.ctaLabel}
      </button>

      {state.isOpen ? (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
            onClick={() => dispatch({ type: "CLOSE" })}
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-label={`${vertical.name} intake chatbot`}
            className="absolute inset-0 flex md:inset-y-0 md:right-0 md:left-auto md:w-full md:max-w-md"
          >
            <div className="flex h-full w-full flex-col bg-white shadow-2xl md:rounded-l-[2rem]">
              <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      {state.phase === "submitted"
                        ? "Request received"
                        : state.phase === "submitting"
                          ? "Sending"
                          : state.phase === "consent"
                            ? "Almost done"
                            : `Step ${currentStepNumber(state)} of ${TOTAL_STEPS}`}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900">
                      {vertical.name} · Care assistant
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "CLOSE" })}
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                    aria-label="Close chat"
                  >
                    Close
                  </button>
                </div>
              </div>

              {state.phase === "submitted" ? (
                <div className="flex flex-1 flex-col justify-center px-5 py-8">
                  <div
                    className={`rounded-[2rem] border ${vertical.theme.border} bg-gradient-to-br ${vertical.theme.surface} p-6`}
                  >
                    <div
                      className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white ${vertical.theme.accent}`}
                      aria-hidden="true"
                    >
                      ✓
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-900">
                      Thank you, {state.fields.name || "there"}.
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Your care manager will call you on{" "}
                      <span className="font-semibold text-slate-800">{state.fields.phone}</span>{" "}
                      within 4 hours.
                    </p>
                    <div className="mt-6 flex gap-3">
                      <button
                        type="button"
                        onClick={() => dispatch({ type: "CLOSE" })}
                        className={`rounded-full px-4 py-2 text-sm font-semibold text-white transition ${vertical.theme.accentStrong}`}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              ) : state.phase === "consent" ? (
                <div className="flex flex-1 flex-col px-5 py-6">
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                      One last thing
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">
                      Confirm we can call you back
                    </h3>
                    <label className="mt-4 flex items-start gap-3 text-sm leading-6 text-slate-700">
                      <input
                        type="checkbox"
                        checked={state.consentGiven}
                        onChange={(e) =>
                          dispatch({ type: "CONSENT_TOGGLE", value: e.target.checked })
                        }
                        className="mt-1 h-4 w-4 rounded border-slate-300"
                      />
                      <span>
                        I agree that Portea may contact me about home care for{" "}
                        <strong>{state.fields.elderName || "the elder"}</strong> on{" "}
                        <strong>{state.fields.phone || "the number I shared"}</strong>, and process
                        the information shared in this chat under Portea&apos;s privacy policy.
                      </span>
                    </label>

                    {state.error ? (
                      <p className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {state.error}
                      </p>
                    ) : null}

                    <button
                      type="button"
                      onClick={handleConsentSubmit}
                      className={`mt-5 w-full rounded-full px-4 py-3 text-sm font-semibold text-white transition ${vertical.theme.accentStrong}`}
                    >
                      Submit and get a call within 4 hours
                    </button>
                  </div>

                  <div className="mt-6 grid gap-3 rounded-[1.5rem] border border-slate-200 p-5 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">What you shared:</p>
                    <dl className="grid grid-cols-1 gap-y-1 text-xs sm:text-sm">
                      <div className="flex gap-2"><dt className="font-semibold">Elder:</dt><dd>{state.fields.elderName}</dd></div>
                      <div className="flex gap-2"><dt className="font-semibold">Condition:</dt><dd>{state.fields.condition}</dd></div>
                      <div className="flex gap-2"><dt className="font-semibold">Help needed:</dt><dd>{state.fields.needs}</dd></div>
                      <div className="flex gap-2"><dt className="font-semibold">City:</dt><dd>{state.fields.city}</dd></div>
                      <div className="flex gap-2"><dt className="font-semibold">Caller:</dt><dd>{state.fields.name} ({state.fields.relationship})</dd></div>
                      <div className="flex gap-2"><dt className="font-semibold">Phone:</dt><dd>{state.fields.phone}</dd></div>
                    </dl>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                    {state.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`max-w-[85%] rounded-[1.5rem] px-4 py-3 text-sm leading-6 shadow-sm ${
                          message.role === "assistant"
                            ? "rounded-tl-md bg-slate-100 text-slate-800"
                            : `${vertical.theme.accent} ml-auto rounded-tr-md text-white`
                        }`}
                      >
                        {message.text}
                      </div>
                    ))}

                    {state.phase === "typing" ? (
                      <div className="inline-flex items-center gap-2 rounded-[1.5rem] rounded-tl-md bg-slate-100 px-4 py-3 text-slate-500 shadow-sm">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                      </div>
                    ) : null}

                    {state.phase === "submitting" ? (
                      <div className="inline-flex items-center gap-2 rounded-[1.5rem] rounded-tl-md bg-slate-100 px-4 py-3 text-sm text-slate-500 shadow-sm">
                        Sending your request...
                      </div>
                    ) : null}

                    <div ref={scrollAnchorRef} />
                  </div>

                  <div className="border-t border-slate-200 px-5 py-4">
                    {state.error ? (
                      <p className="mb-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {state.error}
                      </p>
                    ) : null}

                    {activeStep && state.phase === "awaiting-input" ? (
                      <form onSubmit={handleSubmit} className="space-y-3">
                        {activeStep.type === "textarea" ? (
                          <textarea
                            value={activeValue}
                            onChange={(event) =>
                              dispatch({
                                type: "UPDATE_FIELD",
                                key: activeStep.key,
                                value: event.target.value,
                              })
                            }
                            placeholder={activeStep.placeholder}
                            rows={3}
                            className="w-full rounded-[1.5rem] border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                          />
                        ) : (
                          <input
                            type={activeStep.type}
                            value={activeValue}
                            onChange={(event) =>
                              dispatch({
                                type: "UPDATE_FIELD",
                                key: activeStep.key,
                                value: event.target.value,
                              })
                            }
                            placeholder={activeStep.placeholder}
                            inputMode={activeStep.key === "phone" ? "numeric" : undefined}
                            autoComplete={activeStep.key === "phone" ? "tel" : undefined}
                            maxLength={activeStep.key === "phone" ? 13 : undefined}
                            className="w-full rounded-full border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                          />
                        )}
                        <button
                          type="submit"
                          className={`w-full rounded-full px-4 py-3 text-sm font-semibold text-white transition ${vertical.theme.accentStrong}`}
                        >
                          {findNextEmptyStep(state.fields, state.currentStep + 1) >= TOTAL_STEPS
                            ? state.autoSubmit
                              ? "Submit"
                              : "Continue"
                            : "Next"}
                        </button>
                      </form>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
