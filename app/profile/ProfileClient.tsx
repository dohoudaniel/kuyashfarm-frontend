"use client";

/**
 * Account.
 *
 * The prototype's version was hardcoded: every visitor saw "John Doe",
 * john.doe@example.com, a stock avatar and two addresses in New York and
 * Brooklyn (audit §3.6). It never read the signed-in user at all, and its
 * "save" handler set a flag with a comment saying to wire it up later.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  GraduationCap,
  Loader2,
  MapPin,
  Settings,
  Trash2,
  User as UserIcon,
} from "lucide-react";

import { FormField } from "@/components/ui/FormField";
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
import type { Address } from "@/lib/api/types";
import { myApplications, type Application } from "@/lib/api/applications";
import { myRegistrations, type Registration } from "@/lib/api/academy";
import { formatPrice } from "@/lib/utils";

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

export default function ProfileClient() {
  const { user, isAuthenticated, isLoading, updateProfile } = useAuth();
  const [tab, setTab] = useState<Tab>("profile");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      setMessage("Profile updated.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save your profile.");
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
      setMessage("Password changed.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not change your password.");
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
      <>
        <main className="flex min-h-screen items-center justify-center bg-gray-50">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </main>
      </>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <>
        <main className="min-h-screen bg-gray-50 pt-24 pb-16">
          <div className="mx-auto max-w-md px-4 text-center">
            <p className="mb-6 text-gray-600">Sign in to manage your account.</p>
            <Link href="/login" className="rounded-full bg-primary px-6 py-3 font-semibold text-white">Sign in</Link>
          </div>
        </main>
      </>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof UserIcon }[] = [
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "applications", label: "Applications", icon: Briefcase },
    { id: "academy", label: "Academy", icon: GraduationCap },
    { id: "settings", label: "Security", icon: Settings },
  ];

  return (
    <>
      <main className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 sm:text-4xl">My account</h1>
          <p className="mb-8 text-gray-600">{user.email}</p>

          {message && <p className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-800">{message}</p>}
          {error && <p role="alert" className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</p>}

          {!user.is_email_verified && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
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

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            <nav className="lg:col-span-1">
              <ul className="space-y-2">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <li key={id}>
                    <button type="button" onClick={() => setTab(id)}
                      className={`flex w-full items-center gap-2 rounded-lg px-4 py-2 text-left ${tab === id ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"}`}>
                      <Icon className="h-4 w-4" /> {label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="lg:col-span-3">
              {tab === "profile" && (
                <form onSubmit={handleSaveProfile} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
                  <FormField label="Full name" name="full_name" value={fullName}
                    onChange={(e) => { setFullName(e.target.value); setFieldErrors((c) => ({ ...c, full_name: "" })); }}
                    onBlur={() => setFieldErrors((c) => ({ ...c, full_name: validatePersonName(fullName) ?? "" }))}
                    error={fieldErrors.full_name} required autoComplete="name" />
                  <FormField label="Phone" name="phone" type="tel" value={phone}
                    onChange={(e) => { setPhone(e.target.value); setFieldErrors((c) => ({ ...c, phone: "" })); }}
                    onBlur={() => setFieldErrors((c) => ({ ...c, phone: (phone.trim() ? validatePhone(phone) : undefined) ?? "" }))}
                    error={fieldErrors.phone} autoComplete="tel" placeholder="08039876543" />
                  <p className="text-xs text-gray-500">
                    Your email address and account type are set by Kuyash Farm and cannot be
                    changed here.
                  </p>
                  <button type="submit" disabled={saving} className="rounded-lg bg-primary px-6 py-2.5 font-semibold text-white hover:bg-secondary disabled:opacity-60">
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                </form>
              )}

              {tab === "addresses" && (
                <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
                  <AddressForm onSaved={(saved) => setAddresses((current) => [...current, saved])} />
                  {addresses.length === 0 ? (
                    <p className="text-gray-600">
                      No saved addresses yet. Saving one here fills in your delivery details at
                      checkout.
                    </p>
                  ) : (
                    <ul className="divide-y">
                      {addresses.map((address) => (
                        <li key={address.id} className="flex items-start justify-between gap-4 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {address.label}
                              {address.is_default && (
                                <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">Default</span>
                              )}
                            </p>
                            <p className="text-sm text-gray-600">
                              {address.recipient_name} · {address.street}, {address.city}, {address.state}
                            </p>
                          </div>
                          <button type="button" aria-label={`Delete ${address.label}`} onClick={() => handleDeleteAddress(address.id)} className="rounded p-2 text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {tab === "applications" && (
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <h2 className="mb-1 text-lg font-bold text-gray-900">
                    Wholesale &amp; distributor applications
                  </h2>
                  <p className="mb-5 text-sm text-gray-500">
                    The status here is the real one, read from our records — not from this
                    browser.
                  </p>

                  {applications.length === 0 ? (
                    <div className="rounded-lg bg-gray-50 p-6 text-center">
                      <p className="mb-4 text-gray-600">You haven&apos;t applied yet.</p>
                      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link
                          href="/become-wholesaler"
                          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-secondary"
                        >
                          Apply for wholesale
                        </Link>
                        <Link
                          href="/become-distributor"
                          className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          Become a distributor
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <ul className="divide-y">
                      {applications.map((application) => (
                        <li key={application.id} className="py-4">
                          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                            <span className="font-semibold text-gray-900">
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
                          <p className="text-sm text-gray-500">
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

                          <p className="mt-1 text-xs text-gray-400">
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
                </div>
              )}

              {tab === "academy" && (
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <h2 className="mb-1 text-lg font-bold text-gray-900">Your class bookings</h2>
                  <p className="mb-5 text-sm text-gray-500">
                    Bookings are held on our system, so they survive clearing your browser.
                  </p>

                  {registrations.length === 0 ? (
                    <div className="rounded-lg bg-gray-50 p-6 text-center">
                      <p className="mb-4 text-gray-600">No bookings yet.</p>
                      <Link
                        href="/academy#classes"
                        className="inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-secondary"
                      >
                        Browse upcoming classes
                      </Link>
                    </div>
                  ) : (
                    <ul className="divide-y">
                      {registrations.map((registration) => (
                        <li
                          key={registration.id}
                          className="flex flex-wrap items-center justify-between gap-3 py-4"
                        >
                          <div>
                            <Link
                              href={`/academy/registrations/${registration.reference}`}
                              className="font-semibold text-gray-900 hover:text-primary"
                            >
                              {registration.class_title}
                            </Link>
                            <p className="text-sm text-gray-500">
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
                </div>
              )}

              {tab === "settings" && (
                <div className="space-y-6">
                <TwoFactorSection />
                <form onSubmit={handleChangePassword} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900">Change password</h2>
                  <FormField label="Current password" name="current" type="password" value={passwords.current}
                    onChange={(e) => { setPasswords({ ...passwords, current: e.target.value }); setFieldErrors((c) => ({ ...c, current: "" })); }}
                    error={fieldErrors.current} required autoComplete="current-password" />
                  <FormField label="New password" name="next" type="password" value={passwords.next}
                    onChange={(e) => { setPasswords({ ...passwords, next: e.target.value }); setFieldErrors((c) => ({ ...c, next: "" })); }}
                    error={fieldErrors.next} required autoComplete="new-password" />
                  <FormField label="Confirm new password" name="confirm" type="password" value={passwords.confirm}
                    onChange={(e) => { setPasswords({ ...passwords, confirm: e.target.value }); setFieldErrors((c) => ({ ...c, confirm: "" })); }}
                    error={fieldErrors.confirm} required autoComplete="new-password" />
                  <button type="submit" disabled={saving} className="rounded-lg bg-primary px-6 py-2.5 font-semibold text-white hover:bg-secondary disabled:opacity-60">
                    {saving ? "Saving…" : "Change password"}
                  </button>
                </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
