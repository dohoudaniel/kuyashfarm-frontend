"use client";

/**
 * Sending money back.
 *
 * This is the only control in the back office that moves money *out* of the
 * business, and it is built to be slightly harder to use than everything else
 * on purpose. A status dropdown that fires on `change` is right for moving an
 * order to "packed"; the same interaction for a refund would mean one mis-tap
 * on a phone in a warehouse pays a customer twice.
 *
 * So: an explicit dialog, a mandatory reason, and the amount typed rather than
 * defaulted into a field somebody can submit without reading.
 *
 * **Three things the server owns, which this deliberately does not duplicate.**
 * Whether the order can be refunded at all, how much remains refundable, and
 * whether the caller is allowed — all live in `StaffRefundView` and
 * `services.refund_order`. A balance computed here would be a second opinion
 * about money, and the wrong one the moment a partial refund lands from
 * anywhere else. The server's refusal is shown as-is.
 */

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import { refundOrder, type StaffOrder } from "@/lib/api/admin";
import { formatPrice } from "@/lib/utils";

interface Props {
  order: StaffOrder;
  onDone: (message: string) => void;
  onCancel: () => void;
}

export function RefundDialog({ order, onDone, onCancel }: Props) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [returnStock, setReturnStock] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    if (!reason.trim()) {
      setError("Say why. It is recorded against the order.");
      return;
    }

    // Shape only. Whether the figure is *allowed* — not more than was paid,
    // not more than remains — is the server's to decide.
    if (amount.trim() && !/^\d+(\.\d{1,2})?$/.test(amount.trim())) {
      setError("Use a number like 3500.00, or leave it empty to refund it all.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      await refundOrder(order.order_number, {
        amount: amount.trim() || undefined,
        reason: reason.trim(),
        return_stock: returnStock,
      });
      onDone(
        `Refunded ${amount.trim() ? formatPrice(amount.trim()) : formatPrice(order.grand_total)} on ${order.order_number}.`,
      );
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not process that refund.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={(event) => void submit(event)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="refund-heading"
        className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 id="refund-heading" className="text-lg font-bold text-gray-900">
          Refund {order.order_number}
        </h2>
        <p className="text-sm text-gray-600">
          This order totalled {formatPrice(order.grand_total)}. Leave the amount empty to refund the
          full remaining balance.
        </p>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="refund-amount" className="mb-2 block text-sm font-medium text-gray-700">
            Amount (₦)
          </label>
          <input
            id="refund-amount"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Everything still owed"
            inputMode="decimal"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label htmlFor="refund-reason" className="mb-2 block text-sm font-medium text-gray-700">
            Reason <span className="text-red-600">*</span>
          </label>
          <textarea
            id="refund-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            maxLength={500}
            required
            placeholder="Two crates arrived damaged."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-green-500"
          />
        </div>

        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={returnStock}
            onChange={(event) => setReturnStock(event.target.checked)}
            className="mt-1"
          />
          <span>
            The goods physically came back
            <span className="block text-xs text-gray-500">
              Ticking this writes a movement into the stock ledger. Refunding a customer for a
              damaged crate is not a crate back on the shelf — leave it clear unless you have the
              goods.
            </span>
          </span>
        </label>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={busy}
            className="flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Refund
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
