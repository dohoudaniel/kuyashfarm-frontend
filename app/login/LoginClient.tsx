"use client";

/**
 * Sign in.
 *
 * The failure message is deliberately identical for a wrong password and an
 * unknown account — the API is vague on purpose and the page must not undo
 * that by being more helpful.
 */
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react";
import { isValid, validateEmail, validateFields, type FieldErrors } from "@/lib/validation";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export default function LoginClient() {
  const router = useRouter();
  const { login, completeTwoFactor } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  /**
   * Set once the password is accepted and a second factor is needed. Holding
   * it in state keeps the whole sign-in on one page: a separate route would
   * need the challenge in the URL, where it lands in history and referrers.
   */
  const [challengeToken, setChallengeToken] = useState("");
  const [code, setCode] = useState("");

  /**
   * Where to go afterwards. The back-office guard sends people here with
   * `?next=/admin`, and dropping it would land an administrator on the shop
   * homepage after every sign-in.
   */
  const next = useSearchParams().get("next") ?? "/";

  /**
   * Only the shape of what was typed, never anything about the account.
   *
   * The password rule is deliberately just "not empty". Applying the
   * create-a-password rules here would reject an older account's valid
   * password at the door, and "use at least 8 characters" is nonsense advice
   * when you are typing a password you already have. It would also hint at
   * what this account's password looks like, which this page exists not to do.
   */
  const rules = {
    email: validateEmail,
    password: (value: string) => (value ? undefined : "Enter your password."),
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
      document.getElementById(Object.keys(problems)[0]!)?.focus();
      return;
    }

    setFieldErrors({});
    setIsLoading(true);

    try {
      const outcome = await login(formData.email, formData.password);

      // A correct password is only half a sign-in once a second factor is
      // enrolled. Nobody is signed in at this point and no tokens exist yet —
      // swap the form for the code prompt rather than navigating.
      if (outcome.twoFactorRequired) {
        setChallengeToken(outcome.challengeToken);
        return;
      }

      router.push(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await completeTwoFactor(challengeToken, code);
      router.push(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "That code is not right.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setFieldErrors((current) => ({ ...current, [e.target.name]: "" }));
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50 pt-24 pb-16">
        <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <LogIn className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="font-serif text-4xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">Sign in to your Kuyash Farm account</p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {challengeToken ? (
              /* The password was right. Nobody is signed in yet — no tokens
                 exist — and the challenge expires in five minutes. */
              <form onSubmit={handleTwoFactor} className="space-y-6">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                    Authentication code
                  </label>
                  <input
                    id="code"
                    name="code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    required
                    autoFocus
                    // `one-time-code` lets a password manager and iOS fill it,
                    // and `inputMode` gives a phone the numeric keypad.
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    placeholder="123456"
                    className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-lg tracking-[0.4em] focus:border-transparent focus:ring-2 focus:ring-green-500"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    From your authenticator app. Lost your phone? Enter one of your recovery
                    codes instead — they work in this same box.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 focus:ring-4 focus:ring-green-200 disabled:opacity-50 transition-all"
                >
                  {isLoading ? "Checking…" : "Verify"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setChallengeToken("");
                    setCode("");
                    setError("");
                  }}
                  className="w-full text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Use a different account
                </button>
              </form>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
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

              {/* Password Field */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-green-600 hover:text-green-700"
                  >
                    Forgot password?
                  </Link>
                </div>
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>
            )}

            {!challengeToken && (
              <>
                <div className="my-6 flex items-center gap-3">
                  <span className="h-px flex-1 bg-gray-200" />
                  <span className="text-xs uppercase tracking-wide text-gray-400">or</span>
                  <span className="h-px flex-1 bg-gray-200" />
                </div>
                {/* Renders nothing unless NEXT_PUBLIC_GOOGLE_CLIENT_ID is set:
                    a deployment without a Google project should show no Google
                    button rather than one that fails when pressed. */}
                <GoogleSignInButton next={next} onTwoFactorRequired={setChallengeToken} />
              </>
            )}

            {/* Divider */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-green-600 hover:text-green-700"
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
