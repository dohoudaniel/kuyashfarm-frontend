"use client";

/**
 * Photographs chosen *before* the product they belong to exists.
 *
 * **Why staging rather than uploading.** The upload endpoint is
 * `/staff/products/{slug}/images/` — it needs a product to attach to, and while
 * the New product form is open there isn't one. So the files are held here, in
 * memory, and `ProductForm` uploads them immediately after the create call
 * returns a slug. Nothing about the API changes; the whole feature is ordering.
 *
 * **The order is the point, not a nicety.** The server makes the *first*
 * uploaded photograph the primary one — the image on the product card and in
 * search results — because otherwise somebody uploads one picture and cannot
 * work out why the card is still empty. That rule is only useful if the person
 * choosing the files can see which one is first, so this list is explicit
 * about it and lets them change it. Picking four photographs and discovering
 * afterwards that the card shows the worst of them is the failure this avoids.
 *
 * **Previews are `blob:` URLs and must be revoked.** Each one pins its file in
 * memory until released, so a shop owner working through thirty products in a
 * sitting would otherwise accumulate every photograph they had looked at.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Star, X } from "lucide-react";

import { cn } from "@/lib/utils";

/** Mirrors `ALLOWED_IMAGE_TYPES` in `core/uploads.py`. SVG is deliberately absent. */
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/** Mirrors `MAX_IMAGE_BYTES`. Ten megabytes: a phone photograph, not a raw file. */
export const MAX_BYTES = 10 * 1024 * 1024;

/**
 * A file with a preview URL bound to it.
 *
 * The URL is created once, when the file is added, rather than during render.
 * `URL.createObjectURL` in a render body mints a new URL on every re-render —
 * each one leaked, and each one causing the thumbnail to flicker as the
 * browser re-fetches it.
 */
export interface StagedPhoto {
  id: string;
  file: File;
  preview: string;
}

export function PhotoPicker({
  photos,
  onChange,
  disabled = false,
}: {
  photos: StagedPhoto[];
  onChange: (photos: StagedPhoto[]) => void;
  disabled?: boolean;
}) {
  const [problem, setProblem] = useState("");
  const input = useRef<HTMLInputElement>(null);

  /*
   * Revoke on unmount only, and read the current list through a ref.
   *
   * The obvious `useEffect(..., [photos])` cleanup is wrong here: it runs on
   * every change, so adding a second photograph revokes the first one's URL
   * while its thumbnail is still on screen, and the image goes blank. Removal
   * revokes its own URL where it happens.
   */
  const latest = useRef(photos);
  useEffect(() => {
    // Synced in an effect rather than written during render: a ref assignment
    // in a render body runs on every render including discarded ones, which is
    // why React forbids it.
    latest.current = photos;
  }, [photos]);
  useEffect(() => {
    return () => {
      for (const photo of latest.current) URL.revokeObjectURL(photo.preview);
    };
  }, []);

  const add = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;

      const accepted: StagedPhoto[] = [];
      const rejected: string[] = [];

      for (const file of Array.from(files)) {
        // The same two rules the server applies. Checking here is about the
        // wait, not about security: the server is still the authority, but it
        // can only refuse *after* the whole file has been sent, which on a
        // Nigerian mobile connection is a minute the person does not get back.
        if (!ACCEPTED_TYPES.includes(file.type)) {
          rejected.push(`${file.name} is not a JPEG, PNG, WebP or AVIF`);
        } else if (file.size > MAX_BYTES) {
          rejected.push(`${file.name} is larger than 10 MB`);
        } else {
          accepted.push({
            // `crypto.randomUUID` rather than the index: React keys have to
            // survive a removal from the middle of the list, and an index does
            // not — the thumbnails after the gap all shift onto the wrong key
            // and the browser reuses the wrong <img>.
            id: crypto.randomUUID(),
            file,
            preview: URL.createObjectURL(file),
          });
        }
      }

      setProblem(rejected.join(". "));
      if (accepted.length) onChange([...photos, ...accepted]);

      // Let the same file be chosen again after a rejection; without this the
      // input holds the old value, fires no change event, and looks broken.
      if (input.current) input.current.value = "";
    },
    [photos, onChange],
  );

  function remove(id: string) {
    const going = photos.find((photo) => photo.id === id);
    if (going) URL.revokeObjectURL(going.preview);
    onChange(photos.filter((photo) => photo.id !== id));
    setProblem("");
  }

  /** Move to the front, which is what makes it the card image on upload. */
  function makeCard(id: string) {
    const chosen = photos.find((photo) => photo.id === id);
    if (!chosen) return;
    onChange([chosen, ...photos.filter((photo) => photo.id !== id)]);
  }

  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-gray-700">Photographs</span>

      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
        {photos.length > 0 && (
          <ul className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {photos.map((photo, index) => (
              <li
                key={photo.id}
                className={cn(
                  "group relative overflow-hidden rounded-lg border bg-white",
                  index === 0 ? "border-green-500 ring-1 ring-green-500" : "border-gray-200",
                )}
              >
                <div className="relative aspect-square">
                  {/*
                    A plain <img>, and `next/image` is not an option here. The
                    source is a `blob:` URL that exists only inside this tab —
                    the optimiser runs on the server and cannot fetch it, so
                    every thumbnail would fail. Nothing is downloaded either
                    way: the bytes are already in memory.
                  */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.preview}
                    alt={photo.file.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => remove(photo.id)}
                  aria-label={`Remove ${photo.file.name}`}
                  className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-gray-600 shadow-sm transition-colors hover:bg-red-50 hover:text-red-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>

                {index === 0 ? (
                  <p className="flex items-center justify-center gap-1 bg-green-50 py-1 text-[11px] font-semibold text-green-700">
                    <Star className="h-3 w-3 fill-current" /> Card image
                  </p>
                ) : (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => makeCard(photo.id)}
                    className="w-full bg-white py-1 text-[11px] font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                  >
                    Make card image
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        <label
          htmlFor="new-product-photos"
          className={cn(
            "flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-within:ring-2 focus-within:ring-green-500",
            disabled && "cursor-not-allowed opacity-60",
          )}
        >
          <ImagePlus className="h-4 w-4" />
          {photos.length === 0 ? "Choose photographs" : "Add more"}
        </label>
        <input
          ref={input}
          id="new-product-photos"
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(",")}
          disabled={disabled}
          onChange={(event) => add(event.target.files)}
          className="sr-only"
        />

        <p className="mt-2 text-xs text-gray-500">
          {photos.length === 0
            ? "Optional — you can add them later. JPEG, PNG, WebP or AVIF, up to 10 MB each."
            : "The first photograph becomes the product card image. They upload once the product is created."}
        </p>

        {problem && (
          <p role="alert" className="mt-2 text-xs text-red-700">
            {problem}.
          </p>
        )}
      </div>
    </div>
  );
}
