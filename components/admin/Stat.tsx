"use client";

/**
 * The vocabulary the analytics page is written in.
 *
 * Four small components, shared so that "a number with a label" means one
 * thing across the whole screen. The alternative — each section styling its
 * own — is how a dashboard ends up with four sizes of headline figure and
 * reads as four dashboards.
 *
 * No charting library. Every shape here is a div with a width, which is enough
 * for a bar and a proportion and costs nothing: the alternative is ~90 KB of
 * JavaScript on a back-office page, on a connection where that is real money.
 */

import { cn, formatPrice } from "@/lib/utils";

/**
 * One headline figure.
 *
 * `money` routes through `formatPrice`, which takes the decimal string as it
 * came. Nothing here converts a money value to a Number — 0.1 + 0.2 is not 0.3
 * in binary floating point, and a total that is wrong in the third decimal
 * place is a total somebody has to reconcile by hand.
 */
export function Stat({
  label,
  value,
  hint,
  money = false,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  money?: boolean;
  tone?: "default" | "warn" | "good";
}) {
  return (
    <div className="rounded-xl border border-edge/60 bg-white p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500">{label}</p>
      <p
        className={cn(
          "mt-1.5 font-serif text-2xl font-bold",
          tone === "warn" ? "text-amber-700" : tone === "good" ? "text-primary" : "text-ink",
        )}
      >
        {money ? formatPrice(String(value)) : value}
      </p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

/** A titled block. Every section of the analytics page is one. */
export function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-edge/60 bg-white">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-edge/50 bg-mist/40 px-5 py-4">
        <div>
          <h2 className="font-serif text-base font-bold text-ink">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-gray-600">{description}</p>}
        </div>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

/**
 * A labelled proportion.
 *
 * `total` guards against zero explicitly rather than relying on the division:
 * `n / 0` is `Infinity` in JavaScript, not an error, so an empty deployment
 * would render a bar `Infinity%` wide — which collapses the layout rather than
 * showing nothing, and looks like a rendering bug rather than an empty table.
 */
export function Bar({
  label,
  value,
  total,
  tone = "primary",
}: {
  label: string;
  value: number;
  total: number;
  tone?: "primary" | "accent" | "warn";
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
        <span className="truncate text-gray-700">{label}</span>
        <span className="shrink-0 font-medium text-ink">
          {value.toLocaleString("en-NG")}
          <span className="ml-1.5 text-xs font-normal text-gray-500">{percent}%</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-mist">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500",
            tone === "warn" ? "bg-amber-500" : tone === "accent" ? "bg-accent" : "bg-primary",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

/**
 * A monthly series as columns.
 *
 * Heights are relative to the tallest month, so a flat series still reads.
 * A month with no activity keeps a hairline rather than disappearing — the
 * analytics module emits quiet months as zeroes precisely so the gap is
 * visible as a gap, and rendering nothing would undo that.
 */
export function Columns({
  points,
  money = false,
}: {
  points: { label: string; value: number; caption?: string }[];
  money?: boolean;
}) {
  const peak = Math.max(...points.map((point) => point.value), 0);

  return (
    <div className="flex items-end gap-1.5 overflow-x-auto pb-1" style={{ minHeight: 140 }}>
      {points.map((point) => {
        const height = peak > 0 ? Math.max(2, Math.round((point.value / peak) * 110)) : 2;
        return (
          <div key={point.label} className="flex min-w-10 flex-1 flex-col items-center gap-1.5">
            <span className="text-[10px] font-medium text-gray-600">
              {point.value > 0
                ? money
                  ? formatPrice(String(point.value))
                  : point.value.toLocaleString("en-NG")
                : ""}
            </span>
            <div
              className="w-full rounded-t bg-primary/85 transition-[height] duration-500"
              style={{ height }}
              title={point.caption ?? `${point.label}: ${point.value}`}
            />
            <span className="font-mono text-[9px] uppercase tracking-wide text-gray-500">
              {point.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
