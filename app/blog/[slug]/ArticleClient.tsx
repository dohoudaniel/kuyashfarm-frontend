"use client";

/**
 * The article itself.
 *
 * **The body is rendered as text, never as HTML.** `dangerouslySetInnerHTML`
 * is the obvious way to do this and is not used deliberately: the body is
 * written in the back office, so treating it as markup would make a stored
 * cross-site-scripting hole out of the one field the CSP explicitly does not
 * defend — `script-src` allows `'unsafe-inline'` (see `next.config.ts`), on
 * the stated grounds that there is no `dangerouslySetInnerHTML` anywhere in
 * this codebase. Adding one here would quietly invalidate that reasoning.
 *
 * Paragraphs are split on blank lines, which is what an author typing into a
 * textarea means by a paragraph. Anything richer wants a real editor and a
 * sanitiser, and that decision should be made on purpose rather than arrived
 * at by pasting HTML into a field and finding that it renders.
 */

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";

import type { BlogPost } from "@/lib/api/blog";

/** Blank-line-separated blocks. Empty ones dropped, so extra spacing is free. */
function paragraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
}

export function ArticleClient({ post, live }: { post: BlogPost; live: boolean }) {
  const blocks = paragraphs(post.body);

  return (
    <article className="bg-[#faf8f5]">
      {/* Same wording as the listing, because it is the same situation and a
          reader hitting both should not have to work out whether they are two
          different problems. */}
      {!live && (
        <p role="status" className="bg-amber-50 px-4 py-2 text-center text-xs text-amber-900">
          Showing a recent article. Live updates are briefly unavailable.
        </p>
      )}

      <header className="relative bg-[#080f0a] overflow-hidden">
        {post.cover_image && (
          <div className="absolute inset-0 z-0">
            <Image
              src={post.cover_image}
              alt=""
              fill
              sizes="100vw"
              className="object-cover opacity-25"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#080f0a] to-[#080f0a]/60" />
          </div>
        )}

        <div className="relative z-10 mx-auto max-w-3xl px-6 py-20 md:px-12">
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-2 text-xs font-medium text-[#6b9d7a] transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> All articles
          </Link>

          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-[#6b9d7a]">
            {post.category_label || post.category}
          </p>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-3xl font-bold leading-tight text-white md:text-5xl"
          >
            {post.title}
          </motion.h1>

          <p className="mt-5 text-base leading-relaxed text-white/70">{post.excerpt}</p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/50">
            {post.author_name && (
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {post.author_name}
                {post.author_role && <span className="text-white/30">· {post.author_role}</span>}
              </span>
            )}
            {post.published_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {/*
                  Fixed locale and timezone, not the visitor's.
                  `toLocaleDateString()` with neither renders on the server in
                  the server's zone and in the browser in the reader's, so the
                  two disagree and React abandons the tree — the same
                  hydration failure class as the orbit diagram, arriving by a
                  different route.
                */}
                {new Date(post.published_at).toLocaleDateString("en-NG", {
                  timeZone: "Africa/Lagos",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}
            {post.read_minutes > 0 && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {post.read_minutes} min read
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-16 md:px-12">
        {blocks.length > 0 ? (
          <div className="space-y-6">
            {blocks.map((block, index) => (
              <p
                key={index}
                className="text-base leading-[1.8] text-gray-700 md:text-[17px]"
              >
                {block}
              </p>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-gray-300 py-12 text-center text-sm text-gray-500">
            This piece has no body yet.
          </p>
        )}

        <footer className="mt-16 border-t border-gray-200 pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2d5f3f] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to the blog
          </Link>
        </footer>
      </div>
    </article>
  );
}
