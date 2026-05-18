"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };

      if (res.ok && data.success) {
        router.push("/admin/leads");
        router.refresh();
      } else {
        setError(data.error || "Incorrect password");
        setPassword("");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f9fa] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#d7e7ea] bg-white p-8 shadow-sm">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0b7c87]">
            Portea · Internal
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#10242b]">
            Leads admin
          </h1>
          <p className="mt-1 text-sm text-[#7a8c92]">Sign in to view leads</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full rounded-xl border border-[#d7e7ea] bg-white px-4 py-3 text-sm text-[#10242b] outline-none transition focus:border-[#0f9aa8] focus:ring-2 focus:ring-[#0f9aa8]/20"
            autoFocus
            required
            autoComplete="current-password"
          />

          {error ? (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-center text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full cursor-pointer rounded-xl bg-[#0f9aa8] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0b7c87] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Checking…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#7a8c92]">
          Trouble signing in? Ask the marketing lead for the current password.
        </p>
      </div>
    </div>
  );
}
