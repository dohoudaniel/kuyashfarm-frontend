"use client";

/**
 * A short cross-fade between routes.
 *
 * Navigation used to be a hard cut: the old page vanished and the new one
 * appeared in the same frame, which reads as a reload rather than as movement
 * through one application. A 160ms fade is enough to make the two feel
 * connected and short enough that nobody waits for it.
 *
 * **Deliberately fade-only, with no vertical movement.** A slide-up on route
 * change is the obvious next step and is wrong here for two reasons: it fights
 * the scroll restoration Next performs on back-navigation, and on a long page
 * it animates content the customer cannot see, which costs paint time for
 * nothing. Opacity is cheap, composited, and does not move layout.
 *
 * **`mode="wait"` is not used.** Waiting for the outgoing page to finish
 * before starting the incoming one doubles the perceived navigation time —
 * the thing this is supposed to improve. The two overlap.
 *
 * The key is the pathname rather than the full URL. A filter or a page number
 * in the query string is the *same* page changing its contents, and fading the
 * whole document on every filter tap would make the shop feel slower, not
 * livelier.
 */

import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { DURATION, EASE } from "@/lib/motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  // Under reduced motion this is a plain passthrough. Not a shorter fade — a
  // fade *is* the motion being objected to, and there is nothing here worth
  // keeping a trace of.
  if (reduced) return <>{children}</>;

  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DURATION.base, ease: EASE.out }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
