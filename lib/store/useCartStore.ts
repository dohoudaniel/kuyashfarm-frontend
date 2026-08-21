"use client";

/**
 * Cart state.
 *
 * The cart now lives on the server; this store is a cache of it, not the cart
 * itself. Every mutation round-trips and the response replaces local state, so
 * stock limits, bulk pricing and availability are decided in one place.
 *
 * The previous store persisted the whole basket to `localStorage` and priced it
 * client-side via `calculatePrice()`. That is why two customers could each buy
 * the last crate, and why a basket could show a total the server would never
 * have charged.
 */

import { create } from "zustand";

import { ApiError } from "@/lib/api/client";
import * as cartApi from "@/lib/api/cart";
import type { Cart } from "@/lib/api/types";

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;

  load: () => Promise<void>;
  add: (productSlug: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  remove: (itemId: string) => Promise<boolean>;
  clear: () => Promise<void>;
  reset: () => void;

  itemCount: () => number;
  subtotal: () => string;
}

/**
 * Which `load()` is the current one.
 *
 * **A basket is not a place for last-response-wins.** `load()` is called from
 * an effect keyed on `isAuthenticated`, so signing in fires a second load while
 * the first is still in flight — and `afterSignIn` is concurrently running
 * `mergeCart()`, which changes the very thing both are fetching. Whichever
 * response happened to arrive last used to win, so a customer who had just
 * signed in could be left looking at their *pre-merge* basket: the guest items
 * gone from the screen, still present on the server, reappearing on the next
 * navigation.
 *
 * A counter rather than an `isLoading` early-return, deliberately. Bailing out
 * while a request is in flight would drop the post-sign-in reload — the one
 * that actually matters — and leave the stale basket on screen permanently.
 * Every call still runs; only the newest is allowed to write.
 *
 * Module scope is correct here: the store is a singleton, and this is only
 * ever read in the browser.
 */
let loadSequence = 0;

export const useCartStore = create<CartState>()((set, get) => ({
  cart: null,
  isLoading: false,
  isMutating: false,
  error: null,

  load: async () => {
    const sequence = ++loadSequence;
    set({ isLoading: true, error: null });
    try {
      const cart = await cartApi.getCart();
      // A newer load started while this one was in flight; it owns the result.
      if (sequence !== loadSequence) return;
      set({ cart, isLoading: false });
    } catch (error) {
      if (sequence !== loadSequence) return;
      set({ isLoading: false, error: messageFor(error) });
    }
  },

  add: async (productSlug, quantity = 1) => {
    set({ isMutating: true, error: null });
    try {
      // The server clamps to available stock and re-prices for this user, so
      // the response is authoritative — we replace rather than merge.
      set({ cart: await cartApi.addToCart(productSlug, quantity), isMutating: false });
      return true;
    } catch (error) {
      set({ isMutating: false, error: messageFor(error) });
      return false;
    }
  },

  updateQuantity: async (itemId, quantity) => {
    set({ isMutating: true, error: null });
    try {
      set({ cart: await cartApi.updateCartItem(itemId, quantity), isMutating: false });
      return true;
    } catch (error) {
      set({ isMutating: false, error: messageFor(error) });
      return false;
    }
  },

  remove: async (itemId) => {
    set({ isMutating: true, error: null });
    try {
      set({ cart: await cartApi.removeCartItem(itemId), isMutating: false });
      return true;
    } catch (error) {
      set({ isMutating: false, error: messageFor(error) });
      return false;
    }
  },

  clear: async () => {
    set({ isMutating: true, error: null });
    try {
      await cartApi.clearCart();
      set({ cart: null, isMutating: false });
      await get().load();
    } catch (error) {
      set({ isMutating: false, error: messageFor(error) });
    }
  },

  /** Drop cached state without a round-trip — used on sign-out. */
  /**
   * Drop the basket, on sign-out.
   *
   * Bumping the sequence is the point: without it, a `load()` already in flight
   * resolves *after* the clear and writes the signed-out user's basket back
   * onto the screen of whoever is now sitting at the browser. Invalidating
   * here means any request that started before the reset can no longer write.
   */
  reset: () => {
    loadSequence += 1;
    set({ cart: null, error: null });
  },

  itemCount: () => get().cart?.item_count ?? 0,
  subtotal: () => get().cart?.subtotal ?? "0.00",
}));

function messageFor(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
