"use client";

import { useState } from "react";

// A modal for changing the signed-in user's password. Used in two ways:
//   - Voluntary: opened from a "Change password" button in the dashboard.
//   - Forced: shown automatically when the session's must_change_password
//     flag is true. Cannot be dismissed until a new password is set.

export function PasswordChangeModal({
  forced,
  onClose,
  onDone,
}: {
  forced: boolean;
  onClose?: () => void;
  onDone: () => void;
}) {
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (newPw !== confirmPw) {
      setError("New passwords do not match.");
      return;
    }
    if (newPw.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ old_password: oldPw, new_password: newPw }),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        throw new Error(body.error || "Could not change the password.");
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change the password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-[#10242b]">
          {forced ? "Set a new password to continue" : "Change password"}
        </h2>
        {forced ? (
          <p className="mt-1 text-sm text-[#54727a]">
            Your account is using a temporary password. Please set a new one before
            you continue.
          </p>
        ) : null}
        <form onSubmit={submit} className="mt-4 space-y-3">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7a8c92]">
              Current password
            </span>
            <input
              type="password"
              value={oldPw}
              onChange={(e) => setOldPw(e.target.value)}
              required
              autoFocus
              className="mt-1 w-full rounded-lg border border-[#d7e7ea] px-3 py-2 text-sm outline-none focus:border-[#0f9aa8] focus:ring-2 focus:ring-[#0f9aa8]/20"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7a8c92]">
              New password
            </span>
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              required
              minLength={8}
              className="mt-1 w-full rounded-lg border border-[#d7e7ea] px-3 py-2 text-sm outline-none focus:border-[#0f9aa8] focus:ring-2 focus:ring-[#0f9aa8]/20"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7a8c92]">
              Confirm new password
            </span>
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              required
              minLength={8}
              className="mt-1 w-full rounded-lg border border-[#d7e7ea] px-3 py-2 text-sm outline-none focus:border-[#0f9aa8] focus:ring-2 focus:ring-[#0f9aa8]/20"
            />
          </label>
          {error ? (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}
          <div className="flex justify-end gap-3 pt-2">
            {!forced && onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-[#d7e7ea] px-4 py-2 text-sm font-medium text-[#10242b] hover:bg-[#f7fbfb]"
              >
                Cancel
              </button>
            ) : null}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-[#0f9aa8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0b7c87] disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save new password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
