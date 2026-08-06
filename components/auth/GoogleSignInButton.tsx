"use client";

/**
 * Sign in with Google (PRD §13 Q13).
 *
 * Uses the **authorization-code** flow, so what comes back through the
 * redirect is a one-time code that is worthless on its own. The exchange for
 * real tokens happens on the server with the client secret. An implicit flow
 * would put a Google token in the browser and require the server to trust it,
 * which is the arrangement that goes wrong quietly.
 *
 * The button renders nothing when `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is unset. A
 * deployment without a Google project should show no Google button rather than
 * one that fails when pressed — the client id is public by design (it appears
 * in the redirect URL), so inlining it is correct here in a way it would not
 * be for a secret.
 *
 * `state` is a random value stored in sessionStorage and checked on return.
 * Without it, an attacker can hand somebody a link that completes *their*
 * Google sign-in in the victim's browser, quietly attaching the victim's
 * session to an account the attacker controls.
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/context/AuthContext";
import { randomUUID } from "@/lib/uuid";

const STATE_KEY = "kuyash_oauth_state";

interface Props {
  /** Where to send the customer once they are signed in. */
  next?: string;
  /** Called when Google needs a second factor, with the challenge token. */
  onTwoFactorRequired?: (challengeToken: string) => void;
}

export function GoogleSignInButton({ next = "/", onTwoFactorRequired }: Props) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const router = useRouter();
  const params = useSearchParams();
  const { signInWithGoogle } = useAuth();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const redirectUri =
    typeof window === "undefined" ? "" : `${window.location.origin}/login`;

  const complete = useCallback(
    async (code: string) => {
      setBusy(true);
      setError("");
      try {
        const outcome = await signInWithGoogle(code, redirectUri);
        if (outcome.twoFactorRequired) {
          onTwoFactorRequired?.(outcome.challengeToken);
          return;
        }
        router.replace(next);
      } catch (caught) {
        setError(
          caught instanceof ApiError
            ? caught.message
            : "That Google sign-in could not be completed.",
        );
      } finally {
        setBusy(false);
      }
    },
    [signInWithGoogle, redirectUri, onTwoFactorRequired, router, next],
  );

  useEffect(() => {
    const code = params.get("code");
    const returnedState = params.get("state");
    if (!code) return;

    const expected = sessionStorage.getItem(STATE_KEY);
    sessionStorage.removeItem(STATE_KEY);

    if (!expected || expected !== returnedState) {
      // Without this check, a link can complete somebody else's Google
      // sign-in in this browser and attach this session to their account.
      setError("That sign-in could not be verified. Please try again.");
      return;
    }

    void complete(code);
  }, [params, complete]);

  if (!clientId) return null;

  function start() {
    const state = randomUUID();
    sessionStorage.setItem(STATE_KEY, state);

    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", clientId!);
    url.searchParams.set("redirect_uri", redirectUri);
    // A code, not a token — the exchange happens server-side.
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", state);
    // Otherwise Google silently reuses the last account on a shared machine.
    url.searchParams.set("prompt", "select_account");

    window.location.href = url.toString();
  }

  return (
    <div className="space-y-2">
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={start}
        disabled={busy}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
      >
        {busy ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          // Google's own brand colours, exact by requirement — their sign-in
          // branding guidelines do not permit recolouring the mark. These are
          // the only hex literals left in the codebase, and they are correct:
          // everything that is *ours* is a token in app/globals.css.
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.05l3.66 2.84C6.71 7.29 9.14 5.38 12 5.38z"
            />
          </svg>
        )}
        {busy ? "Signing in…" : "Continue with Google"}
      </button>
    </div>
  );
}
