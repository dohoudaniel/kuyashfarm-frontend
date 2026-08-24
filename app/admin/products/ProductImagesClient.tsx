"use client";

/**
 * Product photography.
 *
 * The catalogue holds eighteen real products and, until this screen existed,
 * zero photographs — `seed_catalogue` creates none deliberately, because the
 * pictures have to come from the farm. Every product page said "No photograph
 * yet". This is how they get there without a developer.
 *
 * Three things the UI has to make obvious, because each is a rule enforced
 * server-side that is invisible otherwise:
 *
 *  * the **primary** image is the one on the card and in search results;
 *  * the first upload becomes primary automatically, so one photograph is
 *    enough to fix an empty card;
 *  * deleting the primary promotes the next, so a product cannot end up with
 *    a full gallery and a blank card.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Star, Trash2, Upload } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import {
  deleteProduct,
  deleteProductImage,
  listProductImages,
  listStaffCategories,
  listStaffProducts,
  setPrimaryImage,
  uploadProductImage,
  type ProductImage,
  type StaffCategory,
  type StaffProduct,
} from "@/lib/api/admin";
import { ProductForm } from "./ProductForm";
import { BulkTiers } from "./BulkTiers";
import { cn } from "@/lib/utils";

/** Mirrors the server's allow-list, so an obvious refusal happens before the upload. */
const ACCEPTED = "image/jpeg,image/png,image/webp,image/avif";
const MAX_BYTES = 10 * 1024 * 1024;

export default function ProductImagesClient() {
  const [products, setProducts] = useState<StaffProduct[]>([]);
  const [categories, setCategories] = useState<StaffCategory[]>([]);
  const [selected, setSelected] = useState<StaffProduct | null>(null);
  /** "new" while creating, the product while editing, null otherwise. */
  const [editing, setEditing] = useState<StaffProduct | "new" | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fileInput = useRef<HTMLInputElement>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      // The staff listing, not the public one: it includes retired products,
      // which is exactly who somebody is looking for when they search.
      const page = await listStaffProducts({ search: search.trim() || undefined });
      setProducts(page.results);
      setError("");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not load products.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    // Debounced: this fires on every keystroke in the search box otherwise,
    // and the endpoint is paginated and not free.
    const timer = setTimeout(() => void loadProducts(), 300);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  useEffect(() => {
    // Needed before a product can be created — a product must have one.
    listStaffCategories().then(setCategories).catch(() => undefined);
  }, []);

  const openProduct = useCallback(async (product: StaffProduct) => {
    setSelected(product);
    setEditing(null);
    setMessage("");
    setError("");
    try {
      setImages(await listProductImages(product.slug));
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not load the photographs.");
    }
  }, []);

  async function onFiles(files: FileList | null) {
    if (!files?.length || !selected) return;

    setBusy(true);
    setError("");
    setMessage("");

    // Sequential, not `Promise.all`. Each upload decides whether it is the
    // first — and therefore primary — by reading what already exists, so
    // firing them together makes "which one is primary" a race.
    let uploaded = 0;
    try {
      for (const file of Array.from(files)) {
        if (file.size > MAX_BYTES) {
          throw new ApiError(`${file.name} is larger than 10 MB.`, 400);
        }
        await uploadProductImage(selected.slug, file, { altText: selected.name });
        uploaded += 1;
      }
      setMessage(`${uploaded} photograph${uploaded === 1 ? "" : "s"} uploaded.`);
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : "That upload failed. Please try again.",
      );
    } finally {
      // Refresh regardless: a partial failure still uploaded the earlier files,
      // and leaving them off the screen makes it look as though nothing worked.
      setImages(await listProductImages(selected.slug).catch(() => images));
      // Let the same file be chosen again after a failure.
      if (fileInput.current) fileInput.current.value = "";
      setBusy(false);
      void loadProducts();
    }
  }

  async function onSetPrimary(image: ProductImage) {
    if (!selected || image.is_primary) return;
    setBusy(true);
    try {
      await setPrimaryImage(selected.slug, image.id);
      setImages(await listProductImages(selected.slug));
      setMessage("Card photograph updated.");
      void loadProducts();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not update that.");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(image: ProductImage) {
    if (!selected) return;
    if (!confirm("Delete this photograph?")) return;

    setBusy(true);
    try {
      await deleteProductImage(selected.slug, image.id);
      setImages(await listProductImages(selected.slug));
      setMessage("Photograph deleted.");
      void loadProducts();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not delete that.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-600">
            Add and edit what you sell. The first photograph you upload becomes the product card
            image.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing("new");
            setSelected(null);
          }}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-secondary"
        >
          New product
        </button>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <label htmlFor="product-search" className="mb-2 block text-sm font-medium text-gray-700">
            Find a product
          </label>
          <input
            id="product-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tomatoes, DRY-013…"
            className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-green-500"
          />

          {loading ? (
            <p className="py-6 text-center text-sm text-gray-500">
              <Loader2 className="mx-auto h-5 w-5 animate-spin" />
            </p>
          ) : products.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">No products match that.</p>
          ) : (
            <ul className="max-h-[28rem] space-y-1 overflow-y-auto">
              {products.map((product) => (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => void openProduct(product)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm",
                      selected?.id === product.id
                        ? "bg-primary-dark text-white"
                        : "hover:bg-gray-100",
                    )}
                  >
                    <span className="truncate">{product.name}</span>
                    {/* The reason someone opened this screen: which products
                        are still showing an empty card. */}
                    {!product.has_image && (
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[11px]",
                          selected?.id === product.id
                            ? "bg-white/20"
                            : "bg-amber-100 text-amber-800",
                        )}
                      >
                        no photo
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          {editing ? (
            <ProductForm
              /* Remounts when the target changes, so nothing carries over
                 between one product and the next — including photographs
                 staged for a product that was never created. See the note on
                 `ProductForm` itself. */
              key={editing === "new" ? "new" : editing.slug}
              product={editing === "new" ? undefined : editing}
              categories={categories}
              onCancel={() => setEditing(null)}
              onSaved={(saved, note) => {
                setEditing(null);
                // The form's own note when it has one — it is the only thing
                // that knows how many photographs went up, and whether they
                // all did. `openProduct` clears the banner, so this is set
                // after it rather than before.
                void loadProducts();
                void openProduct(saved).then(() =>
                  setMessage(note ?? `${saved.name} saved.`),
                );
              }}
            />
          ) : !selected ? (
            <p className="py-16 text-center text-sm text-gray-500">
              Choose a product to edit it, or add a new one.
            </p>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selected.name}</h2>
                  <p className="text-xs text-gray-500">SKU {selected.sku}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(selected)}
                  className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  Edit details
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm(`Delete ${selected.name}?`)) return;
                    try {
                      await deleteProduct(selected.slug);
                      setSelected(null);
                      setMessage("Product deleted.");
                      void loadProducts();
                    } catch (caught) {
                      // The server refuses once it has been ordered, and names
                      // the alternative. Show that rather than a generic error.
                      setError(
                        caught instanceof ApiError ? caught.message : "Could not delete that.",
                      );
                    }
                  }}
                  className="rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  Delete
                </button>
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-secondary",
                    busy && "cursor-not-allowed opacity-60",
                  )}
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {busy ? "Uploading…" : "Upload photographs"}
                  <input
                    ref={fileInput}
                    type="file"
                    accept={ACCEPTED}
                    multiple
                    disabled={busy}
                    onChange={(event) => void onFiles(event.target.files)}
                    className="sr-only"
                  />
                </label>
                </div>
              </div>

              {images.length === 0 ? (
                <p className="rounded-lg border border-dashed border-gray-300 py-16 text-center text-sm text-gray-500">
                  No photographs yet. The first one you upload becomes the product card image.
                </p>
              ) : (
                <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {images.map((image) => (
                    <li
                      key={image.id}
                      className={cn(
                        "overflow-hidden rounded-xl border",
                        image.is_primary ? "border-green-500 ring-1 ring-green-500" : "border-gray-200",
                      )}
                    >
                      <div className="relative aspect-square bg-gray-100">
                        <Image
                          src={image.image}
                          alt={image.alt_text || selected.name}
                          fill
                          sizes="(max-width: 640px) 50vw, 200px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-1 p-2">
                        {image.is_primary ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-green-700">
                            <Star className="h-3.5 w-3.5 fill-current" /> On the card
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void onSetPrimary(image)}
                            className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 disabled:opacity-50"
                          >
                            <Star className="h-3.5 w-3.5" /> Use on card
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void onDelete(image)}
                          aria-label="Delete photograph"
                          className="text-gray-500 hover:text-red-600 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* Keyed on the slug so switching products builds a fresh panel
                  rather than showing the previous product's tiers until its
                  own request lands. */}
              <BulkTiers key={selected.slug} slug={selected.slug} unit={selected.unit} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
