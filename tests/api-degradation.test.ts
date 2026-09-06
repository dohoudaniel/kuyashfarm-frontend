import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The site has to render when the API does not.
 *
 * The API runs on Render's free tier, which spins down after ~15 minutes of
 * inactivity. A spun-down service does not refuse the connection — Render's
 * edge answers **404**, a perfectly successful HTTP exchange. That distinction
 * cost a whole deployment: `fetchPublic` only fell back on a thrown `fetch`,
 * so a 404 raised `ApiError`, `/categories` failed to prerender, and
 * `Export encountered an error ... exiting the build` shipped *nothing* —
 * including every page that needed no data at all.
 *
 * So `offlineFallback` now means "this page can render without me", whatever
 * the reason. These pin each reason separately, because they arrive by
 * different code paths and only one of them was ever handled.
 */

const ORIGINAL = process.env.NEXT_PUBLIC_API_URL;

beforeEach(() => {
  vi.resetModules();
  process.env.NEXT_PUBLIC_API_URL = "https://api.example.test/api/v1";
});

afterEach(() => {
  process.env.NEXT_PUBLIC_API_URL = ORIGINAL;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function client() {
  return await import("@/lib/api/client");
}

/** A `fetch` that behaves the way one specific outage does. */
function fetchThat(behaviour: "throws" | "notFound" | "badGateway" | "html" | "ok") {
  return vi.fn(async () => {
    if (behaviour === "throws") throw new TypeError("fetch failed");
    if (behaviour === "notFound") return new Response("Not Found", { status: 404 });
    if (behaviour === "badGateway") return new Response("Bad Gateway", { status: 502 });
    if (behaviour === "html") {
      return new Response("<html>maintenance</html>", {
        status: 200,
        headers: { "content-type": "text/html" },
      });
    }
    return new Response(JSON.stringify({ success: true, message: "", data: [1, 2], errors: [] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });
}

describe("fetchPublic, when the caller can render without the data", () => {
  it("falls back when the API is unreachable", async () => {
    vi.stubGlobal("fetch", fetchThat("throws"));
    const { fetchPublic } = await client();

    await expect(fetchPublic("/categories/", { offlineFallback: [] })).resolves.toEqual([]);
  });

  it("falls back on a 404 — the spun-down case that broke the build", async () => {
    // Render's edge answers 404 when no instance is running. This is the exact
    // response that took the deployment down.
    vi.stubGlobal("fetch", fetchThat("notFound"));
    const { fetchPublic } = await client();

    await expect(fetchPublic("/categories/", { offlineFallback: [] })).resolves.toEqual([]);
  });

  it("falls back on a 502", async () => {
    vi.stubGlobal("fetch", fetchThat("badGateway"));
    const { fetchPublic } = await client();

    await expect(fetchPublic("/products/", { offlineFallback: [] })).resolves.toEqual([]);
  });

  it("falls back when a 200 is not the envelope we expect", async () => {
    // A proxy's holding page, a login wall, an edge error rendered as HTML.
    // Indistinguishable from an outage to the page, so treated as one.
    vi.stubGlobal("fetch", fetchThat("html"));
    const { fetchPublic } = await client();

    await expect(fetchPublic("/categories/", { offlineFallback: [] })).resolves.toEqual([]);
  });

  it("still returns real data when the API is healthy", async () => {
    // The fallback must not mask a working API.
    vi.stubGlobal("fetch", fetchThat("ok"));
    const { fetchPublic } = await client();

    await expect(fetchPublic("/categories/", { offlineFallback: [] })).resolves.toEqual([1, 2]);
  });
});

describe("fetchPublic, when the caller supplied no fallback", () => {
  it("still throws, so a missing detail page is a real error", async () => {
    // There is no meaningful degraded version of "this specific product".
    // Next's not-found handling is the right answer, and it needs the throw.
    vi.stubGlobal("fetch", fetchThat("notFound"));
    const { fetchPublic, ApiError } = await client();

    await expect(fetchPublic("/products/tomatoes/")).rejects.toBeInstanceOf(ApiError);
  });

  it("propagates an unreachable API too", async () => {
    vi.stubGlobal("fetch", fetchThat("throws"));
    const { fetchPublic } = await client();

    await expect(fetchPublic("/products/tomatoes/")).rejects.toThrow();
  });
});

describe("apiHealthUrl", () => {
  it("points at the health endpoint under the configured base", async () => {
    const { apiHealthUrl } = await client();

    expect(apiHealthUrl()).toBe("https://api.example.test/api/v1/health/");
  });
});

describe("apiReachable", () => {
  it("is true when health answers", async () => {
    vi.stubGlobal("fetch", fetchThat("ok"));
    const { apiReachable } = await client();

    await expect(apiReachable()).resolves.toBe(true);
  });

  it("is false when it does not, rather than throwing into the layout", async () => {
    // This runs in the root layout. An exception here would break every page,
    // which is the opposite of the point.
    vi.stubGlobal("fetch", fetchThat("throws"));
    const { apiReachable } = await client();

    await expect(apiReachable()).resolves.toBe(false);
  });

  it("treats a non-2xx as down", async () => {
    vi.stubGlobal("fetch", fetchThat("badGateway"));
    const { apiReachable } = await client();

    await expect(apiReachable()).resolves.toBe(false);
  });
});
