"use client";

/**
 * Password reset completion.
 *
 * The backend has emailed this URL since Phase 1; the page did not exist, so
 * every reset dead-ended on a 404. The uid/token pair arrives as query
 * parameters and is only proven valid by the API call — there is no way to
 * check it client-side, and pretending otherwise would be security theatre.
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import {
  fromApiFieldErrors,
  isValid,
  validateFields,
  validatePassword,
  validatePasswordConfirmation,
  type FieldErrors,
} from "@/lib/validation";
import { confirmPasswordReset } from "@/lib/api/auth";

export default function ResetPasswordClient() {
  const params = useSearchParams();
  const router = useRouter();

  const uid = params.get("uid") ?? "";
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const linkComplete = Boolean(uid && token);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const problems = validateFields(
      {
        new_password: validatePassword,
        new_password_confirm: (value: string) => validatePasswordConfirmation(password, value),
      },
      { new_password: password, new_password_confirm: confirm },
    );
    if (!isValid(problems)) {
      setFieldErrors(problems);
      // A reset link is single-use and expires. Burning one on a typo means
      // going back to the email and requesting another.
      document.getElementById(problems.new_password ? "password" : "confirm")?.focus();
      return;
    }

    setFieldErrors({});
    setBusy(true);
    try {
      await confirmPasswordReset({
        uid,
        token,
        new_password: password,
        new_password_confirm: confirm,
      });
      setDone(true);
      // Every other session was signed out server-side, so send them to log in.
      setTimeout(() => router.push("/login"), 2500);
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.message);
        setFieldErrors(fromApiFieldErrors(caught.fieldErrors));
      } else {
        setError("Something went wrong. Please try again.");
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
              <h1 className="mb-2 text-2xl font-bold text-gray-900">Password changed</h1>
              <p className="text-gray-600">
                For your safety we signed out every other device. Taking you to sign in…
              </p>
            </div>
          ) : !linkComplete ? (
            <div className="text-center">
              <h1 className="mb-2 text-2xl font-bold text-gray-900">Incomplete link</h1>
              <p className="mb-6 text-gray-600">
                That reset link is missing part of its address. Copy the whole link from your
                email, or ask for a new one.
              </p>
              <Link href="/forgot-password" className="inline-block rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-secondary">
                Request a new link
              </Link>
            </div>
          ) : (
            <>
              <h1 className="mb-2 font-serif text-2xl font-bold text-gray-900">
                Choose a new password
              </h1>
              <p className="mb-6 text-sm text-gray-600">
                Reset links expire after an hour and work only once.
              </p>

              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={visible ? "text" : "password"}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setFieldErrors((current) => ({ ...current, new_password: "" }));
                      }}
                      onBlur={() =>
                        setFieldErrors((current) => ({
                          ...current,
                          new_password: validatePassword(password) ?? "",
                        }))
                      }
                      required
                      // Eight, not ten. The server's MinimumLengthValidator is
                      // set to 8, so `minLength={10}` had the browser silently
                      // blocking passwords the API would have accepted.
                      minLength={8}
                      autoComplete="new-password"
                      aria-invalid={!!fieldErrors.new_password}
                      aria-describedby={fieldErrors.new_password ? "password-error" : undefined}
                      className={`w-full rounded-lg border px-4 py-3 pr-11 focus:ring-1 ${
                        fieldErrors.new_password
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-primary focus:ring-primary"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setVisible((was) => !was)}
                      aria-label={visible ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {fieldErrors.new_password && (
                    <p id="password-error" role="alert" className="mt-1 text-xs text-red-600">
                      {fieldErrors.new_password}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    At least 8 characters, not all numbers, and not a password everyone uses.
                  </p>
                </div>

                <div>
                  <label htmlFor="confirm" className="mb-1 block text-sm font-medium text-gray-700">
                    Confirm new password
                  </label>
                  <input
                    id="confirm"
                    type={visible ? "text" : "password"}
                    value={confirm}
                    onChange={(event) => {
                      setConfirm(event.target.value);
                      setFieldErrors((current) => ({ ...current, new_password_confirm: "" }));
                    }}
                    onBlur={() =>
                      setFieldErrors((current) => ({
                        ...current,
                        new_password_confirm: validatePasswordConfirmation(password, confirm) ?? "",
                      }))
                    }
                    required
                    autoComplete="new-password"
                    aria-invalid={!!fieldErrors.new_password_confirm}
                    aria-describedby={
                      fieldErrors.new_password_confirm ? "confirm-error" : undefined
                    }
                    className={`w-full rounded-lg border px-4 py-3 focus:ring-1 ${
                      fieldErrors.new_password_confirm
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-primary focus:ring-primary"
                    }`}
                  />
                  {fieldErrors.new_password_confirm && (
                    <p id="confirm-error" role="alert" className="mt-1 text-xs text-red-600">
                      {fieldErrors.new_password_confirm}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-secondary disabled:opacity-60"
                >
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  {busy ? "Saving…" : "Change password"}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </>
  );
}
