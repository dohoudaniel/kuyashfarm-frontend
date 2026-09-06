import { expect, test } from "@playwright/test";

/**
 * Guest checkout, end to end, against a real API.
 *
 * This is the flow the whole system exists to serve, and until now nothing
 * verified it. The Vitest suite proves the HTTP client unwraps an envelope; it
 * cannot prove that somebody can put a tomato in a basket and end up with an
 * order.
 *
 * Deliberately unmocked. Every expensive bug in this project has been the two
 * sides disagreeing about a contract, and a mock agrees with whatever you tell
 * it to. Writing this found two: `X-Cart-Session` and `Idempotency-Key` were
 * missing from the API's CORS allowlist, so on any cross-origin deployment —
 * which is every real one — no guest could add to a basket, and the header that
 * prevents a double-tapped Pay button placing two orders was silently stripped.
 * Neither was visible locally, because same-origin requests skip CORS and curl
 * ignores it entirely.
 */

const GUEST = {
  email: "e2e-guest@example.com",
  recipientName: "Adaeze Okonkwo",
  street: "14 Ikorodu Road",
  city: "Lagos",
  state: "Lagos",
  phone: "08031234567",
};

test.describe("guest checkout", () => {
  test("browse, add to basket, and place a cash-on-delivery order", async ({ page }) => {
    // ── Browse ────────────────────────────────────────────────────────────
    await page.goto("/shop/vegetables");

    const addButtons = page.getByRole("button", { name: "Add", exact: true });
    await expect(addButtons.first()).toBeVisible();

    // The listing must actually render products. An empty grid here was the
    // original SSR bug: the page shipped zero products and nobody noticed.
    expect(await addButtons.count()).toBeGreaterThan(0);

    // Remember what we are buying, so the confirmation can be checked against
    // it rather than against the mere fact that a page loaded.
    const firstCard = page.locator("article").filter({ has: addButtons.first() }).first();
    const productName = (await firstCard.getByRole("heading").first().innerText()).trim();
    expect(productName.length).toBeGreaterThan(0);

    // ── Add to basket ─────────────────────────────────────────────────────
    await addButtons.first().click();
    // The badge reads from the server cart, so this proves the whole round
    // trip — including the X-Cart-Session header that identifies a guest.
    await expect(page.getByRole("button", { name: /^Cart, [1-9]/ })).toBeVisible();

    // ── Checkout ──────────────────────────────────────────────────────────
    await page.goto("/checkout");

    await page.getByLabel("Recipient name *").fill(GUEST.recipientName);
    await page.getByLabel("Email *").fill(GUEST.email);
    await page.getByLabel("Street address *").fill(GUEST.street);
    await page.getByLabel("City *").fill(GUEST.city);
    await page.getByLabel("State *").fill(GUEST.state);
    await page.getByLabel("Phone *").fill(GUEST.phone);

    // The summary is server-computed. The client never adds up a cart, so the
    // submit button stays disabled until POST /checkout/quote/ has answered.
    await expect(page.getByRole("heading", { name: "Order summary" })).toBeVisible();

    await page.getByRole("button").filter({ hasText: "Cash on delivery" }).click();

    const placeOrder = page.getByRole("button", { name: "Place order" });
    await expect(placeOrder).toBeEnabled({ timeout: 15_000 });
    await placeOrder.click();

    // ── Confirmation ──────────────────────────────────────────────────────
    // A guest has no session, so landing on their own order proves the
    // sessionStorage ownership hand-off works. Without it this is a 403 —
    // which is exactly what happened before it was built.
    await page.waitForURL(/\/orders\/[^/]+/, { timeout: 25_000 });

    await expect(page.getByRole("heading", { name: "Items" })).toBeVisible({ timeout: 15_000 });
    // The thing on the order is the thing that went into the basket.
    await expect(page.getByText(productName).first()).toBeVisible();
    // And it was booked as cash on delivery, not silently as a card payment.
    await expect(page.getByText(/Cash on delivery/i).first()).toBeVisible();
  });

  test("an empty basket cannot be checked out", async ({ page }) => {
    // Reaching checkout with nothing in the basket must not offer to charge
    // anybody. The server would refuse, but the customer should never get that
    // far.
    await page.goto("/checkout");

    await expect(page.getByRole("heading", { name: "Your cart is empty" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Place order" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Pay with Paystack" })).toHaveCount(0);
  });
});
