"use client";

/**
 * A basket bar pinned to the bottom of the screen, on phones only.
 *
 * **The problem it solves.** On a product page the "Add to cart" button sits
 * partway down, above the description, the bulk-price ladder and the delivery
 * notes. A customer who scrolls to read any of that — which is exactly what a
 * customer deciding whether to buy does — has scrolled the only way to buy off
 * the screen, and has to scroll back up having already decided. That is the
 * most expensive scroll in the shop.
 *
 * **It appears only after the real button has left the viewport.** A bar that
 * is always there duplicates a control the customer can already see, covers
 * content, and on a 390px screen costs a sixth of the visible page for
 * nothing. An `IntersectionObserver` on the original button is what decides —
 * not a scroll offset, which would need re-tuning every time the layout above
 * it changes.
 *
 * **Phones only.** On a desktop the button is rarely far away and the viewport
 * is tall enough that pinning something to the bottom edge is noise.
 */

import { useEffect, useState } from "react";
import { Loader2, ShoppingCart } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { DURATION, EASE, tap } from "@/lib/motion";
import { formatPrice } from "@/lib/utils";

interface Props {
  /** The element to watch. The bar shows when this scrolls out of view. */
  watchRef: React.RefObject<HTMLElement | null>;
  price: string;
  productName: string;
  onAdd: () => void;
  busy: boolean;
  added: boolean;
  disabled?: boolean;
}

export function StickyAddBar({
  watchRef,
  price,
  productName,
  onAdd,
  busy,
  added,
  disabled = false,
}: Props) {
  const [show, setShow] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const target = watchRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      // Show precisely when the real control is not visible. No scroll maths,
      // so this keeps working when the content above it changes.
      ([entry]) => setShow(!entry!.isIntersecting),
      { threshold: 0 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [watchRef]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={reduced ? { opacity: 0 } : { y: "100%" }}
          animate={reduced ? { opacity: 1 } : { y: 0 }}
          exit={reduced ? { opacity: 0 } : { y: "100%" }}
          transition={{ duration: DURATION.base, ease: EASE.out }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-sm md:hidden"
          // Respects the home-indicator area on modern phones, so the button
          // is not half-covered by the system gesture bar.
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-gray-500">{productName}</p>
              <p className="font-semibold text-ink">{formatPrice(price)}</p>
            </div>

            <motion.button
              type="button"
              onClick={onAdd}
              disabled={busy || disabled}
              whileTap={tap}
              className="flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-white transition-colors hover:bg-secondary disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
              {added ? "Added" : "Add"}
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
