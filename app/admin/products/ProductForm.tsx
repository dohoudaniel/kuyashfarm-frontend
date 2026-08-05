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

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { FormField } from "@/components/ui/FormField";
import { FormSelect } from "@/components/ui/FormSelect";
import { FormTextarea } from "@/components/ui/FormTextarea";
import { ApiError } from "@/lib/api/client";
import {
  createProduct,
  updateProduct,
  type ProductInput,
  type StaffCategory,
  type StaffProduct,
} from "@/lib/api/admin";
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
  onSaved: (product: StaffProduct) => void;
  onCancel: () => void;
}

export function ProductForm({ product, categories, onSaved, onCancel }: Props) {
  const [form, setForm] = useState<ProductInput>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    setForm(
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
    setFieldErrors({});
    setError("");
  }, [product]);

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
    try {
      const saved = product
        ? await updateProduct(product.slug, form)
        : await createProduct(form);
      onSaved(saved);
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.message);
        setFieldErrors(fromApiFieldErrors(caught.fieldErrors));
      } else {
        setError("Could not save that product.");
      }
    } finally {
      setBusy(false);
    }
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
          placeholder="VEG-019" />

        <FormSelect label="Category" name="category" value={form.category ?? ""}
          onChange={(e) => set("category", e.target.value)}
          options={[
            { value: "", label: "Choose a category" },
            ...categories.map((entry) => ({ value: entry.slug, label: entry.name })),
          ]}
          error={fieldErrors.category} required />

        <FormField label="Unit" name="unit" value={form.unit ?? ""}
          onChange={(e) => set("unit", e.target.value)} error={fieldErrors.unit} required
          placeholder="per kg" />

        <FormField label="Price (₦)" name="base_price" value={form.base_price ?? ""}
          onChange={(e) => set("base_price", e.target.value)}
          error={fieldErrors.base_price} required placeholder="3500.00" />

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
        placeholder="One line, shown on the product card." />

      <FormTextarea label="Full description" name="long_description"
        value={form.long_description ?? ""} rows={4} maxLength={2000}
        onChange={(e) => set("long_description", e.target.value)} />

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={form.is_active ?? true}
          onChange={(e) => set("is_active", e.target.checked)} />
        Listed in the shop
      </label>

      <div className="flex gap-2">
        <button type="submit" disabled={busy}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-secondary disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {product ? "Save changes" : "Create product"}
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
