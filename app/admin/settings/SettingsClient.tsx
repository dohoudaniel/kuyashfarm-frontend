"use client";

/**
 * The store's own levers: settings, delivery fees, categories.
 *
 * Every one of these was a Django Admin form, and Django Admin is off in
 * production — so the free-shipping threshold, the support phone number and
 * the delivery fee for every state were business decisions that needed a
 * developer.
 *
 * Two things the copy has to say out loud, because both are invisible:
 *
 *  * **The threshold is read by everything**, including the support chat. The
 *    two once disagreed at ₦80,000 and ₦200,000 because each had its own
 *    hardcoded copy; changing it here changes it everywhere at once.
 *  * **A shipping rule for a state that does not exist never applies.** The
 *    lookup is by exact name, so the customer is quietly charged the
 *    nationwide rate. The server refuses an unknown state — this says why
 *    before somebody types one.
 */

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import {
  createCategory,
  createShippingRule,
  createTaxRule,
  deleteCategory,
  deleteShippingRule,
  getSettings,
  listShippingRules,
  listStaffCategories,
  listTaxRules,
  updateSettings,
  updateTaxRule,
  type ShippingRule,
  type SiteSettings,
  type TaxRule,
  type StaffCategory,
} from "@/lib/api/admin";
import { listStates, type State } from "@/lib/api/applications";
import { DataScreen } from "@/components/admin/DataScreen";
import { FormField } from "@/components/ui/FormField";
import { FormSelect } from "@/components/ui/FormSelect";
import { formatPrice } from "@/lib/utils";

export default function SettingsClient() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [rules, setRules] = useState<ShippingRule[]>([]);
  const [categories, setCategories] = useState<StaffCategory[]>([]);
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
  const [states, setStates] = useState<State[]>([]);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [newRule, setNewRule] = useState({ name: "", state: "", flat_rate: "" });
  const [newCategory, setNewCategory] = useState("");
  const [newTax, setNewTax] = useState({ name: "", rate: "", effective_from: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [fetched, fetchedRules, fetchedCategories, fetchedTax] = await Promise.all([
        getSettings(),
        listShippingRules(),
        listStaffCategories(),
        listTaxRules(),
      ]);
      setSettings(fetched);
      setRules(fetchedRules);
      setCategories(fetchedCategories);
      setTaxRules(fetchedTax);
      setError("");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not load the settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    // Best-effort: the state select falls back to a text box if this fails.
    listStates().then(setStates).catch(() => undefined);
  }, [load]);

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setMessage("");
    try {
      await action();
      setMessage(success);
      void load();
    } catch (caught) {
      // The server's refusals here are specific and worth showing verbatim —
      // "we don't recognise that state", "products are still in this category".
      setError(caught instanceof ApiError ? caught.message : "That did not work.");
    } finally {
      setBusy(false);
    }
  }

  function field(key: keyof SiteSettings, value: string | boolean | number) {
    setSettings((current) => (current ? { ...current, [key]: value } : current));
  }

  return (
    <DataScreen
      title="Store settings"
      description="Business levers. Everything here takes effect the moment it is saved."
      loading={loading}
      error={error}
      message={message}
    >
      <div className="space-y-6">
        {settings && (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-1 font-semibold text-gray-900">The shop</h2>
            <p className="mb-4 text-sm text-gray-600">
              The free-delivery threshold is read by checkout, the quote endpoint and the support
              chat. They once quoted different figures because each had its own copy.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Free delivery over (₦)"
                name="free_shipping_threshold"
                value={settings.free_shipping_threshold}
                onChange={(e) => field("free_shipping_threshold", e.target.value)}
              />
              <FormField
                label="Support phone"
                name="support_phone"
                type="tel"
                value={settings.support_phone}
                onChange={(e) => field("support_phone", e.target.value)}
                placeholder="08039876543"
              />
              <FormField
                label="Support email"
                name="support_email"
                type="email"
                value={settings.support_email}
                onChange={(e) => field("support_email", e.target.value)}
              />
              <FormField
                label="Basket holds stock for (minutes)"
                name="reservation_minutes"
                type="number"
                value={String(settings.reservation_minutes)}
                onChange={(e) => field("reservation_minutes", Number(e.target.value))}
              />
            </div>

            <p className="mt-2 text-xs text-gray-500">
              Too short and a customer loses their basket while finding their card. Too long and
              abandoned checkouts hold stock nobody else can buy.
            </p>

            <div className="mt-4 flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={settings.cod_enabled}
                  onChange={(e) => field("cod_enabled", e.target.checked)}
                />
                Offer cash on delivery
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={settings.guest_checkout_enabled}
                  onChange={(e) => field("guest_checkout_enabled", e.target.checked)}
                />
                Allow checkout without an account
              </label>
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={() =>
                void run(
                  () =>
                    updateSettings({
                      free_shipping_threshold: settings.free_shipping_threshold,
                      support_phone: settings.support_phone,
                      support_email: settings.support_email,
                      reservation_minutes: settings.reservation_minutes,
                      cod_enabled: settings.cod_enabled,
                      guest_checkout_enabled: settings.guest_checkout_enabled,
                    }),
                  "Saved. This is live everywhere now.",
                )
              }
              className="mt-4 flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-secondary disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Save settings
            </button>
          </section>
        )}

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-1 font-semibold text-gray-900">Delivery fees</h2>
          <p className="mb-4 text-sm text-gray-600">
            A rule with no state is the nationwide fallback. A rule naming a state only applies if
            that state matches exactly — which is why it is chosen from a list rather than typed.
          </p>

          <ul className="mb-4 divide-y divide-gray-100">
            {rules.map((rule) => (
              <li key={rule.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span>
                  <strong>{rule.name}</strong>{" "}
                  <span className="text-gray-500">
                    {rule.state || "nationwide"} · {formatPrice(rule.flat_rate)}
                  </span>
                </span>
                <button
                  type="button"
                  aria-label={`Delete ${rule.name}`}
                  onClick={() => void run(() => deleteShippingRule(rule.id), "Rule removed.")}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
            {rules.length === 0 && (
              <li className="py-2 text-sm text-gray-500">
                No rules yet — every order uses the nationwide default.
              </li>
            )}
          </ul>

          <div className="flex flex-wrap items-end gap-3">
            <FormField
              label="Name"
              name="rule_name"
              value={newRule.name}
              onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              placeholder="Lagos same-day"
            />
            {states.length > 0 ? (
              <FormSelect
                label="State"
                name="rule_state"
                value={newRule.state}
                onChange={(e) => setNewRule({ ...newRule, state: e.target.value })}
                options={[
                  { value: "", label: "Nationwide" },
                  ...states.map((entry) => ({ value: entry.name, label: entry.name })),
                ]}
              />
            ) : (
              <FormField
                label="State"
                name="rule_state"
                value={newRule.state}
                onChange={(e) => setNewRule({ ...newRule, state: e.target.value })}
              />
            )}
            <FormField
              label="Fee (₦)"
              name="rule_rate"
              value={newRule.flat_rate}
              onChange={(e) => setNewRule({ ...newRule, flat_rate: e.target.value })}
              placeholder="2000.00"
            />
            <button
              type="button"
              disabled={busy || !newRule.name || !newRule.flat_rate}
              onClick={() =>
                void run(async () => {
                  await createShippingRule(newRule);
                  setNewRule({ name: "", state: "", flat_rate: "" });
                }, "Rule added.")
              }
              className="flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-secondary disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Add rule
            </button>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-1 font-semibold text-gray-900">Categories</h2>
          <p className="mb-4 text-sm text-gray-600">
            A category with products in it cannot be deleted — move them first, or deactivate it.
          </p>

          <ul className="mb-4 divide-y divide-gray-100">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex items-center justify-between gap-3 py-2 text-sm"
              >
                <span>
                  <strong>{category.name}</strong>{" "}
                  <span className="text-gray-500">
                    {category.product_count} product{category.product_count === 1 ? "" : "s"}
                    {!category.is_active && " · hidden"}
                  </span>
                </span>
                <button
                  type="button"
                  aria-label={`Delete ${category.name}`}
                  onClick={() => void run(() => deleteCategory(category.slug), "Category removed.")}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-end gap-3">
            <FormField
              label="New category"
              name="category_name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Herbs & spices"
            />
            <button
              type="button"
              disabled={busy || newCategory.trim().length < 2}
              onClick={() =>
                void run(async () => {
                  await createCategory({ name: newCategory.trim() });
                  setNewCategory("");
                }, "Category added.")
              }
              className="flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-secondary disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-1 font-semibold text-gray-900">Tax</h2>
          <p className="mb-4 text-sm text-gray-600">
            Rates are dated, because an order placed last year was taxed at last year&apos;s rate
            and its total has to keep reconciling. To retire a rate, give it an end date — deleting
            it leaves historic orders with a figure nothing explains.
          </p>

          <ul className="mb-4 divide-y divide-gray-100">
            {taxRules.map((rule) => (
              <li key={rule.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span>
                  <strong>{rule.name}</strong>{" "}
                  <span className="text-gray-500">
                    {/* Stored as a fraction; shown as the percentage people
                        talk in, so nobody enters 7.5 meaning 750%. */}
                    {(Number(rule.rate) * 100).toFixed(2)}% · from{" "}
                    {new Date(rule.effective_from).toLocaleDateString("en-NG")}
                    {rule.effective_to
                      ? ` to ${new Date(rule.effective_to).toLocaleDateString("en-NG")}`
                      : " · current"}
                  </span>
                </span>
                {!rule.effective_to && (
                  <button
                    type="button"
                    onClick={() => {
                      const ends = prompt("End this rate on which date? (yyyy-mm-dd)");
                      if (!ends) return;
                      void run(
                        () => updateTaxRule(rule.id, { effective_to: ends }),
                        "Rate end-dated. Historic orders keep the figure they were taxed at.",
                      );
                    }}
                    className="rounded-lg border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50"
                  >
                    End it
                  </button>
                )}
              </li>
            ))}
            {taxRules.length === 0 && (
              <li className="py-2 text-sm text-gray-500">No tax rate configured.</li>
            )}
          </ul>

          <div className="flex flex-wrap items-end gap-3">
            <FormField
              label="Name"
              name="tax_name"
              value={newTax.name}
              onChange={(e) => setNewTax({ ...newTax, name: e.target.value })}
              placeholder="VAT"
            />
            <FormField
              label="Rate (%)"
              name="tax_rate"
              value={newTax.rate}
              onChange={(e) => setNewTax({ ...newTax, rate: e.target.value })}
              placeholder="7.5"
            />
            <FormField
              label="Applies from"
              name="tax_from"
              type="text"
              value={newTax.effective_from}
              onChange={(e) => setNewTax({ ...newTax, effective_from: e.target.value })}
              placeholder="2026-01-01"
            />
            <button
              type="button"
              disabled={busy || !newTax.name || !newTax.rate || !newTax.effective_from}
              onClick={() =>
                void run(async () => {
                  await createTaxRule({
                    name: newTax.name,
                    // Typed as a percentage, stored as a fraction. The server
                    // refuses anything above 1, so 7.5 would be rejected — but
                    // converting here means nobody has to know that.
                    rate: String(Number(newTax.rate) / 100),
                    effective_from: newTax.effective_from,
                  });
                  setNewTax({ name: "", rate: "", effective_from: "" });
                }, "Tax rate added.")
              }
              className="flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-secondary disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Add rate
            </button>
          </div>
        </section>
      </div>
    </DataScreen>
  );
}
