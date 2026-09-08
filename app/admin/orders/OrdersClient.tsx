"use client";

/**
 * The order queue.
 *
 * Status changes go through `/staff/orders/{n}/status/`, which refuses
 * anything the state machine forbids. The client deliberately does not know
 * that machine: duplicating it here means two definitions that drift, and the
 * one in the browser is the one that can be edited. A refused transition is a
 * 400 with a message, which is shown as-is.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import { listStaffOrders, setOrderStatus, type StaffOrder } from "@/lib/api/admin";
import { DataScreen, ScrollableTable, StatusPill } from "@/components/admin/DataScreen";
import { useAuth } from "@/lib/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import { RefundDialog } from "./RefundDialog";

/**
 * `OrderStatus`, copied from the server.
 *
 * The first version of this list was invented rather than checked, and had
 * `PENDING_PAYMENT` and `PAID` in it — those are *payment* statuses, a
 * separate field, kept separate because a despatched order can still be
 * refunded. It also omitted `CONFIRMED` and `PACKED`, which meant staff could
 * not pack an order at all: the transition an order must pass through before
 * it can go on a van was simply not offered.
 *
 * Nothing failed. The dropdown rendered, the options looked plausible, and
 * choosing one returned a 400 the screen displayed as the server's refusal.
 * The end-to-end run is what found it.
 */
/**
 * The payment states from which money can still come back.
 *
 * `PaymentStatus` in `orders.models`, minus the three that never took money
 * (`UNPAID`, `AUTHORIZED`, `FAILED`) and minus `REFUNDED`, which has already
 * given all of it back. `PARTIALLY_REFUNDED` stays: there is a balance left.
 */
const REFUNDABLE = new Set(["PAID", "PARTIALLY_REFUNDED"]);

const STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export default function OrdersClient() {
  const [orders, setOrders] = useState<StaffOrder[]>([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [refunding, setRefunding] = useState<StaffOrder | null>(null);

  /**
   * Refunds are administrator-only.
   *
   * `StaffRefundView` uses `IsAdmin` while the rest of this screen is
   * `IsStaff`, so a warehouse hand can move an order along but cannot pay
   * anybody. Hiding the button matches what the API would answer; it is not
   * the control, and is not relied on as one — the server refuses regardless
   * of what this renders.
   */
  const { user } = useAuth();
  const canRefund = user?.role === "ADMIN";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await listStaffOrders({
        status: status || undefined,
        search: search.trim() || undefined,
      });
      setOrders(page.results);
      setError("");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not load orders.");
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 300);
    return () => clearTimeout(timer);
  }, [load]);

  async function advance(order: StaffOrder, next: string) {
    setMessage("");
    try {
      await setOrderStatus(order.order_number, next);
      setMessage(`${order.order_number} is now ${next.replace(/_/g, " ").toLowerCase()}.`);
      void load();
    } catch (caught) {
      // The server owns the state machine, so its refusal is the explanation.
      setError(caught instanceof ApiError ? caught.message : "Could not update that order.");
    }
  }

  return (
    <DataScreen
      title="Orders"
      description="Everything customers have placed, newest first."
      loading={loading}
      error={error}
      message={message}
      empty={orders.length === 0}
      emptyMessage="No orders match that."
      toolbar={
        <>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Order number, e.g. KF-20260915-00042"
            aria-label="Search orders"
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
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Items</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Payment</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Move to</th>
            {canRefund && <th className="px-4 py-3 text-right">Refund</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">
                <Link href={`/orders/${order.order_number}`} className="hover:underline">
                  {order.order_number}
                </Link>
                <div className="text-xs text-gray-500">
                  {new Date(order.placed_at).toLocaleDateString("en-NG")}
                </div>
              </td>
              {/* The list endpoint does not return the customer's email, and
                  it should not: this table is a queue, not a mailing list.
                  Open the order to see who placed it. */}
              <td className="px-4 py-3 text-gray-600">
                {order.item_count} item{order.item_count === 1 ? "" : "s"}
              </td>
              {/* Money is a decimal string from the API and is never turned
                  into a Number — formatPrice takes the string as it came. */}
              <td className="px-4 py-3">{formatPrice(order.grand_total)}</td>
              <td className="px-4 py-3">
                <StatusPill status={order.payment_status} />
              </td>
              <td className="px-4 py-3">
                <StatusPill status={order.status} />
              </td>
              <td className="px-4 py-3">
                <select
                  value=""
                  onChange={(event) => event.target.value && void advance(order, event.target.value)}
                  aria-label={`Change status of ${order.order_number}`}
                  className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs"
                >
                  <option value="">Change…</option>
                  {STATUSES.filter((value) => value !== order.status).map((value) => (
                    <option key={value} value={value}>
                      {value.replace(/_/g, " ").toLowerCase()}
                    </option>
                  ))}
                </select>
              </td>
              {canRefund && (
                <td className="px-4 py-3 text-right">
                  {/* Only for an order that has actually taken money. Offering
                      it on an unpaid one invites a refusal that reads as a
                      bug rather than as the obvious truth it is.

                      Exact membership, not a pattern. This was written as
                      `/paid|part/i.test(...)` and offered a refund on every
                      order in the queue, because **"UNPAID" contains "paid"**.
                      A substring test against a status enum is a trap
                      wherever one value is a negation of another, and it fails
                      in the expensive direction: the button appeared on
                      seventeen orders that had never taken a naira. */}
                  {REFUNDABLE.has(order.payment_status) ? (
                    <button
                      type="button"
                      onClick={() => setRefunding(order)}
                      className="rounded-lg px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                    >
                      Refund…
                    </button>
                  ) : (
                    <span className="text-xs text-gray-500">—</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </ScrollableTable>

      {refunding && (
        <RefundDialog
          order={refunding}
          onCancel={() => setRefunding(null)}
          onDone={(text) => {
            setRefunding(null);
            setMessage(text);
            void load();
          }}
        />
      )}
    </DataScreen>
  );
}
