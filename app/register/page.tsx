"use client";

/**
 * Create an account.
 *
 * Submitting shows "check your email" whether or not the address was already
 * registered, and does **not** sign you in. Both are deliberate: saying
 * "that email is taken" would turn this form into an account-enumeration
 * oracle, which is exactly what the API refuses to be.
 */
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { UserPlus, Mail, Lock, User, Phone, AlertCircle, CheckCircle } from "lucide-react";
import { ApiError } from "@/lib/api/client";
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

  // Deliberately identical whether or not the address was already registered.
  // Saying "welcome!" for a new account and "that email is taken" for an
  // existing one would make this form an account-enumeration oracle, which is
  // exactly what the API now refuses to be.
  if (submitted) {
    return (
      <>
        <main className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50 pt-24 pb-16">
          <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-lg">
              <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="mb-2 font-serif text-3xl font-bold text-gray-900">
                Check your email
              </h1>
              <p className="mb-6 text-gray-600">
                We&apos;ve sent a message to{" "}
                <span className="font-semibold">{formData.email}</span>. Open the link inside to
                confirm your address, then sign in.
              </p>
              <p className="mb-8 text-sm text-gray-500">
                Nothing arrived? Check your spam folder. If you already had an account with us,
                the email explains how to get back in.
              </p>
              <Link
                href="/login"
                className="inline-block rounded-full bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-secondary"
              >
                Go to sign in
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50 pt-24 pb-16">
        <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <UserPlus className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="font-serif text-4xl font-bold text-gray-900 mb-2">
              Create Account
            </h1>
            <p className="text-gray-600">Join Kuyash Farm community today</p>
          </div>

          {/* Register Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={() => handleBlur("name")}
                    aria-invalid={!!fieldErrors.name}
                    aria-describedby={fieldErrors.name ? "name-error" : undefined}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all ${
                      fieldErrors.name
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-green-500"
                    }`}
                    placeholder="John Doe"
                  />
                </div>
                  {fieldErrors.name && (
                    <p id="name-error" role="alert" className="mt-1 text-sm text-red-600">
                      {fieldErrors.name}
                    </p>
                  )}
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur("email")}
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? "email-error" : undefined}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all ${
                      fieldErrors.email
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-green-500"
                    }`}
                    placeholder="you@example.com"
                  />
                </div>
                  {fieldErrors.email && (
                    <p id="email-error" role="alert" className="mt-1 text-sm text-red-600">
                      {fieldErrors.email}
                    </p>
                  )}
              </div>

              {/* Phone Field */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={() => handleBlur("phone")}
                    aria-invalid={!!fieldErrors.phone}
                    aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all ${
                      fieldErrors.phone
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-green-500"
                    }`}
                    placeholder="+234 800 000 0000"
                  />
                </div>
                  {fieldErrors.phone && (
                    <p id="phone-error" role="alert" className="mt-1 text-sm text-red-600">
                      {fieldErrors.phone}
                    </p>
                  )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur("password")}
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={fieldErrors.password ? "password-error" : undefined}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all ${
                      fieldErrors.password
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-green-500"
                    }`}
                    placeholder="••••••••"
                  />
                </div>
                  {fieldErrors.password && (
                    <p id="password-error" role="alert" className="mt-1 text-sm text-red-600">
                      {fieldErrors.password}
                    </p>
                  )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={() => handleBlur("confirmPassword")}
                    aria-invalid={!!fieldErrors.confirmPassword}
                    aria-describedby={fieldErrors.confirmPassword ? "confirmPassword-error" : undefined}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all ${
                      fieldErrors.confirmPassword
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-green-500"
                    }`}
                    placeholder="••••••••"
                  />
                </div>
                  {fieldErrors.confirmPassword && (
                    <p id="confirmPassword-error" role="alert" className="mt-1 text-sm text-red-600">
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-700 mb-2">
                  Password must contain:
                </p>
                {/* These are the rules the server actually enforces, from
                    AUTH_PASSWORD_VALIDATORS. The previous list promised
                    uppercase, lowercase, a number and a special character —
                    none of which is checked anywhere, so it demanded work of
                    the customer for nothing and misdescribed the real
                    rejections. */}
                <ul className="space-y-1 text-xs text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    At least 8 characters
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    Not entirely numbers
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    Not a commonly used password
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    Not too similar to your name or email
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-secondary focus:ring-4 focus:ring-accent/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-green-600 hover:text-green-700"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
