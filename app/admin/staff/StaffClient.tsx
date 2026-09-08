"use client";

/**
 * Back-office invitations (PRD §13 Q12).
 *
 * The only supported way to create a staff account — which makes it the only
 * supported way to escalate privilege, and the reason the API restricts it to
 * administrators. Staff cannot invite: if they could, the lowest privilege in
 * the back office could mint the highest, and one phished staff account would
 * be enough.
 *
 * The token never appears here. It goes to the invitee's inbox and nowhere
 * else, because everyone who can read this list would otherwise be able to
 * accept an invitation addressed to somebody else — including one granting
 * administrator.
 *
 * Re-inviting an address withdraws the previous link rather than adding a
 * second, so there is never more than one live invitation per address.
 */

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Send, X } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import { invite, listInvitations, revokeInvitation, type StaffInvitation } from "@/lib/api/admin";
import { DataScreen, ScrollableTable, StatusPill } from "@/components/admin/DataScreen";
import { validateEmail } from "@/lib/validation";

export default function StaffClient() {
  const [rows, setRows] = useState<StaffInvitation[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"STAFF" | "ADMIN">("STAFF");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await listInvitations());
      setError("");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not load invitations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");

    const problem = validateEmail(email);
    if (problem) {
      setError(problem);
      return;
    }

    setBusy(true);
    setError("");
    try {
      await invite(email.trim(), role);
      setMessage(`Invitation sent to ${email.trim()}.`);
      setEmail("");
      void load();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not send that invitation.");
    } finally {
      setBusy(false);
    }
  }

  async function withdraw(row: StaffInvitation) {
    if (!confirm(`Withdraw the invitation to ${row.email}?`)) return;
    try {
      await revokeInvitation(row.id);
      setMessage("Invitation withdrawn. The link no longer works.");
      void load();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not withdraw that.");
    }
  }

  return (
    <DataScreen
      title="Staff"
      description="Invitations expire after seven days and can be used once."
      loading={loading}
      error={error}
      message={message}
      toolbar={
        <button
          type="button"
          onClick={() => void load()}
          className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      }
    >
      <div className="space-y-6">
        <form onSubmit={send} className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-900">Invite someone</h2>
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[16rem] flex-1">
              <label htmlFor="invite-email" className="mb-1 block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="invite-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="e.g. adaeze@kuyashfarms.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label htmlFor="invite-role" className="mb-1 block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="invite-role"
                value={role}
                onChange={(event) => setRole(event.target.value as "STAFF" | "ADMIN")}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="STAFF">Staff</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={busy}
              className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-secondary disabled:opacity-60"
            >
              <Send className="h-4 w-4" /> {busy ? "Sending…" : "Send invitation"}
            </button>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            An administrator can do everything staff can, and can also invite and remove other
            people. Only invite someone as an administrator if they need that.
          </p>
        </form>

        {rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-300 py-12 text-center text-sm text-gray-500">
            No invitations yet.
          </p>
        ) : (
          <ScrollableTable>
            <thead className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Invited by</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{row.email}</td>
                  <td className="px-4 py-3 text-xs uppercase text-gray-600">{row.role}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={row.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {row.invited_by_email ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(row.expires_at).toLocaleDateString("en-NG")}
                  </td>
                  <td className="px-4 py-3">
                    {/* Withdrawing works because acceptance reads the row, not
                        just the signature — a purely stateless token could not
                        be recalled once it had been sent. */}
                    {row.status === "PENDING" && (
                      <button
                        type="button"
                        onClick={() => void withdraw(row)}
                        className="flex items-center gap-1 rounded-lg border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                      >
                        <X className="h-3.5 w-3.5" /> Withdraw
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </ScrollableTable>
        )}
      </div>
    </DataScreen>
  );
}
