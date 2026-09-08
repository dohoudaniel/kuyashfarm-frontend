"use client";

/**
 * Session state.
 *
 * Rewritten. The previous version mirrored the API user into
 * `localStorage.user` "for backward compatibility", and the rest of the app
 * read identity from there rather than from React. That mirror is what made
 * `AuthModal` able to fabricate a session — write the object, and every
 * `getCurrentUser()` in the codebase believed it (audit §3.1).
 *
 * There is now exactly one source of truth: this context, populated from
 * `/auth/me/`. Nothing about identity is written to browser storage.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { apiClient, hasSessionHint } from "@/lib/api/client";
import * as authApi from "@/lib/api/auth";
import { clearCartSessionId, mergeCart } from "@/lib/api/cart";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import type { User } from "@/lib/api/types";

/**
 * What a password sign-in produced.
 *
 * A discriminated union rather than an optional field, so a caller cannot read
 * `user` without first establishing that there is one — which is exactly the
 * mistake that would sign somebody in without their second factor.
 */
export type LoginOutcome =
  | { twoFactorRequired: false; user: User }
  | { twoFactorRequired: true; challengeToken: string };

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** Server-computed entitlement. Never inferred from account_type here. */
  getsBulkPricing: boolean;
  isBackOffice: boolean;
  /**
   * Sign in with a password. Resolves to `twoFactorRequired: true` when the
   * account has a second factor — nobody is signed in at that point.
   */
  login: (email: string, password: string) => Promise<LoginOutcome>;
  /** Finish a sign-in that stopped for a second factor. */
  completeTwoFactor: (challengeToken: string, code: string) => Promise<User>;
  /**
   * Confirm an email address from a link, and adopt the session that comes
   * back with it. Resolves to `false` when the link had already been used, in
   * which case the address is verified but nobody was signed in.
   */
  completeEmailVerification: (uid: string, token: string) => Promise<boolean>;
  /** Sign in with a Google authorization code. Same two outcomes as `login`. */
  signInWithGoogle: (code: string, redirectUri: string) => Promise<LoginOutcome>;
  /** Resolves when the request is accepted. Does not sign in — see below. */
  register: (input: authApi.RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (input: { full_name?: string; phone?: string }) => Promise<User>;
  /**
   * Replace or remove the profile photograph.
   *
   * Both live here rather than in the page because the avatar is rendered in
   * the navbar too, and a page that owned this state would leave the header
   * showing the previous photograph until the next full page load.
   */
  setAvatar: (file: File) => Promise<User>;
  clearAvatar: () => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const bootstrapped = useRef(false);

  /**
   * Restore the session on load.
   *
   * The access token lives in memory only, so a page refresh starts with
   * nothing. The HttpOnly refresh cookie is what proves we are still signed
   * in; `/auth/me/` triggers the client's silent refresh and returns the user
   * if that cookie is still good.
   */
  const bootstrap = useCallback(async () => {
    // Most visitors are not signed in, and for them this whole exchange was
    // two guaranteed 401s — `/auth/me/`, then the silent `/auth/refresh/` it
    // provokes — before the page could do anything useful. The server sets a
    // readable `kuyash_session` cookie beside the HttpOnly refresh cookie so
    // that question can be answered locally; see `hasSessionHint`.
    //
    // Only an optimisation, and only in the safe direction: a false negative
    // costs a signed-in visitor nothing, because the first 401 from any real
    // request still runs the normal refresh path. Nothing is authorised on the
    // strength of this cookie.
    if (!hasSessionHint()) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      setUser(await authApi.getCurrentUser());
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    // When a refresh finally fails, drop the session rather than leaving a
    // stale user on screen with a dead token.
    apiClient.setUnauthenticatedHandler(() => setUser(null));
    void bootstrap();

    return () => apiClient.setUnauthenticatedHandler(null);
  }, [bootstrap]);

  const afterSignIn = useCallback(async (signedIn: User) => {
    setUser(signedIn);
    // Carry the anonymous basket across. Failure here must not block sign-in.
    try {
      await mergeCart();
      // The guest basket now belongs to the account, so the anonymous session
      // id has done its job. Leaving it in localStorage means the next guest
      // on this browser — after a sign-out — inherits the previous visitor's
      // cart session, and picks up a basket that was never theirs.
      clearCartSessionId();
    } catch {
      /* the basket merge is best-effort */
    }
  }, []);

  /**
   * Sign in with a password.
   *
   * Returns `{ twoFactorRequired: true, challengeToken }` when the account has
   * a second factor, and nobody is signed in at that point — no tokens have
   * been issued. The caller collects a code and calls `completeTwoFactor`.
   *
   * Modelled as a return value rather than a thrown error because needing a
   * second factor is a successful outcome, not a failure, and callers that
   * treat it as one show "sign-in failed" to somebody whose password was right.
   */
  const login = useCallback(
    async (email: string, password: string): Promise<LoginOutcome> => {
      const result = await authApi.login(email, password);

      if (result.two_factor_required) {
        return { twoFactorRequired: true, challengeToken: result.challenge_token };
      }

      await afterSignIn(result.user);
      return { twoFactorRequired: false, user: result.user };
    },
    [afterSignIn],
  );

  /**
   * Sign in with Google.
   *
   * Goes through `afterSignIn` exactly as a password sign-in does, so the
   * basket merge and the profile load are not quietly skipped for social
   * users — and the second factor is honoured identically.
   */
  const signInWithGoogle = useCallback(
    async (code: string, redirectUri: string): Promise<LoginOutcome> => {
      const result = await authApi.signInWithGoogle(code, redirectUri);

      if (result.two_factor_required) {
        return { twoFactorRequired: true, challengeToken: result.challenge_token };
      }

      await afterSignIn(result.user);
      return { twoFactorRequired: false, user: result.user };
    },
    [afterSignIn],
  );

  /** Finish a sign-in that stopped for a second factor. */
  const completeTwoFactor = useCallback(
    async (challengeToken: string, code: string) => {
      const { user: signedIn } = await authApi.completeTwoFactorLogin(challengeToken, code);
      await afterSignIn(signedIn);
      return signedIn;
    },
    [afterSignIn],
  );

  /**
   * Confirm an email address and sign the person in.
   *
   * Routed through `afterSignIn` for the same reason Google sign-in is: this
   * is a real sign-in, so the anonymous basket has to be merged and the guest
   * cart session cleared. Skipping it would sign somebody in and silently drop
   * whatever they had put in their basket before verifying.
   *
   * Returns false for an already-used link — verification still succeeded, but
   * no session was issued and the page must not claim the visitor is signed in.
   */
  const completeEmailVerification = useCallback(
    async (uid: string, token: string) => {
      const { user: verified, access_token } = await authApi.verifyEmail(uid, token);

      if (!access_token) return false;

      await afterSignIn(verified);
      return true;
    },
    [afterSignIn],
  );

  /**
   * Create an account. Deliberately does not sign the user in.
   *
   * The API returns no tokens, because a signed-in response would reveal that
   * the address was new — the whole point of the endpoint answering identically
   * either way. The caller shows "check your email" and sends them to sign in
   * once they have followed the link.
   */
  const register = useCallback(async (input: authApi.RegisterInput) => {
    await authApi.register(input);
  }, []);

  const logout = useCallback(async () => {
    // Always clear locally, even if the server call fails — otherwise a
    // network blip leaves someone looking signed in when they are not.
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      // One person's saved products must not survive into the next session on
      // a shared device. The store is module-level, so nothing else clears it.
      useWishlistStore.getState().clear();
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      setUser(await authApi.getCurrentUser());
    } catch {
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (input: { full_name?: string; phone?: string }) => {
    const updated = await authApi.updateProfile(input);
    setUser(updated);
    return updated;
  }, []);

  const setAvatar = useCallback(async (file: File) => {
    const updated = await authApi.uploadAvatar(file);
    setUser(updated);
    return updated;
  }, []);

  const clearAvatar = useCallback(async () => {
    const updated = await authApi.removeAvatar();
    setUser(updated);
    return updated;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      getsBulkPricing: user?.gets_bulk_pricing ?? false,
      isBackOffice: user?.is_back_office ?? false,
      completeTwoFactor,
      completeEmailVerification,
      signInWithGoogle,
      login,
      register,
      logout,
      refresh,
      updateProfile,
      setAvatar,
      clearAvatar,
    }),
    [
      user,
      isLoading,
      login,
      completeTwoFactor,
      completeEmailVerification,
      signInWithGoogle,
      register,
      logout,
      refresh,
      updateProfile,
      setAvatar,
      clearAvatar,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export default AuthContext;
