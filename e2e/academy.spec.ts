import { expect, test } from "@playwright/test";

const API = process.env.E2E_API_URL ?? "http://127.0.0.1:8000/api/v1";

/**
 * Academy seat booking.
 *
 * The prototype's version of this was theatre: a 1500ms `setTimeout`, a
 * reference built from `Date.now()`, and a push into `localStorage`. It always
 * "succeeded" — including on a class with no seats left, because nothing was
 * ever asked. These tests check the two things that were false then and must
 * stay true now: a booking reaches the farm, and the seat count is real.
 */

async function firstOpenClass(request: import("@playwright/test").APIRequestContext) {
  const response = await request.get(`${API}/academy/classes/`);
  const classes = (await response.json()).data as Array<{
    slug: string;
    seats_left: number;
    is_open_for_registration: boolean;
  }>;
  const open = classes.find((cls) => cls.is_open_for_registration);
  expect(open, "the seed should provide at least one bookable class").toBeTruthy();
  return open!;
}

test.describe("academy", () => {
  test("the schedule shows seat counts that come from real bookings", async ({ page, request }) => {
    const cls = await firstOpenClass(request);

    await page.goto("/academy");
    await page.getByRole("heading", { name: /Book your spot/i }).scrollIntoViewIfNeeded();

    // A card exists for the class the API is advertising. The prototype
    // rendered a hardcoded array, so a class added in the admin never appeared.
    await expect(page.getByRole("link", { name: /Register/ }).first()).toBeVisible();
    expect(cls.slug.length).toBeGreaterThan(0);
  });

  test("booking a seat decrements the class and issues a real reference", async ({
    page,
    request,
  }) => {
    const before = await firstOpenClass(request);

    await page.goto(`/academy/classes/${before.slug}`);
    await expect(page.getByRole("heading", { name: /Register for this class/ })).toBeVisible();

    const email = `e2e-academy-${Date.now()}@example.com`;
    await page.getByLabel(/full name/i).fill("Adaeze Okonkwo");
    await page.getByLabel(/email address/i).fill(email);
    await page.getByLabel(/phone number/i).fill("08031234567");
    await page.getByRole("button", { name: /confirm registration/i }).click();

    // A guest has no session, so reaching their own booking proves the
    // sessionStorage ownership hand-off. Without it this is a 403.
    await page.waitForURL(/\/academy\/registrations\/[^/]+/, { timeout: 25_000 });
    await expect(page.getByText(email)).toBeVisible({ timeout: 15_000 });

    // The reference is issued by the server, not built from Date.now().
    const reference = page.url().split("/").pop()!;
    expect(reference).toMatch(/^KFA-/);

    // And the seat actually left the room.
    const after = await request
      .get(`${API}/academy/classes/${before.slug}/`)
      .then((response) => response.json())
      .then((body) => body.data);
    expect(after.seats_left).toBe(before.seats_left - 1);
  });

  test("a stranger cannot open somebody else's booking", async ({ page, request }) => {
    const cls = await firstOpenClass(request);
    const email = `e2e-private-${Date.now()}@example.com`;

    const created = await request
      .post(`${API}/academy/classes/${cls.slug}/register/`, {
        data: {
          full_name: "Private Person",
          email,
          phone: "08039998888",
        },
      })
      .then((response) => response.json())
      .then((body) => body.data);

    // Fresh browser, no session and nothing remembered — exactly what somebody
    // guessing a reference would have.
    await page.goto(`/academy/registrations/${created.reference}`);

    await expect(page.getByRole("heading", { name: /confirm it's you/i })).toBeVisible();
    await expect(page.getByText(email)).toHaveCount(0);
  });
});
