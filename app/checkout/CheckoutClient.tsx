"use client";

/**
 * Checkout.
 *
 * Two things are deliberately absent, and both were present before:
 *
 * 1. **No card fields.** The prototype collected full card numbers, expiry
 *    dates and CVVs, validated them client-side, and displayed "Secure
 *    checkout powered by SSL encryption" — with no payment processor behind it
 *    at all (audit §3.5). Payment now happens on Paystack's hosted page, so
 *    card details never touch this application or its server.
 *
 * 2. **No arithmetic.** Every figure comes from `/checkout/quote/`. The
 *    prototype rendered line items at retail price while totalling at bulk
 *    price, so a wholesale customer's own basket did not add up (audit §3.7),
 *    and it hardcoded a free-shipping threshold that contradicted the one the
 *    chatbot quoted.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Banknote, Loader2, Lock, Wallet } from "lucide-react";

import { FormField } from "@/components/ui/FormField";
import { FormSelect } from "@/components/ui/FormSelect";
import { FormTextarea } from "@/components/ui/FormTextarea";
import { ApiError } from "@/lib/api/client";
import { getQuote, getStoreConfig, placeOrder } from "@/lib/api/cart";
import { startPayment } from "@/lib/api/orders";
import { rememberGuestOrder } from "@/lib/api/guest-order";
import { useAuth } from "@/lib/context/AuthContext";
import { useCartStore } from "@/lib/store/useCartStore";
import type { CheckoutQuote, PaymentMethod, StoreConfig } from "@/lib/api/types";
import { formatPrice } from "@/lib/utils";
import { randomUUID } from "@/lib/uuid";
import { listStates, type State } from "@/lib/api/applications";
import { listAddresses } from "@/lib/api/auth";
import type { Address } from "@/lib/api/types";
import {
  fromApiFieldErrors,
  isValid,
  validateCity,
  validateEmail,
  validateFields,
  validatePersonName,
  validatePhone,
  validatePostalCode,
  validateStreetAddress,
  type FieldErrors,
} from "@/lib/validation";

/**
 * A saved address, in the shape the checkout form holds.
 *
 * Named `toFormAddress`, not `useAddress`: anything starting with `use` is a
 * hook by React's rules, and the linter refuses to let one be called inside a
 * callback — correctly, since it would then run conditionally.
 */
function toFormAddress(saved: Address) {
  return {
    recipient_name: saved.recipient_name,
    street: saved.street,
    city: saved.city,
    state: saved.state,
    postal_code: saved.postal_code ?? "",
    country: saved.country || "NG",
    phone: saved.phone,
  };
}

const EMPTY_ADDRESS = {
  recipient_name: "",
  street: "",
  city: "",
  state: "",
  postal_code: "",
  country: "NG",
  phone: "",
};

export default function CheckoutClient() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { cart, load: loadCart } = useCartStore();

  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PAYSTACK");

  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /**
   * One place for both sources of error.
   *
   * Client rules and server rules write to the same state, so a server error
   * cannot be outlived by a stale client error on the same field — which is
   * what happens when the two are kept apart.
   */
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  /**
   * The real states, for the delivery select.
   *
   * This used to be a free-text box, and `_matching_shipping_rule` looks the
   * value up with `state__iexact`. A typo therefore matched no rule and fell
   * through to the stateless fallback, quoting the customer the wrong delivery
   * fee with nothing to show anything had gone wrong.
   */
  const [states, setStates] = useState<State[]>([]);

  /**
   * The customer's saved addresses.
   *
   * Checkout always started from a blank form, so a repeat customer retyped
   * their address every single order — while the profile listed addresses it
   * had no way to create. Both halves of that are fixed: this offers them, and
   * the profile can now save them.
   */
  const [saved, setSaved] = useState<Address[]>([]);

  /**
   * One key per checkout attempt, reused across retries.
   *
   * A double-clicked button or a dropped connection then returns the original
   * order rather than creating a second one and reserving stock twice.
   */
  const idempotencyKey = useMemo(() => randomUUID(), []);

  useEffect(() => {
    void loadCart();
    getStoreConfig().then(setConfig).catch(() => undefined);
    // Best-effort: if this fails the select falls back to a plain text box
    // below rather than blocking checkout on a secondary lookup.
    listStates().then(setStates).catch(() => undefined);
  }, [loadCart]);

  // Only for signed-in customers: a guest has no saved addresses, and the
  // request would 401 on every guest checkout.
  useEffect(() => {
    if (!isAuthenticated) return;
    listAddresses()
      .then((page) => {
        setSaved(page.results);
        // Prefill from the default, if they have one and have not started
        // typing. Overwriting something already entered would be hostile.
        const preferred = page.results.find((entry) => entry.is_default) ?? page.results[0];
        if (preferred) {
          setAddress((current) => (current.street ? current : toFormAddress(preferred)));
        }
      })
      .catch(() => undefined);
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) setEmail((current) => current || user.email);
  }, [user]);

  // Re-quote whenever the delivery state changes: shipping is per-state, and
  // the threshold for free delivery can be overridden per rule.
  const refreshQuote = useCallback(async () => {
    setQuoting(true);
    try {
      setQuote(await getQuote(address.state));
      setError(null);
    } catch (err) {
      setQuote(null);
      if (err instanceof ApiError && err.status !== 400) setError(err.message);
    } finally {
      setQuoting(false);
    }
  }, [address.state]);

  useEffect(() => {
    const timer = setTimeout(() => void refreshQuote(), 300);
    return () => clearTimeout(timer);
  }, [refreshQuote, cart?.updated_at]);

  /**
   * The delivery rules, assembled per attempt.
   *
   * `email` is conditional: a signed-in customer's address comes from their
   * account and the input is disabled, so validating it would reject a form
   * the customer cannot fix. `validateFields` skips an `undefined` rule, which
   * keeps that decision here rather than in two branches.
   */
  function deliveryRules() {
    return {
      recipient_name: validatePersonName,
      email: isAuthenticated ? undefined : validateEmail,
      street: validateStreetAddress,
      city: validateCity,
      state: (value: string) => (value.trim() ? undefined : "Choose a delivery state."),
      postal_code: validatePostalCode,
      phone: validatePhone,
    };
  }

  /** Clear one field's error as it is corrected, so it cannot linger. */
  function clearFieldError(field: string) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  /**
   * Check a single field once the customer has finished with it.
   *
   * Blur rather than change: validating every keystroke declares an email
   * invalid after the first character, which teaches people to ignore the
   * message entirely.
   */
  function validateOnBlur(field: string, value: string) {
    const rule = deliveryRules()[field as keyof ReturnType<typeof deliveryRules>];
    const message = rule?.(value);
    if (message) setFieldErrors((current) => ({ ...current, [field]: message }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    // Check before spending a network round-trip, a reservation and — for
    // Paystack — a redirect away from the site.
    const problems = validateFields(deliveryRules(), { ...address, email });
    if (!isValid(problems)) {
      setFieldErrors(problems);
      setError("Please correct the highlighted fields.");
      // Without this the message can render below the fold on a phone, and the
      // form looks like it silently did nothing.
      document.getElementById(Object.keys(problems)[0]!)?.focus();
      return;
    }

    setSubmitting(true);
    setFieldErrors({});

    try {
      const order = await placeOrder(
        {
          email: isAuthenticated ? undefined : email,
          shipping_address: address,
          payment_method: paymentMethod,
          customer_notes: notes,
        },
        idempotencyKey,
      );

      // A guest has no session, and the API checks ownership before it will
      // show or confirm an order — so remember the email the order was placed
      // with. sessionStorage, not localStorage: this dies with the tab, and it
      // is never needed again.
      if (!isAuthenticated) {
        rememberGuestOrder(order.order_number, email);
      }

      if (paymentMethod === "COD") {
        router.push(`/orders/${order.order_number}?placed=1`);
        return;
      }

      // Hand off to Paystack. We never see the card.
      const payment = await startPayment(order.order_number);
      window.location.href = payment.authorization_url;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(fromApiFieldErrors(err.fieldErrors));
      } else {
        setError("Something went wrong placing your order. Please try again.");
      }
      setSubmitting(false);
    }
  }

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <>
        <main className="min-h-screen bg-gray-50 pt-24 pb-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h1 className="mb-4 text-3xl font-bold text-gray-900">Your cart is empty</h1>
            <p className="mb-8 text-gray-600">Add something before checking out.</p>
            <Link href="/categories" className="rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-secondary">
              Browse products
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link href="/categories" className="mb-8 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" /> Continue shopping
          </Link>

          <h1 className="mb-8 text-3xl font-bold text-gray-900 sm:text-4xl">Checkout</h1>

          {error && (
            <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-xl font-bold text-gray-900">Delivery</h2>

                {saved.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="w-full text-sm font-medium text-gray-700">
                      Use a saved address
                    </span>
                    {saved.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => {
                          setAddress(toFormAddress(entry));
                          setFieldErrors({});
                        }}
                        className="rounded-full border border-gray-300 px-3 py-1.5 text-sm hover:border-primary hover:text-primary"
                      >
                        {entry.label}
                      </button>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField label="Recipient name" name="recipient_name" value={address.recipient_name}
                    onChange={(e) => { setAddress({ ...address, recipient_name: e.target.value }); clearFieldError("recipient_name"); }}
                    onBlur={() => validateOnBlur("recipient_name", address.recipient_name)}
                    error={fieldErrors.recipient_name} required className="md:col-span-2"
                    autoComplete="name" />

                  <FormField label="Email" name="email" type="email" value={email}
                    onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
                    onBlur={() => validateOnBlur("email", email)}
                    error={fieldErrors.email}
                    required disabled={isAuthenticated} className="md:col-span-2"
                    autoComplete="email" />

                  <FormField label="Street address" name="street" value={address.street}
                    onChange={(e) => { setAddress({ ...address, street: e.target.value }); clearFieldError("street"); }}
                    onBlur={() => validateOnBlur("street", address.street)}
                    error={fieldErrors.street} required className="md:col-span-2"
                    autoComplete="street-address" />

                  <FormField label="City" name="city" value={address.city}
                    onChange={(e) => { setAddress({ ...address, city: e.target.value }); clearFieldError("city"); }}
                    onBlur={() => validateOnBlur("city", address.city)}
                    error={fieldErrors.city} required autoComplete="address-level2" />

                  {/* A select, not a text box: shipping is looked up by exact
                      state name, so a typo silently quotes the wrong fee. The
                      text fallback keeps checkout usable if /states/ fails. */}
                  {states.length > 0 ? (
                    <FormSelect label="State" name="state" value={address.state}
                      onChange={(e) => { setAddress({ ...address, state: e.target.value }); clearFieldError("state"); }}
                      options={[
                        { value: "", label: "Choose a state" },
                        ...states.map((entry) => ({ value: entry.name, label: entry.name })),
                      ]}
                      error={fieldErrors.state} required />
                  ) : (
                    <FormField label="State" name="state" value={address.state}
                      onChange={(e) => { setAddress({ ...address, state: e.target.value }); clearFieldError("state"); }}
                      error={fieldErrors.state} required autoComplete="address-level1"
                      placeholder="Lagos" />
                  )}

                  <FormField label="Postal code (optional)" name="postal_code" value={address.postal_code}
                    onChange={(e) => { setAddress({ ...address, postal_code: e.target.value }); clearFieldError("postal_code"); }}
                    onBlur={() => validateOnBlur("postal_code", address.postal_code)}
                    error={fieldErrors.postal_code}
                    autoComplete="postal-code" />

                  <FormField label="Phone" name="phone" type="tel" value={address.phone}
                    onChange={(e) => { setAddress({ ...address, phone: e.target.value }); clearFieldError("phone"); }}
                    onBlur={() => validateOnBlur("phone", address.phone)}
                    error={fieldErrors.phone} required autoComplete="tel"
                    placeholder="08039876543" />
                </div>
              </section>

              <section className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-xl font-bold text-gray-900">Payment</h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <button type="button" onClick={() => setPaymentMethod("PAYSTACK")}
                    className={`rounded-lg border-2 p-4 text-left transition-all ${paymentMethod === "PAYSTACK" ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <Wallet className={`mb-2 h-6 w-6 ${paymentMethod === "PAYSTACK" ? "text-green-600" : "text-gray-400"}`} />
                    <p className="font-semibold">Card or transfer</p>
                    <p className="text-xs text-gray-600">Secured by Paystack</p>
                  </button>

                  {config?.cod_enabled && (
                    <button type="button" onClick={() => setPaymentMethod("COD")}
                      className={`rounded-lg border-2 p-4 text-left transition-all ${paymentMethod === "COD" ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <Banknote className={`mb-2 h-6 w-6 ${paymentMethod === "COD" ? "text-green-600" : "text-gray-400"}`} />
                      <p className="font-semibold">Cash on delivery</p>
                      <p className="text-xs text-gray-600">Pay when it arrives</p>
                    </button>
                  )}
                </div>

                {paymentMethod === "PAYSTACK" && (
                  <p className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                    <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                    You will be taken to Paystack to pay. Your card details are entered there and
                    never reach Kuyash Farm.
                  </p>
                )}
              </section>

              <section className="rounded-2xl bg-white p-6 shadow-sm">
                <FormTextarea label="Order notes (optional)" name="notes" value={notes}
                  onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={500}
                  placeholder="Anything the driver should know?" />
              </section>
            </div>

            <aside className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-xl font-bold text-gray-900">Order summary</h2>

                <ul className="mb-6 max-h-64 space-y-3 overflow-y-auto">
                  {(quote?.lines ?? []).map((line) => (
                    <li key={line.product_slug} className="flex justify-between gap-3 text-sm">
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-gray-900">{line.product_name}</span>
                        <span className="text-xs text-gray-500">
                          {line.quantity} × {formatPrice(line.unit_price)}
                        </span>
                      </span>
                      <span className="font-semibold">{formatPrice(line.line_total)}</span>
                    </li>
                  ))}
                </ul>

                {quote ? (
                  <>
                    <dl className="space-y-3 border-b pb-4 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Subtotal</dt>
                        <dd className="font-semibold">{formatPrice(quote.subtotal)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Delivery</dt>
                        <dd className="font-semibold">
                          {Number(quote.shipping_total) === 0 ? (
                            <span className="text-green-600">FREE</span>
                          ) : (
                            formatPrice(quote.shipping_total)
                          )}
                        </dd>
                      </div>
                      {Number(quote.amount_to_free_shipping) > 0 && (
                        <p className="text-xs text-amber-600">
                          Add {formatPrice(quote.amount_to_free_shipping)} more for free delivery.
                        </p>
                      )}
                      <div className="flex justify-between">
                        <dt className="text-gray-600">
                          VAT ({(Number(quote.tax_rate) * 100).toFixed(1)}%)
                        </dt>
                        <dd className="font-semibold">{formatPrice(quote.tax_total)}</dd>
                      </div>
                    </dl>

                    <div className="mb-6 flex items-center justify-between pt-4">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-green-600">
                        {formatPrice(quote.grand_total)}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="mb-6 flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" /> Calculating…
                  </p>
                )}

                <button type="submit" disabled={submitting || quoting || !quote}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-white hover:bg-secondary disabled:opacity-60">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {submitting ? "Placing order…" : paymentMethod === "COD" ? "Place order" : "Pay with Paystack"}
                </button>

                <p className="mt-4 text-center text-xs text-gray-500">
                  Totals are calculated by Kuyash Farm and confirmed before payment.
                </p>
              </div>
            </aside>
          </form>
        </div>
      </main>
    </>
  );
}
