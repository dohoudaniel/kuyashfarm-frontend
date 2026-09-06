"use client";

/**
 * Basket button with a live item count.
 *
 * The count comes from the zustand store, which caches the *server* cart — so
 * the badge is a fast paint of authoritative data, never a local tally.
 *
 * **The badge animates when the count changes, and that is not decoration.**
 * It is the only confirmation a customer gets that the thing they tapped
 * worked: tapping "Add" on a product card changes one small number at the
 * opposite corner of the screen, which on a phone is nowhere near where the
 * thumb was looking. A number that silently increments is a number nobody
 * sees, and "did that work?" is the moment people abandon a basket.
 *
 * The animation is driven by `key={count}` rather than by an effect watching
 * for changes. React replaces a keyed element when its key changes, which
 * replays the entrance for free — no state, no effect, and nothing to leak if
 * the component unmounts mid-animation. The effect version of this needed a
 * ref, a timer and a `setState` inside `useEffect`, which is both more code
 * and a documented cause of cascading renders.
 */

import { ShoppingCart } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { useCartStore } from "@/lib/store/useCartStore";
import { DURATION, EASE } from "@/lib/motion";

export function CartButton({ onClick }: { onClick: () => void }) {
  const count = useCartStore((state) => state.cart?.item_count ?? 0);
  const reduced = useReducedMotion();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={count > 0 ? `Cart, ${count} items` : "Cart, empty"}
      className="relative flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 text-white transition-colors hover:bg-white/20"
    >
      <ShoppingCart className="h-5 w-5" />

      <AnimatePresence initial={false}>
        {count > 0 && (
          <motion.span
            // Keyed on the value: a change swaps the element and replays the
            // entrance, where mutating the text in place would animate nothing.
            key={count}
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.base, ease: EASE.back }}
            className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-wheat px-1 text-xs font-bold tabular-nums text-primary-dark"
          >
            {count > 99 ? "99+" : count}
          </motion.span>
        )}
      </AnimatePresence>

      {/*
        Announced to screen readers, which perceive none of the above. An
        `aria-live` region is what makes the confirmation available to somebody
        who cannot see a badge appear.
      */}
      <span aria-live="polite" className="sr-only">
        {count > 0 ? `${count} items in your basket` : ""}
      </span>
    </button>
  );
}

export default CartButton;
