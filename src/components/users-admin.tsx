"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type User = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "cm";
  active: boolean;
  must_change_password: boolean;
  created_at: string;
};

export function UsersAdmin({ currentEmail }: { currentEmail: string }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const body = (await res.json()) as { users?: User[]; error?: string };
      if (!res.ok) throw new Error(body.error || "Failed to load users.");
      setUsers(body.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function patch(u: User, payload: Record<string, unknown>, doneMessage?: string) {
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        throw new Error(body.error || "Update failed.");
      }
      if (doneMessage) alert(doneMessage);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed.");
    }
  }

  async function toggleActive(u: User) {
    await patch(u, { active: !u.active });
  }

  async function resetPassword(u: User) {
    const newPassword = window.prompt(
      `Set a new temporary password for ${u.name}. They will be required to change it on next sign-in.`,
    );
    if (!newPassword) return;
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }
    await patch(
      u,
      { reset_password: newPassword },
      `Temporary password set for ${u.name}.`,
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/leads"
            className="text-sm font-medium text-[#0b7c87] hover:underline"
          >
            &larr; Back to leads
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#10242b]">
            User accounts
          </h1>
          <p className="mt-1 text-sm text-[#54727a]">
            Create care manager and admin accounts. Each new account starts with a
            temporary password that the user must change on first sign-in.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd((s) => !s)}
          className="rounded-full bg-[#0f9aa8] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0b7c87]"
        >
          {showAdd ? "Cancel" : "Add user"}
        </button>
      </div>

      {showAdd ? (
        <AddUserForm
          onCreated={() => {
            setShowAdd(false);
            load();
          }}
          onCancel={() => setShowAdd(false)}
        />
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-[#e2e8eb] bg-white shadow-sm">
        {loading ? (
          <p className="p-8 text-center text-sm text-[#7a8c92]">Loading users...</p>
        ) : error ? (
          <p className="p-8 text-center text-sm text-rose-600">{error}</p>
        ) : users.length === 0 ? (
          <p className="p-8 text-center text-sm text-[#7a8c92]">No users yet.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-[#f7fbfb] text-left text-xs font-semibold uppercase tracking-[0.12em] text-[#0b7c87]">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaf2f4]">
              {users.map((u) => {
                const isSelf = u.email === currentEmail;
                return (
                  <tr key={u.id} className="align-middle">
                    <td className="px-4 py-3 font-semibold text-[#10242b]">
                      {u.name}
                      {isSelf ? (
                        <span className="ml-2 text-xs font-medium text-[#7a8c92]">
                          (you)
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-[#54727a]">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          u.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {u.active ? (
                          <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500">
                            Inactive
                          </span>
                        )}
                        {u.must_change_password ? (
                          <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                            First sign-in pending
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => resetPassword(u)}
                          className="rounded-full border border-[#d7e7ea] px-3 py-1 text-xs font-medium text-[#10242b] hover:bg-[#f7fbfb]"
                        >
                          Reset password
                        </button>
                        {isSelf ? null : (
                          <button
                            type="button"
                            onClick={() => toggleActive(u)}
                            className="rounded-full border border-[#d7e7ea] px-3 py-1 text-xs font-medium text-[#10242b] hover:bg-[#f7fbfb]"
                          >
                            {u.active ? "Deactivate" : "Reactivate"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function AddUserForm({
  onCreated,
  onCancel,
}: {
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "cm">("cm");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role, password }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error || "Failed to create user.");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-2xl border border-[#e2e8eb] bg-white p-5 shadow-sm"
    >
      <h2 className="text-base font-semibold text-[#10242b]">New user</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7a8c92]">
            Name
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Dr. Meera Sharma"
            className="mt-1 w-full rounded-lg border border-[#d7e7ea] px-3 py-2 text-sm outline-none focus:border-[#0f9aa8] focus:ring-2 focus:ring-[#0f9aa8]/20"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7a8c92]">
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="name@portea.com"
            className="mt-1 w-full rounded-lg border border-[#d7e7ea] px-3 py-2 text-sm outline-none focus:border-[#0f9aa8] focus:ring-2 focus:ring-[#0f9aa8]/20"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7a8c92]">
            Role
          </span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "admin" | "cm")}
            className="mt-1 w-full rounded-lg border border-[#d7e7ea] px-3 py-2 text-sm outline-none focus:border-[#0f9aa8] focus:ring-2 focus:ring-[#0f9aa8]/20"
          >
            <option value="cm">Care manager</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7a8c92]">
            Default password
          </span>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="At least 8 characters"
            className="mt-1 w-full rounded-lg border border-[#d7e7ea] px-3 py-2 text-sm outline-none focus:border-[#0f9aa8] focus:ring-2 focus:ring-[#0f9aa8]/20"
          />
        </label>
      </div>
      <p className="text-xs text-[#7a8c92]">
        Share this password with the new user. They will be required to change it
        the first time they sign in.
      </p>
      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-[#0f9aa8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0b7c87] disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create user"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-[#d7e7ea] px-4 py-2 text-sm font-medium text-[#10242b] hover:bg-[#f7fbfb]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
