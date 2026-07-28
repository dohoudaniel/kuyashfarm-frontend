"use client";

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
