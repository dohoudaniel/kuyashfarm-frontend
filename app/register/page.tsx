"use client";

/**
 * Create an account.
 *
 * Submitting shows "check your email" whether or not the address was already
 * registered, and does **not** sign you in. Both are deliberate: saying
 * "that email is taken" would turn this form into an account-enumeration
 * oracle, which is exactly what the API refuses to be.
 *
 * The layout comes from `AuthShell`, which carries the reasoning about why
 * this is a split panel and why the panel disappears below 1024px.
 */
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { Mail, Lock, User, Phone, AlertCircle, ArrowRight, Check } from "lucide-react";
import { ApiError } from "@/lib/api/client";
import { AuthField, AuthHeading, AuthShell } from "@/components/auth/AuthShell";
import {
  fromApiFieldErrors,
  isValid,
  validateEmail,
  validateFields,
  validatePassword,
  validatePersonName,
  validatePhone,
  type FieldErrors,
} from "@/lib/validation";

/**
 * The rules the server actually enforces, from `AUTH_PASSWORD_VALIDATORS`.
 *
 * The previous list promised uppercase, lowercase, a number and a special
 * character — none of which is checked anywhere, so it demanded work of the
 * customer for nothing and misdescribed the real rejections.
 */
const PASSWORD_RULES = [
  "At least 8 characters",
  "Not entirely numbers",
  "Not a commonly used password",
  "Not too similar to your name or email",
];

export default function RegisterPage() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  /**
   * The rules, keyed by input name.
   *
   * `phone` is optional here — the API takes it as `allow_blank` — so an empty
   * box is fine, but a filled-in one has to be a number somebody could answer.
   * A half-typed phone number is worse than none: it looks like a way to reach
   * the customer and is not.
   */
  const rules = {
    name: validatePersonName,
    email: validateEmail,
    phone: (value: string) => (value.trim() ? validatePhone(value) : undefined),
    password: validatePassword,
    confirmPassword: (value: string) =>
      !value
        ? "Re-enter the password."
        : value !== formData.password
          ? "The passwords do not match."
          : undefined,
  };

  const handleBlur = (field: keyof typeof rules) => {
    const message = rules[field](formData[field]);
    setFieldErrors((current) => ({ ...current, [field]: message ?? "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const problems = validateFields(rules, formData);
    if (!isValid(problems)) {
      setFieldErrors(problems);
      setError("Please correct the highlighted fields.");
      document.getElementById(Object.keys(problems)[0]!)?.focus();
      return;
    }

    setIsLoading(true);
    setFieldErrors({});

    try {
      // Field names match the API exactly. The previous version sent `name`
      // where the server expects `full_name` and omitted the required
      // `password_confirm`, so registration could never have succeeded.
      await register({
        email: formData.email,
        password: formData.password,
        password_confirm: formData.confirmPassword,
        full_name: formData.name,
        phone: formData.phone || undefined,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      // The server has the last word on passwords: it checks a 20,000-entry
      // common-password list and similarity to the name and email, neither of
      // which is reproducible here. Those verdicts land on the field.
      if (err instanceof ApiError) {
        setError(err.message);
        // This form's inputs are not named the way the API names its fields,
        // so a server error would otherwise attach to an input that does not
        // exist and render nowhere at all.
        const API_TO_INPUT: Record<string, string> = {
          full_name: "name",
          password_confirm: "confirmPassword",
        };
        const mapped: FieldErrors = {};
        for (const [field, message] of Object.entries(fromApiFieldErrors(err.fieldErrors))) {
          mapped[API_TO_INPUT[field] ?? field] = message;
        }
        setFieldErrors(mapped);
      } else {
        setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    // Clear as it is corrected, so a message cannot outlive the problem.
    setFieldErrors((current) => ({ ...current, [e.target.name]: "" }));
  };

  const panel = {
    eyebrow: "Join Kuyash Farms",
    headline: "Good food starts at the",
    highlight: "source.",
    points: [
      "Order fresh produce, eggs, fish and poultry direct from the farm",
      "Apply for wholesale or distributor pricing from your account",
      "Book academy classes on a working 40-acre farm",
    ],
  };

  // Deliberately identical whether or not the address was already registered.
  // Saying "welcome!" for a new account and "that email is taken" for an
  // existing one would make this form an account-enumeration oracle, which is
  // exactly what the API now refuses to be.
  if (submitted) {
    return (
      <AuthShell {...panel}>
        <div className="py-6 text-center">
          <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-mist text-primary">
            <Mail className="h-8 w-8" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-ink">Check your email</h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            We&apos;ve sent a message to{" "}
            <span className="font-semibold text-ink">{formData.email}</span>. Open the link
            inside to confirm your address, then sign in.
          </p>
          <p className="mt-4 rounded-xl bg-mist/50 p-3 text-xs leading-relaxed text-gray-600">
            Nothing arrived? Check your spam folder. If you already had an account with us, the
            email explains how to get back in.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-semibold text-white transition-colors duration-200 hover:bg-secondary"
          >
            Go to sign in <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell {...panel}>
      <AuthHeading title="Create your account">
        It takes a minute, and it is free.
      </AuthHeading>

      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField
          id="name"
          name="name"
          type="text"
          label="Full name"
          icon={User}
          required
          autoComplete="name"
          value={formData.name}
          onChange={handleChange}
          onBlur={() => handleBlur("name")}
          error={fieldErrors.name}
          placeholder="e.g. Ada Okafor"
        />

        <AuthField
          id="email"
          name="email"
          type="email"
          label="Email address"
          icon={Mail}
          required
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={() => handleBlur("email")}
          error={fieldErrors.email}
          placeholder="e.g. ada.okafor@gmail.com"
        />

        <AuthField
          id="phone"
          name="phone"
          type="tel"
          label="Phone number"
          icon={Phone}
          autoComplete="tel"
          value={formData.phone}
          onChange={handleChange}
          onBlur={() => handleBlur("phone")}
          error={fieldErrors.phone}
          placeholder="e.g. 08039876543"
          action={<span className="text-xs text-gray-400">Optional</span>}
        />

        <AuthField
          id="password"
          name="password"
          type="password"
          label="Password"
          icon={Lock}
          required
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          onBlur={() => handleBlur("password")}
          error={fieldErrors.password}
          placeholder="At least 8 characters, not all numbers"
        />

        <AuthField
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm password"
          icon={Lock}
          required
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={() => handleBlur("confirmPassword")}
          error={fieldErrors.confirmPassword}
          placeholder="Type that same password again"
        />

        <ul className="grid gap-1.5 rounded-xl bg-mist/50 p-4 sm:grid-cols-2">
          {PASSWORD_RULES.map((rule) => (
            <li key={rule} className="flex items-center gap-2 text-xs text-gray-600">
              <Check className="h-3 w-3 shrink-0 text-primary" />
              {rule}
            </li>
          ))}
        </ul>

        <button
          type="submit"
          disabled={isLoading}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 font-semibold text-white transition-colors duration-200 hover:bg-secondary focus:ring-4 focus:ring-accent/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            "Creating account…"
          ) : (
            <>
              Create account <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary transition-colors duration-200 hover:text-secondary"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
