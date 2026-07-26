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

import { apiClient } from "@/lib/api/client";
import * as authApi from "@/lib/api/auth";
import { mergeCart } from "@/lib/api/cart";
import type { User } from "@/lib/api/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** Server-computed entitlement. Never inferred from account_type here. */
  getsBulkPricing: boolean;
  isBackOffice: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: authApi.RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (input: { full_name?: string; phone?: string }) => Promise<User>;
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
    } catch {
      /* the basket merge is best-effort */
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { user: signedIn } = await authApi.login(email, password);
      await afterSignIn(signedIn);
      return signedIn;
    },
    [afterSignIn],
  );

  const register = useCallback(
    async (input: authApi.RegisterInput) => {
      const { user: created } = await authApi.register(input);
      await afterSignIn(created);
      return created;
    },
    [afterSignIn],
  );

  const logout = useCallback(async () => {
    // Always clear locally, even if the server call fails — otherwise a
    // network blip leaves someone looking signed in when they are not.
    try {
      await authApi.logout();
    } finally {
      setUser(null);
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

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      getsBulkPricing: user?.gets_bulk_pricing ?? false,
      isBackOffice: user?.is_back_office ?? false,
      login,
      register,
      logout,
      refresh,
      updateProfile,
    }),
    [user, isLoading, login, register, logout, refresh, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export default AuthContext;
