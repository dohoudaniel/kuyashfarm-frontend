"use client";

import { useEffect } from "react";
import { ShieldAlert, RotateCcw } from "lucide-react";

export default function AdminError({
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 pt-20">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <ShieldAlert className="h-7 w-7 text-red-500" />
        </div>
        <h2 className="mb-3 font-serif text-2xl font-bold text-gray-900">
          Admin dashboard error
        </h2>
        <p className="mb-8 font-sans text-sm leading-relaxed text-gray-500">
          Something went wrong loading the admin panel. Please try again or
          contact support if the problem persists.
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
