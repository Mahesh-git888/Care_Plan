"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  LIFECYCLE_STATUSES,
  type LeadRecord,
  type LifecycleStatus,
} from "@/lib/lead-types";

const STATUS_LABELS: Record<LifecycleStatus, string> = {
  new: "new",
  cm_contacted: "cm contacted",
  plan_shared: "plan shared",
  follow_up: "follow up",
  converted: "converted",
  active: "active",
  lost: "lost",
};

const STATUS_PILL: Record<LifecycleStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  cm_contacted: "bg-yellow-100 text-yellow-700",
  plan_shared: "bg-purple-100 text-purple-700",
  follow_up: "bg-orange-100 text-orange-700",
  converted: "bg-green-100 text-green-700",
  active: "bg-teal-100 text-teal-700",
  lost: "bg-gray-100 text-gray-500",
};

const CM_OPTIONS = ["All CMs", "Meera", "Priya", "Rahul"];

function timeAgo(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function isToday(iso?: string): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isThisMonth(iso?: string): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export function CmDashboard() {
  const router = useRouter();
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cm, setCm] = useState<string>("All CMs");
  const [statusFilter, setStatusFilter] = useState<LifecycleStatus | "all">("all");
  const [search, setSearch] = useState("");

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/leads?kind=intake", { cache: "no-store" });
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const body = (await res.json()) as { leads?: LeadRecord[]; error?: string };
      if (!res.ok) throw new Error(body.error || "Failed to load leads");
      setLeads(body.leads || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  async function handleSignOut() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  // CM filter
  const cmFiltered = useMemo(() => {
    if (cm === "All CMs") return leads;
    return leads.filter((l) => (l.care_manager || "Unassigned") === cm);
  }, [leads, cm]);

  // Counts per status (after CM filter, before status/search filter)
  const counts = useMemo(() => {
    const out: Record<string, number> = { all: cmFiltered.length };
    for (const s of LIFECYCLE_STATUSES) {
      out[s] = cmFiltered.filter((l) => (l.status || "new") === s).length;
    }
    return out;
  }, [cmFiltered]);

  // Top stat cards
  const newLeadsCount = counts.new;
  const followUpsToday = cmFiltered.filter(
    (l) => (l.status || "new") === "follow_up" && isToday(l.follow_up_date),
  ).length;
  const activeCount = counts.active;
  const convertedThisMonth = cmFiltered.filter(
    (l) => (l.status || "new") === "converted" && isThisMonth(l.created_at),
  ).length;

  // Final filtered list (status + search)
  const visible = useMemo(() => {
    let out = cmFiltered;
    if (statusFilter !== "all") {
      out = out.filter((l) => (l.status || "new") === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      out = out.filter(
        (l) =>
          (l.full_name || "").toLowerCase().includes(q) ||
          (l.elder_name || "").toLowerCase().includes(q) ||
          (l.phone || "").includes(q),
      );
    }
    return out;
  }, [cmFiltered, statusFilter, search]);

  return (
    <main className="min-h-screen bg-[#f7f9fa] text-[#10242b]">
      {/* Header */}
      <header className="border-b border-[#e2e8eb] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-semibold tracking-[-0.02em]">Portea</h1>
            <span className="text-sm text-[#7a8c92]">CM Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/analytics"
              className="rounded-full border border-[#d7e7ea] bg-white px-4 py-2 text-sm font-medium text-[#0b7c87] hover:bg-[#f7fbfb]"
            >
              Marketing analytics →
            </Link>
            <select
              value={cm}
              onChange={(e) => setCm(e.target.value)}
              className="rounded-lg border-2 border-[#0f9aa8] bg-white px-3 py-1.5 text-sm font-medium text-[#0b7c87] outline-none focus:ring-2 focus:ring-[#0f9aa8]/30"
            >
              {CM_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={fetchLeads}
              className="rounded-lg border border-[#d7e7ea] bg-white px-3 py-1.5 text-sm font-medium text-[#10242b] hover:bg-[#f7fbfb]"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-lg border border-[#d7e7ea] bg-white px-3 py-1.5 text-sm font-medium text-[#10242b] hover:bg-[#f7fbfb]"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="NEW LEADS" value={newLeadsCount} color="#2563eb" />
          <StatCard label="FOLLOW-UPS TODAY" value={followUpsToday} color="#ea580c" />
          <StatCard label="ACTIVE PATIENTS" value={activeCount} color="#16a34a" />
          <StatCard label="CONVERTED THIS MONTH" value={convertedThisMonth} color="#0f9aa8" />
        </div>

        {/* Filter pills + search */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <FilterPill
            label={`All (${counts.all})`}
            active={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
          />
          {LIFECYCLE_STATUSES.map((s) => (
            <FilterPill
              key={s}
              label={`${STATUS_LABELS[s]} (${counts[s] || 0})`}
              active={statusFilter === s}
              onClick={() => setStatusFilter(s)}
            />
          ))}
          <div className="ml-auto">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or phone…"
              className="w-64 rounded-full border border-[#d7e7ea] bg-white px-4 py-2 text-sm outline-none focus:border-[#0f9aa8] focus:ring-2 focus:ring-[#0f9aa8]/20"
            />
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-[#e2e8eb] bg-white shadow-sm">
          {loading ? (
            <p className="p-8 text-center text-sm text-[#7a8c92]">Loading leads…</p>
          ) : error ? (
            <p className="p-8 text-center text-sm text-rose-600">{error}</p>
          ) : visible.length === 0 ? (
            <p className="p-10 text-center text-sm text-[#7a8c92]">
              No leads match the current filters yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-[#f7fbfb] text-left text-xs font-semibold uppercase tracking-[0.12em] text-[#0b7c87]">
                  <tr>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Caller</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">City</th>
                    <th className="px-4 py-3">Condition · needs</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">CM</th>
                    <th className="px-4 py-3">Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaf2f4]">
                  {visible.map((lead) => {
                    const status: LifecycleStatus = lead.status || "new";
                    return (
                      <tr key={lead.id} className="align-top hover:bg-[#fafdfd]">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#10242b]">
                            {lead.elder_name || "—"}
                          </p>
                          {lead.vertical ? (
                            <p className="text-xs text-[#7a8c92]">{lead.vertical}</p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {lead.full_name || "—"}
                          {lead.relationship ? (
                            <p className="text-xs text-[#7a8c92]">{lead.relationship}</p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {lead.phone ? (
                            <a
                              href={`tel:${lead.phone.replace(/\D/g, "")}`}
                              className="text-[#10242b] hover:text-[#0f9aa8]"
                            >
                              {lead.phone}
                            </a>
                          ) : (
                            <span className="text-[#7a8c92]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">{lead.city || "—"}</td>
                        <td className="px-4 py-3 text-sm">
                          <p className="font-semibold text-[#10242b]">
                            {lead.condition || "—"}
                          </p>
                          {lead.needs ? (
                            <p className="text-xs text-[#7a8c92]">{lead.needs}</p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_PILL[status]}`}
                          >
                            {STATUS_LABELS[status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {lead.care_manager || (
                            <span className="text-[#7a8c92]">Unassigned</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#7a8c92]">
                          {timeAgo(lead.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs text-[#7a8c92]">
          Showing {visible.length} of {leads.length} intake patients. Status and care
          manager are read from the Google Sheet — edit them directly in the sheet for
          now; live updates land here on the next Refresh.
        </p>
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e2e8eb] bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7a8c92]">
        {label}
      </p>
      <p
        className="mt-3 text-3xl font-semibold tracking-[-0.03em]"
        style={{ color }}
      >
        {value}
      </p>
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-[#10242b] text-white shadow"
          : "border border-[#d7e7ea] bg-white text-[#10242b] hover:bg-[#f7fbfb]"
      }`}
    >
      {label}
    </button>
  );
}
