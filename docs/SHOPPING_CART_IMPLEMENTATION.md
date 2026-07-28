# Cart and checkout

How the basket works, and why almost none of it happens in the browser.

> **Rewritten 2026-07-28.** The previous version described a cart held entirely
> in `localStorage`, with prices and totals computed client-side. That is gone.
> The cart now lives on the server; the browser keeps a cache so the badge
> paints instantly, and nothing else.

## Why the server holds the cart

A cart that lives in the browser can be edited by whoever owns the browser.
Prices, quantities and totals computed client-side are suggestions, not facts —
and the only thing standing between a shopper and a ₦1 order is code they
control. It also loses the basket when someone switches device.

So: quantities, availability, prices and totals are all decided server-side, and
the client renders what it is told.

## The pieces

| File | Role |
|---|---|
| `lib/store/useCartStore.ts` | zustand store; a **cache** of the server cart |
| `lib/api/cart.ts` | every cart and checkout call |
| `app/checkout/CheckoutClient.tsx` | quote-driven checkout |
| `app/checkout/confirm/` | where Paystack returns the customer |

`kuyash-cart-storage` in `localStorage` exists only so the item-count badge does
not flicker on first paint. It is refreshed from the API and is never the source
of truth. If it disagrees with the server, the server wins.

## Endpoints

| Method | Path | Notes |
|---|---|---|
| GET | `/cart/` | current cart |
| POST | `/cart/items/` | add — quantity clamped to real availability |
| PATCH | `/cart/items/{id}/` | change quantity |
| DELETE | `/cart/items/{id}/` | remove |
| POST | `/cart/merge/` | fold a guest cart into an account on sign-in |
| POST | `/checkout/quote/` | totals: subtotal, shipping, tax, discount, grand total |
| POST | `/checkout/` | place the order; accepts `Idempotency-Key` |

An anonymous cart is keyed by a session id; signing in merges it into the
account rather than discarding it.

## Stock

Availability is checked when an item is added and **again** at checkout. Stock
moves through an append-only `StockMovement` ledger with reserve-then-commit, so
two people racing for the last unit cannot both get it — the loser is told
before they pay, not after.

The public product endpoint reports `available_stock` capped at the low-stock
threshold. That is enough to clamp a quantity field sensibly, and checkout does
not rely on it, so the cap can never cause an oversell.

## Money

Amounts are decimal strings (`"7500.00"`). A float cannot represent ₦0.10, so
totals are never summed in JavaScript. Render with `formatPrice()`.

The client never adds up a cart. `POST /checkout/quote/` returns every line of
the total, including shipping and tax, computed from the delivery address by
server-side rules. A client that computed its own subtotal would eventually
disagree with the invoice.

## Checkout and payment

The checkout form collects an address and a payment method. **It has no card
fields and never will** — `POST /payments/paystack/{order}/initialize/` returns
a Paystack URL and the browser leaves. Card details never touch this system.

`POST /checkout/` accepts an `Idempotency-Key` header. A retry with the same key
returns the original order rather than placing a second one, which matters on a
flaky mobile connection where the customer taps twice.

### Coming back from Paystack

Paystack redirects to `/checkout/confirm?reference=…` **and** calls a webhook,
independently. The browser usually wins that race, so a first look can honestly
show "not paid yet".

The page therefore polls the verify endpoint a few times before saying anything
discouraging, and falls back to "almost there — your bank is still confirming"
rather than "failed". Telling someone their payment failed when it succeeded is
the worst outcome available on that screen.

**The webhook is the authority.** It is HMAC-SHA512 verified, and it is what
actually marks an order paid and deducts stock — exactly once, however many
times Paystack retries. The redirect is a convenience for the customer's screen.

### Guests

A guest returning from Paystack has no session, and the API will not show an
order to an anonymous caller without the email it was placed with — order
numbers are guessable. The email is stashed in `sessionStorage`
(`kuyash_guest_order`) at checkout and used on the way back. `sessionStorage`,
not `localStorage`: it dies with the tab rather than leaving an address behind
on a shared machine.

Without this, a customer lands on a 403 for their own receipt, seconds after
being charged.

## Tests

`tests/guest-access.test.ts` covers the ownership rules, including that an email
is **not** returned for a different order reference. `tests/api-client.test.ts`
covers envelope unwrapping and single-flight refresh. There is no browser
end-to-end test of checkout yet — that gap is tracked in the PRD.
