"use client";

/**
 * Writing and editing a post.
 *
 * **There is no "published" checkbox, and that is the design.** A single
 * `published_at` carries all three states the business actually has: empty is
 * a draft, a past date is live, a future date publishes itself when it
 * arrives. A boolean beside a date would let the two disagree — a post marked
 * published with no date, or dated but hidden — and the public queryset would
 * have to guess which one meant it. The server filters on the date alone, so
 * there is nothing to keep in step.
 *
 * The state is derived and shown back in plain words rather than left for
 * somebody to infer from an ISO string, because "will publish on Monday" and
 * "published on Monday" look identical in a date field and mean opposite
 * things to whoever is about to hit save.
 *
 * **This form is remounted rather than reset.** The parent gives it a `key`
 * tied to the post being edited, so switching rows constructs a fresh
 * component with the right initial state. The alternative — an effect that
 * copies props into state — is the pattern that leaves a half-typed draft
 * sitting in a form now labelled with somebody else's headline.
 */

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { FormField } from "@/components/ui/FormField";
import { FormSelect } from "@/components/ui/FormSelect";
import { FormTextarea } from "@/components/ui/FormTextarea";
import { ApiError } from "@/lib/api/client";
import {
  createPost,
  updatePost,
  POST_CATEGORIES,
  type PostInput,
  type StaffPost,
} from "@/lib/api/admin";
import {
  fromApiFieldErrors,
  isValid,
  validateFields,
  validateMeaningfulText,
  type FieldErrors,
} from "@/lib/validation";

/**
 * ISO instant → the value a `datetime-local` input accepts.
 *
 * That input has no timezone: it shows and returns wall-clock time in the
 * browser's zone. Slicing the ISO string directly would display UTC while
 * labelling it local, so a post scheduled for 9am would show as 8am to an
 * editor in Lagos — an hour out, in the direction nobody checks.
 */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";

  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "";

  const pad = (value: number) => String(value).padStart(2, "0");
  return (
    `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}` +
    `T${pad(at.getHours())}:${pad(at.getMinutes())}`
  );
}

/** The inverse: local wall-clock back to an instant the API can store. */
function toIso(local: string): string | null {
  if (!local.trim()) return null;

  const at = new Date(local);
  return Number.isNaN(at.getTime()) ? null : at.toISOString();
}

function initial(post?: StaffPost): PostInput {
  return {
    title: post?.title ?? "",
    excerpt: post?.excerpt ?? "",
    body: post?.body ?? "",
    category: post?.category ?? "CROPS",
    cover_image: post?.cover_image ?? "",
    author_name: post?.author_name ?? "",
    author_role: post?.author_role ?? "",
    read_minutes: post?.read_minutes ?? 4,
    is_featured: post?.is_featured ?? false,
    published_at: post?.published_at ?? null,
  };
}

interface Props {
  /** Absent when writing something new. */
  post?: StaffPost;
  onSaved: (post: StaffPost) => void;
  onCancel: () => void;
}

export function PostForm({ post, onSaved, onCancel }: Props) {
  const [form, setForm] = useState<PostInput>(() => initial(post));
  const [publishAt, setPublishAt] = useState(() => toLocalInput(post?.published_at ?? null));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const rules = {
    title: (value: string) => validateMeaningfulText(value, { minimum: 6, field: "Title" }),
    excerpt: (value: string) => validateMeaningfulText(value, { minimum: 20, field: "Excerpt" }),
    author_name: (value: string) => (value.trim() ? undefined : "Who wrote it?"),
  };

  function set(field: keyof PostInput, value: string | boolean | number | null) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
  }

  /** What the chosen date means, said out loud. */
  function scheduleLabel(): string {
    if (!publishAt.trim()) return "Saved as a draft. Nobody outside the farm can see it.";

    const at = new Date(publishAt);
    if (Number.isNaN(at.getTime())) return "";

    return at.getTime() > Date.now()
      ? `Scheduled — it appears on the blog by itself on ${at.toLocaleString("en-NG")}.`
      : `Live on the blog, dated ${at.toLocaleString("en-NG")}.`;
  }

  async function submit(event: React.FormEvent, publishNow = false) {
    event.preventDefault();
    setError("");

    const problems = validateFields(rules, form as unknown as Record<string, string>);
    if (!isValid(problems)) {
      setFieldErrors(problems);
      document.getElementById(Object.keys(problems)[0]!)?.focus();
      return;
    }

    // "Publish now" is the same save with the date filled in, not a separate
    // endpoint — one write path means one set of rules about what publishing
    // does, and no way for the two to disagree.
    const payload: Partial<PostInput> = {
      ...form,
      published_at: publishNow ? new Date().toISOString() : toIso(publishAt),
    };

    setBusy(true);
    try {
      const saved = post ? await updatePost(post.slug, payload) : await createPost(payload);
      onSaved(saved);
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.message);
        setFieldErrors(fromApiFieldErrors(caught.fieldErrors));
      } else {
        setError("Could not save that post.");
      }
    } finally {
      setBusy(false);
    }
  }

  const isLive = Boolean(form.published_at) && new Date(form.published_at!).getTime() <= Date.now();

  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">
        {post ? `Edit “${post.title}”` : "New post"}
      </h2>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <FormField
        label="Title"
        name="title"
        value={form.title}
        onChange={(event) => set("title", event.target.value)}
        error={fieldErrors.title}
        required
        placeholder="e.g. Raising broilers through the harmattan"
      />

      {post && (
        // Shown, not editable — see the note on `slug` in lib/api/admin.ts.
        <p className="text-xs text-gray-500">
          Address: <code className="rounded bg-gray-100 px-1.5 py-0.5">/blog/{post.slug}</code> —
          fixed when the post was created, so links already shared keep working.
        </p>
      )}

      <FormTextarea
        label="Excerpt"
        name="excerpt"
        value={form.excerpt}
        rows={2}
        maxLength={400}
        onChange={(event) => set("excerpt", event.target.value)}
        error={fieldErrors.excerpt}
        required
        placeholder="One or two sentences, e.g. Harmattan can halve broiler weight gain. Here is what we changed."
      />

      <FormTextarea
        label="Body"
        name="body"
        value={form.body}
        rows={14}
        onChange={(event) => set("body", event.target.value)}
        placeholder="The article itself — this is what readers see on the post page."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormSelect
          label="Category"
          name="category"
          value={form.category}
          onChange={(event) => set("category", event.target.value)}
          options={POST_CATEGORIES.map((entry) => ({ value: entry.value, label: entry.label }))}
          required
        />

        <FormField
          label="Read time (minutes)"
          name="read_minutes"
          type="number"
          value={String(form.read_minutes)}
          onChange={(event) => set("read_minutes", Number(event.target.value) || 1)}
        />

        <FormField
          label="Author"
          name="author_name"
          value={form.author_name}
          onChange={(event) => set("author_name", event.target.value)}
          error={fieldErrors.author_name}
          required
        />

        <FormField
          label="Author's role"
          name="author_role"
          value={form.author_role}
          onChange={(event) => set("author_role", event.target.value)}
          placeholder="e.g. Head of Poultry"
        />
      </div>

      <FormField
        label="Cover image URL"
        name="cover_image"
        value={form.cover_image}
        onChange={(event) => set("cover_image", event.target.value)}
        placeholder="e.g. https://kuyashfarms.com/images/broiler-house.jpg"
      />
      <p className="-mt-2 text-xs text-gray-500">
        Leave it empty and the card falls back to a placeholder. Only hosts listed in{" "}
        <code className="rounded bg-gray-100 px-1 py-0.5">next.config.ts</code> will load — anything
        else renders blank with the reason only in the server log.
      </p>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <label
          htmlFor="published_at"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Publish date
        </label>
        <input
          id="published_at"
          type="datetime-local"
          value={publishAt}
          onChange={(event) => setPublishAt(event.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-green-500"
        />
        <p className="mt-2 text-xs text-gray-600">{scheduleLabel()}</p>
        {publishAt && (
          <button
            type="button"
            onClick={() => setPublishAt("")}
            className="mt-2 text-xs font-medium text-gray-600 underline hover:text-gray-900"
          >
            Clear the date and keep it as a draft
          </button>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={form.is_featured}
          onChange={(event) => set("is_featured", event.target.checked)}
        />
        Feature this at the top of the blog
      </label>

      <div className="flex flex-wrap gap-2 pt-2">
        <button
          type="submit"
          disabled={busy}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-secondary disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {post ? "Save changes" : "Save"}
        </button>

        {!isLive && (
          <button
            type="button"
            disabled={busy}
            onClick={(event) => void submit(event, true)}
            className="rounded-full border border-primary px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 disabled:opacity-60"
          >
            Save and publish now
          </button>
        )}

        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
