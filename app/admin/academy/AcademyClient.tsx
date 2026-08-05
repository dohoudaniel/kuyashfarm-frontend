"use client";

/**
 * Academy bookings and attendance.
 *
 * A seat is finite, so this list is the register: who is coming, who paid, and
 * who actually turned up. Marking attendance is one-way on purpose — the
 * endpoint sets ATTENDED and there is no "un-attend", because the register is
 * a record of what happened rather than an editable field.
 */

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, RefreshCw } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import { listRegistrations, markAttended, type StaffRegistration } from "@/lib/api/admin";
import { DataScreen, ScrollableTable, StatusPill } from "@/components/admin/DataScreen";
import { ManageClasses } from "./ManageClasses";

/** Switch between the register and the calendar. */
function Tabs({
  tab,
  onChange,
}: {
  tab: "register" | "manage";
  onChange: (next: "register" | "manage") => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-gray-300 bg-white p-0.5 text-sm">
      {(["register", "manage"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          aria-pressed={tab === value}
          className={
            tab === value
              ? "rounded-md bg-[#1a3d2b] px-3 py-1.5 font-semibold text-white"
              : "rounded-md px-3 py-1.5 text-gray-600 hover:text-gray-900"
          }
        >
          {value === "register" ? "Register" : "Classes & instructors"}
        </button>
      ))}
    </div>
  );
}

const STATUSES = ["PENDING_PAYMENT", "CONFIRMED", "ATTENDED", "CANCELLED", "NO_SHOW"];

export default function AcademyClient() {
  /**
   * Two jobs, one screen.
   *
   * The register — who is coming, who turned up — and the calendar — what is
   * scheduled at all — belong to the same person on the same day. Splitting
   * them across two nav entries buries whichever one is listed second.
   */
  const [tab, setTab] = useState<"register" | "manage">("register");

  const [rows, setRows] = useState<StaffRegistration[]>([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await listRegistrations({
        status: status || undefined,
        search: search.trim() || undefined,
      });
      setRows(page.results);
      setError("");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not load bookings.");
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 300);
    return () => clearTimeout(timer);
  }, [load]);

  async function attend(row: StaffRegistration) {
    setMessage("");
    try {
      await markAttended(row.reference);
      setMessage(`${row.full_name} marked as attended.`);
      void load();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not mark that.");
    }
  }

  if (tab === "manage") {
    return (
      <div className="space-y-6">
        <Tabs tab={tab} onChange={setTab} />
        <ManageClasses />
      </div>
    );
  }

  return (
    <DataScreen
      title="Academy"
      description="The register. Paid classes are held as pending until payment is taken on arrival."
      loading={loading}
      error={error}
      message={message}
      empty={rows.length === 0}
      emptyMessage="No bookings match that."
      toolbar={
        <>
          <Tabs tab={tab} onChange={setTab} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name, email or reference"
            aria-label="Search bookings"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-green-500"
          />
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
            <th className="px-4 py-3">Attendee</th>
            <th className="px-4 py-3">Class</th>
            <th className="px-4 py-3">Reference</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Register</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="font-medium">{row.full_name}</div>
                <div className="text-xs text-gray-500">{row.email}</div>
                <div className="text-xs text-gray-500">{row.phone}</div>
              </td>
              <td className="px-4 py-3">{row.class_title}</td>
              <td className="px-4 py-3 font-mono text-xs">{row.reference}</td>
              <td className="px-4 py-3">
                <StatusPill status={row.status} />
              </td>
              <td className="px-4 py-3">
                {row.status === "ATTENDED" ? (
                  <span className="text-xs text-gray-500">Attended</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => void attend(row)}
                    className="flex items-center gap-1 rounded-lg border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Mark attended
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </ScrollableTable>
    </DataScreen>
  );
}
