"use client";

/**
 * Everything about the platform, on one page.
 *
 * The back-office landing page answers "how is trade going" and is deliberately
 * small — it wants to paint fast. This answers "what is in here": people,
 * commerce, catalogue, teaching, content and deliveries. It is a separate
 * route so that asking for the whole picture stays a deliberate act rather
 * than something every visit to /admin pays for.
 *
 * **One request, not fourteen.** The whole page is a single
 * `/staff/analytics/platform/` call, cached server-side for a minute. Fetching
 * each section separately would be fourteen round trips against a connection
 * budget of eight — and worse, sections computed at different moments would
 * not reconcile, so somebody would spend an afternoon chasing a discrepancy
 * that was only ever a clock.
 *
 * **The age is always on screen.** Every figure here can be up to a minute
 * old. A number whose age you cannot see is worse than a slow one, because it
 * invites someone to act on a figure they believe is live.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import {
  getPlatformSnapshot,
  refreshAnalytics,
  type PlatformSnapshot,
} from "@/lib/api/admin";
import { Bar, Columns, Panel, Stat } from "@/components/admin/Stat";
import { formatPrice } from "@/lib/utils";

/** `2026-08` → `Aug`. The year is on the axis label only when it changes. */
function monthLabel(month: string): string {
  const [year, m] = month.split("-");
  const name = new Date(Number(year), Number(m) - 1, 1).toLocaleDateString("en-NG", {
    month: "short",
  });
  return m === "01" ? `${name} ${year!.slice(2)}` : name;
}

/** `PENDING_PAYMENT` → `Pending payment`. */
function humanise(key: string): string {
  const words = key.replace(/_/g, " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export default function AnalyticsClient() {
  const [snapshot, setSnapshot] = useState<PlatformSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setSnapshot(await getPlatformSnapshot());
      setError("");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not load the figures.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function recompute() {
    setBusy(true);
    try {
      // Clears the server's sixty-second cache, then reads it back. Without
      // the first call the second would simply be served the cached payload
      // again, and the button would look broken.
      await refreshAnalytics();
      await load();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not refresh.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !snapshot) {
    return (
      <div
        role="alert"
        className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
      >
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (!snapshot) return null;

  const {
    commerce,
    people,
    user_growth,
    top_customers,
    segments,
    orders,
    catalogue,
    sales,
    top_products,
    categories,
    academy,
    applications,
    content,
    delivery,
  } = snapshot;

  const openApplications = applications.pending + applications.under_review;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-600">
            Everything on the platform. Figures are computed at most once a minute.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Cached or not, and how old. A dashboard that cannot show the age
              of what it displays invites acting on a stale number. */}
          <p className="text-xs text-gray-500">
            {snapshot.cached ? "Cached · computed" : "Computed"}{" "}
            {new Date(snapshot.computed_at).toLocaleTimeString("en-NG", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
          <button
            type="button"
            onClick={() => void recompute()}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors duration-200 hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw className={busy ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Recompute
          </button>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      {/* ── Headline ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Net revenue"
          value={commerce.net_revenue}
          money
          hint={`${formatPrice(commerce.refunds)} refunded`}
          tone="good"
        />
        <Stat
          label="Paid orders"
          value={commerce.paid_orders.toLocaleString("en-NG")}
          hint={`${formatPrice(commerce.average_order_value)} average`}
        />
        <Stat
          label="Registered people"
          value={people.total.toLocaleString("en-NG")}
          hint={`${people.joined_last_30_days} in the last 30 days`}
        />
        <Stat
          label="Items sold"
          value={commerce.items_sold.toLocaleString("en-NG")}
          hint={`${commerce.distinct_customers} distinct customers`}
        />
      </div>

      {/* ── Wants attention ──────────────────────────────────────────────── */}
      {(orders.paid_and_awaiting_action > 0 ||
        openApplications > 0 ||
        catalogue.inventory.out_of_stock > 0 ||
        academy.registrations.pending_payment > 0) && (
        <Panel
          title="Wants attention"
          description="Things somebody has to do, rather than things to know."
        >
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {/* Paid for and untouched. The one operational figure that costs
                money to ignore: the customer has paid and nothing has moved. */}
            <Stat
              label="Paid, not started"
              value={orders.paid_and_awaiting_action}
              hint="Orders"
              tone={orders.paid_and_awaiting_action > 0 ? "warn" : "default"}
            />
            <Stat
              label="Applications open"
              value={openApplications}
              hint="Awaiting a decision"
              tone={openApplications > 0 ? "warn" : "default"}
            />
            <Stat
              label="Out of stock"
              value={catalogue.inventory.out_of_stock}
              hint={`${catalogue.inventory.low_stock} running low`}
              tone={catalogue.inventory.out_of_stock > 0 ? "warn" : "default"}
            />
            <Stat
              label="Seats unpaid"
              value={academy.registrations.pending_payment ?? 0}
              hint="Booked, not settled"
              tone={academy.registrations.pending_payment > 0 ? "warn" : "default"}
            />
          </div>
        </Panel>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        {/* ── People ─────────────────────────────────────────────────────── */}
        <Panel
          title="People"
          description="Role governs back-office access; account type governs pricing. They are separate."
          action={
            <Link
              href="/admin/users"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Open the directory →
            </Link>
          }
        >
          <div className="space-y-5">
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500">
                By role
              </p>
              <div className="space-y-2.5">
                <Bar label="Customers" value={people.customers} total={people.total} />
                <Bar label="Staff" value={people.staff} total={people.total} tone="accent" />
                <Bar label="Administrators" value={people.admins} total={people.total} tone="accent" />
              </div>
            </div>

            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500">
                By account type
              </p>
              <div className="space-y-2.5">
                <Bar label="Retail" value={people.retail} total={people.total} />
                <Bar
                  label="Wholesale (verified)"
                  value={people.wholesale_verified}
                  total={people.total}
                />
                <Bar
                  label="Wholesale (pending)"
                  value={people.wholesale_pending}
                  total={people.total}
                  tone="warn"
                />
                <Bar
                  label="Distributor (verified)"
                  value={people.distributor_verified}
                  total={people.total}
                />
                <Bar
                  label="Distributor (pending)"
                  value={people.distributor_pending}
                  total={people.total}
                  tone="warn"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 border-t border-edge/50 pt-4 text-center">
              <div>
                <p className="font-serif text-xl font-bold text-ink">{people.verified_rate}%</p>
                <p className="text-xs text-gray-500">Email verified</p>
              </div>
              <div>
                <p className="font-serif text-xl font-bold text-ink">{people.have_ordered}</p>
                <p className="text-xs text-gray-500">Have ordered</p>
              </div>
              <div>
                <p className="font-serif text-xl font-bold text-ink">{people.joined_last_7_days}</p>
                <p className="text-xs text-gray-500">Joined this week</p>
              </div>
            </div>
          </div>
        </Panel>

        {/* ── Growth ─────────────────────────────────────────────────────── */}
        <Panel
          title="Registrations"
          description="New accounts per month. The running total includes everyone who predates the window."
        >
          <Columns
            points={user_growth.map((point) => ({
              label: monthLabel(point.month),
              value: point.joined,
              caption: `${point.month}: ${point.joined} joined, ${point.total} total`,
            }))}
          />
          <p className="mt-3 border-t border-edge/50 pt-3 text-xs text-gray-500">
            {user_growth.at(-1)?.total ?? 0} registered in total.
          </p>
        </Panel>

        {/* ── Revenue ────────────────────────────────────────────────────── */}
        <Panel title="Revenue" description="Paid orders only, refunds subtracted. Last 12 months.">
          <Columns
            points={sales.map((point) => ({
              label: monthLabel(point.month),
              value: Number(point.revenue),
              caption: `${point.month}: ${point.revenue}`,
            }))}
            money
          />
          <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-edge/50 pt-4 text-center">
            <div>
              <dt className="text-xs text-gray-500">Gross</dt>
              <dd className="font-medium text-ink">{formatPrice(commerce.gross_revenue)}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Refunds</dt>
              <dd className="font-medium text-red-700">{formatPrice(commerce.refunds)}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Net</dt>
              <dd className="font-medium text-primary">{formatPrice(commerce.net_revenue)}</dd>
            </div>
          </dl>
        </Panel>

        {/* ── Order pipeline ─────────────────────────────────────────────── */}
        <Panel
          title="Orders"
          description="Fulfilment and payment are separate: a despatched order can still be refunded."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500">
                Fulfilment
              </p>
              <div className="space-y-2">
                {Object.entries(orders.by_status)
                  .filter(([key]) => key !== "total")
                  .map(([key, value]) => (
                    <Bar
                      key={key}
                      label={humanise(key)}
                      value={value}
                      total={orders.by_status.total ?? 0}
                    />
                  ))}
              </div>
            </div>
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500">
                Payment
              </p>
              <div className="space-y-2">
                {Object.entries(orders.by_payment).map(([key, value]) => (
                  <Bar
                    key={key}
                    label={humanise(key)}
                    value={value}
                    total={orders.by_status.total ?? 0}
                    tone={key === "failed" || key === "unpaid" ? "warn" : "primary"}
                  />
                ))}
              </div>
            </div>
          </div>
        </Panel>

        {/* ── Catalogue ──────────────────────────────────────────────────── */}
        <Panel title="Catalogue & stock">
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Products" value={catalogue.products.total} hint={`${catalogue.categories} categories`} />
            <Stat label="Listed" value={catalogue.products.listed} hint={`${catalogue.products.unlisted} hidden`} />
            <Stat
              label="Without a photo"
              value={catalogue.products.without_photograph}
              hint="Empty product cards"
              tone={catalogue.products.without_photograph > 0 ? "warn" : "default"}
            />
            <Stat label="Units on hand" value={catalogue.inventory.units_on_hand.toLocaleString("en-NG")} hint={`${catalogue.inventory.units_reserved} reserved`} />
          </div>
          <div className="mt-3 rounded-xl bg-mist/50 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500">
              Stock value at retail
            </p>
            <p className="mt-1 font-serif text-2xl font-bold text-ink">
              {formatPrice(catalogue.stock_value_at_retail)}
            </p>
            {/* Said plainly, because the number is large and inviting. There is
                no cost price in this system, so this is what the shelf would
                fetch, not what it earned. */}
            <p className="mt-1 text-xs text-gray-500">
              What the shelf would sell for. Not profit — no cost price is recorded.
            </p>
          </div>
        </Panel>

        {/* ── Best sellers ───────────────────────────────────────────────── */}
        <Panel title="Best sellers" description="By revenue on paid orders.">
          {top_products.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">Nothing has sold yet.</p>
          ) : (
            <ol className="space-y-2.5">
              {top_products.map((row, index) => (
                <li key={row.sku} className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate text-gray-700">
                    <span className="mr-2 font-mono text-xs text-gray-400">{index + 1}</span>
                    {row.name}
                  </span>
                  <span className="shrink-0 font-medium text-ink">
                    {formatPrice(row.revenue)}
                    <span className="ml-2 text-xs font-normal text-gray-500">×{row.quantity}</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Panel>

        {/* ── Segments ───────────────────────────────────────────────────── */}
        <Panel
          title="Revenue by segment"
          description="Whether the wholesale programme is actually bringing in money."
        >
          {segments.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">No paid orders yet.</p>
          ) : (
            <ul className="space-y-2.5">
              {segments.map((row) => (
                <li key={row.account_type} className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-gray-700">{humanise(row.account_type)}</span>
                  <span className="shrink-0 font-medium text-ink">
                    {formatPrice(row.revenue)}
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      {row.orders} order{row.orders === 1 ? "" : "s"}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* ── Top customers ──────────────────────────────────────────────── */}
        <Panel
          title="Top customers"
          description="Registered accounts only — a guest cannot be contacted or offered a tier."
        >
          {top_customers.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">No paid orders yet.</p>
          ) : (
            <ul className="space-y-2.5">
              {top_customers.map((row) => (
                <li key={row.id} className="flex items-baseline justify-between gap-3 text-sm">
                  <Link
                    href={`/admin/users?search=${encodeURIComponent(row.email)}`}
                    className="min-w-0 truncate text-gray-700 hover:text-primary hover:underline"
                  >
                    {row.full_name || row.email}
                  </Link>
                  <span className="shrink-0 font-medium text-ink">
                    {formatPrice(row.revenue)}
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      {row.orders} order{row.orders === 1 ? "" : "s"}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* ── Academy ────────────────────────────────────────────────────── */}
        <Panel
          title="Academy"
          description="Booking without paying still holds a seat, so there are two money figures."
        >
          <div className="grid grid-cols-2 gap-3">
            <Stat
              label="Booked value"
              value={academy.booked_value}
              money
              hint="Confirmed and attended seats"
            />
            <Stat
              label="Collected online"
              value={academy.collected_online}
              money
              hint="Settled through Paystack"
            />
          </div>
          {/* The gap between the two is cash taken at the farm. Showing one
              number would hide it entirely. */}
          <div className="mt-4 space-y-2 border-t border-edge/50 pt-4">
            {Object.entries(academy.registrations)
              .filter(([key]) => key !== "total")
              .map(([key, value]) => (
                <Bar
                  key={key}
                  label={humanise(key)}
                  value={value}
                  total={academy.registrations.total ?? 0}
                  tone={key === "pending_payment" ? "warn" : "primary"}
                />
              ))}
          </div>
          <p className="mt-4 border-t border-edge/50 pt-3 text-xs text-gray-500">
            {academy.programmes} programmes · {academy.classes} classes · {academy.instructors}{" "}
            instructors
          </p>
        </Panel>

        {/* ── Content ────────────────────────────────────────────────────── */}
        <Panel
          title="Content & mailing list"
          description="The list is double opt-in, so pending addresses must not be mailed."
        >
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Live posts" value={content.posts.live} hint={`${content.posts.drafts} drafts`} />
            <Stat
              label="Scheduled"
              value={content.posts.scheduled}
              hint="Publish on their own"
            />
            <Stat label="Subscribed" value={content.subscribers.subscribed} hint="Confirmed, mailable" tone="good" />
            <Stat
              label="Unconfirmed"
              value={content.subscribers.pending}
              hint="Must not be mailed"
              tone={content.subscribers.pending > 0 ? "warn" : "default"}
            />
          </div>
        </Panel>

        {/* ── Delivery ───────────────────────────────────────────────────── */}
        <Panel title="Delivery" description="Runs are vehicles-per-day; stops are addresses.">
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Runs out" value={delivery.runs.out ?? 0} hint={`${delivery.runs.planned ?? 0} planned`} />
            <Stat label="Completed" value={delivery.runs.completed ?? 0} hint="Runs" tone="good" />
            <Stat label="Stops delivered" value={delivery.stops.delivered ?? 0} hint={`${delivery.stops.pending ?? 0} pending`} />
            <Stat
              label="Failed stops"
              value={delivery.stops.failed ?? 0}
              hint="Re-attempt, not written off"
              tone={(delivery.stops.failed ?? 0) > 0 ? "warn" : "default"}
            />
          </div>
          <p className="mt-3 text-xs text-gray-500">{delivery.drivers} active drivers.</p>
        </Panel>

        {/* ── Applications ───────────────────────────────────────────────── */}
        <Panel title="Applications" description="Wholesale and distributor review queue.">
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Pending" value={applications.pending} tone={applications.pending > 0 ? "warn" : "default"} />
            <Stat label="Under review" value={applications.under_review} />
            <Stat label="Approved" value={applications.approved} tone="good" />
            <Stat label="Rejected" value={applications.rejected} />
          </div>
        </Panel>

        {/* ── Categories ─────────────────────────────────────────────────── */}
        <Panel title="Revenue by category">
          {categories.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">Nothing has sold yet.</p>
          ) : (
            <ul className="space-y-2.5">
              {categories.map((row) => (
                <li key={row.name} className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate text-gray-700">{row.name}</span>
                  <span className="shrink-0 font-medium text-ink">{formatPrice(row.revenue)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
