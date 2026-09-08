"use client";

/**
 * The mailing list.
 *
 * Read-only, and there is deliberately no "add subscriber" button. Every row
 * is meant to be evidence that the owner of a mailbox opened a confirmation
 * link; a form that lets staff type an address in as subscribed destroys that
 * quietly, and the damage only appears later as a spam complaint — by which
 * point the sending domain, shared with every order receipt, is affected.
 *
 * PENDING rows are the interesting ones: somebody asked and never confirmed.
 * They are not on the list and must not be mailed.
 */

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import { listSubscribers, type Subscriber } from "@/lib/api/admin";
import { DataScreen, ScrollableTable, StatusPill } from "@/components/admin/DataScreen";

export default function SubscribersClient() {
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await listSubscribers({
        status: status || undefined,
        search: search.trim() || undefined,
      });
      setRows(page.results);
      setError("");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not load subscribers.");
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 300);
    return () => clearTimeout(timer);
  }, [load]);

  const confirmed = rows.filter((row) => row.status === "SUBSCRIBED").length;

  return (
    <DataScreen
      title="Newsletter"
      description="Double opt-in: an address counts only once its owner has opened the confirmation link."
      loading={loading}
      error={error}
      empty={rows.length === 0}
      emptyMessage="Nobody has signed up yet."
      toolbar={
        <>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by email address, e.g. adaeze@gmail.com"
            aria-label="Search subscribers"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-green-500"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter by status"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="SUBSCRIBED">Subscribed</option>
            <option value="PENDING">Awaiting confirmation</option>
            <option value="UNSUBSCRIBED">Unsubscribed</option>
          </select>
          <button
            type="button"
            onClick={() => void load()}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </>
      }
    >
      <>
        <p className="mb-3 text-sm text-gray-600">
          <strong>{confirmed}</strong> confirmed of {rows.length} shown.
        </p>
        <ScrollableTable>
          <thead className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Signed up via</th>
              <th className="px-4 py-3">Confirmed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{row.email}</td>
                <td className="px-4 py-3">
                  <StatusPill status={row.status} />
                </td>
                <td className="px-4 py-3 text-gray-600">{row.source || "—"}</td>
                <td className="px-4 py-3 text-gray-600">
                  {row.confirmed_at
                    ? new Date(row.confirmed_at).toLocaleDateString("en-NG")
                    : "not yet"}
                </td>
              </tr>
            ))}
          </tbody>
        </ScrollableTable>
      </>
    </DataScreen>
  );
}
