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

export async function login(email: string, password: string): Promise<AuthResult> {
  const result = await apiClient.post<AuthResult>("/auth/login/", { email, password });
  apiClient.setAccessToken(result.access_token);
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
