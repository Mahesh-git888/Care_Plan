import { redirect } from "next/navigation";

import { UsersAdmin } from "@/components/users-admin";
import { getSession, isAdminAuthed } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// Admin-only page for creating and managing user accounts. CM users get
// redirected back to their dashboard; not signed in gets sent to login.
export default async function AdminUsersPage() {
  if (!(await isAdminAuthed())) {
    redirect("/admin/login");
  }
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/admin/leads");
  }
  return (
    <main className="min-h-screen bg-[#f7f9fa] px-4 py-8 text-[#10242b] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <UsersAdmin currentEmail={session.email} />
      </div>
    </main>
  );
}
