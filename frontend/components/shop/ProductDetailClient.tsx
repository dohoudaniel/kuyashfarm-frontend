"use client";

/**
 * Product detail, interactive parts.
 *
 * The bulk-pricing ladder shown here is the caller's own — the server only
 * returns tiers they are entitled to, so a retail shopper sees none and a
 * verified distributor sees theirs. The quantity selector asks the server what
 * that quantity would cost rather than multiplying locally.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Loader2, ShoppingCart } from "lucide-react";

import { StockBadge } from "@/components/ui/StockBadge";
import { getProduct, quoteProduct } from "@/lib/api/catalogue";
import { useAuth } from "@/lib/context/AuthContext";
import { useCartStore } from "@/lib/store/useCartStore";
import type { PriceQuote, ProductDetail } from "@/lib/api/types";
import { formatPrice } from "@/lib/utils";

interface Props {
  initialProduct: ProductDetail;
  categorySlug: string;
}

export function ProductDetailClient({ initialProduct, categorySlug }: Props) {
  const [product, setProduct] = useState(initialProduct);
  const [quantity, setQuantity] = useState(1);
  const [quote, setQuote] = useState<PriceQuote | null>(null);
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);

  const { getsBulkPricing } = useAuth();
  const addToCart = useCartStore((state) => state.add);
  const cartError = useCartStore((state) => state.error);

  // Re-fetch once we know who is asking, so an entitled customer sees their
  // own price ladder rather than the retail one rendered on the server.
  useEffect(() => {
    if (!getsBulkPricing) return;
    let cancelled = false;
    getProduct(product.slug)
      .then((fresh) => !cancelled && setProduct(fresh))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [getsBulkPricing, product.slug]);

  // What would this quantity cost? Asked, never calculated.
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      quoteProduct(product.slug, quantity)
        .then((result) => !cancelled && setQuote(result))
        .catch(() => !cancelled && setQuote(null));
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [product.slug, quantity]);

  const outOfStock = product.available_stock <= 0;

  async function handleAdd() {
    setBusy(true);
    const ok = await addToCart(product.slug, quantity);
    setBusy(false);
    if (ok) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    }
  }

  return (
    <div>
      <Link
        href={`/shop/${categorySlug}`}
        className="mb-8 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {product.category_name}
      </Link>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
          {product.primary_image ? (
            <Image
              src={product.primary_image}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              No photograph yet
            </div>
          )}
        </div>

        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-1 text-sm text-gray-500">SKU {product.sku}</p>

          <div className="mt-4">
            <StockBadge status={product.stock_status} available={product.available_stock} />
          </div>

          <p className="mt-4 text-gray-700">{product.description}</p>
          {product.long_description && (
            <p className="mt-3 whitespace-pre-line text-sm text-gray-600">
              {product.long_description}
            </p>
          )}

          <div className="mt-6">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(product.unit_price)}
            </span>
            <span className="ml-1 text-gray-500">{product.unit}</span>
          </div>

          {product.bulk_tiers.length > 0 && (
            <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-semibold text-green-900">Your bulk pricing</p>
              <ul className="mt-2 space-y-1 text-sm text-green-800">
                {product.bulk_tiers.map((tier) => (
                  <li key={tier.min_quantity}>
                    {tier.min_quantity}+ {product.unit} —{" "}
                    <strong>{formatPrice(tier.price_per_unit)}</strong>{" "}
                    <span className="text-green-700">
                      (save {formatPrice(tier.saving_per_unit)} each)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!outOfStock && (
            <div className="mt-6 flex flex-wrap items-end gap-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">Quantity</span>
                <input
                  type="number"
                  min={1}
                  max={product.available_stock}
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(
                      Math.max(
                        1,
                        Math.min(product.available_stock, Number(event.target.value) || 1),
                      ),
                    )
                  }
                  className="w-28 rounded-lg border border-gray-300 px-3 py-2 focus:border-green-600 focus:outline-none"
                />
              </label>

              <button
                type="button"
                onClick={handleAdd}
                disabled={busy}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-semibold text-white hover:bg-secondary disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                {added ? "Added to cart" : "Add to cart"}
              </button>
            </div>
          )}

          {quote && quantity > 1 && (
            <p className="mt-4 text-sm text-gray-700">
              {quantity} × {formatPrice(quote.unit_price)} ={" "}
              <strong>{formatPrice(quote.line_total)}</strong>
              {Number(quote.saving) > 0 && (
                <span className="ml-2 font-medium text-green-700">
                  You save {formatPrice(quote.saving)}
                </span>
              )}
            </p>
          )}

          {cartError && (
            <p role="alert" className="mt-4 text-sm text-amber-700">
              {cartError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
