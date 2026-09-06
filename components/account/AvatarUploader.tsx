"use client";

/**
 * The one genuinely customisable thing on the account page.
 *
 * **Validated here as well as on the server, for a reason that is not
 * belt-and-braces.** The server is the authority and refuses the same two
 * things — see `core.uploads` — but it can only refuse them *after* the file
 * has been uploaded. Rejecting a 9 MB photograph on a Nigerian mobile
 * connection costs the customer the whole upload before telling them, and the
 * message arrives long enough later that it reads as a failure rather than as
 * an answer. The check here is about the wait, not about the security.
 *
 * The reverse mistake would be relying on it. Nothing here is trusted: this
 * runs in a browser somebody else controls.
 */

import { useRef, useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";

import { Avatar } from "@/components/account/Avatar";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/context/AuthContext";

/**
 * Ten megabytes, matching `MAX_AVATAR_BYTES` in `accounts/views.py`.
 *
 * Checked here as well as there, and the reason is the wait rather than the
 * security. The server is the authority and refuses the same thing — but only
 * after the whole file has been uploaded, which on a Nigerian mobile
 * connection is a minute the customer does not get back before being told no.
 */
const MAX_BYTES = 10 * 1024 * 1024;

/** Matching `ALLOWED_IMAGE_TYPES` in `core/uploads.py`. SVG is deliberately absent. */
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * What to tell somebody when an upload or a removal fails.
 *
 * Three cases, because they call for three different actions:
 *
 * **503** — object storage is unwell, not us and not them. The server returns
 * this rather than a 500 precisely so the answer can be "try again shortly"
 * instead of "something went wrong", which invites a bug report for an outage
 * nobody here can fix.
 *
 * **Any other `ApiError`** — the server said something specific about this
 * file. Show its words: it knows why, and paraphrasing loses the reason.
 *
 * **Anything else** — the request never got an answer. Usually the connection.
 */
function uploadProblem(caught: unknown, verb: "upload" | "remove" = "upload"): string {
  if (caught instanceof ApiError) {
    if (caught.status === 503) {
      return "Photo storage is temporarily unavailable. Please try again in a moment.";
    }
    return caught.message;
  }
  return `Could not ${verb} that photograph. Check your connection and try again.`;
}

export function AvatarUploader({ onMessage }: { onMessage: (text: string, bad?: boolean) => void }) {
  const { user, setAvatar, clearAvatar } = useAuth();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset immediately, or picking the same file twice after a failure fires
    // no change event and the control appears dead.
    event.target.value = "";
    if (!file) return;

    if (!ACCEPTED.includes(file.type)) {
      onMessage("Choose a JPEG, PNG, WebP or AVIF image.", true);
      return;
    }
    if (file.size > MAX_BYTES) {
      // Says how big it actually is. "Too large" leaves somebody guessing
      // whether trimming a little will do.
      const mb = (file.size / 1024 / 1024).toFixed(1);
      onMessage(`That photograph is ${mb} MB. The limit is 10 MB.`, true);
      return;
    }

    setBusy(true);
    try {
      await setAvatar(file);
      onMessage("Photograph updated.");
    } catch (caught) {
      onMessage(uploadProblem(caught), true);
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    setBusy(true);
    try {
      await clearAvatar();
      onMessage("Photograph removed.");
    } catch (caught) {
      onMessage(uploadProblem(caught, "remove"), true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-end gap-4">
      <div className="relative">
        <Avatar
          src={user?.avatar}
          name={user?.full_name}
          email={user?.email}
          size={96}
          className="ring-4 ring-white"
        />

        {/*
          The label *is* the button. A `<button>` that calls `input.click()`
          works but needs the click handler, and a bare file input cannot be
          styled — a label wired with `htmlFor` gets the pointer, the keyboard
          and the screen-reader name for free.
        */}
        <label
          htmlFor="avatar-file"
          className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-md transition-colors duration-200 hover:bg-secondary focus-within:ring-2 focus-within:ring-accent"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
          <span className="sr-only">Upload a profile photograph</span>
        </label>
        <input
          ref={input}
          id="avatar-file"
          type="file"
          accept={ACCEPTED.join(",")}
          disabled={busy}
          onChange={handleFile}
          className="sr-only"
        />
      </div>

      {user?.avatar && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={busy}
          className="mb-1 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-gray-600 transition-colors duration-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" /> Remove
        </button>
      )}
    </div>
  );
}
