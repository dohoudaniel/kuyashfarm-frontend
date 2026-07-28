/**
 * Stock indicator.
 *
 * Takes the server's `stock_status` verbatim rather than deriving it from a
 * quantity. The threshold that separates "low" from "in stock" is configured
 * per product on the server; duplicating that rule here would let the two
 * disagree.
 */

import { cn } from "@/lib/utils";
import type { StockStatus } from "@/lib/api/types";

interface Props {
  status: StockStatus;
  available: number;
  showQuantity?: boolean;
  className?: string;
}

const PRESENTATION: Record<StockStatus, { label: string; classes: string }> = {
  IN_STOCK: { label: "In stock", classes: "bg-green-100 text-green-800" },
  LOW_STOCK: { label: "Low stock", classes: "bg-amber-100 text-amber-800" },
  OUT_OF_STOCK: { label: "Out of stock", classes: "bg-gray-200 text-gray-700" },
};

export function StockBadge({ status, available, showQuantity = true, className }: Props) {
  const { label, classes } = PRESENTATION[status] ?? PRESENTATION.OUT_OF_STOCK;
  const showCount = showQuantity && status === "LOW_STOCK" && available > 0;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        classes,
        className,
      )}
    >
      {showCount ? `Only ${available} left` : label}
    </span>
  );
}

export default StockBadge;
