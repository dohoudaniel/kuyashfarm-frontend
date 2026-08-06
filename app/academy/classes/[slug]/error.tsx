"use client";

/**
 * Error boundary for a class page.
 *
 * Keep this alongside the route when moving it — losing it turns a failed
 * request into a crash rather than a recoverable message.
 */
import { useEffect } from "react";
import { BookOpen, RotateCcw } from "lucide-react";

export default function ClassError({
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
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 pt-20">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <BookOpen className="h-7 w-7 text-primary" />
        </div>
        <h2 className="mb-3 font-serif text-2xl font-bold text-gray-900">
          Couldn&apos;t load this class
        </h2>
        <p className="mb-8 font-sans text-sm leading-relaxed text-gray-500">
          We had trouble loading this lesson. Please try again or go back to the Academy.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-secondary"
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
          <a
            href="/academy"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-6 py-2.5 font-sans text-sm font-semibold text-gray-700 transition-colors hover:border-primary hover:text-primary"
          >
            Back to Academy
          </a>
        </div>
      </div>
    </div>
  );
}
