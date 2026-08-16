"use client";

/**
 * A strip of the products this browser looked at last.
 *
 * The homepage a returning customer sees is currently identical to the one a
 * stranger sees. This is the cheapest thing that makes the second visit feel
 * like a continuation — and for a grocery business the second visit is the
 * business.
 *
 * **Renders nothing when there is no history**, rather than an empty state.
 * A first-time visitor should not be shown a heading explaining a feature they
 * have not used yet; that is a worse homepage than no strip at all.
 *
 * **Reads storage in an effect, not during render.** `localStorage` does not
 * exist on the server, and reading it while rendering produces markup that
 * disagrees with the server's — a hydration mismatch, which React resolves by
 * throwing away the tree. So the first paint is deliberately empty and the
 * strip appears a frame later.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { recentlyViewed, type ViewedProduct } from "@/lib/recently-viewed";
import { DURATION, EASE, lift } from "@/lib/motion";

export function RecentlyViewed({
  exclude,
  title = "Pick up where you left off",
}: {
  exclude?: string;
  title?: string;
}) {
  const [items, setItems] = useState<ViewedProduct[]>([]);

  useEffect(() => {
    setItems(recentlyViewed(exclude));
  }, [exclude]);

  if (items.length === 0) return null;

  return (
    <section aria-label="Recently viewed" className="border-t border-gray-100 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="display-sm mb-6 font-serif font-bold text-ink">{title}</h2>

        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {items.map((item, index) => (
            <motion.li
              key={item.slug}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: DURATION.base,
                ease: EASE.out,
                // Staggered by index rather than by a container variant, so a
                // strip of two does not wait on the timing of a strip of four.
                delay: index * 0.04,
              }}
            >
              <motion.div whileHover={lift}>
                <Link
                  href={`/shop/${item.category}/${item.slug}`}
                  className="group block overflow-hidden rounded-xl bg-cream"
                >
                  <div className="relative aspect-square overflow-hidden bg-mist">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : null}
                  </div>
                  <p className="truncate px-3 py-2.5 text-sm font-medium text-ink">{item.name}</p>
                </Link>
              </motion.div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
