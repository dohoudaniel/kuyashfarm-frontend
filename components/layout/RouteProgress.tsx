"use client";

/**
 * A loading bar across the top of the page during navigation.
 *
 * **Why this exists.** Next's App Router streams a new route in, and between
 * the tap and the first painted content there is a gap with no feedback at
 * all — no spinner, no colour change, nothing. On a fast connection that gap
 * is invisible; on a Nigerian mobile network it is long enough that people tap
 * the link a second time. A progress indicator is the difference between "this
 * is loading" and "that didn't work".
 *
 * **Why it is fake, and why that is correct.** There is no real progress event
 * to read — the browser does not tell you how much of a client-side navigation
 * is done. So the bar eases towards 90% and waits there until the new route
 * commits, then completes. That is the standard approach (YouTube, GitHub and
 * every `nprogress` install do the same) because the honest alternative — no
 * indicator at all — communicates less. It never *claims* to be finished until
 * it is.
 *
 * **Why it does not appear instantly.** It waits 180ms before showing. Most
 * navigations in this app are prefetched and complete faster than that, and a
 * bar that flashes on every tap is worse than none: it makes a fast app look
 * busy. Only navigations slow enough to be noticed get an indicator.
 */

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { DURATION, EASE } from "@/lib/motion";

/** Below this, a navigation is imperceptible and needs no indicator. */
const SHOW_AFTER_MS = 180;

export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduced = useReducedMotion();

  const [visible, setVisible] = useState(false);
  const firstRender = useRef(true);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Route committed: cancel any pending show, then retire the bar.
   *
   * Note that nothing here calls `setVisible` synchronously. Doing so inside
   * an effect is a documented cause of cascading renders, and the linter
   * rejects it — correctly, since the state being set is a *consequence* of a
   * timer rather than of the render that scheduled it. The bar is raised from
   * the click handler below, which is an event and the right place for it.
   */
  useEffect(() => {
    if (showTimer.current) {
      clearTimeout(showTimer.current);
      showTimer.current = null;
    }

    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    // A beat of completed bar before it goes, so a fast navigation still reads
    // as "finished" rather than as a flicker.
    const done = setTimeout(() => setVisible(false), 240);
    return () => clearTimeout(done);
  }, [pathname, searchParams]);

  /**
   * Anchor clicks are what tell us a navigation has *started*.
   *
   * `usePathname` only updates once the new route commits, which is the end of
   * the wait rather than the beginning. Listening for clicks on in-app links
   * is what lets the bar appear during the gap.
   */
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      // Same-document links, new tabs and external destinations are not
      // navigations this bar has anything to say about.
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        anchor.target === "_blank" ||
        event.metaKey ||
        event.ctrlKey
      ) {
        return;
      }
      if (href === window.location.pathname) return;

      // Cleared when the route commits, so a prefetched navigation that lands
      // in 40ms never flashes a bar at all.
      showTimer.current = setTimeout(() => setVisible(true), SHOW_AFTER_MS);
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="route-progress"
          role="progressbar"
          aria-label="Loading page"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: DURATION.quick } }}
          className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 bg-transparent"
        >
          <motion.div
            initial={{ width: reduced ? "90%" : "0%" }}
            // Eases to 90% and stops. The remaining 10% is completion, which
            // only happens when the route actually commits.
            animate={{ width: "90%" }}
            transition={{ duration: reduced ? 0 : 1.6, ease: EASE.out }}
            className="h-full bg-wheat"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
