import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge to handle conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Currency configuration for Nigerian Naira
 */
export const CURRENCY = {
  code: 'NGN',
  symbol: '₦',
  locale: 'en-NG',
  name: 'Nigerian Naira',
} as const;

/**
 * Formats a price amount in Nigerian Naira
 * @param amount - The numeric amount to format
 * @returns Formatted price string with ₦ symbol
 * @example formatPrice(5000) => "₦5,000.00"
 */
export function formatPrice(amount: number | string): string {
  // The API sends money as exact decimal strings ("7500.00"). Number() here is
  // for display only — no arithmetic is ever done on the result, because a
  // float cannot represent ₦0.10 exactly.
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(value)) return "—";

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Currency formatting only.
 *
 * `calculatePrice()` and `getCurrentUser()` used to live here. Both are gone:
 *
 * - Pricing is decided by the server and arrives pre-computed for the calling
 *   user. Recomputing it here is what produced line items that did not sum to
 *   the subtotal for wholesale customers (audit §3.7).
 * - Identity came from `localStorage.user`, an object the browser owned, which
 *   is how typing an email address granted admin access (audit §3.1). Use
 *   `useAuth()` instead.
 */
