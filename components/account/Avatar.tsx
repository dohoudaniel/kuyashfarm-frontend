"use client";

/**
 * A person, as a circle: their photograph, or their initials.
 *
 * The initials arithmetic was in `Navbar.tsx` and is now shared, because the
 * profile page renders the same person at a different size and two copies of
 * "which letters" would drift — one showing `CE` and the other `CK` for the
 * same account is the kind of difference nobody reports and everybody notices.
 *
 * Splitting on `[\s@.]+` is what makes an account with no name still produce
 * something: `cejiro@kuyashfarms.com` yields `CK` rather than a blank disc.
 */

import Image from "next/image";

import { cn } from "@/lib/utils";

export function initialsFor(name?: string | null, email?: string | null): string {
  return (name || email || "?")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  /** Rendered pixel size. Also the value handed to `next/image` for `sizes`. */
  size?: number;
  className?: string;
}

export function Avatar({ src, name, email, size = 40, className }: AvatarProps) {
  const initials = initialsFor(name, email);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary font-bold text-white",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.36)) }}
    >
      {/*
        The initials stay in the DOM underneath the photograph rather than
        being swapped out for it. A photograph that fails to load — a deleted
        file, an offline moment, a bucket permission changed after the URL was
        issued — then degrades to initials instead of to an empty circle,
        without needing an `onError` handler and the state that comes with it.
      */}
      <span aria-hidden={Boolean(src)}>{initials}</span>
      {src && (
        <Image
          src={src}
          alt={name || email || "Profile photograph"}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      )}
    </span>
  );
}
