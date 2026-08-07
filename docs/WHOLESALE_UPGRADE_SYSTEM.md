# Wholesale & distributor upgrades

How a retail shopper becomes a wholesale or distributor buyer, and where the
decision actually lives.

> **Rewritten 2026-07-28.** The previous version described a `localStorage`
> implementation in which the reviewer's approval was written to the
> *reviewer's own browser* — so it never reached the applicant, on any device.
> None of that code exists any more. The design principles it set out were
> sound and are preserved below; the implementation notes were not, and have
> been replaced with what actually runs.

## Design principles (unchanged, and still honoured)

- **One login system.** Everyone signs in the same way.
- **Retail by default.** Every account starts as `RETAIL`.
- **No redesign.** The same product pages serve everyone; there is no separate
  wholesale site.
- **Quantity-based.** Discounts come from how much you buy, not from a separate
  catalogue or separate inventory.
- **An upgrade, not a different account.** Closer to Airbnb's guest → host than
  to running two shops.

## The two axes, and why they are separate

| Field | Values | Governs |
|---|---|---|
| `role` | `CUSTOMER`, `STAFF`, `ADMIN` | back-office access |
| `account_type` | `RETAIL`, `WHOLESALE_PENDING`, `WHOLESALE_VERIFIED`, `DISTRIBUTOR_PENDING`, `DISTRIBUTOR_VERIFIED` | pricing |

Keeping these apart is deliberate. A wholesaler gets a discount and no admin
rights; a member of staff gets admin rights and no discount. Collapsing them
into one field is how a prototype ends up granting admin to anyone whose email
address looks official.

`is_staff` is derived from `role` when a user is saved. Never set it directly.

## The state machine

```
RETAIL
  │  submit application (must be signed in)
  ▼
WHOLESALE_PENDING / DISTRIBUTOR_PENDING          ← still pays retail
  │
  ├── staff approve  → WHOLESALE_VERIFIED / DISTRIBUTOR_VERIFIED
  └── staff reject   → RETAIL
```

**Pending users pay retail prices.** Applying is not a discount. Only
`*_VERIFIED` accounts see bulk tiers, and that is enforced in
`catalog.services.price_for`, not in the UI.

## Applying

`POST /api/v1/applications/` — **requires authentication**.

That requirement is the whole fix. An approval writes `account_type` to a user
row; an anonymous application has no row to write to, which is precisely why the
prototype's approvals went nowhere. The form
(`components/applications/ApplicationForm.tsx`, used by `/become-wholesaler`
and `/become-distributor`) shows a sign-in prompt rather than collecting data it
cannot deliver.

Three further differences from the form that was deleted:

- **No bank fields.** The old form collected account numbers into
  `localStorage`. Payout details now live behind `/auth/bank-details/`,
  encrypted at rest and write-only, collected *after* approval — when there is
  finally a reason to hold them.
- **The applicant does not choose their tier.** It is computed on approval from
  the states covered. The form shows a projection so they know roughly where
  they will land, clearly labelled as an estimate.
- **Documents upload separately**, after the application exists, so a rejected
  8 MB PDF never discards a completed form. They go to a private bucket and are
  never served publicly.

`cac_number` and `tax_id` are accepted but **write-only** — encrypted at rest
and absent from every response, so a stolen token cannot harvest them.

## Distributor tiers

Assigned by the server from the number of states covered:

| Tier | States |
|---|---|
| Tier 1 — State distributor | 1–2 |
| Tier 2 — Regional distributor | 3–5 |
| Tier 3 — National distributor | 6+ |

## Review

Staff endpoints under `/api/v1/staff/applications/`, all requiring `role` of
`STAFF` or `ADMIN`:

| Endpoint | Effect |
|---|---|
| `GET /` | the queue, with internal notes |
| `POST /{id}/claim/` | marks it `UNDER_REVIEW` |
| `POST /{id}/approve/` | sets the **applicant's** `account_type`, computes the tier |
| `POST /{id}/reject/` | returns the applicant to `RETAIL`; a reason is required |

Both decisions take a row lock and refuse to act on an application that has
already been decided, so two reviewers clicking at once cannot both win.

Reviewing happens in the **React back office** at `/admin/applications` (PRD
§13 Q4 answered). Django Admin is off in production, so that screen is the only
place an application can be decided.

## What the applicant can and cannot see

`GET /api/v1/applications/mine/` returns the application, its status, the
computed tier, and `decision_reason`.

`decision_reason` is populated **only on rejection**, where the text was written
for the applicant and has already been emailed to them. It is empty on approval.

It is also **rendered** to them, on their profile, with a link to start a new
application. That second half was missing for a while — the API sent the field
and the frontend never declared or displayed it, so a rejected applicant saw a
red chip reading "rejected" and nothing else. Sending a reason nobody shows is
indistinguishable, from the applicant's side, from not having one.

The reviewer's `review_notes` are **not** in that response. That field does
double duty on the model — rejection reason on one path, private commentary to
colleagues on the other — and a single serializer once served both audiences,
so an approved applicant could read internal notes about themselves. Staff use
`StaffApplicationSerializer`; applicants use `ApplicationSerializer`. They are
separate classes rather than one class with a conditional field, because a
serializer that decides what to reveal based on the request is one refactor away
from revealing it to everyone.

Pinned by `tests/test_applications.py::TestInternalNotesStayInternal`.

## Pricing, end to end

One function decides: `catalog.services.price_for(product, quantity, user)`.

It walks the product's bulk tiers ascending and takes the highest qualifying
`min_quantity`, but only for `*_VERIFIED` accounts. Everyone else pays
`base_price`.

The API never sends a price the client has to work out. `unit_price` on a
product is what **that caller** pays for one — so the same URL legitimately
returns different numbers to different people — and `POST /checkout/quote/`
returns the order total. The client renders; it does not calculate.

## Verifying it works

The behaviour that matters is that an approval reaches the applicant on a
different device **without them signing in again**, because `/auth/me/` reads
the database rather than a token claim. Pinned by
`tests/test_applications.py::TestApprovalReachesTheApplicant`.
