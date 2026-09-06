"use client";

/**
 * Tells the visitor when the site is running without live data, and notices
 * when that stops being true.
 *
 * **Why this exists.** The API is on Render's free tier, which spins a service
 * down after roughly fifteen minutes without traffic and takes tens of seconds
 * to wake. Every page that fetches now degrades rather than failing — see
 * `fetchPublic` — so the site stays up, but an empty shop presented without
 * comment is worse than an outage: it looks like a farm with nothing to sell,
 * and a customer has no reason to come back.
 *
 * ── Polling, and why it is not the polling CLAUDE.md forbids ────────────────
 *
 * The unread-notifications badge used to poll every thirty seconds from every
 * open tab. At five thousand users that is roughly 167 requests a second
 * against eight concurrent database slots, and it was replaced by a response
 * header for exactly that reason.
 *
 * This is a different shape:
 *
 *   * **It only runs while the API is already known to be down.** When the
 *     site is healthy this component renders nothing, registers no timer and
 *     makes no request — steady-state cost is zero, which is the whole
 *     objection to the badge.
 *   * **It stops while the tab is hidden.** A background tab left open for a
 *     week is the case that turns any interval into a load test.
 *   * **Three minutes, not thirty seconds.** Long enough that even a full
 *     five thousand affected visitors are ~28 requests a second, and the site
 *     is degraded anyway at that point.
 *   * **It stops the moment the API answers**, and asks the server for fresh
 *     data once.
 *
 * `/health/` is also the cheapest endpoint to ask: one `SELECT current_schema()`
 * and no serialisation.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CloudOff, RefreshCw } from "lucide-react";

import { apiHealthUrl } from "@/lib/api/client";

/** Three minutes, as asked for. Also a sensible cold-start window. */
const POLL_MS = 3 * 60 * 1000;

export function ApiStatusBanner({ initiallyDown }: { initiallyDown: boolean }) {
  const router = useRouter();
  const [down, setDown] = useState(initiallyDown);
  const [checking, setChecking] = useState(false);

  /*
   * A ref, not state, and read only inside the callback. `router.refresh()`
   * re-renders the tree, so a recovery that also flipped a piece of state used
   * in the effect's dependencies could schedule a second probe against the
   * timer it is trying to clear.
   */
  const recovered = useRef(false);

  const probe = useCallback(async () => {
    if (recovered.current) return;
    setChecking(true);
    try {
      const response = await fetch(apiHealthUrl(), {
        headers: { Accept: "application/json" },
        cache: "no-store",
        // Bounded. A cold free-tier instance can hold a connection open for a
        // long time, and an unbounded probe from a background tab is a leak.
        signal: AbortSignal.timeout(10_000),
      });
      if (response.ok) {
        recovered.current = true;
        setDown(false);
        // Server Components hold the stale data. Without this the banner
        // disappears and the shop stays empty until the visitor navigates.
        router.refresh();
      }
    } catch {
      // Still down. Nothing to say that the banner is not already saying.
    } finally {
      setChecking(false);
    }
  }, [router]);

  useEffect(() => {
    if (!down) return;

    // Not on mount: the page was just rendered by a server that failed to
    // reach the API seconds ago. An immediate probe is a request nobody
    // benefits from.
    let timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void probe();
    }, POLL_MS);

    // Check once when the tab comes back, because the interval may have been
    // running against a hidden tab and skipping — somebody returning after
    // lunch should not wait another three minutes.
    const onVisible = () => {
      if (document.visibilityState === "visible") void probe();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      timer = 0;
    };
  }, [down, probe]);

  if (!down) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-[60] flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900"
    >
      <span className="flex items-center gap-1.5 font-medium">
        <CloudOff className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Live data is unavailable at the moment.
      </span>
      <span className="text-amber-800">
        Prices and stock may be out of date. Everything else works normally.
      </span>
      <button
        type="button"
        onClick={() => void probe()}
        disabled={checking}
        className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 transition-opacity hover:opacity-80 disabled:no-underline disabled:opacity-60"
      >
        <RefreshCw className={`h-3 w-3 ${checking ? "animate-spin" : ""}`} aria-hidden />
        {checking ? "Checking…" : "Check now"}
      </button>
    </div>
  );
}
