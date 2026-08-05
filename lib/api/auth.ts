/**
 * Authentication.
 *
 * Payloads match the server exactly. The previous version sent `name` where
 * the API expects `full_name`, omitted the required `password_confirm`, and
 * used PUT where the API offers PATCH — on top of the missing trailing slashes
 * that made every one of these calls a 500.
 */

import { apiClient } from "./client";
import type { Address, AuthResult, User } from "./types";

export interface RegisterInput {
  email: string;
  password: string;
  password_confirm: string;
  full_name?: string;
  phone?: string;
}

/**
 * Create an account.
 *
 * Returns nothing and does **not** sign you in. The API answers identically
 * whether or not the address was already registered — telling them apart would
 * turn signup into an account-enumeration oracle, which is exactly what login
 * and password reset already go out of their way to avoid. The next step is
 * always the same: open the emailed link, then sign in.
 */
export async function register(input: RegisterInput): Promise<void> {
  await apiClient.post<null>("/auth/register/", { ...input });
}

/**
 * Sign in with a password.
 *
 * Returns one of two shapes, and the caller has to handle both:
 *
 *  * `two_factor_required: false` — the normal case, with tokens.
 *  * `two_factor_required: true` — no tokens, just a five-minute
 *    `challenge_token`. Pass it to `completeTwoFactorLogin` with a code.
 *
 * The absence of tokens in the second case is the whole point. Issuing a
 * working access token and *then* asking for the code would make the second
 * factor decorative, because the token already opens everything.
 */
export async function login(email: string, password: string): Promise<LoginResult> {
  const result = await apiClient.post<LoginResult>("/auth/login/", { email, password });

  if (!result.two_factor_required) {
    apiClient.setAccessToken(result.access_token);
  }
  return result;
}

/**
 * Sign out.
 *
 * The server blacklists the refresh token, so it is genuinely dead afterwards.
 * The prototype deleted a localStorage key and left the JWT valid.
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post<null>("/auth/logout/");
  } finally {
    apiClient.setAccessToken(null);
  }
}

export function getCurrentUser(): Promise<User> {
  return apiClient.get<User>("/auth/me/");
}

export function updateProfile(input: { full_name?: string; phone?: string }): Promise<User> {
  return apiClient.patch<User>("/auth/me/", { ...input });
}

export function changePassword(input: {
  current_password: string;
  new_password: string;
  new_password_confirm: string;
}): Promise<null> {
  return apiClient.post<null>("/auth/change-password/", { ...input });
}

export function verifyEmail(uid: string, token: string): Promise<User> {
  return apiClient.post<User>("/auth/verify-email/", { uid, token });
}

export function resendVerification(): Promise<null> {
  return apiClient.post<null>("/auth/resend-verification/");
}

export function requestPasswordReset(email: string): Promise<null> {
  return apiClient.post<null>("/auth/password-reset/", { email });
}

export function confirmPasswordReset(input: {
  uid: string;
  token: string;
  new_password: string;
  new_password_confirm: string;
}): Promise<null> {
  return apiClient.post<null>("/auth/password-reset/confirm/", { ...input });
}

// ── Saved addresses ─────────────────────────────────────────────────────────
export function listAddresses(): Promise<{ results: Address[]; count: number }> {
  return apiClient.get("/auth/addresses/");
}

export function createAddress(input: Omit<Address, "id" | "created_at">): Promise<Address> {
  return apiClient.post<Address>("/auth/addresses/", { ...input });
}

export function updateAddress(id: string, input: Partial<Address>): Promise<Address> {
  return apiClient.patch<Address>(`/auth/addresses/${id}/`, { ...input });
}

export function deleteAddress(id: string): Promise<null> {
  return apiClient.delete<null>(`/auth/addresses/${id}/`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Back-office invitations and two-factor authentication
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Turn an emailed invitation into a back-office account.
 *
 * Public on purpose: the invitee has no account yet, which is the point.
 * Accepting does **not** sign them in — signing in is a separate throttled
 * step, and for an account this privileged one that goes through 2FA.
 *
 * `full_name` and `password` are omitted when the invitee already has an
 * account and is signed in; the invitation then only changes their role.
 */
/**
 * Exchange a Google authorization code for a session.
 *
 * A *code*, not an ID token: the exchange happens server-side with the client
 * secret, so nothing the browser holds can be replayed against Google on its
 * own. `redirectUri` must match the one the code was issued for — Google
 * enforces that, which is what stops a code intercepted on one site being
 * redeemed from another.
 *
 * Returns the same two shapes as `login`: a second factor still applies.
 * Skipping it for social sign-in would make enrolling in 2FA strictly worse
 * than not, because the account would look protected while a whole path
 * around it existed.
 */
export async function signInWithGoogle(
  code: string,
  redirectUri: string,
): Promise<LoginResult> {
  const result = await apiClient.post<LoginResult>("/auth/social/google/", {
    code,
    redirect_uri: redirectUri,
  });

  if (!result.two_factor_required) {
    apiClient.setAccessToken(result.access_token);
  }
  return result;
}

export type LoginResult =
  | ({ two_factor_required: false } & AuthResult)
  | { two_factor_required: true; challenge_token: string };

export function acceptInvitation(input: {
  token: string;
  full_name?: string;
  password?: string;
}): Promise<User> {
  return apiClient.post<User>("/auth/invitations/accept/", input);
}

export interface TwoFactorStatus {
  enabled: boolean;
  method: string | null;
  confirmed_at: string | null;
  recovery_codes_remaining: number;
  /** True for back-office accounts, which are the ones worth protecting hardest. */
  recommended: boolean;
}

export function getTwoFactorStatus(): Promise<TwoFactorStatus> {
  return apiClient.get<TwoFactorStatus>("/auth/2fa/");
}

export interface TwoFactorEnrolment {
  /** For a password manager that cannot scan a QR code. */
  secret: string;
  otpauth_uri: string;
  /** A data-URI PNG, so nothing external is fetched to render it. */
  qr_code: string;
}

/**
 * Begin enrolment. Two-factor is **not** on until `confirmTwoFactor` succeeds —
 * switching it on here would lock people out at their next sign-in with a
 * secret they never successfully scanned.
 */
export function beginTwoFactorEnrolment(): Promise<TwoFactorEnrolment> {
  return apiClient.post<TwoFactorEnrolment>("/auth/2fa/enrol/");
}

/**
 * Confirm with a code from the app, switching two-factor on.
 *
 * Returns the recovery codes **once** — they are stored hashed, so this is the
 * only moment they can be shown. Put them in front of the user.
 */
export function confirmTwoFactor(code: string): Promise<{ recovery_codes: string[] }> {
  return apiClient.post<{ recovery_codes: string[] }>("/auth/2fa/confirm/", { code });
}

/** Requires the password again: a stolen token must not be able to switch 2FA off. */
export function disableTwoFactor(password: string): Promise<null> {
  return apiClient.post<null>("/auth/2fa/disable/", { password });
}

/** Replaces every previous code, so a lost printout stops working. */
export function regenerateRecoveryCodes(password: string): Promise<{ recovery_codes: string[] }> {
  return apiClient.post<{ recovery_codes: string[] }>("/auth/2fa/recovery-codes/", { password });
}

/**
 * Finish a sign-in that stopped for a second factor.
 *
 * Takes a TOTP code *or* a recovery code in the same field: somebody locked
 * out of their phone should not have to find a different screen to say so.
 */
export async function completeTwoFactorLogin(
  challengeToken: string,
  code: string,
): Promise<AuthResult> {
  const result = await apiClient.post<AuthResult>("/auth/login/2fa/", {
    challenge_token: challengeToken,
    code,
  });
  apiClient.setAccessToken(result.access_token);
  return result;
}
