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
      <AuthProvider>
        {children}
        <ChatWidget />
        <NotificationToast />
      </AuthProvider>
    </ErrorBoundary>
  );
}
