"use client";

/**
 * Sign in.
 *
 * The failure message is deliberately identical for a wrong password and an
 * unknown account — the API is vague on purpose and the page must not undo
 * that by being more helpful.
 *
 * The layout comes from `AuthShell`, which carries the reasoning about why
 * this is a split panel and why the panel disappears below 1024px.
 */
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { Mail, Lock, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { isValid, validateEmail, validateFields, type FieldErrors } from "@/lib/validation";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { AuthField, AuthHeading, AuthShell } from "@/components/auth/AuthShell";

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
    <AuthShell
      eyebrow="Welcome back"
      headline="Fresh from our fields to your"
      highlight="table."
      points={[
        "Track every order from the farm to your door",
        "Wholesale and distributor pricing applied automatically",
        "Your academy bookings and applications in one place",
      ]}
    >
      {challengeToken ? (
        /* The password was right. Nobody is signed in yet — no tokens exist —
           and the challenge expires in five minutes. */
        <>
          <AuthHeading title="One more step">
            Enter the code from your authenticator app to finish signing in.
          </AuthHeading>

          {error && <ErrorNote>{error}</ErrorNote>}

          <form onSubmit={handleTwoFactor} className="space-y-6">
            <div>
              <label htmlFor="code" className="mb-2 block text-sm font-medium text-gray-700">
                Authentication code
              </label>
              <div className="relative">
                <ShieldCheck className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
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
                  className="block w-full rounded-xl border border-edge bg-white py-3 pl-11 pr-4 text-center text-lg tracking-[0.4em] transition-colors duration-200 hover:border-accent focus:border-transparent focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Lost your phone? Enter one of your recovery codes instead — they work in this
                same box.
              </p>
            </div>

            <SubmitButton loading={isLoading} loadingLabel="Checking…">
              Verify
            </SubmitButton>

            <button
              type="button"
              onClick={() => {
                setChallengeToken("");
                setCode("");
                setError("");
              }}
              className="w-full text-sm font-medium text-gray-500 transition-colors duration-200 hover:text-primary"
            >
              Use a different account
            </button>
          </form>
        </>
      ) : (
        <>
          <AuthHeading title="Sign in">
            Welcome back to Kuyash Farms.
          </AuthHeading>

          {error && <ErrorNote>{error}</ErrorNote>}

          <form onSubmit={handleSubmit} className="space-y-5">
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
              placeholder="you@example.com"
            />

            <AuthField
              id="password"
              name="password"
              type="password"
              label="Password"
              icon={Lock}
              required
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => handleBlur("password")}
              error={fieldErrors.password}
              placeholder="••••••••"
              action={
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary transition-colors duration-200 hover:text-secondary"
                >
                  Forgot password?
                </Link>
              }
            />

            <SubmitButton loading={isLoading} loadingLabel="Signing in…">
              Sign in <ArrowRight className="h-4 w-4" />
            </SubmitButton>
          </form>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-edge" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400">
              or
            </span>
            <span className="h-px flex-1 bg-edge" />
          </div>

          {/* Renders nothing unless NEXT_PUBLIC_GOOGLE_CLIENT_ID is set: a
              deployment without a Google project should show no Google button
              rather than one that fails when pressed. */}
          <GoogleSignInButton next={next} onTwoFactorRequired={setChallengeToken} />

          <p className="mt-8 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary transition-colors duration-200 hover:text-secondary"
            >
              Create one
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}

function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
    >
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
      <p className="text-sm text-red-800">{children}</p>
    </div>
  );
}

function SubmitButton({
  loading,
  loadingLabel,
  children,
}: {
  loading: boolean;
  loadingLabel: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 font-semibold text-white transition-colors duration-200 hover:bg-secondary focus:ring-4 focus:ring-accent/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? loadingLabel : children}
    </button>
  );
}
