import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The blog's data layer.
 *
 * Every test here exists because of one bug, and it is worth stating plainly:
 * `/blog/` is **paginated**, and it was typed as a bare `BlogPost[]`.
 *
 * Nothing failed. TypeScript cannot check a shape that is cast at the network
 * boundary, `posts.length` on the paginated object was `undefined`,
 * `undefined > 0` was `false`, and every request quietly fell through to the
 * hardcoded fallback articles. The page rendered a full, healthy-looking blog
 * — and nothing written in the back office could ever appear on it. The
 * feature was inert from the day it shipped and looked perfect.
 *
 * So these do not test that a fetch happens. They pin the *shape*, in both
 * directions: real posts must come through, and a failure must still degrade
 * to the fallback rather than to a blank marketing page.
 */

const fetchPublic = vi.fn();
vi.mock("@/lib/api/client", () => ({
  fetchPublic: (...args: unknown[]) => fetchPublic(...args),
}));

const { fetchPosts, fetchPost } = await import("@/lib/api/blog");

/** One page of results, shaped exactly as `core.pagination.DefaultPagination`. */
function page(results: unknown[]) {
  return { results, count: results.length, page: 1, pages: 1, next: null, previous: null };
}

const post = {
  id: "1",
  title: "Raising broilers through the harmattan",
  slug: "raising-broilers",
  excerpt: "Cold, dry nights change everything about brooding.",
  body: "First paragraph.\n\nSecond paragraph.",
  category: "POULTRY",
  category_label: "Poultry farming",
  cover_image: "",
  author_name: "Ejiro",
  author_role: "Head of Poultry",
  read_minutes: 6,
  is_featured: true,
  published_at: "2026-08-18T09:00:00Z",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("the published listing", () => {
  it("reads posts out of the paginated envelope", async () => {
    fetchPublic.mockResolvedValue(page([post]));

    const { posts, live } = await fetchPosts();

    expect(live, "a healthy API with posts must not be reported as an outage").toBe(true);
    expect(posts).toHaveLength(1);
    expect(posts[0]!.title).toBe("Raising broilers through the harmattan");
  });

  it("falls back — and says so — when the API cannot be reached", async () => {
    fetchPublic.mockRejectedValue(new Error("ECONNREFUSED"));

    const { posts, live } = await fetchPosts();

    expect(live).toBe(false);
    // An empty blog on a marketing site reads as a broken site.
    expect(posts.length).toBeGreaterThan(0);
  });

  it("falls back when the API is healthy but nothing is published yet", async () => {
    fetchPublic.mockResolvedValue(page([]));

    const { posts, live } = await fetchPosts();

    expect(live).toBe(false);
    expect(posts.length).toBeGreaterThan(0);
  });
});

describe("one article", () => {
  it("returns the post the API gave", async () => {
    fetchPublic.mockResolvedValue(post);

    const found = await fetchPost("raising-broilers");

    expect(found?.live).toBe(true);
    expect(found?.post.title).toBe("Raising broilers through the harmattan");
  });

  it("answers null for a slug nothing has, so the page can 404", async () => {
    // A blank article with a working layout reads as a broken site; a 404
    // reads as a wrong address. The route depends on this being null.
    fetchPublic.mockRejectedValue(new Error("404"));

    expect(await fetchPost("no-such-article-anywhere")).toBeNull();
  });
});
