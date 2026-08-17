"use client";

/**
 * Rise-and-fade as a section scrolls into view.
 *
 * Wraps the one pattern the marketing pages need, so a dozen components do not
 * each hand-roll their own `initial`/`whileInView`/`viewport` triple and drift
 * apart. The academy already used this shape; the homepage had no motion at
 * all, which is why the two halves of the site felt like different products.
 *
 * **8px of travel, not 40.** A long distance is what makes scroll animation
 * read as a slideshow: the eye follows the movement instead of the content it
 * is supposed to be introducing. At this distance the section is *settling*
 * rather than arriving.
 *
 * **`once: true`.** Re-animating on every pass makes a page tiring to scroll
 * back through, and on a long marketing page people do scroll back.
 *
 * **`margin: -60px`** starts the animation slightly before the element is
 * fully on screen, so it has finished by the time it is being read rather
 * than moving underneath the reader.
 *
 * Reduced motion renders the children untouched — no wrapper, no transform,
 * nothing to compose with a `will-change` the browser then has to manage.
 */

import { motion, useReducedMotion } from "framer-motion";

import { DURATION, EASE } from "@/lib/motion";

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  /** Seconds. Use sparingly — a stagger longer than about 0.2s reads as slow. */
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: DURATION.base, ease: EASE.out, delay }}
    >
      {children}
    </motion.div>
  );
}
