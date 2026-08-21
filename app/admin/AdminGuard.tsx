"use client";

/**
 * Who may see the back office.
 *
 * **This is not the security boundary.** Every `/staff/*` endpoint enforces
 * `IsStaff` or `IsAdmin` server-side, and that is what actually protects the
 * data — anyone can edit what this component decides. What it does is stop a
 * customer who wanders to `/admin` from seeing a broken page full of 403s, and
 * stop the admin chrome rendering for a fraction of a second before the
 * redirect. Treating it as the boundary is how back offices get walked into.
 *
 * The `isLoading` branch matters as much as the other two. `/auth/me/` is one
 * round-trip away on every page load, so a component that renders its
 * signed-out state while that request is in flight bounces a legitimate
 * administrator to the login page on every refresh.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/lib/context/AuthContext";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, isBackOffice } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Signed out entirely: send them to sign in and come back.
    if (!isLoading && !isAuthenticated) {
      router.replace("/login?next=/admin");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // The redirect above is in flight. Rendering nothing beats flashing the
    // admin chrome at somebody who is about to be sent away from it.
    return null;
  }

  if (!isBackOffice) {
    // Signed in, but a customer. Deliberately not a redirect: silently
    // bouncing them looks like a broken link, and they may have followed one
    // from a colleague. Saying so plainly is more useful and reveals nothing
    // — `is_back_office` is already on their own /auth/me/ response.
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-gray-500" />
          <h1 className="mb-2 font-serif text-2xl font-bold text-gray-900">
            This area is for staff
          </h1>
          <p className="mb-6 text-gray-600">
            Your account does not have back-office access. If it should, ask an administrator to
            invite you.
          </p>
          <Link
            href="/"
            className="inline-block rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-secondary"
          >
            Back to the shop
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
