"use client";

/**
 * Everything this customer saved for later.
 *
 * Three states, and the empty one is the important one. A wishlist page that
 * says only "nothing saved" is a dead end — it tells somebody what they
 * already know and offers no way out of it. This one names the action that
 * fills it and links to the shop, because the page is most often reached by
 * somebody who has not used the feature yet.
 *
 * Reads from the same store as every heart on the site, so removing something
 * here updates the grid behind it without a refetch.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { listWishlist, type WishlistItem } from "@/lib/api/wishlist";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { useAuth } from "@/lib/context/AuthContext";
import { SaveButton } from "@/components/shop/SaveButton";
import { DURATION, EASE, lift } from "@/lib/motion";
import { formatPrice } from "@/lib/utils";

export function SavedClient() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const savedSlugs = useWishlistStore((state) => state.saved);
  const loadStore = useWishlistStore((state) => state.load);

  /**
   * `null` means "not fetched yet"; an array means fetched, empty or not.
   *
   * There is deliberately no separate `loading` flag. The obvious shape — a
   * boolean flipped at the top of the effect — writes state synchronously
   * inside that effect, which is a documented cause of cascading renders and
   * is rejected by the linter. One nullable value carries both facts and is
   * only ever written from an async callback.
   */
  const [items, setItems] = useState<WishlistItem[] | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    void loadStore();
    listWishlist()
      .then((rows) => !cancelled && setItems(rows))
      // An empty array rather than staying null, or a failed request spins
      // for ever instead of showing the empty state.
      .catch(() => !cancelled && setItems([]));

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, loadStore]);

  /*
   * Filtered against the store rather than refetched.
   *
   * Un-saving something removes it from the store optimistically, so the card
   * leaves immediately — and `AnimatePresence` gets to animate it out, which a
   * refetch-and-replace would not.
   */
  const visible = (items ?? []).filter((item) => savedSlugs.has(item.product.slug));

  if (authLoading || (isAuthenticated && items === null)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-cream pb-24 pt-28">
        <div className="mx-auto max-w-md px-4 text-center">
          <Heart className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h1 className="display-sm mb-3 font-serif font-bold text-ink">Sign in to see your saved items</h1>
          <p className="mb-6 text-gray-600">
            Saved products follow your account, so they are there on your phone as well as here.
          </p>
          <Link
            href="/login?next=/saved"
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 font-semibold text-white transition-colors hover:bg-secondary"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream pb-24 pt-28">
      <div className="mx-auto max-w-7xl 2xl:max-w-[1536px] px-4 sm:px-6 lg:px-8">
        <h1 className="display-md mb-2 font-serif font-bold text-ink">Saved for later</h1>
        <p className="mb-8 text-gray-600">
          {visible.length === 0
            ? "Nothing saved yet."
            : `${visible.length} ${visible.length === 1 ? "product" : "products"}.`}
        </p>

        {visible.length === 0 ? (
          // Not a dead end: names the action that fills this page.
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <Heart className="mx-auto mb-4 h-10 w-10 text-gray-300" />
            <p className="mb-6 text-gray-600">
              Tap the heart on any product to keep it here for next time.
            </p>
            <Link
              href="/categories"
              className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 font-semibold text-white transition-colors hover:bg-secondary"
            >
              Browse the shop
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {visible.map((item) => (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: DURATION.base, ease: EASE.out }}
                  className="group relative"
                >
                  <SaveButton
                    slug={item.product.slug}
                    productName={item.product.name}
                    className="absolute right-2 top-2 z-10 shadow-sm"
                  />

                  <motion.div whileHover={lift}>
                    <Link
                      href={`/shop/${item.product.category_slug}/${item.product.slug}`}
                      className="block"
                    >
                      <div className="relative mb-3 aspect-4/3 overflow-hidden rounded-2xl bg-mist">
                        {item.product.primary_image ? (
                          <Image
                            src={item.product.primary_image}
                            alt={item.product.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <h2 className="text-sm font-semibold text-ink">{item.product.name}</h2>
                      <p className="text-sm text-gray-600">
                        {formatPrice(item.product.unit_price)}
                        <span className="text-gray-500"> / {item.product.unit}</span>
                      </p>
                    </Link>
                  </motion.div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </main>
  );
}
