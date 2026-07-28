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

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FormField } from "@/components/ui/FormField";
import { ApiError } from "@/lib/api/client";
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

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });

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

  async function handleSaveProfile(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
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
    setSaving(true);
    setMessage(null);
    setError(null);
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
        <Navbar />
        <main className="flex min-h-screen items-center justify-center bg-gray-50">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </main>
        <Footer />
      </>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 pt-24 pb-16">
          <div className="mx-auto max-w-md px-4 text-center">
            <p className="mb-6 text-gray-600">Sign in to manage your account.</p>
            <Link href="/login" className="rounded-full bg-primary px-6 py-3 font-semibold text-white">Sign in</Link>
          </div>
        </main>
        <Footer />
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
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 sm:text-4xl">My account</h1>
          <p className="mb-8 text-gray-600">{user.email}</p>

          {message && <p className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-800">{message}</p>}
          {error && <p role="alert" className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</p>}

          {!user.is_email_verified && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
              <span>Your email address is not verified yet.</span>
              <button type="button" onClick={() => authApi.resendVerification()} className="font-semibold underline">
                Resend the link
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
                  <FormField label="Full name" name="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  <FormField label="Phone" name="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
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
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  {addresses.length === 0 ? (
                    <p className="text-gray-600">No saved addresses yet. You can add one at checkout.</p>
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
                <form onSubmit={handleChangePassword} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900">Change password</h2>
                  <FormField label="Current password" name="current" type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} required />
                  <FormField label="New password" name="next" type="password" value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} required />
                  <FormField label="Confirm new password" name="confirm" type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} required />
                  <button type="submit" disabled={saving} className="rounded-lg bg-primary px-6 py-2.5 font-semibold text-white hover:bg-secondary disabled:opacity-60">
                    {saving ? "Saving…" : "Change password"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
