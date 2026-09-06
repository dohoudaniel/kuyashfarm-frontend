/**
 * 404 page.
 */

import Link from "next/link";
import { Leaf } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4">
      <div className="max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Leaf className="h-7 w-7 text-primary" />
        </div>
        <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-widest text-accent">
          404 — Page not found
        </p>
        <h1 className="mb-4 font-serif text-4xl font-bold text-gray-900 md:text-5xl">
          Lost in the fields?
        </h1>
        <p className="mb-10 font-sans text-base leading-relaxed text-gray-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get
          you back to fresh ground.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 font-sans text-sm font-semibold text-white transition-colors hover:bg-secondary"
          >
            Back to Home
          </Link>
          <Link
            href="/#services"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-7 py-3 font-sans text-sm font-semibold text-gray-700 transition-colors hover:border-primary hover:text-primary"
          >
            Our Services
          </Link>
        </div>
      </div>
    </div>
  );
}
