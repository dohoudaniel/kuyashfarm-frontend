# Back office

Where staff actually do the work.

> **Rewritten 2026-07-28**, then again when the back office was built. The
> original version documented a frontend-only admin panel that ran on
> `localStorage` and opened with a `/wholesale-demo` page offering a **"Create
> Test Admin User"** button that granted admin rights to anyone who visited it.
> That page and that panel were deleted, not ported.

## The back office is at `/admin` on the frontend

**PRD §13 Q4 is answered: a React back office.** Ten screens live under
`app/admin/`:

| Screen | What it does |
|---|---|
| Overview | Revenue, orders, alerts — every figure computed from Postgres |
| Orders | Fulfilment and status transitions |
| Products | Create, edit, and upload photographs |
| Inventory | Restock, adjust, and check the ledger |
| Delivery | Dispatch to drivers, track stops |
| Applications | Review, approve, reject wholesale and distributor requests |
| Academy | Schedule classes, manage instructors and programmes |
| Subscribers | Newsletter list |
| Staff | Invite colleagues, manage roles |
| Settings | Store configuration, shipping and tax rules |

**Django Admin is off in production.** `ENABLE_DJANGO_ADMIN` defaults to
`DEBUG`, so these screens are not a convenience layer over it — they are the
only way the business is operable. Anything the back office cannot do, nobody
can do.

### `AdminGuard` is not the security boundary

It exists so a customer who wanders to `/admin` sees an explanation instead of a
page full of 403s, and so the admin chrome does not flash before a redirect.
Anyone can edit what a client component decides.

What actually protects the data is that **every `/staff/*` endpoint enforces
`IsStaff` or `IsAdmin` server-side**. Treating the guard as the boundary is how
back offices get walked into, and the component says so in its own docstring.

## Getting access

**Staff are invited, not promoted by hand** (PRD §13 Q12). An admin sends an
invitation from the Staff screen; the recipient sets their own password through
`/accept-invitation`. That way nobody ever knows a colleague's password, and
the invitation expires.

`createsuperuser` remains the bootstrap for the very first account, before
there is anybody to send an invitation:

```bash
uv run python manage.py createsuperuser
```

Promoting an existing row still works and is the fallback if email is down:

```python
user.role = Role.ADMIN     # or Role.STAFF
user.save()                # is_staff is derived from role on save
```

Two things this deliberately makes impossible:

- **No email address grants privilege.** The prototype gave admin rights to
  anyone registering as `admin@kuyashfarms.com`. Nothing in the current system
  reads an address to decide permissions.
- **No client-side flag grants anything.** `role` is read from the database on
  every request. Setting a value in `localStorage` — or in a JWT claim — changes
  nothing, because nothing trusts it.

`account_type` is a separate axis and grants no admin access at all: a verified
distributor is a customer with a discount.

## Staff API

What the screens call. All require `role` of `STAFF` or `ADMIN`, enforced
server-side by `core.permissions.IsStaff`.

| Area | Endpoints |
|---|---|
| Applications | `GET /staff/applications/`, `POST /{id}/claim/`, `/approve/`, `/reject/` |
| Orders | `GET /staff/orders/`, status transitions |
| Inventory | `GET /staff/inventory/`, `/{slug}/restock/`, `/adjust/`, `/ledger-check/` |
| Ledger | `GET /staff/ledger/` — append-only stock movements |
| Academy | `GET /staff/academy/registrations/`, `/{ref}/attended/`, `/{slug}/seat-check/` |
| Analytics | `GET /staff/analytics/` and five sub-reports |
| Catalogue CRUD | `POST /staff/products/`, images, categories, bulk tiers |
| Academy CRUD | `/staff/academy/classes/`, `/programs/`, `/instructors/` |
| Delivery | `GET /staff/delivery/runs/`, assign, mark delivered or failed |
| Staff | `POST /staff/invitations/` — invite by email, never by promoting a row |
| Newsletter | `GET /staff/newsletter/subscribers/` |

They are documented at `/api/v1/docs/` under the **staff** tag — note the
`/v1/`, and note that the docs are disabled in production.

## Reviewing an application

`POST /staff/applications/{id}/approve/` sets `account_type` on the
**applicant's** row. That sentence is the entire point of the rewrite: the
prototype wrote the upgrade to whoever was signed in, so approvals landed on
the reviewer's own account and the applicant never saw anything.

Approval and rejection take a row lock and refuse to act on an application that
has already been decided, so two reviewers clicking at once cannot both win.

Rejection requires a reason, which is emailed to the applicant **and rendered
to them** on their profile, with a link to start a new application. That second
half was missing for a while: the API sent `decision_reason` and the frontend
never displayed it, so a rejected applicant saw a red chip reading "rejected"
and nothing else — no explanation, no way forward, at the single worst
retention moment in the product.

### Notes written on approval are private

`review_notes` is internal. Applicants see `decision_reason`, which is populated
only on rejection. Write candidly in the notes field on approval — it is served
only to staff, through a separate serializer, and there is a test that fails if
that ever changes.

## Analytics come from the database

Every figure — revenue, average order value, top products, the six-month trend —
is computed from orders in Postgres. The prototype's dashboard read
`kuyash-orders` from *the admin's own browser*, so it reported whatever test
purchases that particular person had made in that particular browser.

Three definitions do most of the work, and getting them wrong is how a dashboard
quietly lies:

- **Revenue** counts only paid orders, minus refunds.
- **Order counts** exclude cancelled orders.
- **Items sold** counts lines on paid orders only.

They are pinned by `tests/test_analytics.py`, which tests the *definitions*
rather than the arithmetic.

## Operational procedures

Day-to-day runbook material — restarting workers, replaying a webhook,
reconciling the stock ledger, what to do when Paystack or Redis is down — lives
in [`kuyashfarm-backend/docs/RUNBOOK.md`](../../kuyashfarm-backend/docs/RUNBOOK.md).
Standing the system up in the first place is
[`kuyashfarm-backend/RUNBOOK.md`](../../kuyashfarm-backend/RUNBOOK.md); the two
files have different jobs.

