"use client";

/**
 * Leave the mailing list.
 *
 * **This page asks before acting, and the confirm page does not.** The
 * difference is deliberate.
 *
 * Corporate mail security — Outlook Safe Links, antivirus gateways, spam
 * filters — fetches every URL in an incoming message to check where it goes.
 * If unsubscribing happened on page load, that scan would silently unsubscribe
 * the recipient before they ever opened the email, and the symptom would be
 * "your newsletter stopped arriving" with nothing in any log to explain it.
 * The affected people are exactly the ones on managed corporate mail — the
 * wholesale and distributor customers.
 *
 * A button press cannot be produced by a scanner. Confirming on load is safe
 * from the same problem in the way that matters: a scan can only confirm an
 * address whose own mail system received the link, and the worst case is a
 * subscription the recipient can cancel from any email we send. An
 * unsubscribe, once silent, is invisible.
 *
 * No session is required. The subscriber may have no account at all, and an
 * unsubscribe link that first demands a password is not an unsubscribe link.
 */

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, MailX } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import { unsubscribe } from "@/lib/api/newsletter";

export default function NewsletterUnsubscribeClient() {
  const token = useSearchParams().get("token") ?? "";

  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function onUnsubscribe() {
    setBusy(true);
    setError("");
    try {
      await unsubscribe(token);
      setDone(true);
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "We couldn't do that just now. Please try again shortly.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 pt-24 pb-16">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          {done ? (
            <>
              <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600" />
              <h1 className="mb-2 font-serif text-2xl font-bold text-gray-900">
                You&apos;ve been unsubscribed
              </h1>
              <p className="mb-6 text-gray-600">
                You won&apos;t receive the newsletter again. Order confirmations and other messages
                about things you&apos;ve bought are separate and will still reach you.
              </p>
              <Link
                href="/"
                className="inline-block rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-secondary"
              >
                Back to the shop
              </Link>
            </>
          ) : !token ? (
            <>
              <MailX className="mx-auto mb-4 h-12 w-12 text-gray-500" />
              <h1 className="mb-2 font-serif text-2xl font-bold text-gray-900">Incomplete link</h1>
              <p className="text-gray-600">
                That unsubscribe link is missing part of its address. Copy the whole link from your
                email, or reply to any message from us and we&apos;ll take you off by hand.
              </p>
            </>
          ) : (
            <>
              <MailX className="mx-auto mb-4 h-12 w-12 text-gray-500" />
              <h1 className="mb-2 font-serif text-2xl font-bold text-gray-900">
                Unsubscribe from the newsletter?
              </h1>
              <p className="mb-6 text-gray-600">
                We&apos;ll stop sending it. This does not affect order confirmations or anything
                else about a purchase.
              </p>

              {error && (
                <div
                  role="alert"
                  className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={onUnsubscribe}
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-secondary disabled:opacity-60"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {busy ? "Unsubscribing…" : "Yes, unsubscribe me"}
              </button>
              <Link
                href="/"
                className="mt-3 inline-block text-sm font-semibold text-gray-500 hover:text-gray-700"
              >
                No, keep me subscribed
              </Link>
            </>
          )}
        </div>
      </main>
    </>
  );
}
