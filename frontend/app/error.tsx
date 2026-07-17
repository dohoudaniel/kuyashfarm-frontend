"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#2d5f3f]/10">
          <AlertTriangle className="h-7 w-7 text-[#2d5f3f]" />
        </div>
        <h1 className="mb-3 font-serif text-2xl font-bold text-gray-900">
          Something went wrong
        </h1>
        <p className="mb-8 font-sans text-sm leading-relaxed text-gray-500">
          An unexpected error occurred. Our team has been notified. Please try
          again or return to the homepage.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full bg-[#2d5f3f] px-6 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-[#4a7c59]"
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-6 py-2.5 font-sans text-sm font-semibold text-gray-700 transition-colors hover:border-[#2d5f3f] hover:text-[#2d5f3f]"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
