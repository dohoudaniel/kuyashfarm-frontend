"use client";

/**
 * Class detail and seat booking.
 *
 * The prototype's version of this page was theatre end to end: a 1500ms
 * `setTimeout`, a reference number built from `Date.now()`, and a push into
 * `localStorage.academy_registrations`. Nobody at the farm ever saw a booking,
 * the seat counter never moved because it was a constant in the source, and
 * clearing your browser silently cancelled your place (audit §3.6).
 *
 * Now the seat is claimed through the API under a row lock, so the last seat in
 * the room can only be sold once, and the booking exists somewhere the farm can
 * actually read it.
 */

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Users,
} from "lucide-react";

import { Container } from "@/components/ui/Container";
import { ApiError } from "@/lib/api/client";
import { registerForClass, type AcademyClassDetail } from "@/lib/api/academy";
import { rememberRegistration } from "@/lib/api/guest-registration";
import { useAuth } from "@/lib/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import {
  fromApiFieldErrors,
  isValid,
  validateEmail,
  validateFields,
  validateMeaningfulText,
  validatePersonName,
  validatePhone,
} from "@/lib/validation";

const LEVEL_STYLES: Record<string, string> = {
  BEGINNER: "bg-green-100 text-green-800",
  INTERMEDIATE: "bg-amber-100 text-amber-800",
  ADVANCED: "bg-red-100 text-red-800",
  ALL_LEVELS: "bg-blue-100 text-blue-800",
};

const EXPERIENCE_OPTIONS = [
  { value: "none", label: "No experience" },
  { value: "beginner", label: "Less than 1 year" },
  { value: "some", label: "1–3 years" },
  { value: "experienced", label: "3–5 years" },
  { value: "expert", label: "5+ years" },
];

function humanLevel(level: string): string {
  return level
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^./, (character) => character.toUpperCase());
}

function formatWhen(iso: string): { date: string; time: string } {
  const when = new Date(iso);
  return {
    date: when.toLocaleDateString("en-NG", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    time: when.toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" }),
  };
}

export function ClassDetailClient({ cls }: { cls: AcademyClassDetail }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    occupation: "",
    farming_experience: "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { date, time } = formatWhen(cls.scheduled_date);
  const isFree = Number(cls.price) === 0;

  function change(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    if (errors[name]) {
      setErrors((previous) => {
        const next = { ...previous };
        delete next[name];
        return next;
      });
    }
  }

  /**
   * What a booking has to contain to be worth holding a seat for.
   *
   * This form is why this whole module exists: the API accepted
   * `full_name: "..."` with `phone: "aaaaaaaaaa"` and held a real seat on a
   * real class for it. Nobody could have been contacted, and the seat was
   * gone. The server now refuses that too; this is the copy that says so
   * before the seat is taken.
   *
   * `email` is optional only when signed in, where the API falls back to the
   * account address rather than making someone retype it.
   */
  const rules = {
    full_name: validatePersonName,
    email: isAuthenticated
      ? (value: string) => (value.trim() ? validateEmail(value) : undefined)
      : validateEmail,
    phone: validatePhone,
    occupation: (value: string) =>
      value.trim() ? validateMeaningfulText(value, { field: "Occupation" }) : undefined,
  };

  /** Check one field when it is left, in the shape the markup already renders. */
  function blur(field: keyof typeof rules) {
    const message = rules[field](form[field]);
    setErrors((current) => ({ ...current, [field]: message ? [message] : [] }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError("");

    const problems = validateFields(rules, form);
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
      const registration = await registerForClass(cls.slug, {
        full_name: form.full_name.trim(),
        // Signed-in users may leave this blank; the API falls back to the
        // account email rather than making them retype it.
        email: form.email.trim() || undefined,
        phone: form.phone.trim(),
        occupation: form.occupation.trim(),
        farming_experience: form.farming_experience,
      });

      // A guest has no session, and the API will not show a booking to an
      // anonymous caller without the email it was made with.
      if (!isAuthenticated) {
        rememberRegistration(registration.reference, registration.email);
      }

      router.push(`/academy/registrations/${registration.reference}`);
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
        setFormError("We couldn't complete your registration. Please try again.");
      }
      setSubmitting(false);
    }
  }

  const fieldClass = (name: string) =>
    `w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 ${
      errors[name] ? "border-red-400" : "border-gray-200"
    }`;

  return (
    <>
      <main className="min-h-screen bg-cream">
        {/* Hero */}
        <div className="relative h-72 w-full overflow-hidden md:h-96">
          {cls.image ? (
            <Image
              src={cls.image}
              alt={cls.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-primary-dark" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 via-primary-dark/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end pb-8">
            <Container>
              <Link
                href="/academy"
                className="mb-4 inline-flex items-center gap-2 text-sm text-white/80 transition-colors hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Academy
              </Link>
              <span
                className={`mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                  LEVEL_STYLES[cls.level] ?? "bg-blue-100 text-blue-800"
                }`}
              >
                {humanLevel(cls.level)}
              </span>
              <h1 className="font-serif text-3xl font-bold text-white md:text-5xl">{cls.title}</h1>
            </Container>
          </div>
        </div>

        <Container>
          <div className="grid grid-cols-1 gap-10 py-12 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              {/* Every figure here comes from the database, including seats. */}
              <div className="grid grid-cols-2 gap-6 rounded-2xl bg-white p-6 md:grid-cols-4">
                {[
                  { icon: Calendar, label: "Date", value: date },
                  { icon: Clock, label: "Starts", value: `${time} · ${cls.duration}` },
                  { icon: MapPin, label: "Location", value: cls.location || "Kuyash Farms" },
                  {
                    icon: Users,
                    label: "Seats left",
                    value: `${cls.seats_left} of ${cls.total_seats}`,
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label}>
                    <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
                      <Icon className="h-5 w-5 text-primary" /> {label}
                    </div>
                    <p className="text-sm font-semibold text-primary-dark">{value}</p>
                  </div>
                ))}
              </div>

              {cls.long_description && (
                <div className="rounded-2xl bg-white p-6">
                  <h2 className="mb-3 font-serif text-xl font-bold text-primary-dark">
                    About this class
                  </h2>
                  <p className="leading-relaxed text-gray-500">{cls.long_description}</p>
                </div>
              )}

              {cls.topics.length > 0 && (
                <div className="rounded-2xl bg-white p-6">
                  <h2 className="mb-4 font-serif text-xl font-bold text-primary-dark">
                    What you will cover
                  </h2>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {cls.topics.map((topic) => (
                      <div key={topic} className="flex items-center gap-3">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mist">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm text-gray-700">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cls.includes.length > 0 && (
                <div className="rounded-2xl bg-white p-6">
                  <h2 className="mb-4 font-serif text-xl font-bold text-primary-dark">
                    What&apos;s included
                  </h2>
                  <div className="space-y-2">
                    {cls.includes.map((item) => (
                      <div key={item} className="flex items-center gap-3">
                        <Award className="h-4 w-4 shrink-0 text-wheat" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cls.instructor && (
                <div className="flex items-center gap-5 rounded-2xl bg-white p-6">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-mist">
                    {cls.instructor.photo ? (
                      <Image
                        src={cls.instructor.photo}
                        alt={cls.instructor.name}
                        width={56}
                        height={56}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">👨‍🌾</span>
                    )}
                  </div>
                  <div>
                    <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">
                      Your instructor
                    </p>
                    <p className="font-serif font-bold text-primary-dark">{cls.instructor.name}</p>
                    <p className="text-sm text-gray-500">{cls.instructor.title}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Booking */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-6 border-b border-gray-100 pb-6">
                  <p className="font-serif text-4xl font-bold text-primary-dark">
                    {isFree ? "Free" : formatPrice(Number(cls.price))}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    per person{isFree ? "" : " · payment on arrival"}
                  </p>
                  {!cls.is_full && cls.seats_left <= 8 && (
                    <p className="mt-2 text-xs font-semibold text-red-500">
                      Only {cls.seats_left} {cls.seats_left === 1 ? "seat" : "seats"} remaining
                    </p>
                  )}
                </div>

                {!cls.is_open_for_registration ? (
                  <div className="text-center">
                    <p className="mb-2 font-semibold text-primary-dark">
                      {cls.is_full ? "This class is full" : "Registration is closed"}
                    </p>
                    <p className="mb-6 text-sm text-gray-500">
                      {cls.is_full
                        ? "Every seat has been taken. We run this class regularly — check back for the next date."
                        : "This date has passed or is no longer accepting bookings."}
                    </p>
                    <Link
                      href="/academy"
                      className="inline-block rounded-full bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-dark"
                    >
                      See other classes
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={onSubmit} className="space-y-4">
                    <h3 className="font-serif text-lg font-bold text-primary-dark">
                      Register for this class
                    </h3>

                    {formError && (
                      <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {formError}
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="full_name"
                        className="mb-1 block text-xs font-medium text-gray-600"
                      >
                        Full name *
                      </label>
                      <input
                        id="full_name"
                        name="full_name"
                        value={form.full_name}
                        onChange={change}
                        onBlur={() => blur("full_name")}
                        required
                        placeholder="Adaeze Okonkwo"
                        aria-invalid={!!errors.full_name?.length}
                        className={fieldClass("full_name")}
                      />
                      {errors.full_name?.map((problem) => (
                        <p key={problem} className="mt-1 text-xs text-red-500">
                          {problem}
                        </p>
                      ))}
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="mb-1 block text-xs font-medium text-gray-600"
                      >
                        Email address {isAuthenticated ? "" : "*"}
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={change}
                        onBlur={() => blur("email")}
                        required={!isAuthenticated}
                        aria-invalid={!!errors.email?.length}
                        placeholder={user?.email ?? "you@example.com"}
                        className={fieldClass("email")}
                      />
                      {isAuthenticated && (
                        <p className="mt-1 text-xs text-gray-500">
                          Leave blank to use {user?.email}.
                        </p>
                      )}
                      {errors.email?.map((problem) => (
                        <p key={problem} className="mt-1 text-xs text-red-500">
                          {problem}
                        </p>
                      ))}
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-1 block text-xs font-medium text-gray-600"
                      >
                        Phone number *
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        value={form.phone}
                        onChange={change}
                        onBlur={() => blur("phone")}
                        required
                        placeholder="08039876543"
                        aria-invalid={!!errors.phone?.length}
                        className={fieldClass("phone")}
                      />
                      {errors.phone?.map((problem) => (
                        <p key={problem} className="mt-1 text-xs text-red-500">
                          {problem}
                        </p>
                      ))}
                    </div>

                    <div>
                      <label
                        htmlFor="occupation"
                        className="mb-1 block text-xs font-medium text-gray-600"
                      >
                        Occupation
                      </label>
                      <input
                        id="occupation"
                        name="occupation"
                        value={form.occupation}
                        onChange={change}
                        onBlur={() => blur("occupation")}
                        placeholder="e.g. Farmer, Student, Business owner"
                        aria-invalid={!!errors.occupation?.length}
                        className={fieldClass("occupation")}
                      />
                      {errors.occupation?.map((problem) => (
                        <p key={problem} role="alert" className="mt-1 text-xs text-red-500">
                          {problem}
                        </p>
                      ))}
                    </div>

                    <div>
                      <label
                        htmlFor="farming_experience"
                        className="mb-1 block text-xs font-medium text-gray-600"
                      >
                        Farming experience
                      </label>
                      <select
                        id="farming_experience"
                        name="farming_experience"
                        value={form.farming_experience}
                        onChange={change}
                        className={`${fieldClass("farming_experience")} bg-white`}
                      >
                        <option value="">Select experience</option>
                        {EXPERIENCE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 font-semibold text-white transition-colors duration-200 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                      {submitting ? "Reserving your seat…" : "Confirm registration"}
                    </button>

                    <p className="text-center text-xs text-gray-500">
                      {isFree
                        ? "This class is free. Your seat is confirmed straight away."
                        : `Payment of ${formatPrice(Number(cls.price))} is made on arrival at the farm.`}
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </Container>
      </main>
    </>
  );
}
