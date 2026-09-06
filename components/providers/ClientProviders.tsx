"use client";

/**
 * The client-side provider stack, mounted once in `app/layout.tsx`.
 *
 * Order matters. `ErrorBoundary` is outermost so it can catch failures in
 * the providers themselves; `AuthProvider` sits above anything reading
 * `useAuth()`. Adding a provider anywhere else risks a second, competing
 * instance of the same context.
 */
import { ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/lib/context/AuthContext";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { NotificationToast } from "@/components/ui/NotificationToast";

interface ClientProvidersProps {
  children: ReactNode;
}

/**
 * Client-side providers wrapper
 * Wraps all client-side providers and components including ErrorBoundary
 */
export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ErrorBoundary>
      {/*
        `reducedMotion="user"` makes every framer animation in the application
        honour the operating system's setting, without a `useReducedMotion()`
        call at each site. Framer drops transform and layout animation for
        those users and keeps opacity, which is the right reduction: the
        element still appears, it just does not travel.

        This matters most for the ported marketing sections, which carry 25
        scroll-triggered animations between them and were written with no
        reduced-motion handling at all. Editing 25 call sites would have been
        25 chances to miss one; this is a single switch that also covers
        everything added later.

        The CSS block in `globals.css` still handles CSS transitions and
        keyframes — the two are complementary, not redundant, because framer
        animates through JavaScript and is untouched by a media query.
      */}
      <MotionConfig reducedMotion="user">
        <AuthProvider>
          {children}
          <ChatWidget />
          <NotificationToast />
        </AuthProvider>
      </MotionConfig>
    </ErrorBoundary>
  );
}
