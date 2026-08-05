"use client";

/**
 * Wholesale and distributor applications.
 *
 * Two things the UI has to keep straight, because getting either wrong is a
 * disclosure bug rather than a cosmetic one:
 *
 *  * **`review_notes` are internal; `decision_reason` is what the applicant
 *    reads.** They are separate fields on the rejection form for that reason —
 *    a single "reason" box would eventually put a reviewer's private note in
 *    front of the person it is about.
 *
 *  * **The tier is computed by the server** from the states covered. It is
 *    never sent and the applicant never chose it, so it is displayed and not
 *    editable. The prototype let applicants pick their own.
 */

import { useCallback, useEffect, useState } from "react";
import { Check, RefreshCw, UserCheck, X } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import {
  approveApplication,
  claimApplication,
  listStaffApplications,
  rejectApplication,
  type StaffApplication,
} from "@/lib/api/admin";
import { DataScreen, ScrollableTable, StatusPill } from "@/components/admin/DataScreen";

const STATUSES = ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "WITHDRAWN"];

export default function ApplicationsClient() {
  const [rows, setRows] = useState<StaffApplication[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await listStaffApplications({ status: status || undefined });
      setRows(page.results);
      setError("");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not load applications.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function run(action: () => Promise<unknown>, success: string) {
    setMessage("");
    try {
      await action();
      setMessage(success);
      void load();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "That did not work.");
    }
  }

  return (
    <DataScreen
      title="Applications"
      description="Claim one before reviewing it, so two people do not work the same application."
      loading={loading}
      error={error}
      message={message}
      empty={rows.length === 0}
      emptyMessage="No applications match that."
      toolbar={
        <>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter by status"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {value.replace(/_/g, " ").toLowerCase()}
              </option>
            ))}
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
      <ScrollableTable>
        <thead className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Business</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Contact</th>
            <th className="px-4 py-3">Tier</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr key={row.id} className="align-top hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="font-medium">{row.business_name}</div>
                <div className="text-xs text-gray-500">
                  {new Date(row.created_at).toLocaleDateString("en-NG")}
                </div>
                {row.review_notes && (
                  // Internal. Never sent to the applicant — `decision_reason`
                  // is the field they see, and only on rejection.
                  <div className="mt-1 rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                    Internal: {row.review_notes}
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-xs uppercase text-gray-600">
                {row.application_type}
              </td>
              <td className="px-4 py-3">
                <div>{row.contact_person}</div>
                <div className="text-xs text-gray-500">{row.contact_email}</div>
                <div className="text-xs text-gray-500">{row.contact_phone}</div>
              </td>
              <td className="px-4 py-3 text-xs">
                {/* An object, not a string — rendering it directly would throw
                    "Objects are not valid as a React child". */}
                {row.computed_tier ? row.computed_tier.name : "—"}
              </td>
              <td className="px-4 py-3">
                <StatusPill status={row.status} />
                {row.reviewed_by_email && (
                  <div className="mt-1 text-[11px] text-gray-500">{row.reviewed_by_email}</div>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      void run(() => claimApplication(row.id), "Application claimed.")
                    }
                    className="flex items-center gap-1 rounded-lg border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
                  >
                    <UserCheck className="h-3.5 w-3.5" /> Claim
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const notes = prompt("Internal note (optional, never shown to them):") ?? "";
                      void run(
                        () => approveApplication(row.id, notes),
                        `${row.business_name} approved.`,
                      );
                    }}
                    className="flex items-center gap-1 rounded-lg bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const reason = prompt("Reason — the applicant WILL see this:");
                      if (!reason) return;
                      const notes = prompt("Internal note (optional, never shown):") ?? "";
                      void run(
                        () => rejectApplication(row.id, reason, notes),
                        `${row.business_name} rejected.`,
                      );
                    }}
                    className="flex items-center gap-1 rounded-lg border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </ScrollableTable>
    </DataScreen>
  );
}
