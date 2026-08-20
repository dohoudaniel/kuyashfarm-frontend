/**
 * Blog posts.
 *
 * Published posts come from the database and are written in the back office.
 * `fetchPosts` falls back to `lib/data/blog.ts` when the API cannot be
 * reached, so a backend outage degrades a marketing page to stale-but-present
 * rather than to a blank screen — a blog with nothing on it reads as a broken
 * site, where a slightly old one reads as a quiet week.
 *
 * The fallback is deliberately *only* for failure. It is never merged with
 * live posts: two sources on one page means nobody can tell which article is
 * real, and an old hardcoded piece would outrank something just published.
 */

import { fetchPublic } from "@/lib/api/client";
import type { Paginated } from "@/lib/api/types";
import { BLOG_POSTS, type FallbackBlogPost } from "@/lib/data/blog";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: string;
  category_label: string;
  cover_image: string;
  author_name: string;
  author_role: string;
  read_minutes: number;
  is_featured: boolean;
  published_at: string;
}

/** Shape the fallback like the API so the page renders one thing. */
function asPost(post: FallbackBlogPost): BlogPost {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    body: post.content ?? "",
    category: post.category.toUpperCase(),
    category_label: post.category,
    cover_image: post.image,
    author_name: post.author,
    author_role: post.authorRole,
    read_minutes: Number.parseInt(post.readTime, 10) || 4,
    is_featured: Boolean(post.featured),
    published_at: post.date,
  };
}

/**
 * Published posts, newest first.
 *
 * Returns `{ posts, live }`. `live` is false when the fallback was used, so
 * the page can say so rather than presenting stale content as current — the
 * one thing worse than an outage is not knowing you are looking at one.
 */
export async function fetchPosts(): Promise<{ posts: BlogPost[]; live: boolean }> {
  try {
    /**
     * **Paginated, and typing it as an array was a silent outage.**
     *
     * `/blog/` sets no `pagination_class = None`, so it answers with
     * `{results, count, page, pages, next, previous}` — not the bare array
     * seven other endpoints return. This was typed as `BlogPost[]`, which
     * TypeScript could not catch because the value is cast at the network
     * boundary, not inspected.
     *
     * The failure was invisible in the worst way: `posts.length` on an object
     * is `undefined`, `undefined > 0` is `false`, so every request fell
     * through to the hardcoded fallback. The page rendered articles, looked
     * entirely healthy, and **nothing written in the back office could ever
     * appear on it** — the exact bug the blog was built to eliminate.
     */
    const page = await fetchPublic<Paginated<BlogPost>>("/blog/", {
      offlineFallback: { results: [], count: 0, page: 1, pages: 0, next: null, previous: null },
    });

    // An empty list from a *healthy* API means nothing is published yet, which
    // is a real answer — but on a marketing site an empty blog is worse than
    // a stale one, so the fallback covers it too.
    if (page.results.length > 0) return { posts: page.results, live: true };
  } catch {
    // Falls through to the fallback below.
  }

  return { posts: BLOG_POSTS.map(asPost), live: false };
}

/**
 * One post, by slug.
 *
 * Returns `null` when nothing has that slug, so the page can answer 404
 * rather than render an empty article — a blank post with a working layout
 * reads as a broken site, where a 404 reads as a wrong address.
 *
 * The fallback applies here too, and for the same reason as the listing: if
 * the API is down, a visitor following a link from the listing must not land
 * on an error. Fallback entries carry no body — they were written as cards,
 * not articles — so the excerpt stands in, which is honest about there being
 * nothing more rather than pretending the article failed to load.
 */
export async function fetchPost(slug: string): Promise<{ post: BlogPost; live: boolean } | null> {
  try {
    const post = await fetchPublic<BlogPost>(`/blog/${slug}/`);
    return { post, live: true };
  } catch {
    // A 404 from a healthy API and an unreachable API are indistinguishable
    // here, and both are answered the same way: look in the fallback, and if
    // it is not there either, the address is wrong.
  }

  const fallback = BLOG_POSTS.find((entry) => entry.slug === slug);
  if (!fallback) return null;

  const post = asPost(fallback);
  return { post: { ...post, body: post.body || fallback.excerpt }, live: false };
}
