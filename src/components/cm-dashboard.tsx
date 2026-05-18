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

const CM_OPTIONS = ["Unassigned", "Meera", "Priya", "Rahul"];

type TimeWindow = "today" | "this_week" | "this_month" | "all";

const TIME_LABELS: Record<TimeWindow, string> = {
  today: "Today",
  this_week: "This week",
  this_month: "This month",
  all: "All time",
};

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
function startOfThisWeek() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  // Monday as week start.
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return d.getTime();
}
function startOfThisMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0).getTime();
}

function isWithin(window: TimeWindow, iso?: string) {
  if (window === "all") return true;
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (isNaN(t)) return false;
  if (window === "today") return t >= startOfToday();
  if (window === "this_week") return t >= startOfThisWeek();
  return t >= startOfThisMonth();
}

function timeAgo(iso?: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "-";
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
  return d.getTime() >= startOfToday();
}

function isThisMonth(iso?: string): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return false;
  return d.getTime() >= startOfThisMonth();
}

export function CmDashboard() {
  const router = useRouter();
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cm, setCm] = useState<string>("All CMs");
  const [statusFilter, setStatusFilter] = useState<LifecycleStatus | "all">("all");
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  // CM + time filter
  const scoped = useMemo(() => {
    let out = leads.filter((l) => isWithin(timeWindow, l.created_at));
    if (cm !== "All CMs") {
      out = out.filter((l) => (l.care_manager || "Unassigned") === cm);
    }
    return out;
  }, [leads, cm, timeWindow]);

  // Counts per status (within current CM + time scope)
  const counts = useMemo(() => {
    const out: Record<string, number> = { all: scoped.length };
    for (const s of LIFECYCLE_STATUSES) {
      out[s] = scoped.filter((l) => (l.status || "new") === s).length;
    }
    return out;
  }, [scoped]);

  // Top stat cards - also respect CM + time window
  const newLeadsCount = counts.new;
  const followUpsToday = scoped.filter(
    (l) => (l.status || "new") === "follow_up" && isToday(l.follow_up_date),
  ).length;
  const activeCount = counts.active;
  const convertedThisMonth = scoped.filter(
    (l) => (l.status || "new") === "converted" && isThisMonth(l.created_at),
  ).length;

  // Final list
  const visible = useMemo(() => {
    let out = scoped;
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
  }, [scoped, statusFilter, search]);

  const selectedLead = useMemo(
    () => visible.find((l) => l.id === selectedId) ?? leads.find((l) => l.id === selectedId) ?? null,
    [visible, leads, selectedId],
  );

  function onLeadSaved(updated: LeadRecord) {
    setLeads((curr) => curr.map((l) => (l.id === updated.id ? { ...l, ...updated } : l)));
  }

  return (
    <main className="min-h-screen bg-[#f7f9fa] text-[#10242b]">
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
              <option value="All CMs">All CMs</option>
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
        {/* Time window tabs */}
        <div className="mb-4 inline-flex items-center gap-1 rounded-full bg-white p-1 shadow-sm border border-[#e2e8eb]">
          {(Object.keys(TIME_LABELS) as TimeWindow[]).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setTimeWindow(w)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                timeWindow === w
                  ? "bg-[#10242b] text-white"
                  : "text-[#10242b] hover:bg-[#f7fbfb]"
              }`}
            >
              {TIME_LABELS[w]}
            </button>
          ))}
        </div>

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
              placeholder="Search by name or phone..."
              className="w-64 rounded-full border border-[#d7e7ea] bg-white px-4 py-2 text-sm outline-none focus:border-[#0f9aa8] focus:ring-2 focus:ring-[#0f9aa8]/20"
            />
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-[#e2e8eb] bg-white shadow-sm">
          {loading ? (
            <p className="p-8 text-center text-sm text-[#7a8c92]">Loading leads...</p>
          ) : error ? (
            <p className="p-8 text-center text-sm text-rose-600">{error}</p>
          ) : visible.length === 0 ? (
            <p className="p-10 text-center text-sm text-[#7a8c92]">
              No leads match the current filters.
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
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedId(lead.id)}
                        className="cursor-pointer align-top hover:bg-[#fafdfd]"
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#10242b]">
                            {lead.elder_name || "-"}
                          </p>
                          {lead.vertical ? (
                            <p className="text-xs text-[#7a8c92]">{lead.vertical}</p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {lead.full_name || "-"}
                          {lead.relationship ? (
                            <p className="text-xs text-[#7a8c92]">{lead.relationship}</p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {lead.phone ? (
                            <a
                              href={`tel:${lead.phone.replace(/\D/g, "")}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-[#10242b] hover:text-[#0f9aa8]"
                            >
                              {lead.phone}
                            </a>
                          ) : (
                            <span className="text-[#7a8c92]">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">{lead.city || "-"}</td>
                        <td className="px-4 py-3 text-sm">
                          <p className="font-semibold text-[#10242b]">
                            {lead.condition || "-"}
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
          Showing {visible.length} of {scoped.length} in {TIME_LABELS[timeWindow].toLowerCase()}.
          Click any row to open the patient and update status, CM or notes.
        </p>
      </section>

      {selectedLead ? (
        <LeadDetailPanel
          lead={selectedLead}
          onClose={() => setSelectedId(null)}
          onSaved={(u) => {
            onLeadSaved(u);
            setSelectedId(null);
          }}
        />
      ) : null}
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
      <p className="mt-3 text-3xl font-semibold tracking-[-0.03em]" style={{ color }}>
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

function LeadDetailPanel({
  lead,
  onClose,
  onSaved,
}: {
  lead: LeadRecord;
  onClose: () => void;
  onSaved: (l: LeadRecord) => void;
}) {
  const [status, setStatus] = useState<LifecycleStatus>(lead.status || "new");
  const [careManager, setCareManager] = useState<string>(lead.care_manager || "Unassigned");
  const [followUpDate, setFollowUpDate] = useState<string>(
    lead.follow_up_date ? lead.follow_up_date.slice(0, 10) : "",
  );
  const [notes, setNotes] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/leads/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          received_at: lead.created_at,
          phone: lead.phone,
          status,
          care_manager: careManager,
          follow_up_date: followUpDate || "",
          note: notes,
        }),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) throw new Error(body.error || "Save failed");
      onSaved({
        ...lead,
        status,
        care_manager: careManager,
        follow_up_date: followUpDate || undefined,
      });
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex">
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <aside className="relative ml-auto flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#e2e8eb] px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0b7c87]">
              {lead.vertical || "Patient"}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#10242b]">
              {lead.elder_name || "Unnamed patient"}
            </h2>
            <p className="mt-0.5 text-sm text-[#7a8c92]">
              Received {timeAgo(lead.created_at)} · caller {lead.full_name || "-"}
              {lead.relationship ? ` (${lead.relationship})` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#d7e7ea] px-3 py-1 text-sm text-[#10242b] hover:bg-[#f7fbfb]"
          >
            Close
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6 text-sm">
          {/* Patient facts */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <Fact label="Phone">
              {lead.phone ? (
                <a
                  href={`tel:${lead.phone.replace(/\D/g, "")}`}
                  className="font-semibold text-[#0f9aa8] hover:underline"
                >
                  {lead.phone}
                </a>
              ) : (
                "-"
              )}
            </Fact>
            <Fact label="City">{lead.city || "-"}</Fact>
            <Fact label="Condition">{lead.condition || "-"}</Fact>
            <Fact label="Needs">{lead.needs || "-"}</Fact>
            <Fact label="A/B variant">{lead.ab_variant || "-"}</Fact>
            <Fact label="Source · campaign">
              {lead.attribution?.utm_source ? (
                <>
                  <span className="font-semibold">{lead.attribution.utm_source}</span>
                  {lead.attribution.utm_medium ? ` · ${lead.attribution.utm_medium}` : ""}
                  {lead.attribution.utm_campaign ? (
                    <p className="mt-0.5 text-xs text-[#7a8c92]">
                      {lead.attribution.utm_campaign}
                    </p>
                  ) : null}
                </>
              ) : (
                <span className="text-[#7a8c92]">organic / direct</span>
              )}
            </Fact>
          </div>

          {/* Editable fields */}
          <div className="space-y-4 rounded-2xl border border-[#e2e8eb] bg-[#f7fbfb] p-5">
            <h3 className="text-sm font-semibold text-[#10242b]">Care manager update</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Lifecycle status">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as LifecycleStatus)}
                  className="w-full rounded-lg border border-[#d7e7ea] bg-white px-3 py-2 text-sm"
                >
                  {LIFECYCLE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Care manager">
                <select
                  value={careManager}
                  onChange={(e) => setCareManager(e.target.value)}
                  className="w-full rounded-lg border border-[#d7e7ea] bg-white px-3 py-2 text-sm"
                >
                  {CM_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Follow-up date">
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full rounded-lg border border-[#d7e7ea] bg-white px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Quick note (append)">
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Spoke with daughter, will call back tomorrow"
                  className="w-full rounded-lg border border-[#d7e7ea] bg-white px-3 py-2 text-sm"
                />
              </Field>
            </div>
            {feedback ? (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {feedback}
              </p>
            ) : null}
          </div>
        </div>

        <div className="border-t border-[#e2e8eb] bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#d7e7ea] px-4 py-2 text-sm font-medium text-[#10242b] hover:bg-[#f7fbfb]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="rounded-full bg-[#0f9aa8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0b7c87] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save update"}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a8c92]">
        {label}
      </p>
      <p className="mt-1 text-sm text-[#10242b]">{children}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#7a8c92]">
        {label}
      </span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}
