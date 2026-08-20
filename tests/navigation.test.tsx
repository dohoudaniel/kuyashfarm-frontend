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

  it("the shop is reachable from the homepage", () => {
    /**
     * The guarantee, restated.
     *
     * This used to assert a Shop entry in the nav. The header now follows the
     * frontend redesign, which has no such entry — so the assertion was
     * changed rather than deleted, because the thing worth protecting was
     * never the nav entry itself. It is that somebody landing on the homepage
     * of an e-commerce site can reach the products at all.
     *
     * The hero's primary call to action carries that now. If both it and the
     * nav lose the link, this fails and somebody has to think about it.
     */
    const inNav = NAV_LINKS.some((link) => /shop|product|categor/i.test(link.href));

    const hero = readFileSync(join(COMPONENTS, "sections", "Hero.tsx"), "utf8");
    const inHero = /href="\/(categories|shop)/.test(hero);

    expect(
      inNav || inHero,
      "nothing on the homepage leads to the catalogue — not the nav, not the hero",
    ).toBe(true);
  });

  it("has no duplicate labels or destinations", () => {
    const labels = NAV_LINKS.map((l) => l.label);
    const hrefs = NAV_LINKS.map((l) => l.href);

    expect(new Set(labels).size, "duplicate nav labels").toBe(labels.length);
    expect(new Set(hrefs).size, "two nav entries going to the same place").toBe(hrefs.length);
  });

  it("stays short enough to read", () => {
    /**
     * Seven, raised from six when Shop was added.
     *
     * Not an arbitrary number either time: the desktop bar shares one row with
     * the wordmark, the basket and the account control, and the labels here
     * are short enough that seven still fits at 1280px — verified in a browser
     * rather than assumed. An eighth, or one long label, will wrap, and a
     * wrapped header stops being navigation and becomes a list.
     *
     * If this fails, the answer is almost certainly to drop an entry rather
     * than to raise the number again.
     */
    expect(NAV_LINKS.length).toBeLessThanOrEqual(7);
  });
});
