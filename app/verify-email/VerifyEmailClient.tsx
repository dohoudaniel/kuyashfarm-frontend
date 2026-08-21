"use client";

/**
 * Email verification landing page.
 *
 * The backend has been emailing this URL since Phase 1 and the page did not
 * exist, so every verification link 404'd. The token arrives as query
 * parameters and is posted straight to the API — it is single-use and dies the
 * moment the address is verified.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import { verifyEmail } from "@/lib/api/auth";
import { useAuth } from "@/lib/context/AuthContext";

type State = "working" | "done" | "failed" | "missing";

export default function VerifyEmailClient() {
  const params = useSearchParams();
  const { refresh } = useAuth();

  const uid = params.get("uid");
  const token = params.get("token");
  // Derived during render, not set from an effect: whether the link is
  // complete is a pure function of the URL, and setting it in an effect causes
  // a cascading render for something already known on the first pass.
  const linkComplete = Boolean(uid && token);

  const [state, setState] = useState<State>(() => (linkComplete ? "working" : "missing"));
  const [message, setMessage] = useState("");
  const attempted = useRef(false);

  useEffect(() => {
    if (!uid || !token) return;

    // React runs effects twice in development; the token is single-use, so a
    // second attempt would report failure on a link that actually worked.
    if (attempted.current) return;
    attempted.current = true;

    verifyEmail(uid, token)
      .then(async () => {
        setState("done");
        // Pull the updated user so is_email_verified is current everywhere.
        await refresh();
      })
      .catch((error) => {
        setState("failed");
        setMessage(
          error instanceof ApiError
            ? error.message
            : "We couldn't verify that link. Please request a new one.",
        );
      });
  }, [uid, token, refresh]);

  return (
    <>
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 pt-24 pb-16">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          {state === "working" && (
            <>
              <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-gray-500" />
              <p className="text-gray-600">Verifying your email address…</p>
            </>
          )}

          {state === "done" && (
            <>
              <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600" />
              <h1 className="mb-2 text-2xl font-bold text-gray-900">Email verified</h1>
              <p className="mb-6 text-gray-600">Thank you — your address is confirmed.</p>
              <Link href="/categories" className="inline-block rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-secondary">
                Start shopping
              </Link>
            </>
          )}

          {(state === "failed" || state === "missing") && (
            <>
              <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
              <h1 className="mb-2 text-2xl font-bold text-gray-900">
                {state === "missing" ? "Incomplete link" : "Link didn't work"}
              </h1>
              <p className="mb-6 text-gray-600">
                {state === "missing"
                  ? "That link is missing part of its address. Copy it again from your email."
                  : message}
              </p>
              <p className="mb-6 text-sm text-gray-500">
                Verification links expire after three days, and each one works once.
              </p>
              <Link href="/profile" className="inline-block rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-secondary">
                Request a new link
              </Link>
            </>
          )}
        </div>
      </main>
    </>
  );
}
