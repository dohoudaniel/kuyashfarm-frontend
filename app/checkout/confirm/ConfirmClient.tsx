"use client";

/**
 * Where Paystack sends the customer after they pay.
 *
 * This URL has been Paystack's `callback_url` since Phase 4 and the page did
 * not exist — customers landed on a 404 immediately after being charged.
 *
 * Two things this page deliberately does *not* do:
 *
 *  1. It does not trust the redirect. Anyone can visit this URL with any
 *     reference; the payment is only real because the API re-asks Paystack.
 *  2. It does not treat "not paid yet" as failure. Paystack redirects the
 *     browser and calls the webhook independently, and the browser usually
 *     wins the race, so a first look can legitimately show PENDING. We poll a
 *     few times before saying anything discouraging — telling someone their
 *     payment failed when it succeeded is the worst outcome available here.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import { verifyPayment } from "@/lib/api/orders";
import { guestEmailFor } from "@/lib/api/guest-order";
import { useCartStore } from "@/lib/store/useCartStore";

type Outcome = "checking" | "paid" | "pending" | "failed";

/** Paystack's redirect usually beats its own webhook. Give it a moment. */
const ATTEMPTS = 5;
const GAP_MS = 2000;

export default function ConfirmClient() {
  const params = useSearchParams();
  const reloadCart = useCartStore((state) => state.load);

  // Paystack sends both; `reference` is ours, `trxref` is theirs.
  const reference = params.get("reference") ?? params.get("trxref") ?? "";

  // Derived during render: a missing reference is knowable from the URL on the
  // first pass, so setting it from an effect just costs a cascading render.
  const [outcome, setOutcome] = useState<Outcome>(reference ? "checking" : "failed");
  const [orderNumber, setOrderNumber] = useState(reference);
  const [message, setMessage] = useState(
    reference ? "" : "This link is missing its payment reference.",
  );
  const [attempt, setAttempt] = useState(0);
  const started = useRef(false);

  const check = useCallback(async () => {
    for (let tries = 1; tries <= ATTEMPTS; tries += 1) {
      try {
        const result = await verifyPayment(reference, guestEmailFor(reference));
        setOrderNumber(result.order_number);

        if (result.payment_status === "PAID") {
          setOutcome("paid");
          // The order consumed the cart server-side; drop the local copy so
          // the badge doesn't still show the items they just bought.
          void reloadCart();
          return;
        }

        if (result.payment_status === "FAILED" || result.status === "CANCELLED") {
          setOutcome("failed");
          setMessage("Paystack reported that this payment did not go through.");
          return;
        }
      } catch (caught) {
        // A 403 means we cannot prove this order is theirs — no amount of
        // waiting fixes that, so stop rather than hammer the API.
        if (caught instanceof ApiError && (caught.status === 403 || caught.status === 404)) {
          setOutcome("failed");
          setMessage(
            "We couldn't match that payment to an order. If you were charged, " +
              "contact us with the reference below and we'll sort it out.",
          );
          return;
        }
        // Anything else is likely transient; fall through and retry.
      }

      if (tries < ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, GAP_MS));
        // Bumped after the wait, never synchronously on entry — the first
        // attempt needs no counter, and updating state before the first await
        // would make this effect render-cascading.
        setAttempt(tries + 1);
      }
    }

    // Still not confirmed. The webhook is authoritative and will land; this is
    // a slow path, not a failure, and it must not read like one.
    setOutcome("pending");
  }, [reference, reloadCart]);

  useEffect(() => {
    if (!reference) return;
    if (started.current) return;
    started.current = true;
    // Fetch-on-mount: every setState inside `check` runs after an await, not
    // synchronously in the effect body. The rule cannot see past the async
    // boundary, so it is suppressed here rather than the code contorted.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void check();
  }, [reference, check]);

  return (
    <>
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 pt-24 pb-16">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">
          {outcome === "checking" && (
            <>
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
              <h1 className="mb-2 font-serif text-2xl font-bold text-gray-900">
                Confirming your payment
              </h1>
              <p className="text-gray-600">
                Please don&apos;t close this page or press back.
              </p>
              {attempt > 1 && (
                <p className="mt-3 text-sm text-gray-500">
                  Still checking with Paystack ({attempt} of {ATTEMPTS})…
                </p>
              )}
            </>
          )}

          {outcome === "paid" && (
            <>
              <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-green-600" />
              <h1 className="mb-2 font-serif text-2xl font-bold text-gray-900">
                Payment received
              </h1>
              <p className="mb-1 text-gray-600">Thank you — your order is confirmed.</p>
              <p className="mb-6 font-mono text-sm text-gray-500">{orderNumber}</p>
              <p className="mb-6 text-sm text-gray-600">
                A receipt is on its way to your email. We&apos;ll let you know as soon as it
                leaves the farm.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href={`/orders/${orderNumber}`}
                  className="rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-secondary"
                >
                  View your order
                </Link>
                <Link
                  href="/categories"
                  className="rounded-full border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Keep shopping
                </Link>
              </div>
            </>
          )}

          {outcome === "pending" && (
            <>
              <Clock className="mx-auto mb-4 h-14 w-14 text-amber-500" />
              <h1 className="mb-2 font-serif text-2xl font-bold text-gray-900">
                Almost there
              </h1>
              <p className="mb-4 text-gray-600">
                Your bank is still confirming this payment. Your order is placed and held —
                nothing is lost, and you will not be charged twice.
              </p>
              <p className="mb-6 font-mono text-sm text-gray-500">{orderNumber}</p>
              <p className="mb-6 text-sm text-gray-600">
                We&apos;ll email you the moment it clears, usually within a few minutes.
              </p>
              <Link
                href={`/orders/${orderNumber}`}
                className="inline-block rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-secondary"
              >
                Check your order
              </Link>
            </>
          )}

          {outcome === "failed" && (
            <>
              <AlertCircle className="mx-auto mb-4 h-14 w-14 text-red-500" />
              <h1 className="mb-2 font-serif text-2xl font-bold text-gray-900">
                We couldn&apos;t confirm this payment
              </h1>
              <p className="mb-4 text-gray-600">{message}</p>
              {reference && (
                <p className="mb-6 font-mono text-sm text-gray-500">Reference: {reference}</p>
              )}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/checkout"
                  className="rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-secondary"
                >
                  Back to checkout
                </Link>
                <Link
                  href="/"
                  className="rounded-full border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Back to home
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
