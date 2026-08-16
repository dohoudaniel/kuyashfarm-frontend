/**
 * The last few products this browser looked at.
 *
 * **Why this is client-side and stays that way.** It is the one piece of
 * personalisation that needs no account, no endpoint and no consent banner: it
 * never leaves the device, so there is nothing to disclose in the privacy
 * policy beyond the line already there about local storage. A server-side
 * version would mean a table, a write on every product view — the hottest read
 * in the shop — and a personal record of browsing habits to protect. For a
 * strip of four thumbnails that is a bad trade.
 *
 * **Why it earns its place.** A returning visitor currently lands on a
 * homepage identical to the one a stranger sees. Showing what they were
 * looking at last time is the cheapest way to make the second visit feel like
 * a continuation rather than a restart — and for groceries, the second visit
 * is the whole business.
 *
 * Deliberately small: names, slugs and image URLs only. No prices, because a
 * price is per-caller (`price_for` resolves retail, wholesale or distributor)
 * and a stale one cached in a browser is a price the shop did not quote.
 */

const KEY = "kuyash_recently_viewed";

/** Four. A strip, not a history — more becomes a second catalogue. */
const LIMIT = 4;

export interface ViewedProduct {
  slug: string;
  name: string;
  image: string | null;
  category: string;
  /** Epoch ms, so the list can be ordered without trusting insertion order. */
  at: number;
}

function read(): ViewedProduct[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Validated rather than trusted. This is browser storage: another tab, an
    // extension, or a past version of this code could have written anything,
    // and a malformed entry rendered into JSX is a crash on the homepage.
    return parsed.filter(
      (entry): entry is ViewedProduct =>
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as ViewedProduct).slug === "string" &&
        typeof (entry as ViewedProduct).name === "string",
    );
  } catch {
    // Private browsing, a full quota, or storage disabled entirely. A missing
    // strip of thumbnails is not worth an exception.
    return [];
  }
}

/** Record a view. Most recent first, de-duplicated by slug. */
export function remember(product: Omit<ViewedProduct, "at">): void {
  if (typeof window === "undefined") return;

  try {
    const next = [
      { ...product, at: Date.now() },
      ...read().filter((entry) => entry.slug !== product.slug),
    ].slice(0, LIMIT);

    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Quota exceeded is the realistic case. Silently doing nothing is right:
    // the alternative is an error about a feature the customer did not ask for.
  }
}

/**
 * What to show, newest first.
 *
 * `exclude` skips the product currently being viewed — a "recently viewed"
 * strip whose first item is the page you are on looks broken.
 */
export function recentlyViewed(exclude?: string): ViewedProduct[] {
  return read()
    .filter((entry) => entry.slug !== exclude)
    .sort((a, b) => b.at - a.at);
}

export function clearRecentlyViewed(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* nothing to do */
  }
}
