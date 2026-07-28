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

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ApiError } from "@/lib/api/client";
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const linkComplete = Boolean(uid && token);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }

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
        setFieldErrors(caught.fieldErrors);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Navbar />
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
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      minLength={10}
                      autoComplete="new-password"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-11 focus:border-primary focus:ring-1 focus:ring-primary"
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
                  {fieldErrors.new_password?.map((problem) => (
                    <p key={problem} className="mt-1 text-xs text-red-600">{problem}</p>
                  ))}
                  <p className="mt-1 text-xs text-gray-500">
                    At least 10 characters, and not a password everyone uses.
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
                    onChange={(event) => setConfirm(event.target.value)}
                    required
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary"
                  />
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
      <Footer />
    </>
  );
}
