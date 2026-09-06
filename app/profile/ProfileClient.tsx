"use client";

/**
 * Account.
 *
 * The prototype's version was hardcoded: every visitor saw "John Doe",
 * john.doe@example.com, a stock avatar and two addresses in New York and
 * Brooklyn (audit §3.6). It never read the signed-in user at all, and its
 * "save" handler set a flag with a comment saying to wire it up later.
 *
 * **On the colours.** This screen used to be built from Tailwind's default
 * palette — `bg-gray-50`, `text-green-600`, `focus:ring-green-500` — none of
 * which is a brand colour. Tailwind's `green-600` is `#16a34a`, a bright
 * grass green; the brand's `--primary-green` is `#2d5f3f`, a deep forest one.
 * They are far enough apart to read as two different products, which is most
 * of why the page felt like a scaffold rather than a screen. Everything
 * structural now comes from the tokens in `globals.css`.
 *
 * Semantic colour is deliberately still Tailwind's: amber for pending, red for
 * a rejection, green for an approval. Those mean *state*, not brand, and a
 * rejection rendered in the brand's own green would be actively misleading.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Briefcase,
  GraduationCap,
  Loader2,
  MapPin,
  Settings,
  Trash2,
  User as UserIcon,
} from "lucide-react";

import { FormField } from "@/components/ui/FormField";
import { AvatarUploader } from "@/components/account/AvatarUploader";
import { TwoFactorSection } from "@/components/account/TwoFactorSection";
import { AddressForm } from "@/components/account/AddressForm";
import { ApiError } from "@/lib/api/client";
import {
  isValid,
  validateFields,
  validatePassword,
  validatePasswordConfirmation,
  validatePersonName,
  validatePhone,
  type FieldErrors,
} from "@/lib/validation";
import * as authApi from "@/lib/api/auth";
import { useAuth } from "@/lib/context/AuthContext";
import type { AccountType, Address } from "@/lib/api/types";
import { myApplications, type Application } from "@/lib/api/applications";
import { myRegistrations, type Registration } from "@/lib/api/academy";
import { cn, formatPrice } from "@/lib/utils";

type Tab = "profile" | "addresses" | "applications" | "academy" | "settings";

const APPLICATION_TONE: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  UNDER_REVIEW: "bg-blue-100 text-blue-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  WITHDRAWN: "bg-gray-200 text-gray-700",
};

const REGISTRATION_TONE: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-green-100 text-green-800",
  ATTENDED: "bg-blue-100 text-blue-800",
  CANCELLED: "bg-gray-200 text-gray-700",
  NO_SHOW: "bg-gray-200 text-gray-700",
};

/**
 * What the account type is called to the person who has it.
 *
 * `account_type` governs pricing and nothing else — being a wholesaler grants
 * no admin rights — so this says what it actually buys you rather than naming
 * the enum. "WHOLESALE_PENDING" in a chip on somebody's own profile is a
 * database value leaking into a product.
 */
const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
  RETAIL: "Retail account",
  WHOLESALE_PENDING: "Wholesale — awaiting approval",
  WHOLESALE_VERIFIED: "Wholesale account",
  DISTRIBUTOR_PENDING: "Distributor — awaiting approval",
  DISTRIBUTOR_VERIFIED: "Distributor account",
};

/**
 * A titled white card. Every panel on this page is one, which is the whole
 * point — the previous version gave each tab its own padding and heading
 * markup, so the four of them drifted into four slightly different cards.
 */
function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-edge/60 bg-white shadow-sm">
      <header className="border-b border-edge/50 bg-mist/40 px-6 py-5">
        <h2 className="font-serif text-lg font-bold text-ink">{title}</h2>
        {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      </header>
      <div className="p-6">{children}</div>
    </section>
  );
}

/** The empty state every tab needs, so all four look like the same product. */
function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-edge bg-mist/30 p-8 text-center">
      {children}
    </div>
  );
}

export default function ProfileClient() {
  const { user, isAuthenticated, isLoading, updateProfile } = useAuth();
  const [tab, setTab] = useState<Tab>("profile");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /** One entry point for both banners, so a success cannot sit under a failure. */
  const announce = useCallback((text: string, bad = false) => {
    setMessage(bad ? null : text);
    setError(bad ? text : null);
  }, []);

  /**
   * Resending the verification email is a three-state affair, not a fire.
   *
   * "sent" is sticky on purpose. The API throttles this endpoint at three a
   * minute because the cost of getting it wrong lands on the sending domain's
   * reputation — every other customer's mail is delivered on that reputation —
   * so the button must not invite a fourth click.
   */
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");

  async function resendVerification() {
    setResendState("sending");
    setError(null);
    try {
      await authApi.resendVerification();
      setResendState("sent");
    } catch (caught) {
      // The server's own message is shown: a 429 says how long to wait, and
      // "that did not work" would hide the one useful thing in the response.
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Could not send that email. Please try again shortly.",
      );
      setResendState("idle");
    }
  }

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // An applicant used to have no way to see whether their application had been
  // looked at — approvals were written into the reviewer's own browser and
  // never surfaced anywhere the applicant could reach (audit §3.5).
  const [applications, setApplications] = useState<Application[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setPhone(user.phone);
    }
  }, [user]);

  const loadAddresses = useCallback(async () => {
    try {
      const page = await authApi.listAddresses();
      setAddresses(page.results);
    } catch {
      /* the addresses tab simply stays empty */
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    void loadAddresses();
    void myApplications().then(setApplications, () => setApplications([]));
    void myRegistrations().then(setRegistrations, () => setRegistrations([]));
  }, [isAuthenticated, loadAddresses]);

  /**
   * Only `full_name` and `phone` are editable here — `accounts.services`
   * restricts it to exactly those two — so those are the only rules needed.
   * Phone is optional, but a half-typed one is worse than a blank: it looks
   * like a way to reach the customer about an order, and it is not.
   */
  const profileRules = {
    full_name: validatePersonName,
    phone: (value: string) => (value.trim() ? validatePhone(value) : undefined),
  };

  async function handleSaveProfile(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const problems = validateFields(profileRules, { full_name: fullName, phone });
    if (!isValid(problems)) {
      setFieldErrors(problems);
      document.getElementById(Object.keys(problems)[0]!)?.focus();
      return;
    }

    setFieldErrors({});
    setSaving(true);
    try {
      await updateProfile({ full_name: fullName, phone });
      announce("Profile updated.");
    } catch (err) {
      announce(err instanceof ApiError ? err.message : "Could not save your profile.", true);
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const problems = validateFields(
      {
        current: (value: string) => (value ? undefined : "Enter your current password."),
        next: validatePassword,
        confirm: (value: string) => validatePasswordConfirmation(passwords.next, value),
      },
      passwords,
    );
    if (!isValid(problems)) {
      setFieldErrors(problems);
      document.getElementById(Object.keys(problems)[0]!)?.focus();
      return;
    }

    setFieldErrors({});
    setSaving(true);
    try {
      await authApi.changePassword({
        current_password: passwords.current,
        new_password: passwords.next,
        new_password_confirm: passwords.confirm,
      });
      setPasswords({ current: "", next: "", confirm: "" });
      announce("Password changed.");
    } catch (err) {
      announce(err instanceof ApiError ? err.message : "Could not change your password.", true);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAddress(id: string) {
    await authApi.deleteAddress(id);
    await loadAddresses();
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </main>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <main className="min-h-screen bg-cream pt-24 pb-16">
        <div className="mx-auto max-w-md px-4 text-center">
          <p className="mb-6 text-gray-600">Sign in to manage your account.</p>
          <Link
            href="/login"
            className="inline-block rounded-full bg-primary px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-secondary"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  const tabs: { id: Tab; label: string; hint: string; icon: typeof UserIcon }[] = [
    { id: "profile", label: "Profile", hint: "Name, phone, photograph", icon: UserIcon },
    { id: "addresses", label: "Addresses", hint: "Where deliveries go", icon: MapPin },
    { id: "applications", label: "Applications", hint: "Wholesale & distributor", icon: Briefcase },
    { id: "academy", label: "Academy", hint: "Your class bookings", icon: GraduationCap },
    { id: "settings", label: "Security", hint: "Password & two-factor", icon: Settings },
  ];

  return (
    <main className="min-h-screen bg-cream pt-24 pb-20">
      <div className="mx-auto max-w-6xl 2xl:max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* ── Identity ──────────────────────────────────────────────────────
            The photograph, the name and what kind of account this is, in one
            card at the top. Previously the page opened with an `<h1>` reading
            "My account" and the email underneath in grey — true, and it told
            you nothing you did not already know about yourself. */}
        <div className="overflow-hidden rounded-2xl border border-edge/60 bg-white shadow-sm">
          <div className="relative h-24 bg-linear-to-r from-primary via-secondary to-primary">
            {/* Drawn, not fetched — same weave as the service page CTA. */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          <div className="px-6 pb-6">
            <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
              <AvatarUploader onMessage={announce} />

              <div className="flex flex-wrap items-center gap-2 pb-1">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-mist px-3 py-1 text-xs font-semibold text-primary">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {ACCOUNT_TYPE_LABEL[user.account_type]}
                </span>
                {user.gets_bulk_pricing && (
                  <span className="rounded-full bg-wheat/40 px-3 py-1 text-xs font-semibold text-earth">
                    Bulk pricing active
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4">
              <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl">
                {user.full_name || "Your account"}
              </h1>
              <p className="mt-1 text-sm text-gray-600">{user.email}</p>
              <p className="mt-1 text-xs text-gray-500">
                Member since{" "}
                {new Date(user.date_joined).toLocaleDateString("en-NG", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* ── Announcements ────────────────────────────────────────────────
            `role="status"` on the success and `role="alert"` on the failure:
            a screen reader announces both without the focus having to move,
            which it does not, because saving leaves you where you were. */}
        {message && (
          <p
            role="status"
            className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            {message}
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {error}
          </p>
        )}

        {!user.is_email_verified && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <span>
              {resendState === "sent"
                ? "Sent. Check your inbox — and your spam folder."
                : "Your email address is not verified yet."}
            </span>
            {/* Was `onClick={() => authApi.resendVerification()}`: no await,
                no state, no catch. Clicking did nothing visible, so people
                clicked again — and the API throttles this at 3/min, so the
                rejection became an unhandled promise nobody ever saw. A
                button that silently fails is worse than no button. */}
            <button
              type="button"
              disabled={resendState === "sending" || resendState === "sent"}
              onClick={resendVerification}
              className="font-semibold underline disabled:no-underline disabled:opacity-60"
            >
              {resendState === "sending"
                ? "Sending…"
                : resendState === "sent"
                  ? "Sent"
                  : "Resend the link"}
            </button>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* ── Navigation ──────────────────────────────────────────────────
              A `tablist`, because that is what it is. The previous version was
              five unlabelled buttons in a `<ul>`, so a screen reader announced
              "Addresses, button" with nothing saying it selected a panel or
              which one was showing. */}
          <nav className="lg:col-span-1" aria-label="Account sections">
            <ul role="tablist" aria-orientation="vertical" className="space-y-1 lg:sticky lg:top-24">
              {tabs.map(({ id, label, hint, icon: Icon }) => (
                <li key={id} role="presentation">
                  <button
                    type="button"
                    role="tab"
                    id={`tab-${id}`}
                    aria-selected={tab === id}
                    aria-controls={`panel-${id}`}
                    onClick={() => setTab(id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl px-4 py-3 text-left transition-colors duration-200",
                      tab === id
                        ? "bg-primary text-white shadow-sm"
                        : "text-gray-700 hover:bg-mist",
                    )}
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{label}</span>
                      <span
                        className={cn(
                          "block truncate text-xs",
                          tab === id ? "text-white/70" : "text-gray-500",
                        )}
                      >
                        {hint}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div
            className="lg:col-span-3"
            role="tabpanel"
            id={`panel-${tab}`}
            aria-labelledby={`tab-${tab}`}
          >
            {tab === "profile" && (
              <Panel
                title="Your details"
                description="How we address you, and how we reach you about an order."
              >
                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <FormField
                    label="Full name"
                    name="full_name"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setFieldErrors((c) => ({ ...c, full_name: "" }));
                    }}
                    onBlur={() =>
                      setFieldErrors((c) => ({
                        ...c,
                        full_name: validatePersonName(fullName) ?? "",
                      }))
                    }
                    error={fieldErrors.full_name}
                    required
                    autoComplete="name"
                  />
                  <FormField
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setFieldErrors((c) => ({ ...c, phone: "" }));
                    }}
                    onBlur={() =>
                      setFieldErrors((c) => ({
                        ...c,
                        phone: (phone.trim() ? validatePhone(phone) : undefined) ?? "",
                      }))
                    }
                    error={fieldErrors.phone}
                    autoComplete="tel"
                    placeholder="08039876543"
                  />

                  <p className="rounded-lg bg-mist/50 p-3 text-xs text-gray-600">
                    Your email address and account type are set by Kuyash Farms and cannot be
                    changed here. Your account type changes when an application is approved.
                  </p>

                  <div className="flex items-center gap-3 border-t border-edge/50 pt-5">
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-lg bg-primary px-6 py-2.5 font-semibold text-white transition-colors duration-200 hover:bg-secondary disabled:opacity-60"
                    >
                      {saving ? "Saving…" : "Save changes"}
                    </button>
                  </div>
                </form>
              </Panel>
            )}

            {tab === "addresses" && (
              <Panel
                title="Delivery addresses"
                description="Saving one here fills in your details at checkout."
              >
                <div className="space-y-6">
                  <AddressForm onSaved={(saved) => setAddresses((current) => [...current, saved])} />

                  {addresses.length === 0 ? (
                    <Empty>
                      <p className="text-sm text-gray-600">
                        No saved addresses yet.
                      </p>
                    </Empty>
                  ) : (
                    <ul className="divide-y divide-edge/50 border-t border-edge/50">
                      {addresses.map((address) => (
                        <li key={address.id} className="flex items-start justify-between gap-4 py-4">
                          <div>
                            <p className="font-semibold text-ink">
                              {address.label}
                              {address.is_default && (
                                <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                  Default
                                </span>
                              )}
                            </p>
                            <p className="mt-0.5 text-sm text-gray-600">
                              {address.recipient_name} · {address.street}, {address.city},{" "}
                              {address.state}
                            </p>
                          </div>
                          <button
                            type="button"
                            aria-label={`Delete ${address.label}`}
                            onClick={() => handleDeleteAddress(address.id)}
                            className="rounded-lg p-2 text-red-600 transition-colors duration-200 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Panel>
            )}

            {tab === "applications" && (
              <Panel
                title="Wholesale & distributor applications"
                description="The status here is the real one, read from our records — not from this browser."
              >
                {applications.length === 0 ? (
                  <Empty>
                    <p className="mb-5 text-sm text-gray-600">You haven&apos;t applied yet.</p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                      <Link
                        href="/become-wholesaler"
                        className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-secondary"
                      >
                        Apply for wholesale
                      </Link>
                      <Link
                        href="/become-distributor"
                        className="rounded-full border border-edge bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors duration-200 hover:bg-mist"
                      >
                        Become a distributor
                      </Link>
                    </div>
                  </Empty>
                ) : (
                  <ul className="divide-y divide-edge/50">
                    {applications.map((application) => (
                      <li key={application.id} className="py-4 first:pt-0">
                        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold text-ink">
                            {application.business_name}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              APPLICATION_TONE[application.status] ?? "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {application.status.replace(/_/g, " ").toLowerCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {application.application_type === "DISTRIBUTOR"
                            ? "Distributor"
                            : "Wholesale"}
                          {application.computed_tier ? ` · ${application.computed_tier.name}` : ""}
                          {application.states.length > 0
                            ? ` · ${application.states.length} ${
                                application.states.length === 1 ? "state" : "states"
                              }`
                            : ""}
                        </p>
                        {/* The reason, when there is one. Without this a
                            rejected applicant sees a red chip and nothing
                            else — no explanation, no way forward — which is
                            the worst moment in the product to go silent.
                            `decision_reason` is populated only on rejection
                            and is written for the applicant; the internal
                            `review_notes` are never sent here. */}
                        {application.status === "REJECTED" && application.decision_reason && (
                          <div className="mt-3 rounded-lg border border-red-100 bg-red-50 p-3">
                            <p className="text-sm font-semibold text-red-900">
                              Why this was not approved
                            </p>
                            <p className="mt-1 text-sm text-red-800">
                              {application.decision_reason}
                            </p>
                            <p className="mt-2 text-xs text-red-700">
                              You are welcome to apply again once this is resolved.{" "}
                              <Link
                                href={
                                  application.application_type === "DISTRIBUTOR"
                                    ? "/become-distributor"
                                    : "/become-wholesaler"
                                }
                                className="font-semibold underline"
                              >
                                Start a new application
                              </Link>
                              .
                            </p>
                          </div>
                        )}

                        <p className="mt-1 text-xs text-gray-500">
                          Submitted{" "}
                          {new Date(application.submitted_at).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                          {application.reviewed_at
                            ? ` · reviewed ${new Date(
                                application.reviewed_at,
                              ).toLocaleDateString("en-NG", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}`
                            : " · not yet reviewed"}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            )}

            {tab === "academy" && (
              <Panel
                title="Your class bookings"
                description="Bookings are held on our system, so they survive clearing your browser."
              >
                {registrations.length === 0 ? (
                  <Empty>
                    <p className="mb-5 text-sm text-gray-600">No bookings yet.</p>
                    <Link
                      href="/academy#classes"
                      className="inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-secondary"
                    >
                      Browse upcoming classes
                    </Link>
                  </Empty>
                ) : (
                  <ul className="divide-y divide-edge/50">
                    {registrations.map((registration) => (
                      <li
                        key={registration.id}
                        className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0"
                      >
                        <div>
                          <Link
                            href={`/academy/registrations/${registration.reference}`}
                            className="font-semibold text-ink transition-colors duration-200 hover:text-primary"
                          >
                            {registration.class_title}
                          </Link>
                          <p className="mt-0.5 text-sm text-gray-600">
                            {new Date(registration.scheduled_date).toLocaleDateString("en-NG", {
                              weekday: "short",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                            {" · "}
                            {Number(registration.price) === 0
                              ? "Free"
                              : formatPrice(Number(registration.price))}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            REGISTRATION_TONE[registration.status] ?? "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {registration.status.replace(/_/g, " ").toLowerCase()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            )}

            {tab === "settings" && (
              <div className="space-y-6">
                <TwoFactorSection />

                <Panel
                  title="Change password"
                  description="You will stay signed in on this device."
                >
                  <form onSubmit={handleChangePassword} className="space-y-5">
                    <FormField
                      label="Current password"
                      name="current"
                      type="password"
                      value={passwords.current}
                      onChange={(e) => {
                        setPasswords({ ...passwords, current: e.target.value });
                        setFieldErrors((c) => ({ ...c, current: "" }));
                      }}
                      error={fieldErrors.current}
                      required
                      autoComplete="current-password"
                    />
                    <FormField
                      label="New password"
                      name="next"
                      type="password"
                      value={passwords.next}
                      onChange={(e) => {
                        setPasswords({ ...passwords, next: e.target.value });
                        setFieldErrors((c) => ({ ...c, next: "" }));
                      }}
                      error={fieldErrors.next}
                      required
                      autoComplete="new-password"
                    />
                    <FormField
                      label="Confirm new password"
                      name="confirm"
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) => {
                        setPasswords({ ...passwords, confirm: e.target.value });
                        setFieldErrors((c) => ({ ...c, confirm: "" }));
                      }}
                      error={fieldErrors.confirm}
                      required
                      autoComplete="new-password"
                    />

                    <div className="border-t border-edge/50 pt-5">
                      <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-primary px-6 py-2.5 font-semibold text-white transition-colors duration-200 hover:bg-secondary disabled:opacity-60"
                      >
                        {saving ? "Saving…" : "Change password"}
                      </button>
                    </div>
                  </form>
                </Panel>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
