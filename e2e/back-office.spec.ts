import { expect, test, type Page } from "@playwright/test";

/**
 * The staff and driver journeys.
 *
 * Everything else in this suite is a customer. These cover the two planes that
 * had no browser coverage at all, and one of them — delivery — had never been
 * driven through a UI in any form: 30 API tests, screens that build and render,
 * and no proof that a run could actually go planned → loaded → out → delivered
 * with a human pressing the buttons.
 *
 * The accounts come from `manage.py seed_e2e`, because they cannot be created
 * through the API. Registration only ever produces a `CUSTOMER`, deliberately,
 * so that no request can grant itself back-office access — which means a
 * browser test cannot bootstrap a staff account either.
 *
 * Run against a real API and a real build, like the rest of this directory. A
 * test that mocks the API cannot catch the class of bug that has dominated this
 * project: the two sides disagreeing about a contract.
 */

const API = process.env.E2E_API_URL ?? "http://127.0.0.1:8000/api/v1";
const PASSWORD = "AnE2eP4ssword!";
const ADMIN = "e2e-admin@kuyashfarms.test";
const DRIVER = "e2e-driver@kuyashfarms.test";

/**
 * Sign in and land somewhere.
 *
 * `next` is passed through the login URL rather than navigating afterwards.
 * Navigating separately races the sign-in request: `page.goto` starts a fresh
 * document load, which discards the in-memory access token before the response
 * that would have set it has arrived — and the test then fails on the login
 * page with an error about a missing heading.
 */
async function signIn(page: Page, email: string, next = "/") {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);

  // `form:visible` because React can briefly hold both the outgoing and
  // incoming trees during a client-side navigation, so a plain selector
  // intermittently matches twice. Scoping to the form is not enough — the
  // duplicate moves up a level; visibility is what distinguishes them.
  const form = page.locator("form:visible").filter({ has: page.locator("#password") });
  await expect(form).toBeVisible();

  await form.locator("#email").fill(email);
  await form.locator("#password").fill(PASSWORD);
  await form.getByRole("button", { name: /^sign in$/i }).click();

  // Wait for the sign-in to actually land before anything else navigates.
  await expect(page).not.toHaveURL(/\/login/, { timeout: 20_000 });
}

test.describe("the back office", () => {
  test("a customer is told plainly that /admin is not for them", async ({ page, request }) => {
    // Not a silent redirect: that reads as a broken link, and they may have
    // followed one from a colleague. Saying so reveals nothing, because
    // `is_back_office` is already on their own /auth/me/ response.
    const email = `e2e-customer-${Date.now()}@example.com`;
    const created = await request.post(`${API}/auth/register/`, {
      data: {
        email,
        password: PASSWORD,
        password_confirm: PASSWORD,
        full_name: "Chidi Nwosu",
      },
    });
    expect(created.status()).toBe(202);

    await signIn(page, email, "/admin");

    await expect(page.getByText(/this area is for staff/i)).toBeVisible();
    // And none of the back-office chrome leaked while deciding.
    await expect(page.getByRole("link", { name: /inventory/i })).toHaveCount(0);
  });

  test("a signed-out visitor is sent to sign in and brought back", async ({ page }) => {
    await page.goto("/admin");

    await expect(page).toHaveURL(/\/login\?next=%2Fadmin|\/login\?next=\/admin/);
  });

  test("an administrator reaches the back office and its screens", async ({ page }) => {
    await signIn(page, ADMIN, "/admin");

    await expect(page.getByRole("heading", { name: /overview/i })).toBeVisible();

    // The staff screen is administrator-only, mirroring what the API enforces.
    await page.getByRole("link", { name: /^staff$/i }).click();
    await expect(page.getByRole("heading", { name: /^staff$/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /send invitation/i })).toBeVisible();
  });

  test("the products screen marks what still has no photograph", async ({ page }) => {
    // The catalogue shipped with eighteen real products and no images at all.
    // This badge is the reason somebody opens the screen.
    await signIn(page, ADMIN, "/admin/products");

    await expect(page.getByRole("heading", { name: /products & photographs/i })).toBeVisible();
    await expect(page.getByPlaceholder(/tomatoes/i)).toBeVisible();
  });
});

test.describe("delivery, end to end", () => {
  /**
   * The journey that had never been driven through a browser.
   *
   * Builds its own order through the API — a customer can do that, so it is
   * not cheating — then walks it through dispatch and the driver's phone.
   */
  test("an order goes from packed, onto a van, to a doorstep", async ({ page, request }) => {
    // ── A real order, placed the way a customer would ───────────────────────
    const email = `e2e-delivery-${Date.now()}@example.com`;
    const session = `e2e-${Date.now()}`;

    const products = await request.get(`${API}/products/?page_size=1`);
    const product = (await products.json()).data.results[0];
    expect(product, "the catalogue must be seeded").toBeTruthy();

    await request.post(`${API}/cart/items/`, {
      headers: { "X-Cart-Session": session },
      // `product_slug`, not an id — checked against the serializer.
      data: { product_slug: product.slug, quantity: 1 },
    });

    const placed = await request.post(`${API}/checkout/orders/`, {
      headers: { "X-Cart-Session": session, "Idempotency-Key": session },
      data: {
        email,
        payment_method: "COD",
        shipping_address: {
          recipient_name: "Ada Okoro",
          street: "22 Awolowo Road",
          city: "Lagos",
          state: "Lagos",
          phone: "08039876543",
          country: "NG",
        },
      },
    });
    expect(placed.status(), await placed.text()).toBe(201);
    const orderNumber = (await placed.json()).data.order_number;

    // ── Staff pick and pack it ─────────────────────────────────────────────
    //
    // Through the API, not the browser. The status control on the orders
    // screen has its own test — including that an illegal transition shows the
    // server's refusal — and driving it here means three page loads, three
    // debounced searches and three re-renders before reaching the part that
    // has no coverage at all. This spec exists for dispatch and the driver.
    const signedIn = await request.post(`${API}/auth/login/`, {
      data: { email: ADMIN, password: PASSWORD },
    });
    const token = (await signedIn.json()).data.access_token;
    const asStaff = { Authorization: `Bearer ${token}` };

    for (const status of ["CONFIRMED", "PROCESSING", "PACKED"]) {
      const moved = await request.post(`${API}/staff/orders/${orderNumber}/status/`, {
        headers: asStaff,
        data: { status },
      });
      expect(moved.status(), await moved.text()).toBe(200);
    }

    // ── Dispatch: plan a run, load it, send it out ──────────────────────────
    //
    // Signed in *to* the screen rather than navigating there afterwards. A
    // `page.goto` is a fresh document load, which discards the in-memory
    // access token — recoverable from the refresh cookie, but only once, and
    // racing it makes the failure look like a missing heading.
    await signIn(page, ADMIN, "/admin/delivery");
    await expect(page.getByRole("heading", { name: /^delivery$/i })).toBeVisible();

    await page.getByLabel("Driver").selectOption({ index: 1 });
    await page.getByRole("button", { name: /plan run/i }).click();
    await expect(page.getByText(/run planned/i)).toBeVisible();

    page.once("dialog", (dialog) => dialog.accept(orderNumber));
    await page.getByRole("button", { name: /load an order/i }).first().click();
    await expect(page.getByText(new RegExp(`${orderNumber} loaded`, "i"))).toBeVisible();

    await page.getByRole("button", { name: /start run/i }).first().click();
    await expect(page.getByText(/the van has left/i)).toBeVisible();

    // Starting the run ships the order — and records a despatch, because
    // `transition_order` refuses SHIPPED without one.
    const shipped = await request.get(`${API}/orders/${orderNumber}/?email=${email}`);
    expect((await shipped.json()).data.status).toBe("SHIPPED");

    // ── The driver, on a phone, at the gate ─────────────────────────────────
    //
    // Cookies cleared rather than signing out through the UI. The sign-out
    // button lives inside a closed account menu, so looking for it directly
    // waits for something that will never appear — and `.catch()` on the click
    // swallows the rejection only *after* the whole test timeout has gone.
    // Signing out is covered by `signed-in.spec.ts`; this test is about the
    // round.
    await page.context().clearCookies();

    await signIn(page, DRIVER, "/driver");

    await expect(page.getByRole("heading", { name: /my round/i })).toBeVisible();

    // Scoped to *this* order's card, not the first thing on the round.
    // Earlier runs leave their own stops behind, all to the same address, so
    // an unscoped selector both trips strict mode and — worse, if it did not —
    // would mark somebody else's parcel delivered.
    const stop = page.locator("article").filter({ hasText: orderNumber });
    await expect(stop).toBeVisible();
    // The address is on the card: a driver at the wheel cannot look an order up.
    await expect(stop.getByText(/22 Awolowo Road/)).toBeVisible();

    page.once("dialog", (dialog) => dialog.accept("Ada Okoro"));
    await stop.getByRole("button", { name: /^delivered$/i }).click();
    await expect(stop.getByText(/received by ada okoro/i)).toBeVisible();

    // ── And the order is delivered, because the stop said so ────────────────
    const delivered = await request.get(`${API}/orders/${orderNumber}/?email=${email}`);
    expect((await delivered.json()).data.status).toBe("DELIVERED");
  });

  test("a driver cannot reach dispatch", async ({ page }) => {
    // A driver is not staff. If this leaked, whoever picked up the delivery
    // phone would have the order queue and the customer list.
    await signIn(page, DRIVER, "/admin/delivery");

    await expect(page.getByText(/this area is for staff/i)).toBeVisible();
  });
});
