"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
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
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };

      if (res.ok && data.success) {
        router.push("/admin/leads");
        router.refresh();
      } else {
        setError(data.error || "Incorrect email or password");
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
            Care manager sign-in
          </h1>
          <p className="mt-1 text-sm text-[#7a8c92]">
            Use your work email and the password you were given.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 space-y-3">
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@portea.com"
              className="w-full rounded-xl border border-[#d7e7ea] bg-white px-4 py-3 text-sm text-[#10242b] outline-none transition focus:border-[#0f9aa8] focus:ring-2 focus:ring-[#0f9aa8]/20"
              autoFocus
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl border border-[#d7e7ea] bg-white px-4 py-3 text-sm text-[#10242b] outline-none transition focus:border-[#0f9aa8] focus:ring-2 focus:ring-[#0f9aa8]/20"
              required
              autoComplete="current-password"
            />
          </div>

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
            {loading ? "Checking..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#7a8c92]">
          Sessions stay signed in for 24 hours. Trouble signing in? Ask your manager.
        </p>
      </div>
    </div>
  );
}
