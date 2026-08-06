"use client";

/**
 * Basket button with a live item count.
 *
 * The count comes from the zustand store, which caches the *server* cart —
 * so the badge is a fast paint of authoritative data, never a local tally.
 */
import { ShoppingCart } from "lucide-react";

import { useCartStore } from "@/lib/store/useCartStore";

export function CartButton({ onClick }: { onClick: () => void }) {
  const count = useCartStore((state) => state.cart?.item_count ?? 0);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={count > 0 ? `Cart, ${count} items` : "Cart, empty"}
      className="relative flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 text-white transition-colors hover:bg-white/20"
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-wheat px-1 text-xs font-bold text-primary-dark">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}

export default CartButton;
