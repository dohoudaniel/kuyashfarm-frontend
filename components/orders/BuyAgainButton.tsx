"use client";

/**
 * Put everything from a past order back in the basket.
 *
 * **This is the most valuable retention feature in the shop**, and it is worth
 * saying why so plainly: people buy the same tomatoes every fortnight. Every
 * repeat purchase currently costs the customer a full shopping trip — find the
 * category, find the product, set the quantity, repeat for eight lines — to
 * arrive at a basket they have already assembled once. Removing that is worth
 * more than every animation on the site put together.
 *
 * **Lines are added one at a time, deliberately.** There is no bulk endpoint,
 * and inventing one would mean deciding server-side what to do when three of
 * eight lines are out of stock — refuse the lot, or partially succeed with no
 * way to say which. Doing it here means each line's outcome is visible, and
 * the customer is told exactly what could not be added rather than being given
 * a basket that quietly differs from the order they clicked.
 *
 * **Sequential rather than parallel.** Each add returns the whole recomputed
 * cart, and firing eight at once means eight responses racing to overwrite the
 * same store — last-write-wins, so the final basket reflects whichever request
 * happened to finish last rather than all eight. Slower and correct beats
 * faster and wrong when the result is what somebody is about to pay for.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

import { useCartStore } from "@/lib/store/useCartStore";
import { tap } from "@/lib/motion";

interface Line {
  product_slug: string;
  product_name: string;
  quantity: number;
}

export function BuyAgainButton({ items, label = "Buy these again" }: { items: Line[]; label?: string }) {
  const addToCart = useCartStore((state) => state.add);
  const router = useRouter();

  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  async function handleBuyAgain() {
    setBusy(true);
    setFailed([]);
    setDone(false);

    const couldNotAdd: string[] = [];

    for (const line of items) {
      // The server clamps to available stock and re-prices for this caller, so
      // a line that is short is added at what is actually available rather
      // than rejected — the customer gets what the shop can supply, and is
      // told about anything it cannot.
      const ok = await addToCart(line.product_slug, line.quantity);
      if (!ok) couldNotAdd.push(line.product_name);
    }

    setFailed(couldNotAdd);
    setDone(true);
    setBusy(false);

    // Straight to checkout only when the whole order was reproduced. If
    // anything is missing the customer needs to see the basket first, or they
    // discover the gap at the payment screen.
    if (couldNotAdd.length === 0) router.push("/checkout");
  }

  if (items.length === 0) return null;

  return (
    <div>
      <motion.button
        type="button"
        onClick={handleBuyAgain}
        disabled={busy}
        whileTap={tap}
        className="flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-white transition-colors hover:bg-secondary disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
        {busy ? "Adding…" : label}
      </motion.button>

      {done && failed.length > 0 && (
        <p role="alert" className="mt-3 text-sm text-amber-700">
          Added what we could. Not available right now:{" "}
          <strong>{failed.join(", ")}</strong>. Everything else is in your basket.
        </p>
      )}
      {done && failed.length === 0 && (
        <p aria-live="polite" className="sr-only">
          All items added to your basket.
        </p>
      )}
    </div>
  );
}
