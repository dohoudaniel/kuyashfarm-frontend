"use client";

/**
 * The shared frame for a back-office list screen.
 *
 * Six screens differ only in what they fetch and how they draw a row. Without
 * something like this each one reimplements loading, empty, error and the
 * banner — and they drift, so "no orders yet" and "Nothing here." both exist
 * and one of them forgets to distinguish *empty* from *failed to load*. That
 * distinction is the point: an empty table after a 403 looks exactly like a
 * quiet day, and somebody stops looking for the problem.
 */

import { AlertCircle, Loader2 } from "lucide-react";

interface DataScreenProps {
  title: string;
  description?: string;
  /** Filters, search, refresh — whatever belongs beside the heading. */
  toolbar?: React.ReactNode;
  loading: boolean;
  error?: string;
  /** Transient success text; cleared by the caller. */
  message?: string;
  /** True when the request succeeded and returned nothing. */
  empty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
}

export function DataScreen({
  title,
  description,
  toolbar,
  loading,
  error,
  message,
  empty,
  emptyMessage = "Nothing here yet.",
  children,
}: DataScreenProps) {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
        </div>
        {toolbar && <div className="flex flex-wrap items-center gap-2">{toolbar}</div>}
      </header>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {message}
        </div>
      )}

      {loading ? (
        <p className="py-16 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
        </p>
      ) : empty && !error ? (
        // Only when the request actually succeeded. Showing "nothing yet"
        // after a failure tells somebody there is no work when there may be a
        // day's worth they cannot see.
        <p className="rounded-2xl border border-dashed border-gray-300 py-16 text-center text-sm text-gray-500">
          {emptyMessage}
        </p>
      ) : (
        children
      )}
    </div>
  );
}

/**
 * A table that scrolls inside itself.
 *
 * These screens run on a phone in the warehouse, and order tables are
 * genuinely wider than one. Without the wrapper the *page* scrolls sideways,
 * which drags the navigation off screen with it.
 */
export function ScrollableTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
      <table className="w-full min-w-[40rem] text-sm">{children}</table>
    </div>
  );
}

/** Consistent status colouring, so the same word never means two things. */
export function StatusPill({ status }: { status: string }) {
  const tone =
    /paid|approved|confirmed|delivered|attended|subscribed|accepted/i.test(status)
      ? "bg-green-100 text-green-800"
      : /pending|review|held|processing|dispatch/i.test(status)
        ? "bg-amber-100 text-amber-800"
        : /reject|cancel|fail|refund|revoked|expired|no_show/i.test(status)
          ? "bg-red-100 text-red-800"
          : "bg-gray-100 text-gray-700";

  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>
      {status.replace(/_/g, " ").toLowerCase()}
    </span>
  );
}
