"use client";

import type { ReactNode } from "react";
import { useEffect, useEffectEvent, useMemo, useReducer, useRef } from "react";

import {
  ChatMessage,
  emptyFields,
  IntakeFieldKey,
  IntakeFields,
  intakeSteps,
} from "@/lib/chatbot";
import type { VerticalConfig } from "@/data/verticals";
import { getIntakeApiUrl } from "@/lib/api";

type FlowPhase = "typing" | "awaiting-input" | "submitting" | "submitted";

type PersistedState = {
  currentStep: number;
  fields: IntakeFields;
  messages: ChatMessage[];
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
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS"; submittedAt: string }
  | { type: "SUBMIT_ERROR"; error: string }
  | { type: "RESET" };

const TOTAL_STEPS = intakeSteps.length;

function makeMessage(role: ChatMessage["role"], text: string) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
  };
}

function sanitizePersistedState(raw: string | null): PersistedState {
  if (!raw) {
    return {
      currentStep: 0,
      fields: emptyFields,
      messages: [],
      submittedAt: null,
    };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedState>;

    return {
      currentStep:
        typeof parsed.currentStep === "number" &&
        parsed.currentStep >= 0 &&
        parsed.currentStep < TOTAL_STEPS
          ? parsed.currentStep
          : 0,
      fields: {
        name: parsed.fields?.name ?? "",
        phone: parsed.fields?.phone ?? "",
        city: parsed.fields?.city ?? "",
        situation: parsed.fields?.situation ?? "",
      },
      messages: Array.isArray(parsed.messages)
        ? parsed.messages.filter(
            (message): message is ChatMessage =>
              Boolean(message) &&
              (message.role === "assistant" || message.role === "user") &&
              typeof message.text === "string" &&
              typeof message.id === "string",
          )
        : [],
      submittedAt:
        typeof parsed.submittedAt === "string" ? parsed.submittedAt : null,
    };
  } catch {
    return {
      currentStep: 0,
      fields: emptyFields,
      messages: [],
      submittedAt: null,
    };
  }
}

function derivePhase(state: PersistedState): FlowPhase {
  if (state.submittedAt) {
    return "submitted";
  }

  if (state.messages.length === 0) {
    return "typing";
  }

  return state.messages[state.messages.length - 1]?.role === "user"
    ? "typing"
    : "awaiting-input";
}

function createInitialState(storageKey: string): FlowState {
  if (typeof window === "undefined") {
    return {
      currentStep: 0,
      fields: emptyFields,
      messages: [],
      submittedAt: null,
      isOpen: false,
      phase: "typing",
      error: null,
    };
  }

  const persisted = sanitizePersistedState(window.localStorage.getItem(storageKey));

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
      return {
        ...state,
        isOpen: true,
        error: null,
      };
    case "CLOSE":
      return {
        ...state,
        isOpen: false,
        error: null,
      };
    case "UPDATE_FIELD":
      return {
        ...state,
        fields: {
          ...state.fields,
          [action.key]: action.value,
        },
        error: null,
      };
    case "PROMPT_READY": {
      const step = intakeSteps[state.currentStep];

      if (!step || state.phase === "submitted") {
        return state;
      }

      const lastMessage = state.messages[state.messages.length - 1];
      if (lastMessage?.role === "assistant" && lastMessage.text === step.prompt) {
        return {
          ...state,
          phase: "awaiting-input",
        };
      }

      return {
        ...state,
        phase: "awaiting-input",
        messages: [...state.messages, makeMessage("assistant", step.prompt)],
      };
    }
    case "ANSWER": {
      const step = intakeSteps[state.currentStep];
      if (!step) {
        return state;
      }

      const nextFields = {
        ...state.fields,
        [step.key]: action.value,
      };

      const nextMessages = [...state.messages, makeMessage("user", action.value)];
      const isLastStep = state.currentStep === TOTAL_STEPS - 1;

      return {
        ...state,
        fields: nextFields,
        messages: nextMessages,
        currentStep: isLastStep ? state.currentStep : state.currentStep + 1,
        phase: isLastStep ? "submitting" : "typing",
        error: null,
      };
    }
    case "SUBMIT_START":
      return {
        ...state,
        phase: "submitting",
        error: null,
      };
    case "SUBMIT_SUCCESS":
      return {
        ...state,
        phase: "submitted",
        submittedAt: action.submittedAt,
        error: null,
      };
    case "SUBMIT_ERROR":
      return {
        ...state,
        phase: "awaiting-input",
        error: action.error,
      };
    case "RESET":
      return {
        currentStep: 0,
        fields: emptyFields,
        messages: [],
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
  const storageKey = useMemo(() => `portea-intake:${vertical.slug}`, [vertical.slug]);
  const [state, dispatch] = useReducer(reducer, storageKey, createInitialState);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  const activeStep = intakeSteps[state.currentStep];
  const activeValue = activeStep ? state.fields[activeStep.key] : "";

  const revealPrompt = useEffectEvent(() => {
    dispatch({ type: "PROMPT_READY" });
  });

  const persistState = useEffectEvent((nextState: FlowState) => {
    const persisted: PersistedState = {
      currentStep: nextState.currentStep,
      fields: nextState.fields,
      messages: nextState.messages,
      submittedAt: nextState.submittedAt,
    };

    window.localStorage.setItem(storageKey, JSON.stringify(persisted));
  });

  const scrollToBottom = useEffectEvent(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  });

  useEffect(() => {
    persistState(state);
  }, [state]);

  useEffect(() => {
    scrollToBottom();
  }, [state.messages, state.phase, state.isOpen]);

  useEffect(() => {
    if (!state.isOpen || state.phase !== "typing") {
      return;
    }

    const timeout = window.setTimeout(() => {
      revealPrompt();
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [state.isOpen, state.phase, state.currentStep]);

  useEffect(() => {
    if (state.phase !== "submitting") {
      return;
    }

    let isCancelled = false;

    const submit = async () => {
      try {
        const response = await fetch(getIntakeApiUrl(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: state.fields.name,
            phone: state.fields.phone,
            city: state.fields.city,
            situation: state.fields.situation,
            vertical: vertical.slug,
          }),
        });

        const result = (await response.json()) as {
          error?: string;
          patient_id?: string;
          status?: string;
          submittedAt?: string;
        };

        if (!response.ok) {
          throw new Error(result.error || "We couldn't submit your request.");
        }

        if (!isCancelled) {
          dispatch({
            type: "SUBMIT_SUCCESS",
            submittedAt: result.submittedAt || new Date().toISOString(),
          });
        }
      } catch (error) {
        if (!isCancelled) {
          dispatch({
            type: "SUBMIT_ERROR",
            error:
              error instanceof Error
                ? error.message
                : "We couldn't submit your request.",
          });
        }
      }
    };

    void submit();

    return () => {
      isCancelled = true;
    };
  }, [state.fields, state.phase, vertical.slug]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!activeStep) {
      return;
    }

    const trimmedValue = activeValue.trim();
    if (!trimmedValue) {
      dispatch({
        type: "SUBMIT_ERROR",
        error: `Please enter your ${activeStep.label}.`,
      });
      return;
    }

    if (activeStep.key === "phone" && trimmedValue.replace(/\D/g, "").length < 8) {
      dispatch({
        type: "SUBMIT_ERROR",
        error: "Please enter a valid phone number.",
      });
      return;
    }

    dispatch({ type: "ANSWER", value: trimmedValue });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => dispatch({ type: "OPEN" })}
        className={
          triggerClassName ||
          `inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white transition ${vertical.theme.accentStrong} shadow-lg`
        }
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
                        : `Step ${currentStepNumber(state)} of ${TOTAL_STEPS}`}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900">
                      {vertical.name} Support
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "CLOSE" })}
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
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
                    >
                      OK
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-900">
                      Thank you, {state.fields.name || "there"}.
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Our team will review your {vertical.name.toLowerCase()} request and
                      reach out on {state.fields.phone} shortly.
                    </p>
                    <div className="mt-6 flex gap-3">
                      <button
                        type="button"
                        onClick={() => dispatch({ type: "RESET" })}
                        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
                      >
                        Start over
                      </button>
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
                            rows={4}
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
                            className="w-full rounded-full border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                          />
                        )}
                        <button
                          type="submit"
                          className={`w-full rounded-full px-4 py-3 text-sm font-semibold text-white transition ${vertical.theme.accentStrong}`}
                        >
                          {state.currentStep === TOTAL_STEPS - 1 ? "Submit request" : "Continue"}
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
