"use client";

/**
 * Creating and editing a product.
 *
 * Note what is **absent**: any stock field. Stock belongs to the append-only
 * ledger and is reached through Restock and Adjust on the inventory screen, so
 * every unit that ever existed has a movement explaining where it came from. A
 * quantity box here would be the first hole in that, and it is exactly the box
 * somebody would expect to find.
 *
 * The current quantity is shown, read-only, because whoever is editing a
 * product usually wants to know it — and being able to see a number you cannot
 * type into says more clearly than any label that it is derived.
 */

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { FormField } from "@/components/ui/FormField";
import { FormSelect } from "@/components/ui/FormSelect";
import { FormTextarea } from "@/components/ui/FormTextarea";
import { ApiError } from "@/lib/api/client";
import {
  createProduct,
  updateProduct,
  uploadProductImage,
  type ProductInput,
  type StaffCategory,
  type StaffProduct,
} from "@/lib/api/admin";
import { PhotoPicker, type StagedPhoto } from "./PhotoPicker";
import {
  fromApiFieldErrors,
  isValid,
  validateFields,
  validateMeaningfulText,
  type FieldErrors,
} from "@/lib/validation";

const EMPTY: ProductInput = {
  sku: "",
  name: "",
  category: "",
  unit: "",
  base_price: "",
  description: "",
  long_description: "",
  is_active: true,
};

interface Props {
  /** Absent when creating. */
  product?: StaffProduct;
  categories: StaffCategory[];
  /**
   * `note` carries what happened to the photographs, because the caller shows
   * the banner and only this component knows how many uploaded.
   *
   * It is separate from throwing on failure for a reason that matters: by the
   * time an upload can fail, **the product already exists on the server**. A
   * thrown error would leave the form open over a product that had been
   * created, and pressing the button again would try to create it a second
   * time and fail on the duplicate SKU — with the first, real product still
   * sitting there unphotographed and unmentioned.
   */
  onSaved: (product: StaffProduct, note?: string) => void;
  onCancel: () => void;
}

/**
 * **This component is mounted under a `key`** — see `ProductImagesClient`, which
 * passes the product's slug, or `"new"`. Switching what is being edited
 * therefore remounts it and everything below starts empty.
 *
 * It used to reset itself in an effect on `[product]` instead, and that had a
 * real hole in it that only appeared once this form held staged photographs:
 * the effect reset the *fields*, because those were all there was to reset.
 * Choose three photographs while editing tilapia, press Cancel, press New
 * product — the same component instance stays mounted, the effect refills the
 * fields, and the three tilapia photographs are still staged, ready to be
 * uploaded onto whatever is created next. A remount cannot have that class of
 * bug, and it does not need a line adding to it every time this form gains a
 * piece of state.
 */
export function ProductForm({ product, categories, onSaved, onCancel }: Props) {
  const [form, setForm] = useState<ProductInput>(() =>
    product
      ? {
          sku: product.sku,
          name: product.name,
          category: product.category,
          unit: product.unit,
          base_price: product.base_price,
          description: product.description,
          long_description: product.long_description,
          is_active: product.is_active,
        }
      : EMPTY,
  );
  const [photos, setPhotos] = useState<StagedPhoto[]>([]);
  const [busy, setBusy] = useState(false);
  /** What the button says while it works — creating, then uploading which one. */
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const rules = {
    name: (value: string) => validateMeaningfulText(value, { minimum: 2, field: "Name" }),
    sku: (value: string) => (value.trim() ? undefined : "Give it a SKU."),
    category: (value: string) => (value ? undefined : "Choose a category."),
    unit: (value: string) => (value.trim() ? undefined : "Per kg, per dozen, per litre…"),
    base_price: (value: string) => {
      if (!value.trim()) return "Set a price.";
      // Money is a decimal string end to end; this only checks the shape.
      if (!/^\d+(\.\d{1,2})?$/.test(value.trim())) return "Use a number like 3500.00.";
      if (Number(value) <= 0) return "A price must be greater than zero.";
      return undefined;
    },
  };

  function set(field: keyof ProductInput, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const problems = validateFields(rules, form as Record<string, string>);
    if (!isValid(problems)) {
      setFieldErrors(problems);
      document.getElementById(Object.keys(problems)[0]!)?.focus();
      return;
    }

    setBusy(true);

    // ── 1. The product ───────────────────────────────────────────────────
    // On its own, because everything after this point happens to a product
    // that exists, and must not be able to send us back here.
    let saved: StaffProduct;
    setStage(product ? "Saving…" : "Creating…");
    try {
      saved = product ? await updateProduct(product.slug, form) : await createProduct(form);
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.message);
        setFieldErrors(fromApiFieldErrors(caught.fieldErrors));
      } else {
        setError("Could not save that product.");
      }
      setBusy(false);
      setStage("");
      return;
    }

    // ── 2. The photographs ───────────────────────────────────────────────
    const note = photos.length ? await uploadStaged(saved) : undefined;

    setBusy(false);
    setStage("");
    onSaved(saved, note);
  }

  /**
   * Upload the staged photographs against the product that now exists.
   *
   * **Sequential, never `Promise.all`.** Each upload asks the server what is
   * already there to decide whether it is the first — and therefore the
   * primary, card image. Fired together, they all read an empty gallery, and
   * which one ends up on the card becomes a race between four HTTP requests.
   * The existing gallery uploader has the same comment for the same reason.
   * Sequential also means the order shown in the picker is the order stored.
   *
   * **A failure here never rethrows.** The product has already been created.
   * Reporting this as a failed save would be a lie, and would invite a second
   * press of a button that can now only fail on a duplicate SKU — while the
   * real product sits in the catalogue with no photograph and nothing said
   * about it. So it returns a sentence instead, and the caller shows it and
   * opens the product's gallery, where the remaining files can be retried.
   */
  async function uploadStaged(saved: StaffProduct): Promise<string> {
    let uploaded = 0;

    for (const [index, photo] of photos.entries()) {
      setStage(`Uploading ${index + 1} of ${photos.length}…`);
      try {
        await uploadProductImage(saved.slug, photo.file, { altText: saved.name });
        uploaded += 1;
      } catch (caught) {
        const why = caught instanceof ApiError ? caught.message : "the upload failed";
        return uploaded === 0
          ? `${saved.name} was created, but no photograph could be uploaded — ${why}. Add them below.`
          : `${saved.name} was created with ${uploaded} of ${photos.length} photographs — ${why}. Add the rest below.`;
      }
    }

    return `${saved.name} created with ${uploaded} photograph${uploaded === 1 ? "" : "s"}.`;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">
        {product ? `Edit ${product.name}` : "New product"}
      </h2>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Name" name="name" value={form.name ?? ""}
          onChange={(e) => set("name", e.target.value)} error={fieldErrors.name} required />

        <FormField label="SKU" name="sku" value={form.sku ?? ""}
          onChange={(e) => set("sku", e.target.value)} error={fieldErrors.sku} required
          placeholder="e.g. VEG-019" />

        <FormSelect label="Category" name="category" value={form.category ?? ""}
          onChange={(e) => set("category", e.target.value)}
          options={[
            { value: "", label: "Choose a category" },
            ...categories.map((entry) => ({ value: entry.slug, label: entry.name })),
          ]}
          error={fieldErrors.category} required />

        <FormField label="Unit" name="unit" value={form.unit ?? ""}
          onChange={(e) => set("unit", e.target.value)} error={fieldErrors.unit} required
          placeholder="e.g. per kg, per crate, per dozen" />

        <FormField label="Price (₦)" name="base_price" value={form.base_price ?? ""}
          onChange={(e) => set("base_price", e.target.value)}
          error={fieldErrors.base_price} required placeholder="e.g. 3500.00" />

        {/* Shown, not editable. Stock is the ledger's — Restock and Adjust on
            the inventory screen are the only ways in, so that every unit has a
            movement explaining it. */}
        {product && (
          <div>
            <span className="mb-2 block text-sm font-medium text-gray-700">In stock</span>
            <p className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm text-gray-600">
              {product.quantity_on_hand} — change this from Inventory
            </p>
          </div>
        )}
      </div>

      <FormField label="Short description" name="description" value={form.description ?? ""}
        onChange={(e) => set("description", e.target.value)}
        placeholder="One line for the product card, e.g. Sun-ripened and picked this morning." />

      <FormTextarea label="Full description" name="long_description"
        value={form.long_description ?? ""} rows={4} maxLength={2000}
        onChange={(e) => set("long_description", e.target.value)} />

      {/* Creating only. While editing, the gallery below this form is the
          real one — it can reorder, re-primary and delete against images that
          already exist, none of which a staging list can do. Two upload
          controls on one screen would just raise the question of which is
          which. */}
      {!product && (
        <PhotoPicker photos={photos} onChange={setPhotos} disabled={busy} />
      )}

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={form.is_active ?? true}
          onChange={(e) => set("is_active", e.target.checked)} />
        Listed in the shop
      </label>

      <div className="flex gap-2">
        <button type="submit" disabled={busy}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-secondary disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {/* The stage, not just a spinner. Creating a product with four
              photographs on a slow connection is a genuinely long wait, and a
              button that says only "Create product" for twenty seconds is one
              somebody presses again. */}
          {busy && stage ? stage : product ? "Save changes" : "Create product"}
        </button>
        <button type="button" onClick={onCancel}
          className="rounded-full px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900">
          Cancel
        </button>
      </div>

      {!product && (
        <p className="text-xs text-gray-500">
          The product starts with no stock. Add some from Inventory once it has arrived — that
          way every unit has a ledger entry explaining where it came from.
        </p>
      )}
    </form>
  );
}
