import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminHeaderActions } from "@/components/admin-header-actions";
import { isAdminAuthed, isAdminConfigured } from "@/lib/admin-auth";
import { readLeads, type LeadRecord } from "@/lib/lead-store";
import { getPageViewStats, type PageViewStats } from "@/lib/page-views";

export const metadata: Metadata = {
  title: "Portea Marketing Analytics",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function kindBadge(kind: LeadRecord["kind"]) {
  if (kind === "intake") {
    return (
      <span className="rounded-full bg-[#0f9aa8] px-2.5 py-1 text-xs font-semibold text-white">
        Intake form
      </span>
    );
  }
  if (kind === "call_click") {
    return (
      <span className="rounded-full bg-[#fff1ec] px-2.5 py-1 text-xs font-semibold text-[#a53b16]">
        Call clicked
      </span>
    );
  }
  return (
    <span className="rounded-full bg-[#e6f7ec] px-2.5 py-1 text-xs font-semibold text-[#0f7a3c]">
      WhatsApp clicked
    </span>
  );
}

const RANGES: { key: string; label: string; hours: number | null }[] = [
  { key: "1h", label: "Last hour", hours: 1 },
  { key: "24h", label: "Last 24h", hours: 24 },
  { key: "7d", label: "Last 7 days", hours: 24 * 7 },
  { key: "30d", label: "Last 30 days", hours: 24 * 30 },
  { key: "all", label: "All time", hours: null },
];

export default async function MarketingAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  if (!isAdminConfigured()) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 text-[#10242b]">
        <h1 className="text-3xl font-semibold">Analytics disabled</h1>
        <p className="mt-3 text-base text-[#445d66]">
          Set <code className="rounded bg-slate-100 px-2 py-0.5">PORTEA_USERS_JSON</code>{" "}
          (or the legacy <code className="rounded bg-slate-100 px-2 py-0.5">PORTEA_ADMIN_PASSWORD</code>)
          to enable admin access.
        </p>
      </main>
    );
  }
  if (!(await isAdminAuthed())) {
    redirect("/admin/login");
  }

  const sp = await searchParams;
  const activeRange = RANGES.find((r) => r.key === sp?.range)?.key ?? "all";
  const activeDef = RANGES.find((r) => r.key === activeRange)!;
  const cutoff =
    activeDef.hours != null
      ? new Date(Date.now() - activeDef.hours * 3_600_000)
      : null;
  const cutoffIso = cutoff?.toISOString();

  let all: LeadRecord[] = [];
  let loadError: string | null = null;
  try {
    all = await readLeads(2000);
  } catch (err) {
    loadError =
      err instanceof Error ? err.message : "Could not load leads from the database.";
  }

  if (loadError) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 text-[#10242b]">
        <h1 className="text-3xl font-semibold">Analytics unavailable</h1>
        <p className="mt-3 text-base text-[#445d66]">{loadError}</p>
        <p className="mt-2 text-sm text-[#7a8c92]">
          Confirm <code className="rounded bg-slate-100 px-2 py-0.5">POSTGRES_URL</code> is
          set on the server.
        </p>
      </main>
    );
  }

  let pv: PageViewStats = { total: 0, byCampaign: {} };
  try {
    pv = await getPageViewStats(cutoffIso);
  } catch {
    // The page_views table may not exist yet on first run; degrade gracefully.
  }

  const ranged = cutoff
    ? all.filter((l) => {
        const t = new Date(l.created_at).getTime();
        return !Number.isNaN(t) && t >= cutoff.getTime();
      })
    : all;

  const clicks = ranged.filter((l) => l.kind !== "intake");
  const intakes = ranged.filter((l) => l.kind === "intake");

  // Roll up by utm_campaign
  type Roll = { campaign: string; intakes: number; calls: number; whatsapp: number };
  const byCampaign = new Map<string, Roll>();
  function bump(c: string, k: LeadRecord["kind"]) {
    const r =
      byCampaign.get(c) ?? { campaign: c, intakes: 0, calls: 0, whatsapp: 0 };
    if (k === "intake") r.intakes++;
    if (k === "call_click") r.calls++;
    if (k === "whatsapp_click") r.whatsapp++;
    byCampaign.set(c, r);
  }
  for (const l of ranged) {
    bump(l.attribution?.utm_campaign || "(organic / direct)", l.kind);
  }
  // Surface campaigns that have views but no leads yet, so paid traffic that
  // isn't converting is still visible in the table.
  for (const camp of Object.keys(pv.byCampaign)) {
    if (!byCampaign.has(camp)) {
      byCampaign.set(camp, { campaign: camp, intakes: 0, calls: 0, whatsapp: 0 });
    }
  }
  const rollups = Array.from(byCampaign.values()).sort(
    (a, b) => b.intakes + b.calls + b.whatsapp - (a.intakes + a.calls + a.whatsapp),
  );

  const callCount = clicks.filter((l) => l.kind === "call_click").length;
  const waCount = clicks.filter((l) => l.kind === "whatsapp_click").length;

  return (
    <main className="min-h-screen bg-[#f7f9fa] text-[#10242b]">
      <header className="border-b border-[#e2e8eb] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-semibold tracking-[-0.02em]">Portea</h1>
            <span className="text-sm text-[#7a8c92]">Marketing Analytics</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/leads"
              className="rounded-full border border-[#d7e7ea] bg-white px-4 py-2 text-sm font-medium text-[#0b7c87] hover:bg-[#f7fbfb]"
            >
              ← CM Dashboard
            </Link>
            <AdminHeaderActions csvHref="/api/v1/admin/leads.csv" />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        {/* Time range filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7a8c92]">
            Range
          </span>
          {RANGES.map((r) => {
            const active = r.key === activeRange;
            return (
              <Link
                key={r.key}
                href={`/admin/analytics?range=${r.key}`}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-[#0f9aa8] text-white shadow-sm"
                    : "border border-[#d7e7ea] bg-white text-[#0b7c87] hover:bg-[#f7fbfb]"
                }`}
              >
                {r.label}
              </Link>
            );
          })}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <StatCard label="LANDING PAGE VIEWS" value={pv.total} color="#0b7c87" />
          <StatCard label="INTAKE FORMS" value={intakes.length} color="#0f9aa8" />
          <StatCard label="CALL CLICKS" value={callCount} color="#ea580c" />
          <StatCard label="WHATSAPP CLICKS" value={waCount} color="#16a34a" />
          <StatCard label="TOTAL EVENTS" value={ranged.length} color="#10242b" />
        </div>

        {/* Campaign roll-up */}
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.02em]">
            Performance by campaign
          </h2>
          <p className="mt-1 text-sm text-[#7a8c92]">
            Counts come from the UTM params attached to the landing-page URL ads point at.
          </p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-[#e2e8eb] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-[#f7fbfb] text-left text-xs font-semibold uppercase tracking-[0.12em] text-[#0b7c87]">
                  <tr>
                    <th className="px-4 py-3">Campaign</th>
                    <th className="px-4 py-3 text-right">Views</th>
                    <th className="px-4 py-3 text-right">Intakes</th>
                    <th className="px-4 py-3 text-right">Call clicks</th>
                    <th className="px-4 py-3 text-right">WhatsApp clicks</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-right">Lead rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaf2f4]">
                  {rollups.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-sm text-[#7a8c92]">
                        No events yet.
                      </td>
                    </tr>
                  ) : (
                    rollups.map((r) => {
                      const views = pv.byCampaign[r.campaign] ?? 0;
                      const leadRate =
                        views > 0
                          ? `${((r.intakes / views) * 100).toFixed(1)}%`
                          : "—";
                      return (
                        <tr key={r.campaign} className="align-top">
                          <td className="px-4 py-3 font-semibold">{r.campaign}</td>
                          <td className="px-4 py-3 text-right">{views || "—"}</td>
                          <td className="px-4 py-3 text-right">{r.intakes}</td>
                          <td className="px-4 py-3 text-right">{r.calls}</td>
                          <td className="px-4 py-3 text-right">{r.whatsapp}</td>
                          <td className="px-4 py-3 text-right font-semibold">
                            {r.intakes + r.calls + r.whatsapp}
                          </td>
                          <td className="px-4 py-3 text-right">{leadRate}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Click events */}
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.02em]">Click events</h2>
          <p className="mt-1 text-sm text-[#7a8c92]">
            Anonymous. We know an ad drove the click but not who clicked. Helpful for
            judging top-of-funnel volume per campaign.
          </p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-[#e2e8eb] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-[#f7fbfb] text-left text-xs font-semibold uppercase tracking-[0.12em] text-[#0b7c87]">
                  <tr>
                    <th className="px-4 py-3">When</th>
                    <th className="px-4 py-3">Event</th>
                    <th className="px-4 py-3">Vertical</th>
                    <th className="px-4 py-3">Source · campaign</th>
                    <th className="px-4 py-3">Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaf2f4]">
                  {clicks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-sm text-[#7a8c92]">
                        No click events yet.
                      </td>
                    </tr>
                  ) : (
                    clicks.slice(0, 200).map((c) => (
                      <tr key={c.id} className="align-top">
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-[#7a8c92]">
                          {formatTime(c.created_at)}
                        </td>
                        <td className="px-4 py-3">{kindBadge(c.kind)}</td>
                        <td className="px-4 py-3 text-sm">{c.vertical ?? "-"}</td>
                        <td className="px-4 py-3 text-xs">
                          {c.attribution?.utm_source ? (
                            <>
                              <span className="font-semibold text-[#10242b]">
                                {c.attribution.utm_source}
                              </span>
                              {c.attribution.utm_medium ? ` · ${c.attribution.utm_medium}` : ""}
                              {c.attribution.utm_campaign ? (
                                <p className="mt-0.5 text-[#445d66]">
                                  {c.attribution.utm_campaign}
                                </p>
                              ) : null}
                            </>
                          ) : (
                            <span className="text-[#7a8c92]">organic / direct</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#7a8c92]">
                          {c.click_target || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
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
