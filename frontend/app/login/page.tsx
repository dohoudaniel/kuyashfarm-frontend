"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Eye, EyeOff, ArrowRight, AlertCircle, Leaf, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  suffix?: React.ReactNode;
}

const InputField = ({ label, error, suffix, id, ...rest }: InputFieldProps) => (
  <div>
    <label htmlFor={id} className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 mb-1.5">
      {label}
    </label>
    <div className="relative">
      <input
        id={id}
        {...rest}
        className={`w-full px-4 py-3.5 text-sm font-sans text-[#080f0a] bg-[#faf8f5] border rounded-xl outline-none transition-all duration-200 placeholder:text-gray-300
          ${error
            ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
            : "border-[#c6dece] focus:border-[#2d5f3f] focus:ring-2 focus:ring-[#2d5f3f]/10"
          }
          ${suffix ? "pr-11" : ""}
        `}
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>
      )}
    </div>
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="mt-1.5 text-[11px] text-red-500 font-sans flex items-center gap-1"
        >
          <AlertCircle className="w-3 h-3 shrink-0" /> {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: "" }));
    if (globalError) setGlobalError("");
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email address";
    if (!form.password) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setGlobalError("");
    try {
      await login(form.email, form.password);
      setSuccess(true);
      setTimeout(() => router.push("/"), 900);
    } catch (err: any) {
      setGlobalError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#faf8f5] pt-20 flex">

        {/* ── LEFT PANEL — decorative (desktop only) ── */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#080f0a]">
          <Image
            src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=1600"
            alt="Kuyash farm"
            fill
            className="object-cover opacity-25"
            priority
          />
          {/* gradient */}
          <div className="absolute inset-0 bg-linear-to-br from-[#080f0a] via-[#080f0a]/70 to-[#2d5f3f]/30" />
          {/* grid */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)`,
              backgroundSize: "48px 48px",
            }} />
          {/* glow */}
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#2d5f3f]/20 blur-[100px]" />

          <div className="relative z-10 flex flex-col justify-between p-12 w-full">
            {/* Top badge */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#2d5f3f] flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-serif text-white font-bold text-lg tracking-tight">Kuyash Farm</span>
            </div>

            {/* Quote */}
            <div>
              <p className="font-serif text-white font-bold leading-snug mb-4"
                style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.2rem)" }}>
                "Cultivating a sustainable<br />future, one harvest at a time."
              </p>
              <p className="text-white/40 text-sm font-sans">
                Premium organic produce, delivered farm-to-table.
              </p>

              {/* Stats row */}
              <div className="flex items-center gap-6 mt-8">
                {[
                  { value: "40", label: "Acre farm" },
                  { value: "500+", label: "Customers" },
                  { value: "6+", label: "Services" },
                ].map(s => (
                  <div key={s.label}>
                    <p className="font-serif text-white text-2xl font-bold">{s.value}</p>
                    <p className="text-white/40 text-xs font-sans mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL — form ── */}
        <div className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-[#2d5f3f] flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-serif text-[#080f0a] font-bold text-lg tracking-tight">Kuyash Farm</span>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#6b9d7a] mb-2">
                Member Access
              </p>
              <h1 className="font-serif text-3xl font-bold text-[#080f0a] leading-tight mb-2">
                Welcome back
              </h1>
              <p className="text-sm text-gray-400 font-sans">
                Sign in to your Kuyash account to continue.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-[#c6dece] rounded-2xl p-10 flex flex-col items-center text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-[#eef5f1] border-2 border-[#c6dece] flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-7 h-7 text-[#2d5f3f]" />
                  </div>
                  <p className="font-serif text-xl font-bold text-[#080f0a] mb-1">Signed in!</p>
                  <p className="text-sm text-gray-400 font-sans">Redirecting you now…</p>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
                >
                  {/* Brand accent line */}
                  <div className="h-1 w-full bg-[#2d5f3f]" />

                  <div className="p-8 space-y-5">
                    {/* Global error */}
                    <AnimatePresence>
                      {globalError && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3"
                        >
                          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <p className="text-sm text-red-700 font-sans leading-snug">{globalError}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} noValidate className="space-y-4">
                      <InputField
                        id="login-email"
                        label="Email Address"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={e => set("email", e.target.value)}
                        error={errors.email}
                        autoComplete="email"
                        autoFocus
                      />

                      <InputField
                        id="login-password"
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={form.password}
                        onChange={e => set("password", e.target.value)}
                        error={errors.password}
                        autoComplete="current-password"
                        suffix={
                          <button type="button" onClick={() => setShowPassword(v => !v)}
                            className="text-gray-400 hover:text-[#2d5f3f] transition-colors"
                            aria-label={showPassword ? "Hide password" : "Show password"}>
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        }
                      />

                      <div className="flex justify-end">
                        <button type="button"
                          className="text-xs font-semibold text-[#2d5f3f] hover:text-[#4a7c59] transition-colors font-sans">
                          Forgot password?
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 bg-[#2d5f3f] hover:bg-[#4a7c59] active:bg-[#1a3d2b] text-white font-semibold text-sm py-3.5 rounded-xl transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <><Spinner /> Signing in…</>
                        ) : (
                          <>Sign In <ArrowRight className="w-4 h-4" /></>
                        )}
                      </button>
                    </form>

                    <p className="text-center text-sm text-gray-400 font-sans pt-1">
                      Don&apos;t have an account?{" "}
                      <Link href="/register" className="font-semibold text-[#2d5f3f] hover:text-[#4a7c59] transition-colors">
                        Create one
                      </Link>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </main>
    </>
  );
}
