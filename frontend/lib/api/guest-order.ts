/**
 * Remembering a guest's order across the Paystack round-trip.
 *
 * Order numbers are guessable, so the API will not show or confirm an order to
 * an anonymous caller unless they supply the email it was placed with. A guest
 * who pays leaves the site entirely and comes back on a fresh page load with no
 * session and no memory — without this, they land on a 403 for their own
 * receipt, immediately after paying.
 *
 * `sessionStorage` rather than `localStorage` on purpose: this is scoped to the
 * tab, dies when it closes, and leaves no address behind on a shared machine.
 * It holds an email and an order number — nothing that would let anyone else
 * act on the account.
 */

const KEY = "kuyash_guest_order";

export interface GuestOrderRef {
  order_number: string;
  email: string;
}

export function rememberGuestOrder(orderNumber: string, email: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      KEY,
      JSON.stringify({ order_number: orderNumber, email } satisfies GuestOrderRef),
    );
  } catch {
    // Private browsing can refuse writes. The guest can still find the order
    // from the confirmation email, so this is degraded, not broken.
  }
}

export function recallGuestOrder(): GuestOrderRef | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as GuestOrderRef).order_number === "string" &&
      typeof (parsed as GuestOrderRef).email === "string"
    ) {
      return parsed as GuestOrderRef;
    }
    return null;
  } catch {
    return null;
  }
}

/** The email we hold for this order number, if it is the one we remembered. */
export function guestEmailFor(orderNumber: string): string | undefined {
  const held = recallGuestOrder();
  return held?.order_number === orderNumber ? held.email : undefined;
}

export function forgetGuestOrder(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* nothing to clean up */
  }
}
