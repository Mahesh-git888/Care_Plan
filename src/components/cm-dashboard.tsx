"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  LIFECYCLE_STATUSES,
  type AiBrief,
  type CarePlan,
  type LeadRecord,
  type LifecycleStatus,
} from "@/lib/lead-types";
import { PasswordChangeModal } from "@/components/password-change-modal";
import { upload as uploadToBlob } from "@vercel/blob/client";

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

// Fallback when /api/admin/leads hasn't responded yet or the user list is
// empty. Replaced by the server-supplied list once leads load.
const FALLBACK_CM_OPTIONS = ["Meera", "Priya", "Rahul"];

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

type Viewer = {
  role: "admin" | "cm";
  name: string;
  email: string;
  must_change_password?: boolean;
};

export function CmDashboard() {
  const router = useRouter();
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [cmNames, setCmNames] = useState<string[]>(FALLBACK_CM_OPTIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cm, setCm] = useState<string>("All CMs");
  const [statusFilter, setStatusFilter] = useState<LifecycleStatus | "all">("all");
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/leads?kind=intake", { cache: "no-store" });
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const body = (await res.json()) as {
        leads?: LeadRecord[];
        error?: string;
        viewer?: Viewer;
        cms?: string[];
      };
      if (!res.ok) throw new Error(body.error || "Failed to load leads");
      setLeads(body.leads || []);
      if (body.viewer) setViewer(body.viewer);
      if (Array.isArray(body.cms) && body.cms.length > 0) setCmNames(body.cms);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  // Force a password change when the session says the user is still on a
  // temporary (admin-set) password. The modal blocks the rest of the UI.
  useEffect(() => {
    if (viewer?.must_change_password) setPasswordModalOpen(true);
  }, [viewer]);

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
            <span className="text-sm text-[#7a8c92]">
              {viewer?.role === "cm" ? "My leads" : "CM Dashboard"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {viewer ? (
              <span className="hidden text-sm text-[#54727a] sm:inline">
                {viewer.name}
                {viewer.role === "admin" ? " · admin" : ""}
              </span>
            ) : null}
            <Link
              href="/admin/analytics"
              className="rounded-full border border-[#d7e7ea] bg-white px-4 py-2 text-sm font-medium text-[#0b7c87] hover:bg-[#f7fbfb]"
            >
              Marketing analytics →
            </Link>
            {viewer?.role === "admin" ? (
              <Link
                href="/admin/users"
                className="rounded-full border border-[#d7e7ea] bg-white px-4 py-2 text-sm font-medium text-[#0b7c87] hover:bg-[#f7fbfb]"
              >
                Manage users
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => setPasswordModalOpen(true)}
              className="rounded-lg border border-[#d7e7ea] bg-white px-3 py-1.5 text-sm font-medium text-[#10242b] hover:bg-[#f7fbfb]"
            >
              Change password
            </button>
            {viewer?.role === "admin" ? (
              <select
                value={cm}
                onChange={(e) => setCm(e.target.value)}
                className="rounded-lg border-2 border-[#0f9aa8] bg-white px-3 py-1.5 text-sm font-medium text-[#0b7c87] outline-none focus:ring-2 focus:ring-[#0f9aa8]/30"
              >
                <option value="All CMs">All CMs</option>
                <option value="Unassigned">Unassigned</option>
                {cmNames.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : null}
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
                          {lead.routed_to === "sales" ? (
                            <span className="mt-1 flex w-fit items-center gap-1 rounded-full bg-[#fff1ec] px-2.5 py-1 text-[11px] font-semibold text-[#c2410c]">
                              Sent to sales team
                            </span>
                          ) : null}
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
          cmNames={cmNames}
          viewer={viewer}
          onClose={() => setSelectedId(null)}
          onPatch={onLeadSaved}
          onSaved={(u) => {
            onLeadSaved(u);
            setSelectedId(null);
          }}
        />
      ) : null}

      {passwordModalOpen ? (
        <PasswordChangeModal
          forced={viewer?.must_change_password ?? false}
          onClose={() => setPasswordModalOpen(false)}
          onDone={() => {
            setPasswordModalOpen(false);
            void fetchLeads(); // refresh viewer so must_change_password clears
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
  cmNames,
  viewer,
  onClose,
  onPatch,
  onSaved,
}: {
  lead: LeadRecord;
  cmNames: string[];
  viewer: Viewer | null;
  onClose: () => void;
  onPatch: (l: LeadRecord) => void;
  onSaved: (l: LeadRecord) => void;
}) {
  const [status, setStatus] = useState<LifecycleStatus>(lead.status || "new");
  const [brief, setBrief] = useState<AiBrief | undefined>(lead.ai_brief);
  const [briefLoading, setBriefLoading] = useState(false);
  const [briefError, setBriefError] = useState<string | null>(null);

  // Feature 3: AI care plan.
  const [carePlan, setCarePlan] = useState<CarePlan | undefined>(lead.care_plan);
  const [carePlanNotes, setCarePlanNotes] = useState<string>(lead.care_plan_notes ?? "");
  const [carePlanLoading, setCarePlanLoading] = useState(false);
  const [carePlanError, setCarePlanError] = useState<string | null>(null);

  // Feature 2: post-call recording, transcript, observations.
  const [recordingUrl, setRecordingUrl] = useState(lead.call_recording_url ?? "");
  const [observations, setObservations] = useState(lead.call_observations ?? "");
  const [transcript, setTranscript] = useState<string | undefined>(
    lead.call_transcript,
  );
  const [transcribing, setTranscribing] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);
  const [savingCallInfo, setSavingCallInfo] = useState(false);
  const [callInfoFeedback, setCallInfoFeedback] = useState<string | null>(null);
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
          id: lead.id,
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

  async function transcribeFromUrl() {
    const url = recordingUrl.trim();
    if (!url) {
      setTranscribeError("Please paste a recording link first.");
      return;
    }
    setTranscribing(true);
    setTranscribeError(null);
    try {
      const res = await fetch("/api/admin/leads/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lead.id, source: "url", url }),
      });
      const body = (await res.json()) as {
        ok?: boolean;
        transcript?: string;
        transcript_at?: string;
        error?: string;
      };
      if (!res.ok || !body.ok || !body.transcript) {
        throw new Error(body.error || "Transcription failed.");
      }
      setTranscript(body.transcript);
      onPatch({
        ...lead,
        call_recording_url: url,
        call_transcript: body.transcript,
        call_transcript_at: body.transcript_at,
      });
    } catch (err) {
      setTranscribeError(
        err instanceof Error ? err.message : "Transcription failed.",
      );
    } finally {
      setTranscribing(false);
    }
  }

  async function uploadAndTranscribe(file: File) {
    setTranscribeError(null);
    setUploadingFile(true);
    try {
      // Direct client-to-blob upload using the upload-token route. Bypasses
      // the Next.js API body limit so large MP3 files go through.
      const blob = await uploadToBlob(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/admin/leads/upload-token",
      });
      setUploadingFile(false);
      setTranscribing(true);
      const res = await fetch("/api/admin/leads/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: lead.id,
          source: "blob",
          blob_url: blob.url,
        }),
      });
      const body = (await res.json()) as {
        ok?: boolean;
        transcript?: string;
        transcript_at?: string;
        error?: string;
      };
      if (!res.ok || !body.ok || !body.transcript) {
        throw new Error(body.error || "Transcription failed.");
      }
      setTranscript(body.transcript);
      onPatch({
        ...lead,
        call_transcript: body.transcript,
        call_transcript_at: body.transcript_at,
      });
    } catch (err) {
      setTranscribeError(
        err instanceof Error ? err.message : "Upload or transcription failed.",
      );
    } finally {
      setUploadingFile(false);
      setTranscribing(false);
    }
  }

  async function saveCallInfo() {
    setSavingCallInfo(true);
    setCallInfoFeedback(null);
    try {
      const res = await fetch("/api/admin/leads/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: lead.id,
          call_recording_url: recordingUrl.trim(),
          call_observations: observations,
        }),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) throw new Error(body.error || "Save failed.");
      setCallInfoFeedback("Saved ✓");
      onPatch({
        ...lead,
        call_recording_url: recordingUrl.trim(),
        call_observations: observations,
      });
      setTimeout(() => setCallInfoFeedback(null), 2500);
    } catch (err) {
      setCallInfoFeedback(
        err instanceof Error ? err.message : "Save failed.",
      );
    } finally {
      setSavingCallInfo(false);
    }
  }

  async function handleGenerateBrief() {
    setBriefLoading(true);
    setBriefError(null);
    try {
      const res = await fetch("/api/admin/leads/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lead.id }),
      });
      const body = (await res.json()) as {
        ok?: boolean;
        brief?: AiBrief;
        error?: string;
      };
      if (!res.ok || !body.ok || !body.brief) {
        throw new Error(body.error || "Could not generate the brief.");
      }
      setBrief(body.brief);
      onPatch({ ...lead, ai_brief: body.brief });
    } catch (err) {
      setBriefError(
        err instanceof Error ? err.message : "Could not generate the brief.",
      );
    } finally {
      setBriefLoading(false);
    }
  }

  async function handleGenerateCarePlan() {
    setCarePlanLoading(true);
    setCarePlanError(null);
    try {
      const res = await fetch("/api/admin/leads/care-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lead.id, notes: carePlanNotes }),
      });
      const body = (await res.json()) as {
        ok?: boolean;
        care_plan?: CarePlan;
        error?: string;
      };
      if (!res.ok || !body.ok || !body.care_plan) {
        throw new Error(body.error || "Could not generate the care plan.");
      }
      setCarePlan(body.care_plan);
      onPatch({ ...lead, care_plan: body.care_plan, care_plan_notes: carePlanNotes });
    } catch (err) {
      setCarePlanError(
        err instanceof Error ? err.message : "Could not generate the care plan.",
      );
    } finally {
      setCarePlanLoading(false);
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
              ) : lead.attribution?.gclid ||
                lead.attribution?.gbraid ||
                lead.attribution?.wbraid ||
                lead.attribution?.msclkid ? (
                // An ad click carries a click id but often no utm_source.
                // Showing "organic" here would contradict the routing badge.
                <span className="font-semibold">paid click</span>
              ) : (
                <span className="text-[#7a8c92]">organic / direct</span>
              )}
            </Fact>
            <Fact label="Routing">
              {lead.routed_to === "sales" ? (
                <>
                  <span className="inline-flex w-fit items-center rounded-full bg-[#fff1ec] px-2.5 py-1 text-xs font-semibold text-[#c2410c]">
                    Sent to sales team
                  </span>
                  {lead.sales_forward_status && lead.sales_forward_status !== "ok" ? (
                    <p className="mt-1 text-xs text-[#b91c1c]">
                      Forward status: {lead.sales_forward_status}
                    </p>
                  ) : null}
                </>
              ) : (
                <span className="text-[#7a8c92]">Care team</span>
              )}
            </Fact>
          </div>

          {/* Pre-call brief */}
          <div className="space-y-3 rounded-2xl border border-[#e2e8eb] p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-[#10242b]">Pre-call brief</h3>
              {brief ? (
                <button
                  type="button"
                  onClick={handleGenerateBrief}
                  disabled={briefLoading}
                  className="text-xs font-semibold text-[#0b7c87] hover:underline disabled:opacity-50"
                >
                  {briefLoading ? "Working..." : "Regenerate"}
                </button>
              ) : null}
            </div>

            {!brief && !briefLoading ? (
              <>
                <p className="text-xs text-[#7a8c92]">
                  Generate a quick summary and recommended questions before you call
                  this family.
                </p>
                <button
                  type="button"
                  onClick={handleGenerateBrief}
                  className="rounded-full bg-[#0f9aa8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0b7c87]"
                >
                  Generate brief
                </button>
              </>
            ) : null}

            {briefLoading ? (
              <p className="text-sm text-[#7a8c92]">Generating brief...</p>
            ) : null}

            {briefError ? (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {briefError}
              </p>
            ) : null}

            {brief && !briefLoading ? (
              <div className="space-y-4">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-[#eaf2f4]">
                    {brief.summary.map((row) => (
                      <tr key={row.label}>
                        <td className="w-32 py-2 pr-4 align-top text-xs font-semibold uppercase tracking-[0.12em] text-[#7a8c92]">
                          {row.label}
                        </td>
                        <td className="py-2 text-sm text-[#10242b]">
                          {row.label.toLowerCase() === "urgency" ? (
                            <UrgencyValue value={row.value} />
                          ) : (
                            row.value
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7a8c92]">
                    Recommended questions
                  </p>
                  <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-[#10242b]">
                    {brief.questions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ol>
                </div>
                {brief.generated_by === "stub" ? (
                  <p className="text-xs text-[#a0adb2]">
                    Sample brief. Live AI generation activates once the Vertex AI key
                    is added.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* After the call: recording, transcript, observations */}
          <div className="space-y-5 rounded-2xl border border-[#e2e8eb] p-5">
            <div>
              <h3 className="text-sm font-semibold text-[#10242b]">After the call</h3>
           
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#7a8c92]">
                  Recording link 
                </span>
                <input
                  type="url"
                  value={recordingUrl}
                  onChange={(e) => setRecordingUrl(e.target.value)}
                  placeholder="Paste the link here"
                  disabled={transcribing || uploadingFile}
                  className="mt-1 w-full rounded-lg border border-[#d7e7ea] px-3 py-2 text-sm outline-none focus:border-[#0f9aa8] focus:ring-2 focus:ring-[#0f9aa8]/20"
                />
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={transcribeFromUrl}
                  disabled={!recordingUrl.trim() || transcribing || uploadingFile}
                  className="rounded-full bg-[#0f9aa8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0b7c87] disabled:opacity-50"
                >
                  {transcribing
                    ? "Transcribing..."
                    : transcript
                      ? "Re-transcribe from link"
                      : "Transcribe from link"}
                </button>
                <span className="text-xs text-[#7a8c92]">or</span>
                <label
                  className={`cursor-pointer rounded-full border border-[#d7e7ea] bg-white px-4 py-2 text-sm font-semibold text-[#10242b] hover:bg-[#f7fbfb] ${
                    transcribing || uploadingFile
                      ? "pointer-events-none opacity-50"
                      : ""
                  }`}
                >
                  {uploadingFile ? "Uploading..." : "Upload audio file"}
                  <input
                    type="file"
                    accept="audio/*"
                    disabled={transcribing || uploadingFile}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void uploadAndTranscribe(file);
                      event.target.value = "";
                    }}
                    className="hidden"
                  />
                </label>
              </div>
              {transcribing || uploadingFile ? (
                <p className="text-xs text-[#7a8c92]">
                  {uploadingFile
                    ? "Sending the file to secure storage..."
                    : "Transcribing the audio. This can take 30 to 60 seconds for longer calls."}
                </p>
              ) : null}
              {transcribeError ? (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {transcribeError}
                </p>
              ) : null}
            </div>

            {transcript ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7a8c92]">
                  Transcript
                </p>
                <pre className="mt-1 max-h-72 overflow-y-auto whitespace-pre-wrap rounded-lg border border-[#e2e8eb] bg-[#f7fbfb] p-3 text-sm leading-relaxed text-[#10242b]">
                  {transcript}
                </pre>
              </div>
            ) : null}

            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#7a8c92]">
                Observations from the call
              </span>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={4}
                placeholder="What stood out: patient's state, family dynamic, anything urgent or to follow up on."
                className="mt-1 w-full rounded-lg border border-[#d7e7ea] px-3 py-2 text-sm outline-none focus:border-[#0f9aa8] focus:ring-2 focus:ring-[#0f9aa8]/20"
              />
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={saveCallInfo}
                disabled={savingCallInfo}
                className="rounded-full bg-[#0f9aa8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0b7c87] disabled:opacity-50"
              >
                {savingCallInfo ? "Saving..." : "Save link & observations"}
              </button>
              {callInfoFeedback ? (
                <span className="text-xs text-[#7a8c92]">{callInfoFeedback}</span>
              ) : null}
            </div>

            {lead.notes ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7a8c92]">
                  Notes history
                </p>
                <pre className="mt-1 max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg border border-[#e2e8eb] bg-[#f7fbfb] p-3 text-xs leading-relaxed text-[#10242b]">
                  {lead.notes}
                </pre>
                <p className="mt-1 text-xs text-[#7a8c92]">
                  Add a new note via the &quot;Quick note&quot; field in the Care manager update box below.
                </p>
              </div>
            ) : null}
          </div>

          {/* Care plan (Feature 3) */}
          <div className="space-y-3 rounded-2xl border border-[#e2e8eb] p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-[#10242b]">Care plan</h3>
              {carePlan ? (
                <button
                  type="button"
                  onClick={handleGenerateCarePlan}
                  disabled={carePlanLoading}
                  className="text-xs font-semibold text-[#0b7c87] hover:underline disabled:opacity-50"
                >
                  {carePlanLoading ? "Working..." : "Regenerate"}
                </button>
              ) : null}
            </div>

            <p className="text-xs text-[#7a8c92]">
              Paste the doctor&apos;s notes / clinical brief. The plan also draws on the
              intake, transcript, and observations above. A clinician should review the
              draft before sharing.
            </p>

            <textarea
              value={carePlanNotes}
              onChange={(e) => setCarePlanNotes(e.target.value)}
              rows={5}
              placeholder="Doctor's clinical notes / brief (diagnosis, timeline, current status, services, equipment, special requests)..."
              className="w-full rounded-lg border border-[#d7e7ea] bg-white px-3 py-2 text-sm"
            />

            <button
              type="button"
              onClick={handleGenerateCarePlan}
              disabled={carePlanLoading}
              className="rounded-full bg-[#0f9aa8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0b7c87] disabled:opacity-50"
            >
              {carePlanLoading
                ? "Generating..."
                : carePlan
                  ? "Regenerate care plan"
                  : "Generate care plan"}
            </button>

            {carePlanError ? (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {carePlanError}
              </p>
            ) : null}

            {carePlan ? (
              <div className="space-y-3 rounded-xl border border-[#e2e8eb] bg-[#f7fbfb] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#10242b]">{carePlan.title}</p>
                    <p className="text-xs text-[#7a8c92]">{carePlan.subtitle}</p>
                  </div>
                  <a
                    href={`/api/admin/leads/care-plan.docx?id=${encodeURIComponent(lead.id)}`}
                    className="flex-none rounded-full bg-[#10242b] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0b1a20]"
                  >
                    Download .docx
                  </a>
                </div>
                {carePlan.care_goals.length ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7a8c92]">
                      Care goals
                    </p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-[#10242b]">
                      {carePlan.care_goals.slice(0, 6).map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {carePlan.gaps.length ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#b45309]">
                      To confirm at first visit
                    </p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-[#7a4a12]">
                      {carePlan.gaps.slice(0, 6).map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {carePlan.generated_by === "stub" ? (
                  <p className="text-xs text-[#a0adb2]">
                    Sample plan. Live AI generation activates once the Gemini / Vertex key
                    is configured.
                  </p>
                ) : null}
              </div>
            ) : null}
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
                  <option value="Unassigned">Unassigned</option>
                  {(viewer?.role === "cm"
                    ? cmNames.filter((n) => n === viewer.name)
                    : cmNames
                  ).map((o) => (
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

// Colour-coding for the brief's urgency levels.
const URGENCY_STYLE: Record<string, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

// Maps any urgency word the AI returns to a current level. Accepts the legacy
// Green / Amber / Red wording too, so briefs generated earlier still colour
// correctly without needing a regenerate.
const URGENCY_ALIASES: Record<string, string> = {
  low: "low",
  green: "low",
  medium: "medium",
  amber: "medium",
  high: "high",
  red: "high",
};

// Renders the brief's "Urgency" value with the level word (Low / Medium /
// High) shown as a colour-coded pill, followed by the reason text.
function UrgencyValue({ value }: { value: string }) {
  const match = value.match(/^\s*(low|medium|high|green|amber|red)\b[\s:.-]*/i);
  if (!match) {
    return <>{value}</>;
  }
  const level = URGENCY_ALIASES[match[1].toLowerCase()] ?? "low";
  const rest = value.slice(match[0].length).trim();
  return (
    <span>
      <span
        className={`mr-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${URGENCY_STYLE[level]}`}
      >
        {level}
      </span>
      {rest}
    </span>
  );
}
