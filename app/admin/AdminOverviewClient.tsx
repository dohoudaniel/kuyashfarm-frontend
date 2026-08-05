"use client";

/**
 * The first screen after signing in.
 *
 * Answers "what needs me today?" rather than showing a wall of charts. The
 * three counts here are the ones that represent somebody waiting: an order
 * nobody has picked, an application nobody has reviewed, a product nobody has
 * photographed.
 *
 * Analytics figures are cached for sixty seconds server-side and carry
 * `computed_at`, so the age is shown rather than implied. A number with no age
 * on it invites people to refresh until it "updates".
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Loader2, RefreshCw } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import { getDashboard, refreshAnalytics } from "@/lib/api/admin";

export default function AdminOverviewClient() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      setData(await getDashboard());
      setError("");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not load the dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const computedAt = typeof data?.computed_at === "string" ? data.computed_at : null;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
          {computedAt && (
            <p className="mt-1 text-xs text-gray-500">
              Figures as of {new Date(computedAt).toLocaleTimeString("en-NG")}
              {data?.cached ? " (cached for up to a minute)" : ""}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={async () => {
            // Clears the server's sixty-second cache, for when a figure has to
            // be current now rather than shortly.
            await refreshAnalytics().catch(() => undefined);
            void load();
          }}
          className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      {loading && !data ? (
        <p className="py-16 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
        </p>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(data ?? {})
              .filter(([, value]) => typeof value === "number" || typeof value === "string")
              .filter(([key]) => !["computed_at", "cached", "stale_after_seconds"].includes(key))
              .map(([key, value]) => (
                <div key={key} className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {key.replace(/_/g, " ")}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{String(value)}</p>
                </div>
              ))}
          </section>

          {/* The one thing the dashboard cannot tell you, because it is not a
              sales figure: eighteen real products shipped with no photographs
              at all, and an empty product card is invisible in every metric. */}
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <h2 className="font-semibold text-amber-900">Products without photographs</h2>
                <p className="mt-1 text-sm text-amber-800">
                  A product with no photograph still sells, but badly. The product list marks
                  every one that is still missing an image.
                </p>
                <Link
                  href="/admin/products"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-amber-900 hover:underline"
                >
                  Upload photographs <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
