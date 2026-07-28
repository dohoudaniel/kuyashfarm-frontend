"use client";

/**
 * Order detail and timeline.
 *
 * The timeline is built from `status_events` the server recorded as staff
 * moved the order along. The prototype rendered a four-step timeline where
 * three steps had empty dates and nothing ever advanced them (audit §3.8).
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Truck } from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ApiError } from "@/lib/api/client";
import { cancelOrder, getGuestOrder, getOrder, reorder } from "@/lib/api/orders";
import { guestEmailFor } from "@/lib/api/guest-order";
import { useCartStore } from "@/lib/store/useCartStore";
import type { Order } from "@/lib/api/types";
import { formatPrice } from "@/lib/utils";

export default function OrderDetailClient({ orderNumber }: { orderNumber: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const loadCart = useCartStore((state) => state.load);

  const load = useCallback(async () => {
    try {
      // A guest who just checked out has no session. The API will still show
      // them the order if they supply the email it was placed with, which we
      // held on to at checkout — otherwise they get a 403 for their own
      // receipt, seconds after paying for it.
      const asGuest = guestEmailFor(orderNumber);
      setOrder(asGuest ? await getGuestOrder(orderNumber, asGuest) : await getOrder(orderNumber));
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 403
          ? "This order belongs to another account. Sign in with the email it was placed under."
          : "We couldn't load that order.",
      );
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCancel() {
    if (!confirm("Cancel this order? The items will be released back into stock.")) return;
    setBusy(true);
    try {
      await cancelOrder(orderNumber);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not cancel the order.");
    } finally {
      setBusy(false);
    }
  }

  async function handleReorder() {
    setBusy(true);
    try {
      await reorder(orderNumber);
      await loadCart();
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center bg-gray-50">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </main>
        <Footer />
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 pt-24 pb-16">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <p role="alert" className="mb-6 text-gray-700">{error}</p>
            <Link href="/orders" className="rounded-full bg-primary px-6 py-3 font-semibold text-white">
              Back to my orders
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{order.order_number}</h1>
              <p className="text-sm text-gray-500">
                Placed {new Date(order.placed_at).toLocaleString("en-NG")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{formatPrice(order.grand_total)}</p>
              <p className="text-sm text-gray-500">
                {order.status.toLowerCase()} · {order.payment_status.toLowerCase()}
              </p>
            </div>
          </div>

          <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Progress</h2>
            <ol className="space-y-3">
              {order.status_events.map((event, index) => (
                <li key={`${event.to_status}-${index}`} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                  <div>
                    <p className="text-sm font-medium capitalize text-gray-900">
                      {event.to_status.toLowerCase()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.created_at).toLocaleString("en-NG")}
                      {event.note ? ` · ${event.note}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            {order.shipments.map((shipment, index) => (
              <div key={index} className="mt-4 flex items-start gap-3 rounded-lg bg-purple-50 p-4">
                <Truck className="mt-0.5 h-5 w-5 shrink-0 text-purple-700" />
                <div className="text-sm">
                  <p className="font-medium text-purple-900">
                    {shipment.carrier} · {shipment.tracking_number}
                  </p>
                  {shipment.tracking_url && (
                    <a href={shipment.tracking_url} target="_blank" rel="noreferrer noopener" className="text-purple-700 underline">
                      Track this delivery
                    </a>
                  )}
                </div>
              </div>
            ))}
          </section>

          <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Items</h2>
            <ul className="divide-y">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{item.product_name_snapshot}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} × {formatPrice(item.unit_price)} {item.unit_snapshot}
                    </p>
                  </div>
                  <p className="font-semibold">{formatPrice(item.line_total)}</p>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-gray-600">Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-600">Delivery</dt><dd>{formatPrice(order.shipping_total)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-600">VAT</dt><dd>{formatPrice(order.tax_total)}</dd></div>
              <div className="flex justify-between border-t pt-2 text-base font-bold"><dt>Total</dt><dd>{formatPrice(order.grand_total)}</dd></div>
            </dl>
          </section>

          <div className="flex flex-wrap gap-4">
            {order.is_cancellable && (
              <button type="button" onClick={handleCancel} disabled={busy}
                className="rounded-lg border border-red-300 px-6 py-2.5 font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60">
                Cancel order
              </button>
            )}
            <button type="button" onClick={handleReorder} disabled={busy}
              className="rounded-lg bg-primary px-6 py-2.5 font-semibold text-white hover:bg-secondary disabled:opacity-60">
              Order these again
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
