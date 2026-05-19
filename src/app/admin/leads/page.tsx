import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { isAdminAuthed, isAdminConfigured } from "@/lib/admin-auth";
import { CmDashboard } from "@/components/cm-dashboard";

export const metadata: Metadata = {
  title: "Portea CM Dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  if (!isAdminConfigured()) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 text-[#10242b]">
        <h1 className="text-3xl font-semibold">Leads admin disabled</h1>
        <p className="mt-3 text-base text-[#445d66]">
          Set <code className="rounded bg-slate-100 px-2 py-0.5">PORTEA_USERS_JSON</code>{" "}
          (or the legacy <code className="rounded bg-slate-100 px-2 py-0.5">PORTEA_ADMIN_PASSWORD</code>)
          on Vercel, then visit{" "}
          <code className="rounded bg-slate-100 px-2 py-0.5">/admin/login</code> and sign in.
        </p>
      </main>
    );
  }

  if (!(await isAdminAuthed())) {
    redirect("/admin/login");
  }

  return <CmDashboard />;
}
