# Deploying the Kuyash Farms storefront to Vercel

Everything needed to take this repository from nothing to a live site on
Vercel's Hobby plan, talking to the Django API on Render.

Written against the code in this repository. Where a claim comes from a file,
the file is named so you can check it. Where something was tested, it says so.

> **Deploy the API first.** The build fetches from it and fails without it —
> §12 has the exact error. The backend guide is
> [`../kuyashfarm-backend/DEPLOYMENT-GUIDE.md`](../kuyashfarm-backend/DEPLOYMENT-GUIDE.md).

---

## Contents

1. [Before you start](#1-before-you-start)
2. [The two URLs, and the order to deploy in](#2-the-two-urls-and-the-order-to-deploy-in)
3. [Import the project](#3-import-the-project)
4. [Environment variables](#4-environment-variables)
5. [Why these must be *build-time* variables](#5-why-these-must-be-build-time-variables)
6. [Deploy](#6-deploy)
7. [Confirm the API is pointed at this frontend](#7-confirm-the-api-is-pointed-at-this-frontend)
8. [Verify — the checks only a browser can make](#8-verify--the-checks-only-a-browser-can-make)
9. [A custom domain](#9-a-custom-domain)
10. [Preview deployments will not be able to sign in](#10-preview-deployments-will-not-be-able-to-sign-in)
11. [Images](#11-images)
12. [Troubleshooting](#12-troubleshooting)
13. [What to do next](#13-what-to-do-next)
- [Appendix A: every command, in order](#appendix-a-every-command-in-order)
- [Appendix B: the deployment checklist](#appendix-b-the-deployment-checklist)

---

## 1. Before you start

| You need | Notes |
|---|---|
| A Vercel account | Hobby is enough |
| The API already live | §2 |
| The API's public URL | e.g. `https://kuyashfarmsmvpapi.onrender.com` |
| Node 20+ locally | To run the pre-flight checks in §6.1 |

This is a stock Next.js 16 App Router application. There is no `vercel.json` and
none is needed — Vercel detects Next.js and gets the build, output and routing
right on its own. Adding one would be a file to maintain that overrides
defaults you want.

---

## 2. The two URLs, and the order to deploy in

Each side needs the other's URL:

- The **frontend build** needs `NEXT_PUBLIC_API_URL`, or it cannot fetch, and it
  bakes the value into the Content-Security-Policy (§5).
- The **API** needs `CORS_ALLOWED_ORIGINS` and `FRONTEND_URL` set to the Vercel
  domain, or the browser blocks every request and email links point nowhere.

**Both URLs are already decided for this deployment**, which removes most of the
problem:

| | |
|---|---|
| Frontend | `https://kuyashfarmsmvp.vercel.app` |
| API | `https://kuyashfarmsmvpapi.onrender.com` |

Render derives the hostname from the service name, and Vercel from the project
name, so as long as you name them `kuyashfarmsmvpapi` and `kuyashfarmsmvp` both
are known before either exists. `render.yaml` in the API repo already hardcodes
the Vercel URL into `FRONTEND_URL`, `CORS_ALLOWED_ORIGINS` and
`CSRF_TRUSTED_ORIGINS`.

So the order is simply:

```
1. Deploy the API (its blueprint already knows this frontend's URL).
2. Confirm https://kuyashfarmsmvpapi.onrender.com/api/v1/health/ returns 200.
3. Deploy the frontend with NEXT_PUBLIC_API_URL set BEFORE the first build.
4. Verify in a browser (§8).
```

If either name is taken and Render or Vercel appends a suffix, the real URL
differs from the planned one — **check the assigned URL before step 3**, and
correct `render.yaml` if so.

Step 3 is where this goes wrong. `NEXT_PUBLIC_API_URL` must be present **before
the first build**, not added afterwards — §5 explains why, and it is the
difference between a working site and one where every request is blocked by the
browser before it is sent.

And if you deploy the frontend under a name you did not plan for, the API's
`CORS_ALLOWED_ORIGINS` will not match it. A CORS rejection happens at the
browser's preflight, so the request never reaches Django and nothing appears in
any server log — only the browser console shows it.

---

## 3. Import the project

Vercel Dashboard → **Add New** → **Project** → import `kuyashfarm-frontend`.

| Setting | Value |
|---|---|
| Framework Preset | Next.js (detected) |
| Root Directory | `./` |
| Build Command | default (`next build`) |
| Output Directory | default |
| Install Command | default |
| Node.js Version | 20.x or later |

> **Root Directory is `./`, not `frontend/`.** The app used to live in a
> `frontend/` subdirectory and was flattened to the repository root on
> 2026-07-28. Any older instruction naming `frontend/` is describing a layout
> that no longer exists.

Do **not** click Deploy yet — set the environment variables first, or the first
build will fail and bake a broken CSP (§5).

---

## 4. Environment variables

Project → Settings → **Environment Variables**.

### 4.1 Required

| Variable | Value | Environments |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://kuyashfarmsmvpapi.onrender.com/api/v1` | Production, Preview, Development |
| `NEXT_PUBLIC_SITE_URL` | `https://kuyashfarmsmvp.vercel.app` | Production, Preview, Development |

**Both matter in ways that are not obvious:**

`NEXT_PUBLIC_API_URL` — the version prefix `/api/v1` is **included**, and there
is **no trailing slash**. Get the prefix wrong and every request 404s. There is
deliberately no production fallback: `lib/api/client.ts` throws on a production
build without it rather than silently pointing at `localhost`, because a build
that quietly targets a machine that is not there is worse than one that refuses.

`NEXT_PUBLIC_SITE_URL` builds absolute Open Graph and Twitter card URLs. Those
**must** be absolute, because WhatsApp, Facebook and X fetch them from their own
servers and have no idea what your origin is. Getting it wrong fails silently
and only off-site: the page renders perfectly and the share card simply does not
appear — which is invisible in testing and matters a great deal in a market
where links spread on WhatsApp.

### 4.2 Optional

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID | Blank is a working state — the Google button renders nothing at all rather than failing when pressed |

### 4.3 What must never go here

Everything named `NEXT_PUBLIC_*` is inlined into the JavaScript every visitor
downloads, **regardless of which component reads it or who that component
renders for**. There is no such thing as a `NEXT_PUBLIC_` variable that is only
seen by admins.

So: no service-role key, no `DATABASE_URL`, no Paystack secret key, no SMTP
credential, no admin path. Those belong in the API's environment.

`npm run check:bundle` fails the build on secret-shaped values in the client
bundle. It exists because `NEXT_PUBLIC_ADMIN_URL` once shipped the back-office
path to every anonymous visitor; the admin path now comes from `/auth/me/` as
`admin_url` and is `null` for anyone who is not back-office.

### 4.4 Never set this one

`NEXT_PRERENDER_OFFLINE` is a CI-only escape hatch that lets prerender fetches
which supplied an `offlineFallback` render empty instead of failing. In a real
deployment an unreachable API **should** stop the release — otherwise you ship a
site with empty category pages and no indication anything went wrong.

---

## 5. Why these must be *build-time* variables

`NEXT_PUBLIC_API_URL` is read in `next.config.ts` at build time and used to
build the Content-Security-Policy — specifically `connect-src` and `img-src`:

```js
`connect-src 'self' ${apiOrigin}`
```

**If the variable is not present when the build runs, `apiOrigin` falls back to
`http://localhost:8000` and the deployed site's CSP forbids the browser from
talking to your API at all.** Every request is blocked before it is sent. The
page renders perfectly; nothing works; the API log is empty because no request
was ever made. The only evidence is a CSP violation in the browser console.

Vercel exposes environment variables to the build by default, so this works if
you set them before deploying. It breaks if you add them after a first failed
deploy and do not **rebuild** — a redeploy from cache will not pick them up. Use
Deployments → ⋯ → **Redeploy**, with "Use existing Build Cache" **unchecked**.

The same build-time read decides `upgrade-insecure-requests`, which is emitted
only when the API URL is HTTPS. Render gives you HTTPS, so this is correct
automatically — but it is why pointing a production build at an `http://` API
turns every request into an upgraded one aimed at a dead port.

---

## 6. Deploy

### 6.1 Run the checks locally first

Vercel's build runs `next build` and nothing else — no linting, no tests, no
type-check beyond what the build itself does. Run the full set before pushing:

```bash
npm ci
npx tsc --noEmit
npm run lint          # 0 errors, 0 warnings
npm test              # vitest
npm run build         # needs the API reachable — see §12
npm run check:bundle  # after a build: no secrets in the client JS
```

### 6.2 Deploy

Push to your production branch, or click Deploy. Watch the build log for
`Compiled successfully` and the route table.

### 6.3 What "ƒ" and "○" mean in that table

- `○ (Static)` — prerendered at build time. `/categories` is one of these,
  which is why the build needs the API.
- `ƒ (Dynamic)` — rendered per request.

If a route you expect to be static shows as dynamic, something in it read a
request-time value.

---

## 7. Confirm the API is pointed at this frontend

If you deployed the API with [`render.yaml`](../kuyashfarm-backend/render.yaml),
all five of these are **already set** — the blueprint hardcodes this frontend's
URL. This section is the check, not the work.

Render → `kuyashfarmsmvpapi` → Environment. Confirm:

```
FRONTEND_URL=https://kuyashfarmsmvp.vercel.app
CORS_ALLOWED_ORIGINS=https://kuyashfarmsmvp.vercel.app
CSRF_TRUSTED_ORIGINS=https://kuyashfarmsmvp.vercel.app
REFRESH_COOKIE_SAMESITE=None
REFRESH_COOKIE_SECURE=True
```

Scheme included, **no trailing slash**.

The last two are the ones that bite. Vercel and Render are on **different
registrable domains** (`vercel.app` vs `onrender.com`), which makes every
request between them cross-site, and a `SameSite=Lax` cookie is never sent
cross-site. Without them, sign-in appears to work and then every session dies on
the next page load — while CORS looks perfectly correct throughout, because they
are separate mechanisms answering separate questions. The backend guide §12 has
the full explanation.

If the frontend ended up on a different URL than planned, edit `render.yaml` in
the API repo and push — values written as `value:` there are owned by the file,
so a dashboard edit would be reverted on the next blueprint sync.

Confirm from the command line before moving on:

```bash
curl -s -I -X OPTIONS https://kuyashfarmsmvpapi.onrender.com/api/v1/products/ \
  -H "Origin: https://kuyashfarmsmvp.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: x-cart-session,idempotency-key"
```

You want `Access-Control-Allow-Origin` naming your Vercel URL, and both
requested headers echoed back in `Access-Control-Allow-Headers`.

---

## 8. Verify — the checks only a browser can make

Automated checks pass on plenty of broken deployments. These are the ones that
catch what they miss. **All of them need real DevTools; curl cannot see any of
them.**

### 8.1 The console must be clean

Open the site with DevTools on the **Console** tab.

A CSP violation here is the §5 failure. It is worth knowing what a *partial*
CSP failure looks like: if `script-src` were wrong, the App Router's inline RSC
payload would be blocked, React would fail to hydrate with **error #412**, and
the page would paint correctly while every button on it did nothing. A page that
looks perfect is not evidence.

### 8.2 Sign in, then reload

The single most important check. If you are signed out by the reload, go back
to §7 — the refresh cookie is not being sent.

Then **Application → Cookies** and confirm `refresh_token` is `HttpOnly`,
`Secure`, `SameSite=None`.

### 8.3 Add to basket while signed out

This exercises the `X-Cart-Session` header, which must be in the API's
`CORS_ALLOW_HEADERS`. If it is missing, the browser's preflight fails and no
guest can add anything to a basket — and because a preflight failure is a
*network* error rather than an API error, nothing is logged anywhere. Only the
console shows it.

### 8.4 Register, and read the email

Confirm it arrives, and that the verification link points at your Vercel domain
rather than `localhost:3000`. That single check covers `FRONTEND_URL` and — on
the free tier — whether Celery tasks are actually executing at all.

### 8.5 Check the network tab once

Filter to Fetch/XHR and confirm requests go to your Render domain over HTTPS,
and that responses carry the `{success, message, data, errors}` envelope.

### 8.6 Confirm the back office is not indexable

```bash
curl -sI https://kuyashfarmsmvp.vercel.app/admin | grep -i x-robots-tag
# X-Robots-Tag: noindex, nofollow
```

---

## 9. A custom domain

Worth doing early — it is the cheapest fix for the cookie problem in §7.

1. Vercel → Settings → Domains → add `kuyashfarms.com`, follow the DNS steps.
2. Point `api.kuyashfarms.com` at the Render service (Render → Settings →
   Custom Domains).
3. Update, on Render:
   ```
   DJANGO_ALLOWED_HOSTS=api.kuyashfarms.com
   FRONTEND_URL=https://kuyashfarms.com
   CORS_ALLOWED_ORIGINS=https://kuyashfarms.com,https://www.kuyashfarms.com
   CSRF_TRUSTED_ORIGINS=https://kuyashfarms.com,https://www.kuyashfarms.com
   REFRESH_COOKIE_SAMESITE=Lax
   ```
4. Update, on Vercel, then **rebuild without cache** (§5):
   ```
   NEXT_PUBLIC_API_URL=https://api.kuyashfarms.com/api/v1
   NEXT_PUBLIC_SITE_URL=https://kuyashfarms.com
   ```

`SameSite=Lax` becomes correct at step 3 because `kuyashfarms.com` and
`api.kuyashfarms.com` share a registrable domain — they are same-site. That is
strictly better than `None`: the cookie stops depending on third-party-cookie
policy, which browsers keep tightening.

Do steps 3 and 4 together. In between, the deployment is inconsistent and
sign-in will not work.

---

## 10. Preview deployments will not be able to sign in

Vercel gives every preview deployment a unique URL
(`kuyashfarmsmvp-git-somebranch-you.vercel.app`). The API's `CORS_ALLOWED_ORIGINS`
is an explicit allow-list, so those origins are not on it, and cannot be — you
cannot list a URL that does not exist yet.

So on a preview: anything public renders, and anything needing the API fails.

This is the correct trade. The alternative is a wildcard CORS origin on an API
that sets `CORS_ALLOW_CREDENTIALS = True`, which would let any subdomain of
`vercel.app` — including someone else's project — make credentialed requests to
your API.

If you need a working shared environment, deploy a second Render service as
staging with its own fixed frontend URL, and put that URL in its
`CORS_ALLOWED_ORIGINS`. Bear in mind on the free tier that a second service
roughly doubles your instance-hour usage and adds a second claim on the
database connection budget.

---

## 11. Images

`next.config.ts` allows images from three sources: the API host (derived from
`NEXT_PUBLIC_API_URL`), `*.supabase.co`, and `images.unsplash.com`.

In production, uploaded photographs come back as absolute Supabase Storage URLs,
so they are covered by the `*.supabase.co` pattern. Nothing extra is needed.

Two things to know:

- **`dangerouslyAllowLocalIP` is on only outside production.** It is keyed to
  `NODE_ENV`, which Vercel sets to `production` for you. It exists because Next
  16 refuses to optimise images on private addresses — correct as an SSRF
  defence, and wrong for local development where the API is on `localhost`.
- **The Unsplash images are placeholders of somebody else's farm.** Around
  thirty of them, hotlinked. Replace them with owned photography before this is
  a commercial site; the pattern stays in the config until then because removing
  it first would break every marketing section at once.

---

## 12. Troubleshooting

| Symptom | Cause |
|---|---|
| Build fails with `TypeError: fetch failed` and `ENOTFOUND` on `/categories` | The API is unreachable from the build. See below. |
| Site loads, every API call blocked, console shows CSP violations | `NEXT_PUBLIC_API_URL` was missing or wrong **at build time**. Fix it, then redeploy **without** the build cache (§5). |
| Site loads, API calls fail as network errors, API log is empty | CORS. The request never reached Django. §7. |
| Sign-in works, reload signs you out | `REFRESH_COOKIE_SAMESITE`. §7. |
| Guests cannot add to basket | `X-Cart-Session` missing from `CORS_ALLOW_HEADERS`. §8.3. |
| Page paints but nothing is clickable | React did not hydrate. Check the console for CSP error #412. §8.1. |
| Share previews show no image | `NEXT_PUBLIC_SITE_URL` wrong or missing. Only reproducible off-site. |
| Images 404 or 400 | Host not in `images.remotePatterns`. §11. |
| Everything works on production, nothing works on a preview URL | Expected. §10. |
| Build succeeds locally, fails on Vercel | Usually a case-sensitivity difference — macOS is case-insensitive, Vercel's builders are not. Check your import paths. |

### The build genuinely does need the API

This was tested for this guide, with the API stopped:

```
Error occurred prerendering page "/categories".
TypeError: fetch failed
    at async lib/api/client.ts:463:16
    at async app/categories/page.tsx:24:22
  [cause]: Error: getaddrinfo ENOTFOUND api.example.invalid
Export encountered an error on /categories/page: /categories, exiting the build.
```

`/categories` is prerendered with a 60-second revalidate, and its fetch has no
offline fallback. So: **start the API before you build.** On the free tier, if
the API has spun down, the cold start may be slower than the fetch's patience —
hit `/api/v1/health/` once and wait for a 200 before triggering the build.

Two other routes fetch at build time and are *not* a problem: the root layout's
`/config/` call supplies an `offlineFallback` and is wrapped in a try/catch, and
the academy class pages' `generateStaticParams` returns `[]` on failure and
renders those routes on demand instead.

---

## 13. What to do next

- **Add the custom domain** (§9). It removes the `SameSite=None` dependency.
- **Turn on Vercel Analytics** if you want traffic figures. Note that the back
  office already has its own analytics at `/admin/analytics`, computed from the
  database — those are business figures, not traffic.
- **Replace the Unsplash placeholders** (§11).
- **Run the end-to-end suite against staging.** `npm run test:e2e` serves on
  port 3100, so that origin must be in the API's `CORS_ALLOWED_ORIGINS` and the
  login throttle raised via `THROTTLE_LOGIN` — otherwise the suite trips the
  rate limiter mid-run and the failures look like product bugs.
- **Check `SOCIAL_LINKS`** in `lib/constants.ts`. It is empty, so the footer
  renders no social icons.
- **Have someone read the legal pages.** `/privacy`, `/terms` and `/cookies`
  exist and are generic.

---

## Appendix A: every command, in order

Vercel is mostly a dashboard, but everything can be done from the CLI and the
local checks are not optional — Vercel's build runs `next build` and nothing
else. No linting, no tests.

### Local, before you deploy

```bash
cd kuyashfarm-frontend
npm ci

npx tsc --noEmit         # must be silent
npm run lint             # 0 errors, 0 warnings
npm test                 # vitest

# The build needs the API reachable. Wake it first if it has spun down —
# a free Render service takes tens of seconds to come back.
curl -s https://kuyashfarmsmvpapi.onrender.com/api/v1/health/ | python -m json.tool

NEXT_PUBLIC_API_URL=https://kuyashfarmsmvpapi.onrender.com/api/v1 \
NEXT_PUBLIC_SITE_URL=https://kuyashfarmsmvp.vercel.app \
  npm run build

npm run check:bundle     # after a build: no secrets in the client JS
```

### Deploy: the dashboard route

**Add New → Project → import `kuyashfarm-frontend`.** Set Root Directory to
`./`, add the two environment variables from §4.1 to **all three** environments
(Production, Preview, Development) — *before* clicking Deploy — then deploy.

### Deploy: the CLI route

```bash
npm i -g vercel
vercel login

# Link this directory to a Vercel project. Name it `kuyashfarmsmvp` so the
# domain comes out as kuyashfarmsmvp.vercel.app.
vercel link

# Environment variables. Add each to every environment it is needed in;
# `vercel env add` prompts for the value and the target.
vercel env add NEXT_PUBLIC_API_URL production      # https://kuyashfarmsmvpapi.onrender.com/api/v1
vercel env add NEXT_PUBLIC_API_URL preview
vercel env add NEXT_PUBLIC_API_URL development
vercel env add NEXT_PUBLIC_SITE_URL production     # https://kuyashfarmsmvp.vercel.app
vercel env add NEXT_PUBLIC_SITE_URL preview
vercel env add NEXT_PUBLIC_SITE_URL development

vercel env ls                                      # confirm before building

vercel --prod                                      # build and deploy to production
```

### Everyday CLI

```bash
vercel ls                          # deployments
vercel logs <deployment-url>       # build and function logs
vercel env pull .env.local         # bring the configured values down locally
vercel --prod --force              # redeploy WITHOUT the build cache — see below
vercel rollback <deployment-url>   # promote a previous deployment
vercel domains add kuyashfarms.com # custom domain (§9)
```

> **`--force` matters more here than usual.** `NEXT_PUBLIC_API_URL` is read at
> *build* time and baked into the Content-Security-Policy. If you add or change
> it after a build, a cached redeploy keeps the old value and the site's CSP
> keeps blocking your API. From the dashboard the equivalent is
> Deployments → ⋯ → Redeploy with **"Use existing Build Cache" unchecked**.

### Verify the live site

```bash
SITE=https://kuyashfarmsmvp.vercel.app

# The back office must not be indexable
curl -sI $SITE/admin | grep -i x-robots-tag        # X-Robots-Tag: noindex, nofollow

# The CSP must name the real API, not localhost. If you see localhost here,
# the build did not have NEXT_PUBLIC_API_URL — rebuild with --force.
curl -sI $SITE | grep -i content-security-policy | tr ';' '\n' | grep connect-src
```

Everything else worth checking needs a real browser — §8.

---

## Appendix B: the deployment checklist

```
Before importing
  [ ] API is live and /api/v1/health/ returns schema_correct: true
  [ ] npx tsc --noEmit clean
  [ ] npm run lint clean
  [ ] npm test passing
  [ ] npm run build succeeds against the live API
  [ ] npm run check:bundle clean

Vercel
  [ ] Project imported, Root Directory = ./
  [ ] NEXT_PUBLIC_API_URL set (with /api/v1, no trailing slash) BEFORE first build
  [ ] NEXT_PUBLIC_SITE_URL set
  [ ] No secrets in any NEXT_PUBLIC_* variable
  [ ] NEXT_PRERENDER_OFFLINE not set
  [ ] Deployed

Back on Render
  [ ] FRONTEND_URL = Vercel URL
  [ ] CORS_ALLOWED_ORIGINS = Vercel URL
  [ ] CSRF_TRUSTED_ORIGINS = Vercel URL
  [ ] REFRESH_COOKIE_SAMESITE=None
  [ ] REFRESH_COOKIE_SECURE=True
  [ ] Redeployed

In a browser
  [ ] Console free of CSP violations
  [ ] Signed in, reloaded, still signed in
  [ ] refresh_token cookie is HttpOnly + Secure + SameSite=None
  [ ] Guest can add to basket
  [ ] Registration email arrives, link points at the Vercel domain
  [ ] /admin returns X-Robots-Tag: noindex
```
