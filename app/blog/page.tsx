import type { Metadata } from "next";

import { fetchPosts } from "@/lib/api/blog";
import { BlogClient } from "./BlogClient";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Research, practical guides and field-tested insights to help you farm better, smarter and sustainably.",
  openGraph: {
    title: "Kuyash Farms Journal",
    description: "Practical knowledge for modern Nigerian agriculture.",
    type: "website",
  },
};

/**
 * The blog.
 *
 * A Server Component so posts are fetched before the page paints — a blog that
 * arrives empty and fills in a moment later is a blog that looks broken on a
 * slow connection.
 *
 * `Navbar` and `Footer` are deliberately absent: they are mounted once in the
 * root layout by `SiteChrome`. The ported version rendered them here, which is
 * what made the header remount on every navigation.
 *
 * Posts come from the database. `fetchPosts` falls back to the articles in
 * `lib/data/blog.ts` when the API is unreachable, and reports which it used —
 * so an outage degrades the page to stale-but-present rather than blank, and
 * the page can be honest about it rather than passing old content off as new.
 */
export default async function BlogPage() {
  const { posts, live } = await fetchPosts();

  return <BlogClient posts={posts} live={live} />;
}
