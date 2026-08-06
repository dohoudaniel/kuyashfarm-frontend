"use client";

/**
 * Password reset request.
 *
 * The API answers identically whether or not the address is registered, so
 * this page must not say "no account found" — that would turn the form into an
 * account-enumeration oracle and undo the backend's deliberate choice.
 */

import { useState } from "react";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import { requestPasswordReset } from "@/lib/api/auth";
import { validateEmail } from "@/lib/validation";

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    // A typo'd address otherwise consumes one of the throttled reset attempts
    // and then shows the same "check your email" as a success, so the customer
    // waits for a message that was never going to arrive.
    const problem = validateEmail(email);
    if (problem) {
      setEmailError(problem);
      document.getElementById("email")?.focus();
      return;
    }

    setBusy(true);
    setError("");
    setEmailError("");
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (caught) {
      // Rate limiting is the realistic failure here; anything else is a
      // genuine outage. Neither reveals whether the account exists.
      setError(
        caught instanceof ApiError
          ? caught.message
          : "We couldn't send that just now. Please try again shortly.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 pt-24 pb-16">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
          {sent ? (
            <div className="text-center">
              <MailCheck className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h1 className="mb-2 font-serif text-2xl font-bold text-gray-900">Check your email</h1>
              <p className="mb-6 text-gray-600">
                If <span className="font-medium">{email}</span> has an account with us, a reset
                link is on its way. It expires in one hour.
              </p>
              <Link href="/login" className="text-sm font-semibold text-primary hover:underline">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="mb-2 font-serif text-2xl font-bold text-gray-900">
                Reset your password
              </h1>
              <p className="mb-6 text-sm text-gray-600">
                Enter the email on your account and we&apos;ll send you a link.
              </p>

              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setEmailError("");
                    }}
                    onBlur={() => setEmailError(validateEmail(email) ?? "")}
                    required
                    autoComplete="email"
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? "email-error" : undefined}
                    className={`w-full rounded-lg border px-4 py-3 focus:ring-1 ${
                      emailError
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-primary focus:ring-primary"
                    }`}
                  />
                  {emailError && (
                    <p id="email-error" role="alert" className="mt-1 text-sm text-red-600">
                      {emailError}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-secondary disabled:opacity-60"
                >
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  {busy ? "Sending…" : "Send reset link"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-600">
                Remembered it?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </main>
    </>
  );
}
