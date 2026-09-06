import { expect, test } from "@playwright/test";

/**
 * What the site refuses to tell a stranger, verified through the browser.
 *
 * Each of these was closed at the API and checked with curl. That proves the
 * server behaves; it does not prove the *interface* behaves. A page is free to
 * reintroduce an oracle the API carefully avoids — by saying "that email is
 * taken" from a client-side check, say — and no backend test would notice.
 */

const KNOWN_ACCOUNT = "e2e-known@example.com";
const PASSWORD = "AnExampleP4ssword!";

test.describe("account enumeration", () => {
  test.beforeAll(async ({ request }) => {
    // Make sure the "already registered" address really is registered.
    await request.post(`${process.env.E2E_API_URL ?? "http://127.0.0.1:8000/api/v1"}/auth/register/`, {
      data: {
        email: KNOWN_ACCOUNT,
        password: PASSWORD,
        password_confirm: PASSWORD,
        full_name: "Known Person",
      },
      failOnStatusCode: false,
    });
  });

  async function submitRegistration(page: import("@playwright/test").Page, email: string) {
    await page.goto("/register");
    await page.locator("#name").fill("Someone Testing");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(PASSWORD);
    await page.locator("#confirmPassword").fill(PASSWORD);
    await page.getByRole("button", { name: /create account|sign up|register/i }).click();

    // Wait for the outcome rather than for the network to go quiet — the
    // button spends a moment as "Creating account…", and reading the page
    // during it compares a half-submitted form against a finished one.
    await expect(page.getByRole("heading", { name: /check your email/i })).toBeVisible({
      timeout: 20_000,
    });

    return (await page.locator("main").innerText()).replace(email, "<EMAIL>").trim();
  }

  test("signing up says exactly the same thing for a new and an existing address", async ({
    page,
  }) => {
    // The API answers 202 with an identical body either way. If the page
    // distinguishes them — even by rendering a different heading — it becomes
    // the oracle the API refuses to be, and the care taken over login and
    // password reset is wasted.
    const fresh = await submitRegistration(page, `e2e-fresh-${Date.now()}@example.com`);
    const taken = await submitRegistration(page, KNOWN_ACCOUNT);

    expect(taken).toBe(fresh);
    expect(fresh).toMatch(/check your email/i);
  });

  test("signing up does not sign you in", async ({ page }) => {
    // A signed-in response for a new address and an error for an existing one
    // is itself the signal, so registration issues no tokens at all.
    await submitRegistration(page, `e2e-nosession-${Date.now()}@example.com`);

    await expect(page.getByRole("link", { name: /sign in/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /account|profile/i })).toHaveCount(0);
  });

  test("a failed sign-in does not reveal whether the account exists", async ({ page }) => {
    const messages: string[] = [];

    for (const email of [KNOWN_ACCOUNT, `e2e-absent-${Date.now()}@example.com`]) {
      await page.goto("/login");
      await page.getByLabel(/email/i).fill(email);
      await page.getByLabel(/password/i).fill("DefinitelyTheWrongPassword1!");
      await page.getByRole("button", { name: /sign in/i }).click();
      messages.push((await page.getByRole("alert").first().innerText()).trim());
    }

    expect(messages[0]).toBe(messages[1]);
  });

  test("asking for a password reset says the same thing either way", async ({ page }) => {
    const responses: string[] = [];

    for (const email of [KNOWN_ACCOUNT, `e2e-absent-${Date.now()}@example.com`]) {
      await page.goto("/forgot-password");
      await page.getByLabel(/email/i).fill(email);
      await page.getByRole("button", { name: /send reset link/i }).click();
      await expect(page.getByRole("heading", { name: /check your email/i })).toBeVisible();
      responses.push((await page.locator("main").innerText()).replace(email, "<EMAIL>").trim());
    }

    expect(responses[0]).toBe(responses[1]);
  });
});

test.describe("what ships to the browser", () => {
  test("the back-office path is not in any script an anonymous visitor loads", async ({ page }) => {
    // NEXT_PUBLIC_* is inlined at build time, so a value used behind a
    // staff-only condition is still downloaded by everybody. This is the
    // browser-side twin of scripts/check-bundle-secrets.mjs.
    const scripts: string[] = [];
    page.on("response", async (response) => {
      if (response.url().endsWith(".js") && response.status() === 200) {
        scripts.push(await response.text().catch(() => ""));
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    expect(scripts.length).toBeGreaterThan(0);
    for (const body of scripts) {
      expect(body).not.toMatch(/https?:\/\/[^\s"'`]*\/admin\//);
    }
  });

  test("an anonymous visitor is not offered the back office", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /back office/i })).toHaveCount(0);
  });
});
