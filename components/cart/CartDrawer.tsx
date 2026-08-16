"use client";

/**
 * Cart drawer.
 *
 * Every quantity change round-trips to the server, which clamps to available
 * stock and re-prices for the signed-in user. The prices shown are the
 * server's; nothing here multiplies anything.
 */

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Minus, Plus, ShoppingBag, ShoppingBasket, Trash2, X } from "lucide-react";

import { DURATION, EASE } from "@/lib/motion";
import { useCartStore } from "@/lib/store/useCartStore";
import { formatPrice } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: Props) {
  const reduced = useReducedMotion();
  const { cart, isLoading, isMutating, error, load, updateQuantity, remove } = useCartStore();

  useEffect(() => {
    if (isOpen) void load();
  }, [isOpen, load]);

  // Escape closes, and the body stops scrolling behind the panel.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const items = cart?.items ?? [];

  return (
    /*
     * `AnimatePresence` rather than an early `return null`, so the drawer can
     * animate *out*. Unmounting immediately is why it used to vanish — the
     * panel appearing instantly is tolerable, but a panel that disappears
     * between frames loses the connection between the basket and the button
     * that opened it, and the customer has to re-orient.
     */
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.button
            type="button"
            aria-label="Close cart"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.base, ease: EASE.out }}
            className="absolute inset-0 bg-black/50"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            // Slides from the edge it is attached to. Reduced motion gets a
            // fade in place — the panel still arrives, nothing travels.
            initial={reduced ? { opacity: 0 } : { x: "100%" }}
            animate={reduced ? { opacity: 1 } : { x: 0 }}
            exit={reduced ? { opacity: 0 } : { x: "100%" }}
            transition={{ duration: DURATION.slow, ease: EASE.out }}
            className="relative flex h-full w-full max-w-md flex-col bg-white shadow-xl"
      >
        <header className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">
            Your cart {cart ? `(${cart.item_count})` : ""}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </header>

        {error && (
          <p role="alert" className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-sm text-amber-800">
            {error}
          </p>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading && !cart ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag className="mb-4 h-12 w-12 text-gray-300" />
              <p className="mb-4 text-gray-600">Your cart is empty.</p>
              <Link href="/categories" onClick={onClose} className="rounded-full bg-primary px-6 py-2 font-semibold text-white hover:bg-secondary">
                Browse products
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 border-b pb-4">
                  {/* The real photograph. This was `/icons/file.svg` — the
                      grey document icon that ships with create-next-app —
                      rendered for every line in the basket, because the API
                      never sent an image. A basket of unrecognisable grey
                      squares is a basket people abandon. */}
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-mist">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-primary/40">
                        <ShoppingBasket className="h-6 w-6" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">{item.product_name}</p>
                    <p className="text-xs text-gray-500">
                      {formatPrice(item.unit_price)} {item.unit}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        disabled={isMutating}
                        onClick={() => void updateQuantity(item.id, item.quantity - 1)}
                        className="rounded border p-1 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        disabled={isMutating || item.quantity >= item.available_stock}
                        onClick={() => void updateQuantity(item.id, item.quantity + 1)}
                        className="rounded border p-1 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <Plus className="h-3 w-3" />
                      </button>

                      <button
                        type="button"
                        aria-label={`Remove ${item.product_name}`}
                        disabled={isMutating}
                        onClick={() => void remove(item.id)}
                        className="ml-auto rounded p-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {item.quantity >= item.available_stock && (
                      <p className="mt-1 text-xs text-amber-700">
                        That is all we have in stock.
                      </p>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-gray-900">{formatPrice(item.line_total)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t px-6 py-4">
            <div className="mb-1 flex justify-between text-base font-semibold">
              <span>Subtotal</span>
              <span>{formatPrice(cart?.subtotal ?? "0")}</span>
            </div>
            <p className="mb-4 text-xs text-gray-500">
              Delivery and VAT are calculated at checkout.
            </p>
            <Link
              href="/checkout"
              onClick={onClose}
              className="block w-full rounded-lg bg-primary py-3 text-center font-semibold text-white hover:bg-secondary"
            >
              Checkout
            </Link>
          </footer>
        )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

export default CartDrawer;
