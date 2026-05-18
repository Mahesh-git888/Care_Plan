import { redirect } from "next/navigation";

import { isAdminAuthed } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminIndex() {
  if (await isAdminAuthed()) {
    redirect("/admin/leads");
  }
  redirect("/admin/login");
}
