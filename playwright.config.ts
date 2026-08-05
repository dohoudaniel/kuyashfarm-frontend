import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests.
 *
 * These exist because everything else in this repo verifies pieces. The Vitest
 * suite proves the HTTP client unwraps an envelope; it cannot prove that a
 * customer can put a tomato in a basket and end up with an order. Until this
 * existed, a broken checkout would have passed every gate.
 *
 * They run against a real Django API and a real Next.js build — no mocking. A
 * test that mocks the API cannot catch the class of bug that has dominated this
 * project: the two sides disagreeing about a contract.
 */

const FRONTEND_PORT = 3100;
const API_URL = process.env.E2E_API_URL ?? "http://127.0.0.1:8000/api/v1";

export default defineConfig({
  testDir: "./e2e",
  // Checkout mutates stock, and stock is global. Parallel workers racing for
  // the same units would produce failures that look like bugs but are the
  // suite fighting itself.
  workers: 1,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],

  timeout: 45_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: `http://127.0.0.1:${FRONTEND_PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  // Both servers are started here so the suite is a single command. `reuse`
  // keeps a dev loop fast locally while always starting clean in CI.
  webServer: [
    {
      // **Builds here rather than assuming a build exists.**
      //
      // `NEXT_PUBLIC_API_URL` is inlined into the client bundle at build time,
      // so passing it only to `next start` does nothing at all — the bundle
      // keeps whatever URL the last `npm run build` baked in, which locally is
      // whatever `.env.local` happens to say.
      //
      // That is not a cosmetic mismatch. Playwright serves from 127.0.0.1, and
      // if the bundle points at a different host the two are cross-site: the
      // `SameSite=Lax` refresh cookie is never sent, every full page load
      // lands signed-out, and the failures read as "the admin pages render
      // nothing" rather than as a cookie problem.
      command: `npx next build && npx next start --port ${FRONTEND_PORT}`,
      url: `http://127.0.0.1:${FRONTEND_PORT}`,
      reuseExistingServer: !process.env.CI,
      // Longer, because this now includes a production build.
      timeout: 300_000,
      env: {
        NEXT_PUBLIC_API_URL: API_URL,
        // Only fetches that supplied an `offlineFallback` render empty; the
        // rest still fail loudly. Never set this in a real deploy.
        NEXT_PRERENDER_OFFLINE: "1",
      },
    },
  ],
});
