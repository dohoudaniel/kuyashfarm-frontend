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
import { useAuth } from "@/lib/context/AuthContext";

type State = "working" | "done" | "failed" | "missing";

export default function VerifyEmailClient() {
  const params = useSearchParams();
  const { completeEmailVerification } = useAuth();

  const uid = params.get("uid");
  const token = params.get("token");
  // Derived during render, not set from an effect: whether the link is
  // complete is a pure function of the URL, and setting it in an effect causes
  // a cascading render for something already known on the first pass.
  const linkComplete = Boolean(uid && token);

  const [state, setState] = useState<State>(() => (linkComplete ? "working" : "missing"));
  const [message, setMessage] = useState("");
  // Whether the link also signed us in. A link that has already been used
  // verifies fine but issues no session, and telling that visitor they are
  // signed in when they are not sends them to a page that bounces them back.
  const [signedIn, setSignedIn] = useState(false);
  const attempted = useRef(false);

  useEffect(() => {
    if (!uid || !token) return;

    // React runs effects twice in development; the token is single-use, so a
    // second attempt would report failure on a link that actually worked.
    if (attempted.current) return;
    attempted.current = true;

    completeEmailVerification(uid, token)
      .then((didSignIn) => {
        setSignedIn(didSignIn);
        setState("done");
      })
      .catch((error) => {
        setState("failed");
        setMessage(
          error instanceof ApiError
            ? error.message
            : "We couldn't verify that link. Please request a new one.",
        );
      });
  }, [uid, token, completeEmailVerification]);

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
              <h1 className="mb-2 text-2xl font-bold text-gray-900">
                {signedIn ? "You're all set" : "Email verified"}
              </h1>
              <p className="mb-6 text-gray-600">
                {signedIn
                  ? "Your address is confirmed and you are signed in. We have sent a confirmation to your inbox."
                  : "Your address is already confirmed. Sign in to pick up where you left off."}
              </p>
              <Link
                href={signedIn ? "/categories" : "/login"}
                className="inline-block rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-secondary"
              >
                {signedIn ? "Start shopping" : "Sign in"}
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
