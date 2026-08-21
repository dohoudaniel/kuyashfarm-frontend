"use client";

/**
 * Order history.
 *
 * The prototype injected three fabricated orders whenever a customer had none
 * — complete with a working UPS tracking link — so a brand-new customer's
 * first visit showed deliveries they never received (audit §3.6). This shows
 * what the server has, and an empty history reads as empty.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Package } from "lucide-react";

import { listOrders } from "@/lib/api/orders";
import { useAuth } from "@/lib/context/AuthContext";
import type { OrderSummary, OrderStatus } from "@/lib/api/types";
import { formatPrice } from "@/lib/utils";

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-green-100 text-green-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  PACKED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-900",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-200 text-gray-700",
};

export default function OrdersClient() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  // Nothing to load when signed out, so this is derived rather than switched
  // off from inside an effect.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    listOrders()
      .then((page) => setOrders(page.results))
      .catch(() => setError("We couldn't load your orders. Please try again."))
      .finally(() => setLoading(false));
  }, [authLoading, isAuthenticated]);

  return (
    <>
      <main className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-3xl font-bold text-gray-900 sm:text-4xl">My orders</h1>

          {authLoading || loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          ) : !isAuthenticated ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <p className="mb-6 text-gray-600">Sign in to see your orders.</p>
              <Link href="/login" className="rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-secondary">
                Sign in
              </Link>
            </div>
          ) : error ? (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</p>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <Package className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <p className="mb-6 text-gray-600">You haven&apos;t placed an order yet.</p>
              <Link href="/categories" className="rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-secondary">
                Start shopping
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {orders.map((order) => (
                <li key={order.id}>
                  <Link href={`/orders/${order.order_number}`} className="block rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">{order.order_number}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.placed_at).toLocaleDateString("en-NG", {
                            day: "numeric", month: "long", year: "numeric",
                          })}{" "}
                          · {order.item_count} {order.item_count === 1 ? "item" : "items"}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[order.status]}`}>
                          {order.status.toLowerCase()}
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(order.grand_total)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
