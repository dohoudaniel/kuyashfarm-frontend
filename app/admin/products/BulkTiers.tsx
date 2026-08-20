"use client";

/**
 * Bulk pricing for one product.
 *
 * The endpoints for this existed and nothing reached them, so break-points
 * could be seeded but never changed — a wholesaler's price was effectively
 * fixed at whatever the migration said. That matters more here than it would
 * in most shops: bulk pricing *is* the wholesale proposition, and the whole
 * application-and-approval flow exists to put customers onto it.
 *
 * **Nothing here computes a price.** `catalog.services.price_for` is the one
 * place that decides what a given caller pays, and it reads these rows. A
 * preview rendered in this panel would be a second implementation of the
 * pricing rules, and the first thing to drift.
 *
 * Two server constraints are surfaced rather than discovered:
 *
 * - **A tier starts at 2.** A "bulk" price for one unit is just a different
 *   base price, and the database has a check constraint refusing it.
 * - **One row per quantity per audience.** `(product, min_quantity,
 *   applies_to)` is unique, so a second tier at the same break-point is a 400.
 *   Saying so up front is kinder than letting somebody type it twice.
 */

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import { createTier, deleteTier, listTiers, type BulkTier } from "@/lib/api/admin";
import { formatPrice } from "@/lib/utils";

/** `PricingAudience`, copied from `catalog.models`. */
const AUDIENCES = [
  { value: "BOTH", label: "Wholesale and distributor" },
  { value: "WHOLESALE", label: "Wholesale only" },
  { value: "DISTRIBUTOR", label: "Distributor only" },
];

function audienceLabel(value: string): string {
  return AUDIENCES.find((entry) => entry.value === value)?.label ?? value;
}

export function BulkTiers({ slug, unit }: { slug: string; unit: string }) {
  const [tiers, setTiers] = useState<BulkTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [audience, setAudience] = useState("BOTH");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTiers(await listTiers(slug));
      setError("");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not load bulk pricing.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  async function add(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const min = Number(quantity);
    if (!Number.isInteger(min) || min < 2) {
      setError("A bulk tier starts at 2 or more. Below that, change the product's base price.");
      return;
    }
    if (!/^\d+(\.\d{1,2})?$/.test(price.trim())) {
      setError("Use a price like 3200.00.");
      return;
    }

    setBusy(true);
    try {
      await createTier(slug, {
        min_quantity: min,
        // A decimal string, not a Number — see the money note in lib/api/admin.
        price_per_unit: price.trim(),
        applies_to: audience,
      });
      setQuantity("");
      setPrice("");
      void load();
    } catch (caught) {
      // A duplicate break-point is the likely refusal, and the server says so
      // better than a guess here would.
      setError(caught instanceof ApiError ? caught.message : "Could not add that tier.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(tier: BulkTier) {
    setBusy(true);
    setError("");
    try {
      await deleteTier(slug, tier.id);
      void load();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not remove that tier.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8 border-t border-gray-200 pt-6">
      <h3 className="text-sm font-bold text-gray-900">Bulk pricing</h3>
      <p className="mt-1 text-xs text-gray-500">
        What approved wholesale and distributor accounts pay at quantity. Retail customers are never
        affected by these.
      </p>

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {loading ? (
        <Loader2 className="mt-4 h-5 w-5 animate-spin text-gray-400" />
      ) : tiers.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-gray-300 py-6 text-center text-xs text-gray-500">
          No bulk pricing. Wholesale accounts pay the base price for this product.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-200">
          {tiers.map((tier) => (
            <li key={tier.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <span className="text-sm text-gray-700">
                <strong className="font-semibold">{tier.min_quantity}+</strong> {unit || "units"} —{" "}
                {formatPrice(tier.price_per_unit)} each
                <span className="block text-xs text-gray-500">
                  {audienceLabel(tier.applies_to)}
                </span>
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() => void remove(tier)}
                aria-label={`Remove the ${tier.min_quantity}+ tier`}
                className="text-gray-400 hover:text-red-600 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={(event) => void add(event)} className="mt-4 flex flex-wrap items-end gap-2">
        <div>
          <label htmlFor="tier-quantity" className="mb-1 block text-xs font-medium text-gray-700">
            From quantity
          </label>
          <input
            id="tier-quantity"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            inputMode="numeric"
            placeholder="10"
            className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label htmlFor="tier-price" className="mb-1 block text-xs font-medium text-gray-700">
            Price each (₦)
          </label>
          <input
            id="tier-price"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            inputMode="decimal"
            placeholder="3200.00"
            className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label htmlFor="tier-audience" className="mb-1 block text-xs font-medium text-gray-700">
            Applies to
          </label>
          <select
            id="tier-audience"
            value={audience}
            onChange={(event) => setAudience(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            {AUDIENCES.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="flex items-center gap-1.5 rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5 disabled:opacity-60"
        >
          <Plus className="h-4 w-4" /> Add tier
        </button>
      </form>
    </section>
  );
}
