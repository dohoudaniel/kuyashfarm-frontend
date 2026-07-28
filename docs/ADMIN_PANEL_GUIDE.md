# Back office

Where staff actually do the work.

> **Rewritten 2026-07-28.** The previous version documented a frontend-only
> admin panel that ran on `localStorage`, and opened with a `/wholesale-demo`
> page offering a **"Create Test Admin User"** button that granted admin rights
> to anyone who visited it. That page and that panel have been deleted, not
> ported. This describes what replaced them.

## There is no React admin, deliberately

Back-office work runs through **Django Admin** at the path set by
`DJANGO_ADMIN_URL`. Whether to build a custom React back office is **PRD §13
Q4**, still an open business decision, so no admin UI has been built — choosing
one would pre-empt the answer.

Django Admin already covers application review, order fulfilment, inventory
adjustment and attendance marking, with permissions, an audit trail and object
history for free.

## Getting access

Access is granted by `role`, in the database, by someone who already has it:

```bash
uv run python manage.py createsuperuser
```

To promote an existing user:

```python
user.role = Role.ADMIN     # or Role.STAFF
user.save()                # is_staff is derived from role on save
```

Two things this deliberately makes impossible:

- **No email address grants privilege.** The prototype gave admin rights to
  anyone registering as `admin@kuyashfarm.com`. Nothing in the current system
  reads an address to decide permissions.
- **No client-side flag grants anything.** `role` is read from the database on
  every request. Setting a value in `localStorage` — or in a JWT claim — changes
  nothing, because nothing trusts it.

`account_type` is a separate axis and grants no admin access at all: a verified
distributor is a customer with a discount.

## Staff API

If a UI is built later, the endpoints already exist. All require `role` of
`STAFF` or `ADMIN`, enforced server-side by `core.permissions.IsStaff`.

| Area | Endpoints |
|---|---|
| Applications | `GET /staff/applications/`, `POST /{id}/claim/`, `/approve/`, `/reject/` |
| Orders | `GET /staff/orders/`, status transitions |
| Inventory | `GET /staff/inventory/`, `/{slug}/restock/`, `/adjust/`, `/ledger-check/` |
| Ledger | `GET /staff/ledger/` — append-only stock movements |
| Academy | `GET /staff/academy/registrations/`, `/{ref}/attended/`, `/{slug}/seat-check/` |
| Analytics | `GET /staff/analytics/` and five sub-reports |

They are documented at `/api/v1/docs/` under the **staff** tag — note the
`/v1/`, and note that the docs are disabled in production.

## Reviewing an application

`POST /staff/applications/{id}/approve/` sets `account_type` on the
**applicant's** row. That sentence is the entire point of the rewrite: the
prototype wrote the upgrade to whoever was signed in, so approvals landed on
the reviewer's own account and the applicant never saw anything.

Approval and rejection take a row lock and refuse to act on an application that
has already been decided, so two reviewers clicking at once cannot both win.

Rejection requires a reason, which is emailed to the applicant and shown to them
as `decision_reason`.

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
reconciling the stock ledger, what to do when Paystack is down — lives in
[`kuyashfarm-backend/docs/RUNBOOK.md`](../kuyashfarm-backend/docs/RUNBOOK.md).
