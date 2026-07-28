# Project structure

Where things live in the Next.js app, and the rules that decide where new code
should go.

> **Rewritten 2026-07-28.** The previous version was branded "Betàni", described
> a `types/index.ts` that has since moved to `lib/types.ts`, and listed a
> component tree from before the API integration.

## Layout

```
kuyashfarm-frontend/                  # the app lives at the repo root
├── app/                              # App Router. One directory per route.
│   ├── layout.tsx                    # Root layout: fonts, metadata, providers
│   ├── page.tsx                      # Landing page
│   ├── globals.css                   # Design tokens via @theme inline
│   ├── error.tsx  loading.tsx  not-found.tsx
│   │
│   ├── categories/                   # Category index
│   ├── shop/[category]/              # Product listing (Server Component)
│   │   └── [product]/                # Product detail
│   ├── checkout/                     # Quote-driven checkout
│   │   └── confirm/                  # Where Paystack returns the customer
│   ├── orders/[orderNumber]/         # History and detail
│   ├── profile/                      # Profile, addresses, applications, bookings
│   │
│   ├── login/  register/             # Auth
│   ├── forgot-password/  reset-password/  verify-email/
│   │
│   ├── become-wholesaler/            # Wholesale application
│   ├── become-distributor/           # Distributor application
│   │
│   ├── academy/
│   │   ├── classes/[slug]/           # Class detail and seat booking
│   │   ├── registrations/[reference]/# Booking receipt
│   │   ├── programs/
│   │   └── sections/                 # Landing-page sections for the academy
│   └── services/[slug]/
│
├── components/
│   ├── ui/                           # Button, Card, Container, Section, FormField
│   ├── layout/                       # Navbar, Footer
│   ├── sections/                     # Landing-page sections
│   ├── shop/                         # ProductGrid and friends
│   ├── cart/                         # Cart button, drawer
│   ├── applications/                 # ApplicationForm (wholesale + distributor)
│   ├── banners/  modals/  chat/
│   └── providers/                    # ClientProviders — mounted once in layout
│
├── lib/
│   ├── api/                          # One module per domain. See below.
│   ├── context/AuthContext.tsx       # useAuth()
│   ├── store/useCartStore.ts         # zustand cache of the server cart
│   ├── data/                         # Static marketing copy only
│   ├── types.ts                      # Shared types (was types/index.ts)
│   └── utils.ts                      # cn(), formatPrice()
│
├── tests/                            # Vitest specs
├── scripts/                          # check-bundle-secrets.mjs
├── docs/                             # back office, cart, wholesale guides
├── .github/workflows/ci.yml          # lint, types, tests, build, bundle scan
└── public/
```

## Rules

### Server Components by default

A route is a Server Component unless it needs state, effects or event handlers.
When it does, split it: `page.tsx` stays on the server and owns `metadata` and
data fetching; a sibling `*Client.tsx` carries `"use client"` and the
interactivity. `app/academy/classes/[slug]/` is the reference example.

### Keep the route boundaries

Most routes carry sibling `loading.tsx` and `error.tsx`. They are easy to lose
when moving a route around, and losing them turns a slow request into a blank
screen and a failed one into a crash.

### All network access goes through `lib/api/`

| Module | Covers |
|---|---|
| `client.ts` | `apiClient` singleton, `fetchPublic()`, `ApiError`, `NetworkError` |
| `auth.ts` | sign-in, registration, verification, reset, profile, addresses |
| `catalogue.ts` | categories and products |
| `cart.ts` | cart, quote, checkout, store config |
| `orders.ts` | orders, payments |
| `applications.ts` | wholesale and distributor applications |
| `academy.ts` | programmes, classes, bookings |
| `guest-order.ts`, `guest-registration.ts` | tab-scoped guest ownership |
| `types.ts` | shared response types |

Two rules that are not stylistic:

- **Never import `apiClient` into a Server Component.** It holds the access
  token in module scope, and on the server module scope is shared between
  concurrent requests — one visitor's session would leak into another
  visitor's page. Use `fetchPublic()`, which sends no credentials.
- **Never call `fetch` directly from a component.** The client is where trailing
  slashes, the response envelope and single-flight token refresh are handled.
  Bypassing it reintroduces bugs that have already been fixed once.

### `lib/data/` is for copy, not for records

Marketing text, FAQ entries, testimonials and service descriptions belong there.
Products, classes, prices and stock do not — those come from the API. The
prototype's habit of keeping business records in `lib/data` and `localStorage`
is exactly what the rewrite removed.

### Styling

Tailwind v4 through `@import "tailwindcss"`; there is no `tailwind.config`.
Design tokens are CSS variables in `app/globals.css` exposed through
`@theme inline`:

| Token | Value |
|---|---|
| primary | `#2d5f3f` |
| secondary | `#4a7c59` |
| accent | `#6b9d7a` |
| earth | `#8b6f47` |
| cream | `#faf8f5` |

Compose class names with `cn()` so conflicting utilities merge predictably.
Fonts are Playfair Display (headings, `--font-playfair`) and Inter (body,
`--font-inter`), wired in the root layout.

### Money

Always `formatPrice()`. Amounts arrive as decimal strings and must never be
summed as floats.

## Tests

`tests/` holds Vitest specs, run with `npm test`. They cover the HTTP client,
guest-ownership storage, money formatting and the class-booking form. There is
no browser end-to-end suite.
