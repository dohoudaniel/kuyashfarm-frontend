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
│   ├── layout.tsx                    # Root layout: fonts, metadata, providers,
│   │                                 #   and SiteChrome (header + footer, once)
│   ├── icon.tsx                      # Browser-tab icon — the brand monogram,
│   │                                 #   replacing create-next-app's favicon
│   ├── opengraph-image.tsx           # Share card, generated at build time
│   ├── apple-icon.tsx                # Home-screen icon, generated
│   ├── manifest.ts                   # Web app manifest
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
│   ├── admin/                        # React back office — staff only.
│   │                                 #   AdminGuard is NOT the security
│   │                                 #   boundary; the API is.
│   ├── driver/                       # Delivery run, built for a phone
│   ├── accept-invitation/            # Staff invitation
│   ├── newsletter/confirm|unsubscribe/
│   ├── privacy/  terms/  cookies/    # Legal — awaiting review, says so
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
│   ├── layout/                       # Navbar, Footer, SiteChrome
│   ├── admin/                        # DataScreen and back-office pieces
│   ├── legal/                        # Shell for the three legal pages
│   ├── notifications/                # Bell — reads a header, never polls
│   ├── account/                      # AddressForm, TwoFactorSection
│   ├── auth/                         # GoogleSignInButton
│   ├── sections/                     # Landing-page sections
│   ├── shop/                         # ProductGrid and friends
│   ├── cart/                         # Cart button, drawer
│   ├── applications/                 # ApplicationForm (wholesale + distributor)
│   ├── modals/  chat/
│   └── providers/                    # ClientProviders — mounted once in layout
│
├── lib/
│   ├── api/                          # One module per domain. See below.
│   ├── context/AuthContext.tsx       # useAuth()
│   ├── store/useCartStore.ts         # zustand cache of the server cart
│   ├── data/                         # Static marketing copy only
│   ├── validation.ts                 # Shared field rules (phone, address, …)
│   ├── uuid.ts                       # randomUUID with a secure fallback
│   ├── constants.ts                  # SITE_CONFIG, SOCIAL_LINKS
│   ├── types.ts                      # Shared types (was types/index.ts)
│   └── utils.ts                      # cn(), formatPrice()
│
├── tests/                            # Vitest specs
├── e2e/                              # Playwright specs (real browser, real API)
├── scripts/                          # check-bundle-secrets.mjs
├── docs/                             # back office, cart, wholesale guides
├── next.config.ts                    # Images, and the security headers
├── .github/workflows/ci.yml          # lint, types, tests, build, bundle scan
└── public/images/                    # Owned photography (mostly still to come)
```

Three files carry decisions rather than code, and are worth reading before
changing anything near them:

| File | Decision it encodes |
|---|---|
| `next.config.ts` | Why the CSP allows inline script, and why `upgrade-insecure-requests` is conditional. Getting either wrong breaks the site silently. |
| `components/layout/SiteChrome.tsx` | Why the header lives in the layout and not in pages |
| `app/admin/AdminGuard.tsx` | Why it is explicitly *not* the security boundary |

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
Products, classes, programmes, prices and stock do not — those come from the
API. The prototype's habit of keeping business records in `lib/data` and
`localStorage` is exactly what the rewrite removed.

**This rule was already written down and got broken anyway,** which is why it
now carries its example. `ACADEMY_PROGRAMS` sat in `lib/data/academy.ts` and
the public academy page rendered *that* instead of `/academy/programs/`. A
`fetchProgramsPublic()` existed in `lib/api/academy.ts` and was called from
nowhere. So a staff member could create a programme in the back office, see it
saved, see it listed in the admin — and no customer would ever see it. Nothing
reported the gap; it simply did not show up.

The test that catches this class of bug is not a unit test. Ask of anything in
`lib/data/`: **can somebody change this in the back office?** If yes, it is a
record and it belongs behind the API, including its presentation — a programme
whose icon and outcomes stayed on the client would render as a broken card
rather than a new one.

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

`tests/` holds Vitest specs (`npm test`): the HTTP client, guest-ownership
storage, money formatting and the class-booking form.

`e2e/` holds Playwright specs (`npm run test:e2e`), which drive a real browser
against a real API with nothing mocked. That is deliberate — every expensive
bug here has been the two sides disagreeing about a contract, and a mock agrees
with whatever you tell it to.
