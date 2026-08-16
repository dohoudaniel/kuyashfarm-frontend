"use client";

/**
 * Product grid.
 *
 * Renders server-provided products immediately, then re-fetches once we know
 * who is asking. A verified wholesaler sees their tier price; everyone else
 * keeps the retail figures that were already in the HTML.
 *
 * No price is computed here. `unit_price` is whatever the server said it is.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, Check, Loader2, ShoppingCart } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { StockBadge } from "@/components/ui/StockBadge";
import { DURATION, EASE, tap } from "@/lib/motion";
import { useAuth } from "@/lib/context/AuthContext";
import { listProducts, subscribeToRestock } from "@/lib/api/catalogue";
import { useCartStore } from "@/lib/store/useCartStore";
import type { Product } from "@/lib/api/types";
import { formatPrice } from "@/lib/utils";

interface Props {
  initialProducts: Product[];
  categorySlug: string;
  categoryName: string;
}

/** Icon swap inside the add button: a fast cross-fade, no movement. */
const swap = {
  initial: { opacity: 0, scale: 0.7 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.7 },
  transition: { duration: DURATION.quick, ease: EASE.out },
} as const;

export function ProductGrid({ initialProducts, categorySlug }: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [addedSlug, setAddedSlug] = useState<string | null>(null);
  const [busySlug, setBusySlug] = useState<string | null>(null);

  const { isAuthenticated, getsBulkPricing } = useAuth();
  const addToCart = useCartStore((state) => state.add);
  const cartError = useCartStore((state) => state.error);

  // Server-rendered prices are retail. Once we know the visitor is entitled to
  // bulk pricing, ask again — the server recomputes for them.
  useEffect(() => {
    if (!getsBulkPricing) return;
    let cancelled = false;

    listProducts({ category: categorySlug, page_size: 60 })
      .then((page) => {
        if (!cancelled) setProducts(page.results);
      })
      .catch(() => {
        /* keep the server-rendered prices */
      });

    return () => {
      cancelled = true;
    };
  }, [getsBulkPricing, categorySlug]);

  const visible = products.filter((p) =>
    p.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  async function handleAdd(product: Product) {
    setBusySlug(product.slug);
    const ok = await addToCart(product.slug, 1);
    setBusySlug(null);
    if (ok) {
      setAddedSlug(product.slug);
      setTimeout(() => setAddedSlug(null), 2000);
    }
  }

  async function handleNotify(product: Product) {
    setBusySlug(product.slug);
    try {
      await subscribeToRestock(product.slug);
    } finally {
      setBusySlug(null);
    }
  }

  return (
    <div className="py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products…"
          aria-label="Search products"
          className="w-full rounded-full border border-gray-300 px-5 py-3 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20 sm:w-80"
        />
        {getsBulkPricing && (
          <p className="text-sm font-medium text-green-700">
            Your wholesale pricing is applied below.
          </p>
        )}
      </div>

      {cartError && (
        <div role="alert" className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {cartError}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="py-16 text-center text-gray-600">No products match that search.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((product) => {
            const outOfStock = product.available_stock <= 0;
            const busy = busySlug === product.slug;

            return (
              <article key={product.id} className="group">
                <Link
                  href={`/shop/${categorySlug}/${product.slug}`}
                  className="relative mb-3 block aspect-4/3 overflow-hidden rounded-2xl bg-gray-100"
                >
                  {product.primary_image ? (
                    <Image
                      src={product.primary_image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">
                      No photograph yet
                    </div>
                  )}
                </Link>

                <h3 className="text-sm font-semibold text-gray-900">
                  <Link href={`/shop/${categorySlug}/${product.slug}`}>{product.name}</Link>
                </h3>
                <p className="line-clamp-2 text-xs text-gray-600">{product.description}</p>

                <div className="mt-2">
                  <StockBadge
                    status={product.stock_status}
                    available={product.available_stock}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-base font-semibold text-gray-900">
                      {formatPrice(product.unit_price)}
                    </span>
                    <span className="text-sm text-gray-500"> {product.unit}</span>
                    {product.has_bulk_pricing && (
                      <p className="text-xs font-medium text-green-700">Bulk pricing available</p>
                    )}
                  </div>

                  {outOfStock ? (
                    <button
                      type="button"
                      onClick={() => handleNotify(product)}
                      disabled={busy || !isAuthenticated}
                      title={isAuthenticated ? undefined : "Sign in to be notified"}
                      className="flex min-h-11 items-center gap-1.5 rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
                    >
                      <Bell className="h-3 w-3" />
                      Notify me
                    </button>
                  ) : (
                    <motion.button
                      type="button"
                      onClick={() => handleAdd(product)}
                      disabled={busy}
                      whileTap={tap}
                      // Green while idle, and *stays* green when added rather
                      // than flipping to a success colour: the confirmation is
                      // the word and the tick, and a second colour here
                      // competes with the basket badge for the same message.
                      className="flex min-h-11 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-secondary disabled:opacity-60"
                    >
                      {/* Width is held steady across the three states so the
                          card does not reflow mid-tap — a button that resizes
                          under the thumb is how a second, accidental tap
                          happens. */}
                      <span className="grid h-3 w-3 place-items-center">
                        <AnimatePresence mode="wait" initial={false}>
                          {busy ? (
                            <motion.span key="busy" {...swap}>
                              <Loader2 className="h-3 w-3 animate-spin" />
                            </motion.span>
                          ) : addedSlug === product.slug ? (
                            <motion.span key="done" {...swap}>
                              <Check className="h-3 w-3" />
                            </motion.span>
                          ) : (
                            <motion.span key="idle" {...swap}>
                              <ShoppingCart className="h-3 w-3" />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </span>
                      {addedSlug === product.slug ? "Added" : "Add"}
                    </motion.button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
