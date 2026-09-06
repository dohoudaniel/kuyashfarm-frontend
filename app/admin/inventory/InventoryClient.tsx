"use client";

/**
 * Stock control.
 *
 * Two deliberately different actions, and conflating them is how a ledger
 * stops explaining anything:
 *
 *  * **Restock** adds a delivery — a relative change, "+40 arrived".
 *  * **Adjust** sets an absolute figure after a stocktake — "there are 37,
 *    whatever we thought".
 *
 * Both write a `StockMovement`; `quantity_on_hand` is never written directly.
 * The distinction is what lets somebody later ask "why is this number what it
 * is" and get an answer.
 *
 * `quantity_available` is on-hand minus reserved. It can be lower than on-hand
 * without anything being wrong — those units are in baskets mid-checkout.
 */

import { useCallback, useEffect, useState } from "react";
import { PackagePlus, RefreshCw, SlidersHorizontal } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import { adjustStock, listInventory, restock, type InventoryRow } from "@/lib/api/admin";
import { DataScreen, ScrollableTable, StatusPill } from "@/components/admin/DataScreen";

export default function InventoryClient() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [search, setSearch] = useState("");
  const [lowOnly, setLowOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await listInventory({
        search: search.trim() || undefined,
        low_stock: lowOnly || undefined,
      });
      setRows(page.results);
      setError("");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not load inventory.");
    } finally {
      setLoading(false);
    }
  }, [search, lowOnly]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 300);
    return () => clearTimeout(timer);
  }, [load]);

  async function onRestock(row: InventoryRow) {
    const answer = prompt(`How many ${row.product_name} arrived?`);
    if (!answer) return;

    const quantity = Number(answer);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError("Enter a whole number greater than zero.");
      return;
    }

    try {
      await restock(row.product_slug, quantity, "Restocked from the back office");
      setMessage(`Added ${quantity} to ${row.product_name}.`);
      void load();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not restock that.");
    }
  }

  async function onAdjust(row: InventoryRow) {
    const answer = prompt(
      `Counted how many ${row.product_name}? This sets the figure absolutely, it does not add.`,
      String(row.quantity_on_hand),
    );
    if (answer === null) return;

    const quantity = Number(answer);
    if (!Number.isInteger(quantity) || quantity < 0) {
      setError("Enter a whole number of zero or more.");
      return;
    }

    try {
      await adjustStock(row.product_slug, quantity, "Stocktake correction");
      setMessage(`${row.product_name} set to ${quantity}.`);
      void load();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not adjust that.");
    }
  }

  return (
    <DataScreen
      title="Inventory"
      description="Every change writes to the stock ledger, so any figure can be explained afterwards."
      loading={loading}
      error={error}
      message={message}
      empty={rows.length === 0}
      emptyMessage="No products match that."
      toolbar={
        <>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Product or SKU"
            aria-label="Search inventory"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-green-500"
          />
          <label className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={lowOnly}
              onChange={(event) => setLowOnly(event.target.checked)}
            />
            Low stock only
          </label>
          <button
            type="button"
            onClick={() => void load()}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </>
      }
    >
      <ScrollableTable>
        <thead className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">On hand</th>
            <th className="px-4 py-3">Reserved</th>
            <th className="px-4 py-3">Available</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr key={row.product} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="font-medium">{row.product_name}</div>
                <div className="text-xs text-gray-500">{row.sku}</div>
              </td>
              <td className="px-4 py-3">{row.quantity_on_hand}</td>
              {/* Not a discrepancy: these units are in baskets mid-checkout. */}
              <td className="px-4 py-3 text-gray-500">{row.quantity_reserved}</td>
              <td className="px-4 py-3 font-medium">{row.quantity_available}</td>
              <td className="px-4 py-3">
                <StatusPill status={row.stock_status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => void onRestock(row)}
                    className="flex items-center gap-1 rounded-lg border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
                  >
                    <PackagePlus className="h-3.5 w-3.5" /> Restock
                  </button>
                  <button
                    type="button"
                    onClick={() => void onAdjust(row)}
                    className="flex items-center gap-1 rounded-lg border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" /> Adjust
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </ScrollableTable>
    </DataScreen>
  );
}
