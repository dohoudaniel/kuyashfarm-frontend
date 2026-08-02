import { expect, test } from "@playwright/test";

const API = process.env.E2E_API_URL ?? "http://127.0.0.1:8000/api/v1";
const PASSWORD = "AnExampleP4ssword!";

/**
 * The signed-in journey.
 *
 * The guest path is covered elsewhere. This covers what only happens with an
 * account, and in particular the basket merge on sign-in — which is where a
 * customer quietly loses everything they had chosen. It is best-effort in the
 * client (a failed merge is swallowed so it cannot block a sign-in), which is
 * the right call and also exactly why it needs a test: a merge that silently
 * stopped working would look like nothing at all.
 */

/**
 * Registration deliberately does not sign you in, and email verification is a
 * separate step. Creating the account through the API keeps these tests about
 * the signed-in journey rather than about onboarding, which `disclosure.spec`
 * already covers.
 */
async function createVerifiedAccount(
  request: import("@playwright/test").APIRequestContext,
  email: string,
) {
  const response = await request.post(`${API}/auth/register/`, {
    data: { email, password: PASSWORD, password_confirm: PASSWORD, full_name: "Chidi Nwosu" },
  });
  expect(response.status()).toBe(202);
}

async function signIn(page: import("@playwright/test").Page, email: string) {
  await page.goto("/login");

  // Scoped to the form, and awaited before filling. During a client-side
  // navigation React can briefly hold both the outgoing and incoming trees in
  // the DOM, so a bare `#email` occasionally matched twice and failed strict
  // mode — a flake, not a duplicate id: the served HTML has exactly one.
  const form = page.locator("form").filter({ has: page.locator("#password") });
  await expect(form).toBeVisible();

  await form.locator("#email").fill(email);
  await form.locator("#password").fill(PASSWORD);
  await form.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/$|\/categories/, { timeout: 20_000 });
}

test.describe("signed in", () => {
  test("a basket filled as a guest survives signing in", async ({ page, request }) => {
    const email = `e2e-merge-${Date.now()}@example.com`;
    await createVerifiedAccount(request, email);

    // Fill a basket while anonymous.
    await page.goto("/shop/vegetables");
    const add = page.getByRole("button", { name: "Add", exact: true });
    await expect(add.first()).toBeVisible();

    const card = page.locator("article").filter({ has: add.first() }).first();
    const productName = (await card.getByRole("heading").first().innerText()).trim();
    await add.first().click();
    await expect(page.getByRole("button", { name: /^Cart, [1-9]/ })).toBeVisible();

    // Sign in. The guest cart is keyed by X-Cart-Session; the merge folds it
    // into the account rather than discarding it.
    await signIn(page, email);

    await expect(page.getByRole("button", { name: /^Cart, [1-9]/ })).toBeVisible({
      timeout: 15_000,
    });

    // And it is still the same basket, not merely a non-empty one.
    await page.goto("/checkout");
    await expect(page.getByText(productName).first()).toBeVisible({ timeout: 15_000 });
  });

  test("a signed-in customer checks out without retyping their email", async ({
    page,
    request,
  }) => {
    const email = `e2e-signedin-${Date.now()}@example.com`;
    await createVerifiedAccount(request, email);
    await signIn(page, email);

    await page.goto("/shop/vegetables");
    const add = page.getByRole("button", { name: "Add", exact: true });
    await expect(add.first()).toBeVisible();
    await add.first().click();
    await expect(page.getByRole("button", { name: /^Cart, [1-9]/ })).toBeVisible();

    await page.goto("/checkout");

    // The account already supplies the address, so the form does not ask again.
    await expect(page.getByLabel("Email *")).toHaveCount(0);

    await page.getByLabel("Recipient name *").fill("Chidi Nwosu");
    await page.getByLabel("Street address *").fill("22 Awolowo Road");
    await page.getByLabel("City *").fill("Lagos");
    await page.getByLabel("State *").fill("Lagos");
    await page.getByLabel("Phone *").fill("08039876543");

    await page.getByRole("button").filter({ hasText: "Cash on delivery" }).click();
    const placeOrder = page.getByRole("button", { name: "Place order" });
    await expect(placeOrder).toBeEnabled({ timeout: 15_000 });
    await placeOrder.click();

    await page.waitForURL(/\/orders\/[^/]+/, { timeout: 25_000 });

    // The order is on the account, so it appears in their history — a guest
    // has no history at all.
    await page.goto("/orders");
    await expect(page.getByRole("heading", { name: /orders/i }).first()).toBeVisible();
    await expect(page.getByText(/KF-|ORD-/).first()).toBeVisible({ timeout: 15_000 });
  });

  test("signing out genuinely ends the session", async ({ page, request }) => {
    const email = `e2e-signout-${Date.now()}@example.com`;
    await createVerifiedAccount(request, email);
    await signIn(page, email);

    await page.getByRole("button", { name: /account|chidi/i }).first().click();
    await page.getByRole("button", { name: /sign out|log out/i }).click();

    // The prototype's logout deleted a localStorage key and left the token
    // valid. Reloading has to leave us signed out.
    await page.reload();
    await expect(page.getByRole("link", { name: /sign in/i }).first()).toBeVisible();

    // And a protected page must not render account data.
    await page.goto("/orders");
    await expect(page.getByText(/sign in/i).first()).toBeVisible({ timeout: 15_000 });
  });
});
