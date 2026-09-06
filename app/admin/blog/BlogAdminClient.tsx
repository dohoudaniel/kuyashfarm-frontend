"use client";

/**
 * The blog, from the writing side.
 *
 * This screen is why the `BlogPost` table exists. The redesign shipped the
 * blog as a TypeScript file of hardcoded articles, which meant publishing
 * required a developer, a pull request and a deploy — so in practice the farm
 * would never publish. The endpoints landed before this did, which left the
 * same gap wearing a different disguise: the content was in the database and
 * still only reachable by someone willing to hand-craft an HTTP request.
 *
 * Drafts and scheduled posts are listed alongside live ones, deliberately.
 * Hiding them behind a filter is how a piece sits finished-but-unpublished for
 * a month because the date was left empty and nothing ever said so.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Pencil, Plus, RefreshCw, Star, Trash2 } from "lucide-react";

import { DataScreen, ScrollableTable } from "@/components/admin/DataScreen";
import { ApiError } from "@/lib/api/client";
import {
  deletePost,
  listStaffPosts,
  updatePost,
  POST_CATEGORIES,
  type StaffPost,
} from "@/lib/api/admin";
import { PostForm } from "./PostForm";

/** Draft, scheduled or live — derived from the one date, never stored twice. */
function state(post: StaffPost): { label: string; tone: string } {
  if (!post.published_at) return { label: "Draft", tone: "bg-gray-100 text-gray-700" };

  return new Date(post.published_at).getTime() > Date.now()
    ? { label: "Scheduled", tone: "bg-amber-100 text-amber-800" }
    : { label: "Live", tone: "bg-green-100 text-green-800" };
}

function categoryLabel(value: string): string {
  return POST_CATEGORIES.find((entry) => entry.value === value)?.label ?? value;
}

export default function BlogAdminClient() {
  const [posts, setPosts] = useState<StaffPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  /** `null` closed, `undefined` writing something new, a post when editing. */
  const [editing, setEditing] = useState<StaffPost | null | undefined>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Paginated — see the note in lib/api/blog.ts about what typing this as
      // a bare array cost the public page.
      const page = await listStaffPosts();
      setPosts(page.results);
      setError("");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not load the blog.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function saved(post: StaffPost) {
    setEditing(null);
    setMessage(`“${post.title}” saved.`);
    void load();
  }

  async function togglePublished(post: StaffPost) {
    setMessage("");
    const live = post.published_at !== null && new Date(post.published_at).getTime() <= Date.now();

    try {
      await updatePost(post.slug, { published_at: live ? null : new Date().toISOString() });
      setMessage(live ? `“${post.title}” is back to a draft.` : `“${post.title}” is live.`);
      void load();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not change that post.");
    }
  }

  async function remove(post: StaffPost) {
    // Deleting a published post breaks every link to it that exists in the
    // world, so this asks — unlike unpublishing, which is reversible.
    const warning = post.published_at
      ? `Delete “${post.title}”? It is published, so any link to it will stop working. ` +
        `Turning it back into a draft hides it without breaking those links.`
      : `Delete the draft “${post.title}”?`;

    if (!window.confirm(warning)) return;

    setMessage("");
    try {
      await deletePost(post.slug);
      setMessage(`“${post.title}” deleted.`);
      void load();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not delete that post.");
    }
  }

  if (editing !== null) {
    return (
      <div className="space-y-6">
        <PostForm
          // Remounts on a different post rather than copying props into state
          // in an effect. See the note at the top of PostForm.
          key={editing?.slug ?? "new"}
          post={editing}
          onSaved={saved}
          onCancel={() => setEditing(null)}
        />
      </div>
    );
  }

  return (
    <DataScreen
      title="Blog"
      description="Write, schedule and publish. Drafts are listed here too."
      loading={loading}
      error={error}
      message={message}
      empty={posts.length === 0}
      emptyMessage="Nothing written yet. The blog falls back to its built-in articles until the first post is published."
      toolbar={
        <>
          <button
            type="button"
            onClick={() => void load()}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button
            type="button"
            onClick={() => setEditing(undefined)}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-secondary"
          >
            <Plus className="h-4 w-4" /> Write a post
          </button>
        </>
      }
    >
      <ScrollableTable>
        <thead className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Author</th>
            <th className="px-4 py-3">State</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {posts.map((post) => {
            const shown = state(post);
            const live = shown.label === "Live";

            return (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5 font-medium text-gray-900">
                    {post.is_featured && (
                      <Star
                        className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400"
                        aria-label="Featured"
                      />
                    )}
                    {post.title}
                  </span>
                  <span className="line-clamp-1 text-xs text-gray-500">{post.excerpt}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">{categoryLabel(post.category)}</td>
                <td className="px-4 py-3 text-gray-600">
                  {post.author_name}
                  {post.author_role && (
                    <span className="block text-xs text-gray-500">{post.author_role}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${shown.tone}`}
                  >
                    {shown.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString("en-NG")
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {/* Only offered for a post the public can actually reach —
                        a link to a draft is a 404, which reads as a bug. */}
                    {live && (
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        aria-label={`View ${post.title} on the site`}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => void togglePublished(post)}
                      className="rounded-lg px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    >
                      {live ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(post)}
                      aria-label={`Edit ${post.title}`}
                      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(post)}
                      aria-label={`Delete ${post.title}`}
                      className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </ScrollableTable>
    </DataScreen>
  );
}
