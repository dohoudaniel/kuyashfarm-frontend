"use client";

/**
 * Turning two-factor authentication on and off.
 *
 * Three states, and the middle one is the whole reason enrolment is not a
 * single button:
 *
 *  1. **Off** — offer to set it up.
 *  2. **Scanning** — a QR code is on screen and a device row exists, but
 *     two-factor is *not* on. It only switches on once a code from the app is
 *     accepted. Skipping that step locks people out at their next sign-in with
 *     a secret they never successfully scanned, and the resulting support call
 *     cannot be safely resolved — the person asking to be let back in is
 *     indistinguishable from an attacker.
 *  3. **On** — show how many recovery codes are left, and offer to replace
 *     them or turn the whole thing off.
 *
 * Recovery codes are shown exactly once, at the moment they are generated.
 * They are stored hashed, so there is no second chance and no "show them
 * again" — the UI has to make that obvious before the user navigates away.
 */

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AlertTriangle, Check, Copy, Loader2, ShieldCheck, ShieldOff } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import {
  beginTwoFactorEnrolment,
  confirmTwoFactor,
  disableTwoFactor,
  getTwoFactorStatus,
  regenerateRecoveryCodes,
  type TwoFactorEnrolment,
  type TwoFactorStatus,
} from "@/lib/api/auth";

export function TwoFactorSection() {
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [enrolment, setEnrolment] = useState<TwoFactorEnrolment | null>(null);
  const [codes, setCodes] = useState<string[] | null>(null);

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      setStatus(await getTwoFactorStatus());
    } catch {
      /* the section simply does not render its detail */
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function start() {
    setBusy(true);
    setError("");
    try {
      setEnrolment(await beginTwoFactorEnrolment());
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not start setup.");
    } finally {
      setBusy(false);
    }
  }

  async function confirm(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await confirmTwoFactor(code);
      setCodes(result.recovery_codes);
      setEnrolment(null);
      setCode("");
      await load();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "That code is not right.");
    } finally {
      setBusy(false);
    }
  }

  async function turnOff(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await disableTwoFactor(password);
      setPassword("");
      setCodes(null);
      await load();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not turn that off.");
    } finally {
      setBusy(false);
    }
  }

  async function replaceCodes(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await regenerateRecoveryCodes(password);
      setCodes(result.recovery_codes);
      setPassword("");
      await load();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not issue new codes.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        {status?.enabled ? (
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
        ) : (
          <ShieldOff className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
        )}
        <div>
          <h2 className="font-semibold text-gray-900">Two-factor authentication</h2>
          <p className="mt-1 text-sm text-gray-600">
            {status?.enabled
              ? "On. You will be asked for a code from your app each time you sign in."
              : "A code from an app on your phone, as well as your password."}
          </p>
          {status?.recommended && !status.enabled && (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Strongly recommended for back-office accounts.
            </p>
          )}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      {/* Shown once, immediately after generation. Stored hashed, so there is
          no way to show them again — which the copy has to say plainly. */}
      {codes && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <div className="mb-2 flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-sm font-semibold text-amber-900">
              Save these now. They are not shown again.
            </p>
          </div>
          <p className="mb-3 text-xs text-amber-800">
            Each works once, in place of a code from your app, if you lose your phone.
          </p>
          <ul className="mb-3 grid grid-cols-2 gap-1 font-mono text-sm text-amber-900">
            {codes.map((recovery) => (
              <li key={recovery}>{recovery}</li>
            ))}
          </ul>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(codes.join("\n"));
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="flex items-center gap-1.5 rounded-full bg-amber-900 px-3 py-1.5 text-xs font-semibold text-white"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy all"}
          </button>
        </div>
      )}

      {enrolment ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Scan this with Google Authenticator, 1Password, Authy or similar.
          </p>
          {/* A data URI, so nothing is fetched from a third party to render a
              QR code that encodes a shared secret. */}
          <Image
            src={enrolment.qr_code}
            alt="QR code for two-factor setup"
            width={180}
            height={180}
            unoptimized
            className="rounded-lg border border-gray-200 bg-white p-2"
          />
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-600">Can&apos;t scan it?</summary>
            <p className="mt-2 break-all rounded-lg bg-gray-50 p-3 font-mono text-xs">
              {enrolment.secret}
            </p>
          </details>

          <form onSubmit={confirm} className="space-y-3">
            <label htmlFor="totp" className="block text-sm font-medium text-gray-700">
              Enter the six-digit code from your app
            </label>
            <input
              id="totp"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              className="w-full max-w-[12rem] rounded-lg border border-gray-300 px-4 py-2.5 text-center tracking-[0.3em] focus:border-transparent focus:ring-2 focus:ring-green-500"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy}
                className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-secondary disabled:opacity-60"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Turn on
              </button>
              <button
                type="button"
                onClick={() => setEnrolment(null)}
                className="rounded-full px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : status?.enabled ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {status.recovery_codes_remaining} recovery code
            {status.recovery_codes_remaining === 1 ? "" : "s"} left.
            {status.recovery_codes_remaining <= 2 && (
              <span className="font-semibold text-amber-700"> Consider issuing new ones.</span>
            )}
          </p>

          <form onSubmit={replaceCodes} className="flex flex-wrap items-end gap-2">
            <div>
              <label htmlFor="pw-2fa" className="mb-1 block text-sm font-medium text-gray-700">
                Confirm your password
              </label>
              <input
                id="pw-2fa"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                className="rounded-lg border border-gray-300 px-4 py-2.5 focus:border-transparent focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold hover:bg-gray-50 disabled:opacity-60"
            >
              New recovery codes
            </button>
            {/* The password is required again on purpose: a stolen access
                token is exactly what a second factor exists to survive. */}
            <button
              type="button"
              onClick={turnOff}
              disabled={busy || !password}
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Turn off
            </button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={start}
          disabled={busy}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-secondary disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Set up two-factor authentication
        </button>
      )}
    </section>
  );
}
