import { test, expect } from "@playwright/test";

/**
 * Security headers, and the one thing that makes them dangerous.
 *
 * A Content-Security-Policy is the only header on this list that can break the
 * product. The App Router streams its RSC payload through inline `<script>`
 * tags, so a `script-src` without `'unsafe-inline'` (or a nonce) blocks every
 * one of them: the HTML paints, React fails to hydrate with error #412, and
 * nothing on the page works. Every button is dead and the page looks fine.
 *
 * `curl` cannot catch that — only a browser enforces CSP — which is exactly
 * how a policy like this ships broken. These run in a real browser.
 */

test.describe("security headers", () => {
  test("the policy does not break the page it protects", async ({ page }) => {
    const problems: string[] = [];

    page.on("console", (message) => {
      if (/Content Security Policy|CSP/i.test(message.text())) problems.push(message.text());
    });
    page.on("pageerror", (error) => problems.push(`page error: ${error.message}`));

    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    expect(problems, `CSP violations or page errors:\n${problems.join("\n")}`).toEqual([]);
  });

  test("the page is actually interactive, not just painted", async ({ page }) => {
    // Hydration is what a blocked inline script kills, and a page that has not
    // hydrated still *looks* correct. Opening the cart proves React is live.
    await page.goto("/");

    const cart = page.getByRole("button", { name: /cart/i }).first();
    await cart.click();

    await expect(page.getByRole("dialog").or(page.getByText(/your (basket|cart)/i))).toBeVisible({
      timeout: 5000,
    });
  });

  test("the back office cannot be framed", async ({ page }) => {
    // Clickjacking against /admin is the concrete risk: an invisible iframe
    // overlaid with a UI that makes an administrator's clicks land on real
    // back-office buttons — approve an application, refund an order.
    const response = await page.goto("/admin");
    const headers = response?.headers() ?? {};

    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-robots-tag"]).toContain("noindex");
  });

  test("every page carries the baseline headers", async ({ page }) => {
    const response = await page.goto("/login");
    const headers = response?.headers() ?? {};

    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("geolocation=()");
    expect(headers["strict-transport-security"]).toContain("max-age=");

    // The directive that stops injected script phoning home, and the one that
    // stops it posting a signed-in user's data somewhere else.
    const csp = headers["content-security-policy"] ?? "";
    expect(csp).toContain("connect-src");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
  });
});
