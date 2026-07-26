/**
 * Cart and checkout.
 *
 * The cart lives on the server. An anonymous visitor's basket is keyed by a
 * random session id sent in `X-Cart-Session` and merged into their account on
 * sign-in, so adding items and then logging in no longer loses the basket.
 *
 * Totals come from `/checkout/quote/` and are rendered verbatim. The prototype
 * computed line items at retail price and the subtotal at bulk price, so a
 * wholesale customer's basket visibly failed to add up (audit §3.7).
 */

import { apiClient } from "./client";
import type {
  Cart,
  CheckoutQuote,
  Order,
  PaymentMethod,
  ShippingAddressInput,
  StoreConfig,
} from "./types";

const SESSION_STORAGE_KEY = "kuyash_cart_session";

/**
 * Identifier for an anonymous basket.
 *
 * This is *not* business data — it is an opaque random handle, and the cart it
 * points at lives on the server. It is the only cart-related thing the browser
 * is allowed to keep.
 */
export function getCartSessionId(): string {
  if (typeof window === "undefined") return "";

  let id = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(SESSION_STORAGE_KEY, id);
  }
  return id;
}

export function clearCartSessionId(): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

function cartHeaders(): Record<string, string> {
  const id = getCartSessionId();
  return id ? { "X-Cart-Session": id } : {};
}

export function getCart(): Promise<Cart> {
  return apiClient.get<Cart>("/cart/", { headers: cartHeaders() });
}

export function addToCart(productSlug: string, quantity = 1): Promise<Cart> {
  return apiClient.post<Cart>(
    "/cart/items/",
    { product_slug: productSlug, quantity },
    { headers: cartHeaders() },
  );
}

export function updateCartItem(itemId: string, quantity: number): Promise<Cart> {
  return apiClient.patch<Cart>(`/cart/items/${itemId}/`, { quantity }, { headers: cartHeaders() });
}

export function removeCartItem(itemId: string): Promise<Cart> {
  return apiClient.delete<Cart>(`/cart/items/${itemId}/`, { headers: cartHeaders() });
}

export function clearCart(): Promise<null> {
  return apiClient.delete<null>("/cart/", { headers: cartHeaders() });
}

/** Fold the anonymous basket into the user's account after signing in. */
export async function mergeCart(): Promise<Cart | null> {
  const sessionKey = getCartSessionId();
  if (!sessionKey) return null;

  const cart = await apiClient.post<Cart>("/cart/merge/", { session_key: sessionKey });
  clearCartSessionId();
  return cart;
}

// ── Checkout ────────────────────────────────────────────────────────────────
export function getQuote(state = ""): Promise<CheckoutQuote> {
  return apiClient.post<CheckoutQuote>("/checkout/quote/", { state }, { headers: cartHeaders() });
}

export interface PlaceOrderInput {
  email?: string;
  shipping_address: ShippingAddressInput;
  billing_address?: ShippingAddressInput;
  payment_method: PaymentMethod;
  customer_notes?: string;
}

/**
 * Place an order.
 *
 * `idempotencyKey` must be generated once per checkout attempt and reused on
 * retry. A double-clicked button or a dropped connection then returns the
 * original order instead of creating a second one and reserving stock twice.
 */
export function placeOrder(input: PlaceOrderInput, idempotencyKey: string): Promise<Order> {
  return apiClient.post<Order>("/checkout/orders/", { ...input }, {
    headers: { ...cartHeaders(), "Idempotency-Key": idempotencyKey },
  });
}

export function getStoreConfig(): Promise<StoreConfig> {
  return apiClient.get<StoreConfig>("/config/");
}
