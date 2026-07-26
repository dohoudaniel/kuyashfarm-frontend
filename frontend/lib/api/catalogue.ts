/**
 * Catalogue.
 *
 * Prices arrive already computed for the calling user. A retail shopper and a
 * verified wholesaler requesting the same URL get different `unit_price`
 * values, and the client renders whichever it is given. It never applies a
 * discount itself — that decision belongs to the server.
 */

import { apiClient, fetchPublic } from "./client";
import type { Category, Paginated, PriceQuote, Product, ProductDetail } from "./types";

export interface ProductFilters {
  category?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  ordering?: "name" | "-name" | "base_price" | "-base_price" | "created_at" | "-created_at";
  page?: number;
  page_size?: number;
}

function toQuery(filters: ProductFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "" && value !== null) {
      params.set(key, String(value));
    }
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

// ── Client-side (prices reflect the signed-in user) ─────────────────────────
export function listProducts(filters: ProductFilters = {}): Promise<Paginated<Product>> {
  return apiClient.get<Paginated<Product>>(`/products/${toQuery(filters)}`);
}

export function getProduct(slug: string): Promise<ProductDetail> {
  return apiClient.get<ProductDetail>(`/products/${slug}/`);
}

export function listCategories(): Promise<Category[]> {
  return apiClient.get<Category[]>("/categories/");
}

/** "What would N of these cost me?" — the authoritative answer. */
export function quoteProduct(slug: string, quantity: number): Promise<PriceQuote> {
  return apiClient.post<PriceQuote>(`/products/${slug}/quote/`, { quantity });
}

export function subscribeToRestock(slug: string, email?: string): Promise<null> {
  return apiClient.post<null>(`/products/${slug}/restock-subscribe/`, email ? { email } : {});
}

// ── Server Components (public data, retail prices, cached) ──────────────────
//
// These render the catalogue into the initial HTML, which is what makes the
// shop indexable. The prototype read localStorage during render, so the
// server threw and shipped a page with zero products in it (audit §3.4).

export function fetchProductsPublic(filters: ProductFilters = {}): Promise<Paginated<Product>> {
  return fetchPublic<Paginated<Product>>(`/products/${toQuery(filters)}`, {
    revalidate: 60,
    tags: ["products"],
  });
}

export function fetchProductPublic(slug: string): Promise<ProductDetail> {
  return fetchPublic<ProductDetail>(`/products/${slug}/`, {
    revalidate: 60,
    tags: ["products", `product:${slug}`],
  });
}

export function fetchCategoriesPublic(): Promise<Category[]> {
  return fetchPublic<Category[]>("/categories/", { revalidate: 300, tags: ["categories"] });
}

export function fetchCategoryPublic(slug: string): Promise<Category> {
  return fetchPublic<Category>(`/categories/${slug}/`, { revalidate: 300, tags: ["categories"] });
}
