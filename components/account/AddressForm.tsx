"use client";

/**
 * Saving a delivery address.
 *
 * The addresses tab could list and delete but never create, so the list was
 * permanently empty and its own empty state said "you can add one at
 * checkout" — which checkout did not do either. A tab that can only delete
 * things that cannot exist.
 *
 * Validation mirrors the checkout address exactly, including the state select
 * backed by `/states/`: shipping is looked up by exact state name, so a typo
 * quietly produces the wrong delivery fee. An address saved with a bad state
 * would carry that error into every future order placed with it.
 */

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { FormField } from "@/components/ui/FormField";
import { FormSelect } from "@/components/ui/FormSelect";
import { ApiError } from "@/lib/api/client";
import { createAddress } from "@/lib/api/auth";
import { listStates, type State } from "@/lib/api/applications";
import type { Address } from "@/lib/api/types";
import {
  fromApiFieldErrors,
  isValid,
  validateCity,
  validateFields,
  validatePersonName,
  validatePhone,
  validatePostalCode,
  validateStreetAddress,
  type FieldErrors,
} from "@/lib/validation";

const EMPTY = {
  label: "",
  recipient_name: "",
  street: "",
  city: "",
  state: "",
  postal_code: "",
  country: "NG",
  phone: "",
};

export function AddressForm({ onSaved }: { onSaved: (address: Address) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [states, setStates] = useState<State[]>([]);
  const [isDefault, setIsDefault] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (open && states.length === 0) {
      listStates().then(setStates).catch(() => undefined);
    }
  }, [open, states.length]);

  const rules = {
    label: (value: string) => (value.trim() ? undefined : "Give it a name, like Home or Shop."),
    recipient_name: validatePersonName,
    street: validateStreetAddress,
    city: validateCity,
    state: (value: string) => (value.trim() ? undefined : "Choose a state."),
    postal_code: validatePostalCode,
    phone: validatePhone,
  };

  function set(field: keyof typeof EMPTY, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
  }

  function blur(field: keyof typeof rules) {
    const message = rules[field](form[field]);
    setFieldErrors((current) => ({ ...current, [field]: message ?? "" }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const problems = validateFields(rules, form);
    if (!isValid(problems)) {
      setFieldErrors(problems);
      document.getElementById(Object.keys(problems)[0]!)?.focus();
      return;
    }

    setBusy(true);
    try {
      const saved = await createAddress({ ...form, is_default: isDefault });
      onSaved(saved);
      setForm(EMPTY);
      setIsDefault(false);
      setOpen(false);
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.message);
        setFieldErrors(fromApiFieldErrors(caught.fieldErrors));
      } else {
        setError("Could not save that address.");
      }
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-secondary"
      >
        Add an address
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-gray-200 p-4">
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Name for this address" name="label" value={form.label}
          onChange={(e) => set("label", e.target.value)} onBlur={() => blur("label")}
          error={fieldErrors.label} required placeholder="Home" />

        <FormField label="Recipient" name="recipient_name" value={form.recipient_name}
          onChange={(e) => set("recipient_name", e.target.value)}
          onBlur={() => blur("recipient_name")} error={fieldErrors.recipient_name}
          required autoComplete="name" />

        <FormField label="Street address" name="street" value={form.street}
          onChange={(e) => set("street", e.target.value)} onBlur={() => blur("street")}
          error={fieldErrors.street} required className="sm:col-span-2"
          autoComplete="street-address" />

        <FormField label="City" name="city" value={form.city}
          onChange={(e) => set("city", e.target.value)} onBlur={() => blur("city")}
          error={fieldErrors.city} required autoComplete="address-level2" />

        {/* A select, not free text: shipping is matched on the exact state
            name, so a saved typo would misprice every order made with it. */}
        {states.length > 0 ? (
          <FormSelect label="State" name="state" value={form.state}
            onChange={(e) => set("state", e.target.value)}
            options={[
              { value: "", label: "Choose a state" },
              ...states.map((entry) => ({ value: entry.name, label: entry.name })),
            ]}
            error={fieldErrors.state} required />
        ) : (
          <FormField label="State" name="state" value={form.state}
            onChange={(e) => set("state", e.target.value)} error={fieldErrors.state} required />
        )}

        <FormField label="Postal code (optional)" name="postal_code" value={form.postal_code}
          onChange={(e) => set("postal_code", e.target.value)} onBlur={() => blur("postal_code")}
          error={fieldErrors.postal_code} autoComplete="postal-code" />

        <FormField label="Phone" name="phone" type="tel" value={form.phone}
          onChange={(e) => set("phone", e.target.value)} onBlur={() => blur("phone")}
          error={fieldErrors.phone} required autoComplete="tel" placeholder="08039876543" />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(event) => setIsDefault(event.target.checked)}
        />
        Use this one by default at checkout
      </label>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-secondary disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Save address
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
