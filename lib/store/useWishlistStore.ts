/**
 * Which products this customer has saved.
 *
 * **Why a store rather than local state per card.** The same product appears
 * in several places at once — the grid, the recently-viewed strip, the detail
 * page — and each would keep its own idea of whether it is saved. Tap the
 * heart in one and the others go stale, so the page contradicts itself. One
 * set, shared, means every heart agrees.
 *
 * **Optimistic, and rolled back on failure.** A heart that waits for a round
 * trip before filling in feels broken on a slow connection, which is most
 * connections here. It fills immediately and reverts if the server refuses —
 * the alternative, showing saved for something that was not, is worse than a
 * brief flicker because the customer only discovers it on the next visit.
 *
 * Slugs, not ids: the card knows its slug and the endpoints are keyed on it,
 * so nothing has to look up an id it does not have.
 */

import { create } from "zustand";

import { listWishlist, removeFromWishlist, saveToWishlist } from "@/lib/api/wishlist";

interface WishlistState {
  /** Slugs of saved products. A set, because membership is the only question. */
  saved: Set<string>;
  loaded: boolean;
  /** Slugs with a request in flight, so a card can disable its own control. */
  pending: Set<string>;

  load: () => Promise<void>;
  toggle: (slug: string) => Promise<void>;
  isSaved: (slug: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  saved: new Set(),
  loaded: false,
  pending: new Set(),

  /**
   * Fetch once per session.
   *
   * Guarded on `loaded` because several components mount at once and would
   * otherwise each fire the same request on first paint.
   */
  load: async () => {
    if (get().loaded) return;

    try {
      const items = await listWishlist();
      set({ saved: new Set(items.map((item) => item.product.slug)), loaded: true });
    } catch {
      // A signed-out visitor gets a 401 here, which is not an error worth
      // surfacing — it is the expected answer to "what have I saved" when
      // nobody is signed in. `loaded` stays false so signing in retries.
    }
  },

  toggle: async (slug) => {
    const { saved, pending } = get();
    if (pending.has(slug)) return;

    const wasSaved = saved.has(slug);

    // Optimistic. New Set each time — mutating the existing one would not
    // change its identity, and nothing subscribed would re-render.
    const next = new Set(saved);
    if (wasSaved) next.delete(slug);
    else next.add(slug);

    set({ saved: next, pending: new Set(pending).add(slug) });

    try {
      if (wasSaved) await removeFromWishlist(slug);
      else await saveToWishlist(slug);
    } catch {
      // Put it back. Showing "saved" for something the server refused is
      // worse than a flicker: the customer finds out on their next visit.
      const rolledBack = new Set(get().saved);
      if (wasSaved) rolledBack.add(slug);
      else rolledBack.delete(slug);
      set({ saved: rolledBack });
    } finally {
      const stillPending = new Set(get().pending);
      stillPending.delete(slug);
      set({ pending: stillPending });
    }
  },

  isSaved: (slug) => get().saved.has(slug),

  /** On sign-out. One person's saved items must not survive into the next session. */
  clear: () => set({ saved: new Set(), loaded: false, pending: new Set() }),
}));
