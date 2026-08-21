"use client";

/**
 * Setting up a back-office account from an emailed invitation.
 *
 * Two paths, and the page has to handle both because the invitee cannot tell
 * which they are on until the server says so:
 *
 *  * **No account yet** — they choose a password here, and the account is
 *    created already email-verified, because the link only ever reached the
 *    mailbox it was sent to.
 *
 *  * **An account already exists** — the API refuses to elevate it on the
 *    strength of an emailed link, because that proves control of a mailbox and
 *    not ownership of an account that already has a password. They have to
 *    sign in first. The page detects that refusal and says so, rather than
 *    showing "something went wrong" for a situation with an obvious next step.
 *
 * Accepting deliberately does **not** sign anyone in. Signing in is a separate
 * throttled step, and for an account this privileged one that will go through
 * two-factor once enrolled.
 */

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, ShieldCheck, ShieldX } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import { acceptInvitation } from "@/lib/api/auth";
import {
  fromApiFieldErrors,
  isValid,
  validateFields,
  validatePassword,
  validatePasswordConfirmation,
  validatePersonName,
  type FieldErrors,
} from "@/lib/validation";

export default function AcceptInvitationClient() {
  const token = useSearchParams().get("token") ?? "";

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  /** Set when the address already has an account — a different next step. */
  const [needsSignIn, setNeedsSignIn] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const problems = validateFields(
      {
        full_name: validatePersonName,
        password: validatePassword,
        confirm: (value: string) => validatePasswordConfirmation(password, value),
      },
      { full_name: fullName, password, confirm },
    );
    if (!isValid(problems)) {
      setFieldErrors(problems);
      document.getElementById(Object.keys(problems)[0]!)?.focus();
      return;
    }

    setFieldErrors({});
    setBusy(true);
    try {
      await acceptInvitation({ token, full_name: fullName, password });
      setDone(true);
    } catch (caught) {
      if (caught instanceof ApiError) {
        // The server phrases this one precisely; detecting it lets the page
        // offer "sign in" instead of a dead end.
        if (/sign in to it first/i.test(caught.message) || /already exists/i.test(caught.message)) {
          setNeedsSignIn(true);
        }
        setError(caught.message);
        setFieldErrors(fromApiFieldErrors(caught.fieldErrors));
      } else {
        setError("We couldn't set that up just now. Please try again shortly.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 pt-24 pb-16">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
          {done ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600" />
              <h1 className="mb-2 font-serif text-2xl font-bold text-gray-900">
                Your account is ready
              </h1>
              <p className="mb-6 text-gray-600">
                Sign in to reach the back office. We recommend turning on two-factor
                authentication from your account settings straight away.
              </p>
              <Link
                href="/login?next=/admin"
                className="inline-block rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-secondary"
              >
                Sign in
              </Link>
            </div>
          ) : !token ? (
            <div className="text-center">
              <ShieldX className="mx-auto mb-4 h-12 w-12 text-gray-500" />
              <h1 className="mb-2 font-serif text-2xl font-bold text-gray-900">Incomplete link</h1>
              <p className="text-gray-600">
                That invitation link is missing part of its address. Copy the whole link from your
                email, or ask for a new invitation.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-primary" />
                <h1 className="font-serif text-2xl font-bold text-gray-900">
                  Set up your back-office account
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Your email address is already confirmed — the link reached your inbox.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                >
                  {error}
                  {needsSignIn && (
                    <Link
                      href="/login"
                      className="mt-2 block font-semibold underline hover:no-underline"
                    >
                      Sign in, then open the link again
                    </Link>
                  )}
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label htmlFor="full_name" className="mb-1 block text-sm font-medium text-gray-700">
                    Your name
                  </label>
                  <input
                    id="full_name"
                    value={fullName}
                    onChange={(event) => {
                      setFullName(event.target.value);
                      setFieldErrors((current) => ({ ...current, full_name: "" }));
                    }}
                    onBlur={() =>
                      setFieldErrors((current) => ({
                        ...current,
                        full_name: validatePersonName(fullName) ?? "",
                      }))
                    }
                    required
                    autoComplete="name"
                    aria-invalid={!!fieldErrors.full_name}
                    className={`w-full rounded-lg border px-4 py-3 focus:ring-1 ${
                      fieldErrors.full_name
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-primary focus:ring-primary"
                    }`}
                  />
                  {fieldErrors.full_name && (
                    <p role="alert" className="mt-1 text-sm text-red-600">
                      {fieldErrors.full_name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                    Choose a password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setFieldErrors((current) => ({ ...current, password: "" }));
                    }}
                    onBlur={() =>
                      setFieldErrors((current) => ({
                        ...current,
                        password: validatePassword(password) ?? "",
                      }))
                    }
                    required
                    minLength={8}
                    autoComplete="new-password"
                    aria-invalid={!!fieldErrors.password}
                    className={`w-full rounded-lg border px-4 py-3 focus:ring-1 ${
                      fieldErrors.password
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-primary focus:ring-primary"
                    }`}
                  />
                  {fieldErrors.password && (
                    <p role="alert" className="mt-1 text-sm text-red-600">
                      {fieldErrors.password}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    At least 8 characters, not all numbers, and not a password everyone uses.
                  </p>
                </div>

                <div>
                  <label htmlFor="confirm" className="mb-1 block text-sm font-medium text-gray-700">
                    Confirm password
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    value={confirm}
                    onChange={(event) => {
                      setConfirm(event.target.value);
                      setFieldErrors((current) => ({ ...current, confirm: "" }));
                    }}
                    onBlur={() =>
                      setFieldErrors((current) => ({
                        ...current,
                        confirm: validatePasswordConfirmation(password, confirm) ?? "",
                      }))
                    }
                    required
                    autoComplete="new-password"
                    aria-invalid={!!fieldErrors.confirm}
                    className={`w-full rounded-lg border px-4 py-3 focus:ring-1 ${
                      fieldErrors.confirm
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-primary focus:ring-primary"
                    }`}
                  />
                  {fieldErrors.confirm && (
                    <p role="alert" className="mt-1 text-sm text-red-600">
                      {fieldErrors.confirm}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-secondary disabled:opacity-60"
                >
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  {busy ? "Setting up…" : "Create my account"}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </>
  );
}
