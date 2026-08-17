/**
 * Saved products.
 *
 * Three calls, matching the three endpoints. The list is unpaginated — a
 * wishlist is a handful of rows and the UI renders it as one strip, and
 * paginating it would mean the "saved" state of a product card could not be
 * resolved without walking pages.
 *
 * Note the return shape of `listWishlist`: a bare array, not `{results}`.
 * That is deliberate on the server (`pagination_class = None`) and is one of
 * the endpoints listed in CLAUDE.md as unpaginated — typing it as paginated
 * would crash on `.map`.
 */

import { apiClient } from "@/lib/api/client";
import type { Product } from "@/lib/api/types";

export interface WishlistItem {
  id: string;
  /**
   * Priced for *this* caller, because the server nests the same
   * `ProductListSerializer` the catalogue uses. Never re-derive a price here.
   */
  product: Product;
  created_at: string;
}

export function listWishlist(): Promise<WishlistItem[]> {
  return apiClient.get<WishlistItem[]>("/wishlist/");
}

/**
 * Save a product. Idempotent — saving something already saved returns the
 * existing entry rather than erroring, so a double tap is harmless.
 */
export function saveToWishlist(slug: string): Promise<WishlistItem> {
  return apiClient.post<WishlistItem>(`/wishlist/${slug}/`);
}

/** Remove a product. Removing something not saved also succeeds. */
export function removeFromWishlist(slug: string): Promise<null> {
  return apiClient.delete<null>(`/wishlist/${slug}/remove/`);
}
