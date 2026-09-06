"use client";

/**
 * A single academy booking.
 *
 * The backend has been emailing this URL since Phase 6 and the page did not
 * exist, so every booking confirmation dead-ended on a 404.
 *
 * Two audiences land here: someone who has just booked (pushed straight from
 * the class page) and someone clicking a link in an email days later, possibly
 * on a different device with no session. The second case is why anonymous
 * visitors are offered an email box rather than a locked door.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
} from "lucide-react";

import { Container } from "@/components/ui/Container";
import { ApiError } from "@/lib/api/client";
import {
  cancelRegistration,
  getRegistration,
  payForRegistration,
  type Registration,
} from "@/lib/api/academy";
import { registrationEmailFor } from "@/lib/api/guest-registration";
import { useAuth } from "@/lib/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import { validateEmail } from "@/lib/validation";

const STATUS_COPY: Record<
  Registration["status"],
  { label: string; tone: string; blurb: string }
> = {
  PENDING_PAYMENT: {
    label: "Seat held",
    tone: "bg-amber-100 text-amber-800",
    blurb: "Your place is reserved. Payment is taken on arrival at the farm.",
  },
  CONFIRMED: {
    label: "Confirmed",
    tone: "bg-green-100 text-green-800",
    blurb: "You're all set. We'll see you on the day.",
  },
  ATTENDED: {
    label: "Attended",
    tone: "bg-blue-100 text-blue-800",
    blurb: "Thank you for coming. Your certificate follows by email.",
  },
  CANCELLED: {
    label: "Cancelled",
    tone: "bg-gray-200 text-gray-700",
    blurb: "This booking was cancelled and the seat released.",
  },
  NO_SHOW: {
    label: "Missed",
    tone: "bg-gray-200 text-gray-700",
    blurb: "This seat was booked but not taken up.",
  },
};

export default function RegistrationClient({ reference }: { reference: string }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsEmail, setNeedsEmail] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [paying, setPaying] = useState(false);

  const load = useCallback(
    async (email?: string) => {
      setLoading(true);
      setError("");
      try {
        setRegistration(await getRegistration(reference, email));
        setNeedsEmail(false);
      } catch (caught) {
        if (caught instanceof ApiError && caught.status === 403) {
          // Not proof of anything — just that we haven't identified ourselves.
          setNeedsEmail(true);
          if (email) setError("That email doesn't match this booking.");
        } else if (caught instanceof ApiError && caught.status === 404) {
          setError("We couldn't find a booking with that reference.");
        } else {
          setError("We couldn't load this booking. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },
    [reference],
  );

  useEffect(() => {
    // Wait for the session check, so a signed-in user isn't briefly asked for
    // an email they don't need to give.
    if (authLoading) return;
    void load(isAuthenticated ? undefined : registrationEmailFor(reference));
  }, [authLoading, isAuthenticated, reference, load]);

  async function onPay() {
    if (!registration) return;
    setPaying(true);
    setError("");
    try {
      // Guests identify themselves with the email the booking was made with —
      // the same rule as viewing it, because a reference appears in an email
      // that can be forwarded.
      const result = await payForRegistration(
        reference,
        isAuthenticated ? undefined : registrationEmailFor(reference) || emailInput || undefined,
      );
      window.location.href = result.authorization_url;
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : "Could not start that payment.",
      );
      setPaying(false);
    }
  }

  async function onCancel() {
    if (!confirm("Cancel this booking and release the seat?")) return;
    setCancelling(true);
    try {
      setRegistration(await cancelRegistration(reference));
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : "We couldn't cancel that booking.",
      );
    } finally {
      setCancelling(false);
    }
  }

  const status = registration ? STATUS_COPY[registration.status] : null;
  /**
   * Paying online is offered, never required (PRD §13 Q6).
   *
   * The seat is already held. This is the transactional half of "both
   * transactional and lead-generating" — somebody who wants it settled can
   * settle it, and somebody who would rather pay at the farm still can. The
   * copy below the buttons says so, because a lone "Pay now" reads as a demand.
   */
  const canPay =
    registration &&
    registration.status === "PENDING_PAYMENT" &&
    Number(registration.price) > 0;

  const canCancel =
    registration &&
    isAuthenticated &&
    (registration.status === "PENDING_PAYMENT" || registration.status === "CONFIRMED");

  return (
    <>
      <main className="min-h-screen bg-cream py-24">
        <Container>
          <div className="mx-auto max-w-xl">
            <Link
              href="/academy"
              className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Academy
            </Link>

            {loading ? (
              <div className="rounded-2xl bg-white p-12 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : needsEmail ? (
              <div className="rounded-2xl bg-white p-8">
                <h1 className="mb-2 font-serif text-2xl font-bold text-primary-dark">
                  Confirm it&apos;s you
                </h1>
                <p className="mb-6 text-sm text-gray-500">
                  Enter the email address this booking was made with, or{" "}
                  <Link href="/login" className="font-semibold text-primary hover:underline">
                    sign in
                  </Link>
                  .
                </p>
                {error && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    // A malformed address just returns 403 — the API cannot
                    // distinguish "wrong email" from "not your booking", by
                    // design — so the customer sees "that isn't the right
                    // email" for what is really a typo. Catch it here instead.
                    const problem = validateEmail(emailInput);
                    if (problem) {
                      setEmailError(problem);
                      return;
                    }
                    setEmailError("");
                    void load(emailInput.trim());
                  }}
                  className="space-y-4"
                >
                  <input
                    id="booking-email"
                    type="email"
                    required
                    value={emailInput}
                    onChange={(event) => {
                      setEmailInput(event.target.value);
                      setEmailError("");
                    }}
                    onBlur={() => setEmailError(validateEmail(emailInput) ?? "")}
                    placeholder="you@example.com"
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? "booking-email-error" : undefined}
                    className={`w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 ${
                      emailError ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                  {emailError && (
                    <p id="booking-email-error" role="alert" className="text-sm text-red-600">
                      {emailError}
                    </p>
                  )}
                  <button
                    type="submit"
                    className="w-full rounded-full bg-primary py-3 font-semibold text-white transition-colors hover:bg-primary-dark"
                  >
                    View booking
                  </button>
                </form>
              </div>
            ) : error || !registration || !status ? (
              <div className="rounded-2xl bg-white p-8 text-center">
                <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
                <h1 className="mb-2 font-serif text-2xl font-bold text-primary-dark">
                  Booking not found
                </h1>
                <p className="mb-6 text-gray-500">{error}</p>
                <Link
                  href="/academy"
                  className="inline-block rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark"
                >
                  Browse classes
                </Link>
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-8">
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                  </div>
                  <h1 className="mb-2 font-serif text-2xl font-bold text-primary-dark">
                    {registration.class_title}
                  </h1>
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${status.tone}`}
                  >
                    {status.label}
                  </span>
                  <p className="mt-3 text-sm text-gray-500">{status.blurb}</p>
                </div>

                <div className="space-y-3 border-t border-gray-100 pt-6 text-sm">
                  <Row label="Reference" value={registration.reference} mono />
                  <Row label="Name" value={registration.full_name} />
                  <Row label="Email" value={registration.email} />
                  {registration.phone && <Row label="Phone" value={registration.phone} />}
                  <Row
                    label="Date"
                    value={new Date(registration.scheduled_date).toLocaleDateString("en-NG", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    icon={Calendar}
                  />
                  <Row
                    label="Time"
                    value={new Date(registration.scheduled_date).toLocaleTimeString("en-NG", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    icon={Clock}
                  />
                  <Row label="Location" value="Kuyash Farms, Lagos" icon={MapPin} />
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-6">
                  <span className="text-sm text-gray-500">
                    {Number(registration.price) === 0 ? "Cost" : "Amount to pay"}
                  </span>
                  <span className="font-serif text-2xl font-bold text-primary-dark">
                    {Number(registration.price) === 0
                      ? "Free"
                      : formatPrice(Number(registration.price))}
                  </span>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={`/academy/classes/${registration.class_slug}`}
                    className="flex-1 rounded-full bg-primary px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-primary-dark"
                  >
                    View the class
                  </Link>
                  {canPay && (
                    <button
                      type="button"
                      onClick={onPay}
                      disabled={paying}
                      className="flex-1 rounded-full bg-wheat px-6 py-3 font-semibold text-primary-dark transition-colors hover:bg-wheat disabled:opacity-60"
                    >
                      {paying ? "Opening payment…" : `Pay ${formatPrice(registration.price)} now`}
                    </button>
                  )}
                  {canCancel && (
                    <button
                      type="button"
                      onClick={onCancel}
                      disabled={cancelling}
                      className="flex-1 rounded-full border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
                    >
                      {cancelling ? "Cancelling…" : "Cancel booking"}
                    </button>
                  )}
                </div>

                {canPay && (
                  <p className="mt-3 text-center text-xs text-gray-500">
                    Paying now is optional — your seat is already held. You can also pay when
                    you arrive at the farm.
                  </p>
                )}
              </div>
            )}
          </div>
        </Container>
      </main>
    </>
  );
}

function Row({
  label,
  value,
  mono,
  icon: Icon,
}: {
  label: string;
  value: string;
  mono?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-2 text-gray-500">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        {label}
      </span>
      <span
        className={`text-right font-semibold text-primary-dark ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
