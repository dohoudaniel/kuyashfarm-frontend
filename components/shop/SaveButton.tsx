"use client";

/**
 * The heart that saves a product for later.
 *
 * **Hidden entirely when signed out**, rather than shown and then bouncing the
 * customer to a login page. A control that looks available and turns out not
 * to be is worse than an absent one — and a wishlist is a reason to create an
 * account, which is best made on the account pages rather than by ambushing
 * somebody mid-browse.
 *
 * **The fill animates; the outline does not.** Saving is the action worth
 * acknowledging. Un-saving is a correction, and celebrating it would be odd.
 *
 * `aria-pressed` rather than a label that changes: this is a toggle, and
 * screen readers announce toggle state from that attribute. The visible label
 * stays constant so the button does not resize under the thumb mid-tap.
 */

import { Heart } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { useAuth } from "@/lib/context/AuthContext";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { DURATION, EASE, tap } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function SaveButton({
  slug,
  productName,
  className,
}: {
  slug: string;
  productName: string;
  className?: string;
}) {
  const { isAuthenticated } = useAuth();
  const reduced = useReducedMotion();

  const saved = useWishlistStore((state) => state.saved.has(slug));
  const busy = useWishlistStore((state) => state.pending.has(slug));
  const toggle = useWishlistStore((state) => state.toggle);

  if (!isAuthenticated) return null;

  return (
    <motion.button
      type="button"
      onClick={(event) => {
        // The heart usually sits inside a card that is itself a link.
        event.preventDefault();
        event.stopPropagation();
        void toggle(slug);
      }}
      disabled={busy}
      whileTap={tap}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${productName} from saved` : `Save ${productName} for later`}
      className={cn(
        "flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors hover:bg-white disabled:opacity-60",
        className,
      )}
    >
      <motion.span
        // Keyed on the state so the fill replays its entrance on save. Nothing
        // plays on un-save: `saved` is false, so the animate target is idle.
        key={saved ? "saved" : "not-saved"}
        initial={saved && !reduced ? { scale: 0.6 } : false}
        animate={{ scale: 1 }}
        transition={{ duration: DURATION.base, ease: EASE.back }}
        className="block"
      >
        <Heart
          className={cn(
            "h-5 w-5 transition-colors",
            saved ? "fill-red-500 text-red-500" : "text-gray-600",
          )}
        />
      </motion.span>
    </motion.button>
  );
}
