"use client";

import { useEffect } from "react";
import { RotateCcw, BookOpen } from "lucide-react";
import Link from "next/link";

export default function BlogError({
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
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-mist border border-edge flex items-center justify-center mx-auto mb-5">
          <BookOpen className="w-6 h-6 text-primary" />
        </div>
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-primary mb-2">
          Blog Error
        </p>
        <h2 className="font-serif text-2xl font-bold text-gray-900 mb-3">
          Couldn&apos;t load the blog
        </h2>
        <p className="text-sm text-gray-500 font-sans leading-relaxed mb-8">
          Something went wrong while loading the articles. Please try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-secondary transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-semibold text-sm px-6 py-2.5 rounded-full hover:border-edge hover:text-primary transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
