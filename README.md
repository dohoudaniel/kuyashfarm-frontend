# Kuyash Integrated Farm — Frontend

The customer-facing web app: shop, checkout, orders, wholesale and distributor
applications, and the Kuyash Academy. Next.js 16 (App Router), React 19,
TypeScript and Tailwind v4.

This repository is **frontend only**. The API is a separate Django project in
[`kuyashfarm-backend`](https://github.com/dohoudaniel/kuyashfarm-backend). An
Express + Mongoose backend used to live in this repo; it has been removed.

## Quick start

```bash
npm install
cp .env.example .env.local     # NEXT_PUBLIC_API_URL is required
npm run dev                    # http://localhost:3000
```

The app lives at the repo root. It used to sit in a `frontend/` subdirectory;
that was flattened on 2026-07-28.

**The API must be running first.** Beyond the obvious — nothing loads without
it — `/categories` and the academy class pages are prerendered at build time,
so `npm run build` fails with `ECONNREFUSED` if the backend is down. Start the
backend, then build.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with Turbopack |
| `npm run build` | Production build (needs the API up) |
| `npm start` | Serve the production build |
| `npm run lint` | eslint — currently 0 errors, 0 warnings |
| `npm test` | Vitest, 35 specs |
| `npm run test:watch` | Vitest in watch mode |
| `npm run check:bundle` | After a build: fails if anything secret-shaped reached the client JS |
| `npx tsc --noEmit` | Typecheck |

All of these run on every push — see `.github/workflows/ci.yml`.

## How it talks to the API

Everything goes through `lib/api/`. There is no second data plane — products,
carts, orders, applications and bookings all live on the server.

- **`client.ts`** is the only place that calls `fetch` for authenticated
  traffic. It holds the access token **in memory** (never `localStorage`, which
  any injected script can read), appends the trailing slash Django requires,
  unwraps the `{success, message, data, errors}` envelope, and refreshes
  **single-flight** on a 401 — refresh tokens rotate and blacklist on use, so
  two concurrent refreshes would invalidate each other and sign the user out at
  random.
- **`fetchPublic()`** is what Server Components use. It is deliberately separate:
  the `apiClient` singleton lives in module scope, and on the server module
  scope is shared across concurrent requests, so using it for user data would
  leak one visitor's session into another visitor's page.
- The refresh token is an **HttpOnly cookie**, so every request sends
  `credentials: 'include'`.

Things the client must not do, because the server already does them: compute a
price, add up a cart, decide whether stock is available, or decide what a user
is entitled to. `unit_price` in a response is already what *that* caller pays.

### Environment

`NEXT_PUBLIC_API_URL` is required for a production build — there is no fallback,
because a silent default to localhost means a misconfigured deploy boots happily
and fails in front of a customer. Development keeps the convenience default.

Nothing secret belongs in a `NEXT_PUBLIC_*` variable. Next.js inlines them into
the JavaScript every visitor downloads, regardless of which component reads the
value or who that component renders for. `npm run check:bundle` enforces this
after a build; it exists because `NEXT_PUBLIC_ADMIN_URL` once shipped the
back-office path to every anonymous visitor, even though the link itself was
rendered only for staff.

### Money

Amounts arrive as decimal strings (`"7500.00"`) because a float cannot
represent ₦0.10. Render with `formatPrice()`; never sum them as numbers.

### Guest storage

Only three keys are written, and each earns its place:

| Key | Store | Why |
|---|---|---|
| `kuyash-cart-storage` | local | zustand cache of the server cart, so the badge paints instantly |
| `kuyash_guest_order` | **session** | a guest returning from Paystack has no session; the API needs the email to prove the order is theirs |
| `kuyash_guest_registration` | **session** | the same, for an academy booking |

The two guest keys are `sessionStorage` on purpose — they die with the tab
rather than leaving an email address on a shared machine.

## Routes

```
/                                    landing
/categories                          category index
/shop/[category]                     product listing (SSR)
/shop/[category]/[product]           product detail
/checkout                            quote-driven; no card fields ever
/checkout/confirm                    where Paystack returns the customer
/orders  ·  /orders/[orderNumber]    history and detail (guests use ?email=)
/login  ·  /register                 
/forgot-password  ·  /reset-password verified against the API, not the client
/verify-email                        
/profile                             profile, addresses, applications, bookings
/become-wholesaler                   wholesale application
/become-distributor                  distributor application
/academy                             programmes and the live class schedule
/academy/classes/[slug]              class detail and seat booking
/academy/registrations/[reference]   booking receipt
/services/[slug]                     
```

Interactive pages split into `page.tsx` (Server Component, metadata) and a
`*Client.tsx`. Most routes carry sibling `loading.tsx` and `error.tsx` — keep
them if you move a route.

## Design tokens

Tailwind v4 via `@import "tailwindcss"`; there is no `tailwind.config`. Tokens
are CSS variables in `app/globals.css`, exposed through `@theme inline`.

| Token | Value |
|---|---|
| primary | `#2d5f3f` |
| secondary | `#4a7c59` |
| accent | `#6b9d7a` |
| earth | `#8b6f47` |
| cream | `#faf8f5` |

Headings use Playfair Display, body uses Inter. Combine classes with `cn()`
(clsx + tailwind-merge).

## Tests

`npm test` runs Vitest + React Testing Library over the parts where a
regression would be expensive and invisible:

- the HTTP client — trailing slashes, envelope unwrapping, error mapping, and
  single-flight refresh under concurrent 401s;
- guest-ownership storage, including that it refuses to hand back an email for
  a *different* order reference;
- money formatting;
- the class booking form — a full class renders no form at all.

There is no browser end-to-end suite yet, so a broken checkout would still
reach production. That gap is tracked in the PRD.

## Known gaps

- No Playwright suite. A broken checkout would still pass CI, because nothing
  drives a real browser through it.
- 103 product images are Unsplash hotlinks awaiting owned photography.
- There is no staff UI. Back-office work runs through Django Admin — see PRD
  §13 Q4, which is still an open decision.
