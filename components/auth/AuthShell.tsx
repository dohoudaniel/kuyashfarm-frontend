"use client";

/**
 * The frame around signing in and signing up.
 *
 * **What was wrong with the old one.** Both pages were a 448px column on a
 * `from-green-50 via-white to-green-50` wash, with a pale circle, a Lucide
 * icon, a heading and a white card. It was not broken — it was *default*. The
 * greens were Tailwind's rather than the brand's (`green-600` is `#16a34a`, a
 * bright grass green; `--primary-green` is `#2d5f3f`, a deep forest one), the
 * page had no farm on it anywhere, and the first screen a customer sees after
 * the storefront looked like it belonged to a different company.
 *
 * The split panel is the fix and it is deliberately not novel: the reason
 * every serious product uses this layout for its front door is that the
 * left-hand side is the only place in an authentication flow where there is
 * room to say anything at all. It also gives the brand somewhere to be — the
 * ink field, the blurred orbs and the drawn grid are the academy hero's
 * treatment, so arriving here from the marketing pages is continuous rather
 * than a change of product.
 *
 * **The panel is `hidden lg:flex`.** Below 1024px it is not stacked above the
 * form, it is not rendered: on a phone the form *is* the page, and pushing it
 * below a screenful of decoration to reach the email field is the single most
 * common way this layout is got wrong. Nothing in the panel is information —
 * every claim on it is also on the marketing pages — so removing it costs a
 * small-screen visitor nothing.
 */

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

import { PasswordToggle } from "@/components/ui/PasswordToggle";

/** The wordmark's leaf, so the panel is branded without shipping an image. */
function Leaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M12 2C9 2 6 5 6 9c0 2.5 1.5 4.5 3.5 5.5L9 22h6l-.5-7.5C16.5 13.5 18 11.5 18 9c0-4-3-7-6-7z" />
    </svg>
  );
}

interface AuthShellProps {
  /** Small caps line above the panel headline. */
  eyebrow: string;
  /** Panel headline. The last word is picked out in the accent gradient. */
  headline: string;
  /** Accent-gradient word, rendered after `headline`. */
  highlight: string;
  /** Three or four short reasons. Not features — reasons. */
  points: string[];
  children: React.ReactNode;
}

export function AuthShell({ eyebrow, headline, highlight, points, children }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-cream pt-24 pb-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-3xl border border-edge/60 bg-white shadow-xl lg:grid-cols-2">
          {/* ── Brand panel ─────────────────────────────────────────────── */}
          <aside className="relative hidden overflow-hidden bg-ink p-10 lg:flex lg:flex-col lg:justify-between">
            {/* Drawn rather than fetched: no request, nothing to keep in sync,
                and no image to load before the page looks finished. */}
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/25 blur-[90px]" />
            <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-secondary/20 blur-[80px]" />

            <div className="relative z-10">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white">
                  <Leaf className="h-5 w-5" />
                </span>
                <span className="font-serif text-lg font-bold text-white">Kuyash Farms</span>
              </Link>
            </div>

            <div className="relative z-10 py-10">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
                {eyebrow}
              </p>
              <h2 className="font-serif text-4xl font-bold leading-[1.1] text-white">
                {headline}{" "}
                {/* `var(--accent-green)`, not `var(--accent)`. There is no
                    `--accent` token — an undefined `var()` invalidates the
                    whole gradient, the declaration is dropped, and
                    `text-transparent` then renders the word in nothing at all.
                    That shipped on the academy hero and was invisible to every
                    check except looking at the page. */}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, var(--accent-green) 0%, var(--wheat) 100%)",
                  }}
                >
                  {highlight}
                </span>
              </h2>

              <ul className="mt-8 space-y-3.5">
                {points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm text-white/70">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/30 text-accent">
                      <Check className="h-3 w-3" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <p className="relative z-10 text-xs text-white/40">
              A working 40-acre farm in Nigeria — produce, wholesale supply and the academy.
            </p>
          </aside>

          {/* ── Form ────────────────────────────────────────────────────── */}
          <div className="p-6 sm:p-10">{children}</div>
        </div>
      </div>
    </main>
  );
}

/**
 * The heading above a form inside the shell.
 *
 * Its own component because the sign-in page renders it in three different
 * states — password, two-factor challenge, and the "check your email"
 * confirmation on sign-up — and three hand-written copies drifted last time.
 */
export function AuthHeading({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h1 className="font-serif text-3xl font-bold text-ink">{title}</h1>
      {children && <p className="mt-2 text-sm text-gray-600">{children}</p>}
    </div>
  );
}

/**
 * A labelled text input with an optional leading icon.
 *
 * `components/ui/FormField` exists and is used on the account page, but it has
 * no slot for the "Forgot password?" link that has to sit on the password
 * field's label row — so the two auth pages had the whole input hand-written,
 * twice, and the copies had already drifted in their focus ring. This adds the
 * slot rather than adding a second styling vocabulary.
 */
export function AuthField({
  id,
  label,
  error,
  icon: Icon,
  action,
  ...input
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
}) {
  /*
   * Sign-in and sign-up get the same show/hide control as everywhere else.
   *
   * It matters most here. Typing a password blind is the commonest reason a
   * sign-in fails on a phone, and the natural response — try again, slowly —
   * is precisely what the login throttle punishes at five attempts a minute.
   */
  const [revealed, setRevealed] = useState(false);
  const isPassword = input.type === "password";

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {action}
      </div>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        )}
        <input
          id={id}
          {...input}
          // After the spread, so a password field renders as text when
          // revealed while `input.type` — and therefore the password
          // manager's understanding of the field — stays "password".
          type={isPassword && revealed ? "text" : input.type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`block w-full rounded-xl border bg-white py-3 text-sm transition-colors duration-200 focus:border-transparent focus:ring-2 focus:outline-none ${
            Icon ? "pl-11" : "pl-4"
          } ${isPassword ? "pr-11" : "pr-4"} ${
            error
              ? "border-red-400 focus:ring-red-500"
              : "border-edge hover:border-accent focus:ring-primary"
          }`}
        />
        {isPassword && (
          <PasswordToggle visible={revealed} onToggle={() => setRevealed((was) => !was)} />
        )}
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
