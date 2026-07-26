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

export const useCartStore = create<CartState>()((set, get) => ({
  cart: null,
  isLoading: false,
  isMutating: false,
  error: null,

  load: async () => {
    set({ isLoading: true, error: null });
    try {
      set({ cart: await cartApi.getCart(), isLoading: false });
    } catch (error) {
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
  reset: () => set({ cart: null, error: null }),

  itemCount: () => get().cart?.item_count ?? 0,
  subtotal: () => get().cart?.subtotal ?? "0.00",
}));

function messageFor(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
