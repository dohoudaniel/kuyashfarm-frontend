"use client";

/**
 * The other half of the double opt-in.
 *
 * The address is not on the list until this page runs. It confirms on mount
 * rather than behind a button: the click that matters already happened, in the
 * email client, and asking someone to confirm their confirmation loses people
 * for no benefit.
 *
 * The token is only proven valid by the API call. There is nothing to check
 * client-side — the signature is made with the server's `SECRET_KEY` — and
 * pretending otherwise would be theatre.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, MailX } from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ApiError } from "@/lib/api/client";
import { confirmSubscription } from "@/lib/api/newsletter";

type State = "working" | "done" | "failed";

export default function NewsletterConfirmClient() {
  const token = useSearchParams().get("token") ?? "";

  const [state, setState] = useState<State>(token ? "working" : "failed");
  const [message, setMessage] = useState(
    token ? "" : "That link is missing part of its address. Copy the whole link from your email.",
  );

  // React runs effects twice in development's Strict Mode. Confirming is
  // idempotent server-side, so a second call is harmless — but it would race
  // the first and could render the failure of a request that was already
  // superseded. One attempt per token.
  const attempted = useRef(false);

  useEffect(() => {
    if (!token || attempted.current) return;
    attempted.current = true;

    confirmSubscription(token)
      .then(() => setState("done"))
      .catch((caught: unknown) => {
        setState("failed");
        setMessage(
          caught instanceof ApiError
            ? caught.message
            : "We couldn't confirm that just now. Please try the link again shortly.",
        );
      });
  }, [token]);

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 pt-24 pb-16">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          {state === "working" ? (
            <>
              <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-gray-400" />
              <p className="text-gray-600">Confirming your subscription…</p>
            </>
          ) : state === "done" ? (
            <>
              <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600" />
              <h1 className="mb-2 font-serif text-2xl font-bold text-gray-900">
                You&apos;re subscribed
              </h1>
              <p className="mb-6 text-gray-600">
                Seasonal produce, academy dates and what&apos;s coming out of the ground. Every
                email we send carries an unsubscribe link.
              </p>
              <Link
                href="/academy"
                className="inline-block rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-secondary"
              >
                Back to the Academy
              </Link>
            </>
          ) : (
            <>
              <MailX className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h1 className="mb-2 font-serif text-2xl font-bold text-gray-900">
                That link didn&apos;t work
              </h1>
              <p className="mb-6 text-gray-600">{message}</p>
              {/* Confirmation links expire after three days, so the useful
                  next step is a fresh one — not a retry of a dead token. */}
              <Link
                href="/academy"
                className="inline-block rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-secondary"
              >
                Sign up again
              </Link>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
