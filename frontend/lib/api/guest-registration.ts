/**
 * Remembering a guest's academy booking within the tab.
 *
 * Same reasoning as `guest-order.ts`: references are guessable, so the API
 * will not hand a booking to an anonymous caller unless they also supply the
 * email it was made with. Without this a guest who books a seat is bounced off
 * their own confirmation page.
 */

const KEY = "kuyash_guest_registration";

interface Held {
  reference: string;
  email: string;
}

export function rememberRegistration(reference: string, email: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify({ reference, email } satisfies Held));
  } catch {
    // Private browsing can refuse writes; the confirmation email still has the
    // reference, so this degrades rather than breaks.
  }
}

/** The email we hold for this reference, if it is the one we remembered. */
export function registrationEmailFor(reference: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return undefined;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      (parsed as Held).reference === reference &&
      typeof (parsed as Held).email === "string"
    ) {
      return (parsed as Held).email;
    }
    return undefined;
  } catch {
    return undefined;
  }
}
