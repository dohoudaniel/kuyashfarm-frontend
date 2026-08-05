/**
 * Newsletter subscriptions.
 *
 * The footer has promised "No spam. Unsubscribe anytime." since the prototype
 * while subscribing nobody: the handler ran an 800ms `setTimeout` and showed a
 * success panel. There was no endpoint, no table and no list.
 *
 * Two things about this flow are worth knowing before calling it.
 *
 * **Subscribing does not subscribe you.** It sends a confirmation link, and
 * the address only joins the list once that link is opened. So the success
 * copy must say "check your email", never "you're subscribed" — the second is
 * simply untrue at that point, and a customer who believes it will wonder why
 * nothing arrives.
 *
 * **The response says nothing about the address.** `subscribe` resolves
 * identically for a brand-new address, one already on the list, and one that
 * previously unsubscribed. That is deliberate on the server: a box that
 * answered "you're already subscribed" would let anyone test an address list
 * against it and learn who shops here. Do not add UI that implies otherwise.
 */

import { apiClient } from "./client";

/**
 * Ask to join the list.
 *
 * `source` records which form was used, so the farm can tell what works
 * without running two experiments.
 */
export function subscribe(email: string, source?: string): Promise<null> {
  return apiClient.post<null>("/newsletter/subscribe/", source ? { email, source } : { email });
}

/** Complete a double opt-in. Idempotent — inbox links get clicked twice. */
export function confirmSubscription(token: string): Promise<null> {
  return apiClient.post<null>("/newsletter/confirm/", { token });
}

/**
 * Leave the list.
 *
 * Needs no session: the subscriber may have no account, and an unsubscribe
 * link that first demands a password is not an unsubscribe link. The address
 * is inside the signed token rather than a parameter, so this cannot be used
 * to unsubscribe somebody else.
 */
export function unsubscribe(token: string): Promise<null> {
  return apiClient.post<null>("/newsletter/unsubscribe/", { token });
}
