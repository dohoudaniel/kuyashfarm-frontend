"use client";

/**
 * Wholesale / distributor application.
 *
 * Replaces the 663-line prototype form that collected CAC numbers, tax IDs and
 * bank account numbers into `localStorage` (audit §3.5) and then wrote the
 * approval into the *reviewer's* browser, so an approval never reached the
 * applicant on any other device.
 *
 * Deliberate differences from what it replaced:
 *
 *  * **No bank fields.** They were collected up front and never used. Payout
 *    details belong behind the encrypted `/auth/bank-details/` endpoint, after
 *    approval, not in a public form.
 *  * **Sign-in required.** An approval sets `account_type` on a user row. An
 *    anonymous application has nobody to approve, which is precisely why the
 *    prototype's approvals went nowhere.
 *  * **Tier is computed by the server** from the states covered. The prototype
 *    let the applicant pick their own tier.
 *  * **Documents upload after submission**, so a rejected 8 MB PDF never
 *    discards a completed form.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, FileUp, Loader2, Lock, X } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import {
  fromApiFieldErrors,
  isValid,
  validateEmail,
  validateFields,
  validateInteger,
  validateMeaningfulText,
  validatePersonName,
  validatePhone,
  validateStreetAddress,
} from "@/lib/validation";
import {
  listStates,
  listTiers,
  submitApplication,
  uploadDocument,
  type Application,
  type ApplicationType,
  type DocumentType,
  type State,
  type Tier,
} from "@/lib/api/applications";
import { useAuth } from "@/lib/context/AuthContext";

const SPECIALTIES = [
  "Fresh produce",
  "Poultry",
  "Livestock",
  "Fish & seafood",
  "Grains",
  "Processed foods",
];

const VOLUME_BANDS = [
  "Under ₦500,000",
  "₦500,000 – ₦2,000,000",
  "₦2,000,000 – ₦10,000,000",
  "Over ₦10,000,000",
];

const DOCUMENT_LABELS: Record<DocumentType, string> = {
  CAC_CERTIFICATE: "CAC certificate",
  TAX_CLEARANCE: "Tax clearance",
  UTILITY_BILL: "Utility bill",
  OTHER: "Other supporting document",
};

interface Props {
  applicationType: ApplicationType;
  title: string;
  intro: string;
}

export function ApplicationForm({ applicationType, title, intro }: Props) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const isDistributor = applicationType === "DISTRIBUTOR";

  const [states, setStates] = useState<State[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [submitted, setSubmitted] = useState<Application | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [form, setForm] = useState({
    business_name: "",
    business_address: "",
    cac_number: "",
    tax_id: "",
    years_in_business: "",
    monthly_volume_capacity: "",
    retail_network_size: "",
    warehouse_info: "",
    contact_person: "",
    contact_email: "",
    contact_phone: "",
    trade_references: "",
  });
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);

  // Reference data. Both are small and public-ish; failing to load them is not
  // fatal for wholesale, which needs neither.
  useEffect(() => {
    if (!isAuthenticated) return;
    void listStates().then(setStates, () => setStates([]));
    void listTiers().then(setTiers, () => setTiers([]));
  }, [isAuthenticated]);

  // Prefill from the signed-in account rather than making them retype it.
  useEffect(() => {
    if (!user) return;
    setForm((previous) => ({
      ...previous,
      contact_person: previous.contact_person || user.full_name || "",
      contact_email: previous.contact_email || user.email || "",
      contact_phone: previous.contact_phone || user.phone || "",
    }));
  }, [user]);

  const change = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = event.target;
      setForm((previous) => ({ ...previous, [name]: value }));
      setErrors((previous) => {
        if (!previous[name]) return previous;
        const next = { ...previous };
        delete next[name];
        return next;
      });
    },
    [],
  );

  /**
   * A preview of the tier the server will assign, from the same rule the server
   * uses. Shown as an estimate, never sent — the server decides.
   */
  const projectedTier = useMemo(() => {
    if (!isDistributor || selectedStates.length === 0) return null;
    const count = selectedStates.length;
    return (
      tiers.find(
        (tier) =>
          count >= tier.min_states && (tier.max_states === null || count <= tier.max_states),
      ) ?? null
    );
  }, [isDistributor, selectedStates, tiers]);

  const statesByZone = useMemo(() => {
    const grouped = new Map<string, State[]>();
    for (const state of states) {
      const zone = state.zone || "OTHER";
      grouped.set(zone, [...(grouped.get(zone) ?? []), state]);
    }
    return [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [states]);

  function toggle(list: string[], value: string, set: (next: string[]) => void) {
    set(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  /**
   * The rules, mirroring `SubmitApplicationSerializer`.
   *
   * Only what the server actually requires is required here. `cac_number` and
   * `tax_id` are `allow_blank` — plenty of legitimate small traders have
   * neither — so they are checked for shape only when filled in. Demanding
   * them would turn an optional field into a wall.
   *
   * `years_in_business` carries the server's own 0–200 bounds. The API rejects
   * 5000 with a 400 that would otherwise arrive after the whole form was
   * filled in.
   */
  const rules: Record<string, (value: string) => string | undefined> = {
    business_name: (value) => validateMeaningfulText(value, { field: "Business name" }),
    business_address: validateStreetAddress,
    cac_number: (value) =>
      value.trim() ? validateMeaningfulText(value, { minimum: 2, field: "CAC number" }) : undefined,
    tax_id: (value) =>
      value.trim() ? validateMeaningfulText(value, { minimum: 2, field: "Tax ID" }) : undefined,
    years_in_business: (value) =>
      validateInteger(value, { min: 0, max: 200, field: "Years in business" }),
    retail_network_size: (value) =>
      validateInteger(value, { min: 0, field: "Retail network size" }),
    contact_person: validatePersonName,
    contact_email: validateEmail,
    contact_phone: validatePhone,
    // Required for distributors only — the serializer says so, and asking a
    // wholesaler for it would block a form the server would have accepted.
    monthly_volume_capacity: (value) =>
      isDistributor && !value.trim() ? "Tell us roughly how much you move per month." : undefined,
  };

  /** Check one field when it is left, in the shape `FieldErrors` renders. */
  function blur(name: string) {
    const message = rules[name]?.(form[name as keyof typeof form] ?? "");
    setErrors((current) => ({ ...current, [name]: message ? [message] : [] }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError("");

    const problems = validateFields(rules, form);
    // The states picker is not a text field, so it cannot go through
    // `validateFields`, but the server rejects an empty list for distributors.
    if (isDistributor && selectedStates.length === 0) {
      problems.state_ids = "Select the states you can distribute in.";
    }

    if (!isValid(problems)) {
      setErrors(
        Object.fromEntries(Object.entries(problems).map(([field, message]) => [field, [message]])),
      );
      setFormError("Please correct the highlighted fields.");
      document.getElementById(Object.keys(problems)[0]!)?.focus();
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const application = await submitApplication({
        application_type: applicationType,
        business_name: form.business_name.trim(),
        business_address: form.business_address.trim(),
        cac_number: form.cac_number.trim(),
        tax_id: form.tax_id.trim(),
        years_in_business: form.years_in_business ? Number(form.years_in_business) : null,
        state_ids: isDistributor ? selectedStates : [],
        specialty_areas: specialties,
        monthly_volume_capacity: form.monthly_volume_capacity,
        retail_network_size: form.retail_network_size
          ? Number(form.retail_network_size)
          : null,
        warehouse_info: form.warehouse_info.trim(),
        contact_person: form.contact_person.trim(),
        contact_email: form.contact_email.trim(),
        contact_phone: form.contact_phone.trim(),
        trade_references: form.trade_references.trim(),
      });
      setSubmitted(application);
    } catch (caught) {
      if (caught instanceof ApiError) {
        setFormError(caught.message);
        setErrors(
          Object.fromEntries(
            Object.entries(fromApiFieldErrors(caught.fieldErrors)).map(([field, message]) => [
              field,
              [message],
            ]),
          ),
        );
      } else {
        setFormError("We couldn't submit your application. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // An approval writes to a user row. Without one there is nothing to approve —
  // this is the exact hole that made every prototype approval a no-op.
  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        <Lock className="mx-auto mb-4 h-10 w-10 text-[#2d5f3f]" />
        <h2 className="mb-2 font-serif text-2xl font-bold text-[#1a3d2b]">
          Sign in to apply
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          Approval upgrades your account to {isDistributor ? "distributor" : "wholesale"}{" "}
          pricing, so it has to be attached to an account.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/login?next=${encodeURIComponent(isDistributor ? "/become-distributor" : "/become-wholesaler")}`}
            className="rounded-full bg-[#2d5f3f] px-6 py-3 font-semibold text-white hover:bg-[#1a3d2b]"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-full border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Create an account
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return <SubmittedPanel application={submitted} onDone={() => router.push("/profile")} />;
  }

  const fieldClass = (name: string) =>
    `w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2d5f3f]/30 ${
      errors[name] ? "border-red-400" : "border-gray-200"
    }`;

  const FieldErrors = ({ name }: { name: string }) => (
    <>
      {errors[name]?.map((problem) => (
        <p key={problem} className="mt-1 text-xs text-red-500">
          {problem}
        </p>
      ))}
    </>
  );

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="mb-3 font-serif text-3xl font-bold text-[#1a3d2b] md:text-4xl">{title}</h1>
        <p className="text-gray-500">{intro}</p>
      </div>

      {formError && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-8">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-serif text-lg font-bold text-[#1a3d2b]">Your business</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="business_name" className="mb-1 block text-sm font-medium text-gray-700">
                Registered business name *
              </label>
              <input
                id="business_name"
                name="business_name"
                value={form.business_name}
                onChange={change}
                onBlur={() => blur("business_name")}
                aria-invalid={!!errors.business_name?.length}
                required
                className={fieldClass("business_name")}
              />
              <FieldErrors name="business_name" />
            </div>

            <div>
              <label htmlFor="business_address" className="mb-1 block text-sm font-medium text-gray-700">
                Business address *
              </label>
              <textarea
                id="business_address"
                name="business_address"
                value={form.business_address}
                onChange={change}
                onBlur={() => blur("business_address")}
                aria-invalid={!!errors.business_address?.length}
                required
                rows={2}
                className={`${fieldClass("business_address")} resize-none`}
              />
              <FieldErrors name="business_address" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="cac_number" className="mb-1 block text-sm font-medium text-gray-700">
                  CAC number
                </label>
                <input
                  id="cac_number"
                  name="cac_number"
                  value={form.cac_number}
                  onChange={change}
                  onBlur={() => blur("cac_number")}
                  aria-invalid={!!errors.cac_number?.length}
                  placeholder="RC1234567"
                  className={fieldClass("cac_number")}
                />
                <FieldErrors name="cac_number" />
              </div>
              <div>
                <label htmlFor="tax_id" className="mb-1 block text-sm font-medium text-gray-700">
                  Tax ID (TIN)
                </label>
                <input
                  id="tax_id"
                  name="tax_id"
                  value={form.tax_id}
                  onChange={change}
                  onBlur={() => blur("tax_id")}
                  aria-invalid={!!errors.tax_id?.length}
                  className={fieldClass("tax_id")}
                />
                <FieldErrors name="tax_id" />
              </div>
              <div>
                <label
                  htmlFor="years_in_business"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Years trading
                </label>
                <input
                  id="years_in_business"
                  name="years_in_business"
                  type="number"
                  min={0}
                  max={200}
                  value={form.years_in_business}
                  onChange={change}
                  onBlur={() => blur("years_in_business")}
                  aria-invalid={!!errors.years_in_business?.length}
                  className={fieldClass("years_in_business")}
                />
                <FieldErrors name="years_in_business" />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-serif text-lg font-bold text-[#1a3d2b]">
            What you handle
          </h2>

          <p className="mb-3 text-sm font-medium text-gray-700">Product areas</p>
          <div className="mb-6 flex flex-wrap gap-2">
            {SPECIALTIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => toggle(specialties, item, setSpecialties)}
                aria-pressed={specialties.includes(item)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  specialties.includes(item)
                    ? "border-[#2d5f3f] bg-[#2d5f3f] text-white"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="monthly_volume_capacity"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Monthly purchase volume {isDistributor ? "*" : ""}
              </label>
              <select
                id="monthly_volume_capacity"
                name="monthly_volume_capacity"
                value={form.monthly_volume_capacity}
                onChange={change}
                onBlur={() => blur("monthly_volume_capacity")}
                aria-invalid={!!errors.monthly_volume_capacity?.length}
                required={isDistributor}
                className={`${fieldClass("monthly_volume_capacity")} bg-white`}
              >
                <option value="">Select a range</option>
                {VOLUME_BANDS.map((band) => (
                  <option key={band} value={band}>
                    {band}
                  </option>
                ))}
              </select>
              <FieldErrors name="monthly_volume_capacity" />
            </div>

            <div>
              <label
                htmlFor="retail_network_size"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Retail outlets you supply
              </label>
              <input
                id="retail_network_size"
                name="retail_network_size"
                type="number"
                min={0}
                value={form.retail_network_size}
                onChange={change}
                onBlur={() => blur("retail_network_size")}
                aria-invalid={!!errors.retail_network_size?.length}
                className={fieldClass("retail_network_size")}
              />
              <FieldErrors name="retail_network_size" />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="warehouse_info" className="mb-1 block text-sm font-medium text-gray-700">
              Storage and cold chain
            </label>
            <textarea
              id="warehouse_info"
              name="warehouse_info"
              value={form.warehouse_info}
              onChange={change}
              rows={2}
              placeholder="Warehouse size, refrigeration, vehicles…"
              className={`${fieldClass("warehouse_info")} resize-none`}
            />
            <FieldErrors name="warehouse_info" />
          </div>
        </section>

        {isDistributor && (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-2 font-serif text-lg font-bold text-[#1a3d2b]">
              Coverage area *
            </h2>
            <p className="mb-5 text-sm text-gray-500">
              Select every state you can distribute in. Your tier is set from this — we work it
              out, you don&apos;t choose it.
            </p>

            {states.length === 0 ? (
              <p className="text-sm text-gray-400">Loading states…</p>
            ) : (
              <div className="space-y-5">
                {statesByZone.map(([zone, zoneStates]) => (
                  <div key={zone}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      {zone.replace(/_/g, " ").toLowerCase()}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {zoneStates.map((state) => (
                        <button
                          key={state.id}
                          type="button"
                          onClick={() => toggle(selectedStates, state.id, setSelectedStates)}
                          aria-pressed={selectedStates.includes(state.id)}
                          className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                            selectedStates.includes(state.id)
                              ? "border-[#2d5f3f] bg-[#2d5f3f] text-white"
                              : "border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {state.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <FieldErrors name="state_ids" />

            {selectedStates.length > 0 && (
              <div className="mt-5 rounded-lg bg-[#f0f7f3] px-4 py-3 text-sm">
                <span className="text-gray-600">
                  {selectedStates.length} {selectedStates.length === 1 ? "state" : "states"}{" "}
                  selected
                </span>
                {projectedTier && (
                  <span className="ml-2 text-gray-500">
                    — likely <span className="font-semibold text-[#1a3d2b]">{projectedTier.name}</span>{" "}
                    tier. We confirm this during review.
                  </span>
                )}
              </div>
            )}
          </section>
        )}

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-serif text-lg font-bold text-[#1a3d2b]">Contact</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="contact_person" className="mb-1 block text-sm font-medium text-gray-700">
                Contact name *
              </label>
              <input
                id="contact_person"
                name="contact_person"
                value={form.contact_person}
                onChange={change}
                onBlur={() => blur("contact_person")}
                aria-invalid={!!errors.contact_person?.length}
                required
                className={fieldClass("contact_person")}
              />
              <FieldErrors name="contact_person" />
            </div>
            <div>
              <label htmlFor="contact_email" className="mb-1 block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                id="contact_email"
                name="contact_email"
                type="email"
                value={form.contact_email}
                onChange={change}
                onBlur={() => blur("contact_email")}
                aria-invalid={!!errors.contact_email?.length}
                required
                className={fieldClass("contact_email")}
              />
              <FieldErrors name="contact_email" />
            </div>
            <div>
              <label htmlFor="contact_phone" className="mb-1 block text-sm font-medium text-gray-700">
                Phone *
              </label>
              <input
                id="contact_phone"
                name="contact_phone"
                value={form.contact_phone}
                onChange={change}
                onBlur={() => blur("contact_phone")}
                aria-invalid={!!errors.contact_phone?.length}
                required
                className={fieldClass("contact_phone")}
              />
              <FieldErrors name="contact_phone" />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="trade_references" className="mb-1 block text-sm font-medium text-gray-700">
              Trade references
            </label>
            <textarea
              id="trade_references"
              name="trade_references"
              value={form.trade_references}
              onChange={change}
              rows={3}
              placeholder="Suppliers or buyers who can vouch for you — name, business, phone."
              className={`${fieldClass("trade_references")} resize-none`}
            />
            <FieldErrors name="trade_references" />
          </div>
        </section>

        <div className="rounded-2xl border border-gray-200 bg-[#f7f5f0] p-5 text-sm text-gray-600">
          <p className="mb-1 font-semibold text-[#1a3d2b]">We don&apos;t ask for bank details here.</p>
          <p>
            You&apos;ll add payout details from your profile after approval, where they&apos;re
            stored encrypted. Nobody from Kuyash will ever ask for them by email or phone.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#2d5f3f] px-6 py-4 font-semibold text-white transition-colors hover:bg-[#1a3d2b] disabled:opacity-60"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? "Submitting…" : "Submit application"}
        </button>

        <p className="text-center text-xs text-gray-400">
          We usually review within two business days. You&apos;ll hear from us by email either way.
        </p>
      </form>
    </div>
  );
}

/** Post-submission: confirmation plus optional document upload. */
function SubmittedPanel({
  application,
  onDone,
}: {
  application: Application;
  onDone: () => void;
}) {
  const [documents, setDocuments] = useState(application.documents);
  const [uploading, setUploading] = useState<DocumentType | null>(null);
  const [uploadError, setUploadError] = useState("");

  async function onPick(type: DocumentType, file: File | undefined) {
    if (!file) return;
    setUploading(type);
    setUploadError("");
    try {
      const uploaded = await uploadDocument(application.id, type, file);
      setDocuments((previous) => [...previous, uploaded]);
    } catch (caught) {
      setUploadError(
        caught instanceof ApiError ? caught.message : "That upload didn't go through.",
      );
    } finally {
      setUploading(null);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 rounded-2xl bg-white p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-green-600" />
        <h1 className="mb-2 font-serif text-2xl font-bold text-[#1a3d2b]">Application received</h1>
        <p className="mb-1 text-gray-500">
          {application.business_name} — we usually review within two business days.
        </p>
        <p className="text-sm text-gray-400">
          We&apos;ll email {application.contact_email} with the decision.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-1 font-serif text-lg font-bold text-[#1a3d2b]">
          Supporting documents
        </h2>
        <p className="mb-5 text-sm text-gray-500">
          Optional, but they speed up review. PDF or image, up to 10 MB. These are stored
          privately — they are not served publicly.
        </p>

        {uploadError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {uploadError}
          </div>
        )}

        <div className="space-y-3">
          {(Object.keys(DOCUMENT_LABELS) as DocumentType[]).map((type) => {
            const existing = documents.find((document) => document.document_type === type);
            return (
              <div
                key={type}
                className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 px-4 py-3"
              >
                <span className="text-sm text-gray-700">{DOCUMENT_LABELS[type]}</span>
                {existing ? (
                  <span className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="max-w-[12rem] truncate">{existing.original_filename}</span>
                  </span>
                ) : (
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#2d5f3f] hover:underline">
                    {uploading === type ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileUp className="h-4 w-4" />
                    )}
                    {uploading === type ? "Uploading…" : "Upload"}
                    <input
                      type="file"
                      accept=".pdf,image/jpeg,image/png,image/webp"
                      className="hidden"
                      disabled={uploading !== null}
                      onChange={(event) => void onPick(type, event.target.files?.[0])}
                    />
                  </label>
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onDone}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
        >
          <X className="h-4 w-4" /> Done for now
        </button>
      </div>
    </div>
  );
}
