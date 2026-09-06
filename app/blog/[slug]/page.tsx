import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { fetchPost } from "@/lib/api/blog";
import { ArticleClient } from "./ArticleClient";

/**
 * One article.
 *
 * **This route was missing.** The listing linked to `/blog/{slug}` from three
 * places — the featured card, every card in the grid, and the popular list —
 * and none of them went anywhere: the blog port shipped the index without the
 * article page, so every "read more" on the site was a 404. Nothing failed
 * loudly, because a 404 renders perfectly.
 *
 * A Server Component, so the article is in the HTML that arrives. This is a
 * page people reach from search and share on WhatsApp; rendering the body
 * client-side would leave a crawler with an empty shell and the preview card
 * with nothing to show.
 */

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * The share card and the search result.
 *
 * Generated per post rather than inherited from the layout, because the
 * inherited version titles every article "Blog" — which is what a link to any
 * of them would have said in a WhatsApp preview, the single place this content
 * actually spreads.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const found = await fetchPost(slug);

  if (!found) return { title: "Post not found" };

  const { post } = found;

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.published_at,
      authors: post.author_name ? [post.author_name] : undefined,
      // Falls back to the site-wide card when a post has no cover.
      images: post.cover_image ? [{ url: post.cover_image }] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const found = await fetchPost(slug);

  // A wrong address is a 404, not an empty article. `fetchPost` returns null
  // only when the slug is in neither the API nor the fallback.
  if (!found) notFound();

  return <ArticleClient post={found.post} live={found.live} />;
}
