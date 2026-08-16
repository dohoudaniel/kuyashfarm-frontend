import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { NAV_LINKS } from "@/lib/constants";

/**
 * The primary navigation must actually go somewhere.
 *
 * Two entries used to point at nothing. `#projects` had no matching section
 * and never had; `#blog` lost its section when three invented articles linking
 * to `href="#"` were deleted, and the nav entry stayed behind. Neither failed
 * loudly — an anchor with no target does not error, the page simply does not
 * move, so a visitor clicks and concludes the site is broken.
 *
 * These read the filesystem rather than mocking it, because the failure is a
 * mismatch between a constant and what exists on disk. A test that mocked the
 * routes would agree with the constant and prove nothing.
 */

const APP = join(process.cwd(), "app");
const COMPONENTS = join(process.cwd(), "components");

/** Every `id="..."` rendered by the homepage and the sections it composes. */
function homepageAnchors(): Set<string> {
  const ids = new Set<string>();
  const files = [
    join(APP, "page.tsx"),
    ...readdirSync(join(COMPONENTS, "sections")).map((f) => join(COMPONENTS, "sections", f)),
  ];

  for (const file of files) {
    if (!existsSync(file) || !file.endsWith(".tsx")) continue;
    for (const match of readFileSync(file, "utf8").matchAll(/id="([a-zA-Z0-9-]+)"/g)) {
      ids.add(match[1]!);
    }
  }
  return ids;
}

/** Whether a route path has a `page.tsx` behind it. */
function routeExists(href: string): boolean {
  const segments = href.split("?")[0]!.split("#")[0]!.split("/").filter(Boolean);
  return existsSync(join(APP, ...segments, "page.tsx"));
}

describe("primary navigation", () => {
  it("every anchor entry has a section to scroll to", () => {
    const anchors = homepageAnchors();
    const broken = NAV_LINKS.filter((link) => link.href.startsWith("#")).filter(
      (link) => !anchors.has(link.href.slice(1)),
    );

    expect(
      broken.map((l) => `${l.label} -> ${l.href}`),
      "nav entries pointing at a section that does not exist",
    ).toEqual([]);
  });

  it("every route entry has a page behind it", () => {
    const broken = NAV_LINKS.filter((link) => !link.href.startsWith("#")).filter(
      (link) => !routeExists(link.href),
    );

    expect(
      broken.map((l) => `${l.label} -> ${l.href}`),
      "nav entries pointing at a route with no page.tsx",
    ).toEqual([]);
  });

  it("links to the shop", () => {
    /**
     * The defect that mattered most. This is an e-commerce site — server-side
     * pricing, wholesale tiers, a stock ledger — and the primary navigation
     * did not link to any of it. A customer landing on the homepage could
     * reach the products only through the hero button.
     */
    const shop = NAV_LINKS.find((link) => /shop|product|categor/i.test(link.label));

    expect(shop, "no nav entry leads to the shop").toBeDefined();
    expect(routeExists(shop!.href)).toBe(true);
  });

  it("has no duplicate labels or destinations", () => {
    const labels = NAV_LINKS.map((l) => l.label);
    const hrefs = NAV_LINKS.map((l) => l.href);

    expect(new Set(labels).size, "duplicate nav labels").toBe(labels.length);
    expect(new Set(hrefs).size, "two nav entries going to the same place").toBe(hrefs.length);
  });

  it("stays short enough to read", () => {
    // Not arbitrary: the desktop bar sits beside a cart, a bell and a sign-in
    // button on one row, and the mobile sheet is thumb-reachable. Past about
    // six it wraps and stops being navigation.
    expect(NAV_LINKS.length).toBeLessThanOrEqual(6);
  });
});
