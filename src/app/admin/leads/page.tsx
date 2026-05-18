import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { isAdminAuthed } from "@/lib/admin-auth";
import { readLeads, maskPhone, type LeadRecord } from "@/lib/lead-store";
import { AdminHeaderActions } from "@/components/admin-header-actions";

export const metadata: Metadata = {
  title: "Portea Leads · Admin",
  robots: { index: false, follow: false },
};

// Always read fresh data — never cache.
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

function badge(kind: LeadRecord["kind"]) {
  const map = {
    intake: { label: "Intake form", bg: "#0f9aa8", color: "#fff" },
    call_click: { label: "Call clicked", bg: "#fff1ec", color: "#a53b16" },
    whatsapp_click: { label: "WhatsApp clicked", bg: "#e6f7ec", color: "#0f7a3c" },
  } as const;
  const meta = map[kind];
  return (
    <span
      className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: meta.bg, color: meta.color }}
    >
      {meta.label}
    </span>
  );
}

export default async function AdminLeadsPage() {
  const adminPassword = process.env.PORTEA_ADMIN_PASSWORD?.trim();

  if (!adminPassword) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 text-[#10242b]">
        <h1 className="text-3xl font-semibold">Leads admin disabled</h1>
        <p className="mt-3 text-base text-[#445d66]">
          Set <code className="rounded bg-slate-100 px-2 py-0.5">PORTEA_ADMIN_PASSWORD</code> in
          the environment, then visit{" "}
          <code className="rounded bg-slate-100 px-2 py-0.5">/admin/login</code> and sign in.
        </p>
      </main>
    );
  }

  if (!(await isAdminAuthed())) {
    redirect("/admin/login");
  }

  const leads = await readLeads(500);
  const intakeCount = leads.filter((l) => l.kind === "intake").length;
  const callCount = leads.filter((l) => l.kind === "call_click").length;
  const waCount = leads.filter((l) => l.kind === "whatsapp_click").length;

  return (
    <main className="min-h-screen bg-[#f4f9fa] text-[#10242b]">
      <header className="border-b border-[#d7e7ea] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0b7c87]">
              Portea · Internal
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">Leads inbox</h1>
            <p className="mt-2 text-sm text-[#445d66]">
              Newest first. Every chatbot intake, call click and WhatsApp click hitting a Portea
              landing page lands here.
            </p>
          </div>
          <AdminHeaderActions csvHref="/api/v1/admin/leads.csv" />
        </div>
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-6 pb-6 sm:grid-cols-4">
          {[
            { label: "Total events", value: leads.length },
            { label: "Intake forms", value: intakeCount },
            { label: "Call clicks", value: callCount },
            { label: "WhatsApp clicks", value: waCount },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-[#d7e7ea] bg-[#f7fbfb] px-4 py-3"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0b7c87]">
                {s.label}
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-[-0.03em]">{s.value}</p>
            </div>
          ))}
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {leads.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#cfe1e3] bg-white p-8 text-center text-sm text-[#445d66]">
            No leads yet. Send some traffic to a vertical landing page — every chatbot intake or
            call/WhatsApp click will appear here.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#d7e7ea] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-[#f7fbfb] text-left text-xs font-semibold uppercase tracking-[0.16em] text-[#0b7c87]">
                  <tr>
                    <th className="px-4 py-3">When</th>
                    <th className="px-4 py-3">Event</th>
                    <th className="px-4 py-3">Vertical</th>
                    <th className="px-4 py-3">Caller</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">City</th>
                    <th className="px-4 py-3">Condition / needs</th>
                    <th className="px-4 py-3">Source · campaign</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaf2f4]">
                  {leads.map((lead) => (
                    <tr key={`${lead.id}-${lead.created_at}`} className="align-top">
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-[#445d66]">
                        {formatTime(lead.created_at)}
                      </td>
                      <td className="px-4 py-3">{badge(lead.kind)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#10242b]">
                        {lead.vertical ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {lead.full_name ?? "—"}
                        {lead.relationship ? (
                          <p className="text-xs text-[#7a8c92]">{lead.relationship}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-[#10242b]">
                        {lead.phone ? (
                          <a
                            href={`tel:${lead.phone.replace(/\D/g, "")}`}
                            className="hover:text-[#0f9aa8]"
                          >
                            {lead.phone}
                          </a>
                        ) : (
                          <span className="text-[#7a8c92]">
                            {lead.ip_hash ? "click only" : "—"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">{lead.city ?? "—"}</td>
                      <td className="px-4 py-3 text-sm">
                        {lead.condition ? (
                          <span className="font-semibold text-[#10242b]">{lead.condition}</span>
                        ) : null}
                        {lead.needs ? (
                          <p className="mt-1 text-xs text-[#445d66]">{lead.needs}</p>
                        ) : null}
                        {lead.elder_name ? (
                          <p className="mt-1 text-[11px] text-[#7a8c92]">
                            Elder: {lead.elder_name}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#445d66]">
                        {lead.attribution?.utm_source ? (
                          <p>
                            <span className="font-semibold text-[#10242b]">
                              {lead.attribution.utm_source}
                            </span>
                            {lead.attribution.utm_medium ? ` · ${lead.attribution.utm_medium}` : ""}
                          </p>
                        ) : null}
                        {lead.attribution?.utm_campaign ? (
                          <p className="mt-0.5">{lead.attribution.utm_campaign}</p>
                        ) : null}
                        {lead.attribution?.gclid ? <p className="mt-0.5">gclid</p> : null}
                        {lead.attribution?.fbclid ? <p className="mt-0.5">fbclid</p> : null}
                        {!lead.attribution?.utm_source &&
                        !lead.attribution?.gclid &&
                        !lead.attribution?.fbclid ? (
                          <span className="text-[#7a8c92]">organic / direct</span>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p className="mt-6 text-xs text-[#7a8c92]">
          Source:{" "}
          {process.env.PORTEA_LEADS_READ_SECRET ? (
            <span className="font-semibold text-[#0b7c87]">Google Sheet (live)</span>
          ) : (
            <span className="font-semibold text-[#0b7c87]">
              Local JSONL (
              <code>{process.env.PORTEA_LEADS_FILE || "/tmp/portea-leads.jsonl"}</code>)
            </span>
          )}
          {process.env.PORTEA_LEADS_WEBHOOK_URL ? (
            <span> · webhook forwarding ON.</span>
          ) : (
            <span> · webhook forwarding OFF — set <code>PORTEA_LEADS_WEBHOOK_URL</code> to push to Sheets / Slack / CRM.</span>
          )}
        </p>
        {(() => {
          const masked = leads.filter((l) => l.phone).slice(0, 1)[0];
          return masked ? (
            <p className="mt-2 text-xs text-[#7a8c92]">Phones masked in logs: e.g. {maskPhone(masked.phone)}.</p>
          ) : null;
        })()}
      </section>
    </main>
  );
}
