"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminHeaderActions({ csvHref }: { csvHref: string }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  return (
    <div className="flex w-fit items-center gap-2">
      <a
        href={csvHref}
        className="inline-flex items-center gap-2 rounded-full bg-[#0f9aa8] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b7c87]"
      >
        Download CSV
      </a>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="inline-flex items-center gap-2 rounded-full border border-[#d7e7ea] bg-white px-4 py-2.5 text-sm font-semibold text-[#10242b] transition hover:border-[#b8d1d4] hover:bg-[#f7fbfb] disabled:opacity-60"
      >
        {loggingOut ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
