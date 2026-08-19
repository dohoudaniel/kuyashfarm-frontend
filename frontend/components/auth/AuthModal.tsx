"use client";

import { useState, useEffect, useRef, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, X, Leaf, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultMode?: "login" | "register";
}

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

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, suffix, id, ...rest }, ref) => (
    <div>
      <label htmlFor={id} className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          {...rest}
          className={`w-full px-4 py-3 text-sm font-sans text-[#080f0a] bg-[#faf8f5] border rounded-xl outline-none transition-all duration-200 placeholder:text-gray-300
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
  )
);

export function AuthModal({ isOpen, onClose, onSuccess, defaultMode = "login" }: AuthModalProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [success, setSuccess] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setForm({ name: "", email: "", password: "", confirm: "" });
    setErrors({});
    setGlobalError("");
    setSuccess(false);
    setShowPassword(false);
    setShowConfirm(false);
  }, [mode]);

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setTimeout(() => firstInputRef.current?.focus(), 150);
    }
  }, [isOpen, defaultMode]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const set = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: "" }));
    if (globalError) setGlobalError("");
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (mode === "register" && !form.name.trim()) next.name = "Full name is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email address";
    if (!form.password) next.password = "Password is required";
    else if (form.password.length < 8) next.password = "Minimum 8 characters";
    if (mode === "register") {
      if (!form.confirm) next.confirm = "Please confirm your password";
      else if (form.confirm !== form.password) next.confirm = "Passwords do not match";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setGlobalError("");
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register({ name: form.name, email: form.email, password: form.password });
      }
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        else onClose();
      }, 900);
    } catch (err: any) {
      setGlobalError(
        err.message ||
        (mode === "login" ? "Invalid email or password." : "Registration failed. Please try again.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[#080f0a]/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Brand accent line */}
              <div className="h-1 w-full bg-[#2d5f3f]" />

              {/* Left decorative bleed — subtle green wash */}
              <div className="absolute top-1 left-0 w-1 h-full bg-[#2d5f3f]/5 pointer-events-none" />

              {/* ── HEADER ── */}
              <div className="px-8 pt-7 pb-5 flex items-start justify-between border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#eef5f1] border border-[#c6dece] flex items-center justify-center shrink-0">
                    <Leaf className="w-4 h-4 text-[#2d5f3f]" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-bold text-[#080f0a] leading-tight">
                      {mode === "login" ? "Welcome back" : "Create account"}
                    </h2>
                    <p className="text-xs text-gray-400 font-sans mt-0.5">
                      {mode === "login"
                        ? "Sign in to your Kuyash account"
                        : "Join Kuyash Farm today"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors duration-150 shrink-0"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* ── BODY ── */}
              <div className="px-8 py-6">
                <AnimatePresence mode="wait">

                  {/* Success screen */}
                  {success ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center py-8 text-center"
                    >
                      <div className="w-14 h-14 rounded-full bg-[#eef5f1] border-2 border-[#c6dece] flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-7 h-7 text-[#2d5f3f]" />
                      </div>
                      <p className="font-serif text-lg font-bold text-[#080f0a] mb-1">
                        {mode === "login" ? "Signed in!" : "Account created!"}
                      </p>
                      <p className="text-sm text-gray-400 font-sans">Redirecting you now…</p>
                    </motion.div>

                  ) : (

                    /* Form */
                    <motion.form
                      key={`form-${mode}`}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleSubmit}
                      noValidate
                      className="space-y-4"
                    >
                      {/* Global error banner */}
                      <AnimatePresence>
                        {globalError && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.18 }}
                            className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3"
                          >
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700 font-sans leading-snug">{globalError}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Full name — register only */}
                      <AnimatePresence>
                        {mode === "register" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <InputField
                              id="auth-name"
                              label="Full Name"
                              type="text"
                              placeholder="Adaeze Okonkwo"
                              value={form.name}
                              onChange={e => set("name", e.target.value)}
                              error={errors.name}
                              autoComplete="name"
                              ref={mode === "register" ? firstInputRef : undefined}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <InputField
                        id="auth-email"
                        label="Email Address"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={e => set("email", e.target.value)}
                        error={errors.email}
                        autoComplete="email"
                        ref={mode === "login" ? firstInputRef : undefined}
                      />

                      <InputField
                        id="auth-password"
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={form.password}
                        onChange={e => set("password", e.target.value)}
                        error={errors.password}
                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                        suffix={
                          <button
                            type="button"
                            onClick={() => setShowPassword(v => !v)}
                            className="text-gray-400 hover:text-[#2d5f3f] transition-colors"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword
                              ? <EyeOff className="w-4 h-4" />
                              : <Eye className="w-4 h-4" />}
                          </button>
                        }
                      />

                      {/* Confirm password — register only */}
                      <AnimatePresence>
                        {mode === "register" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <InputField
                              id="auth-confirm"
                              label="Confirm Password"
                              type={showConfirm ? "text" : "password"}
                              placeholder="••••••••"
                              value={form.confirm}
                              onChange={e => set("confirm", e.target.value)}
                              error={errors.confirm}
                              autoComplete="new-password"
                              suffix={
                                <button
                                  type="button"
                                  onClick={() => setShowConfirm(v => !v)}
                                  className="text-gray-400 hover:text-[#2d5f3f] transition-colors"
                                  aria-label={showConfirm ? "Hide password" : "Show password"}
                                >
                                  {showConfirm
                                    ? <EyeOff className="w-4 h-4" />
                                    : <Eye className="w-4 h-4" />}
                                </button>
                              }
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Forgot password */}
                      {mode === "login" && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            className="text-xs font-semibold text-[#2d5f3f] hover:text-[#4a7c59] transition-colors font-sans"
                          >
                            Forgot password?
                          </button>
                        </div>
                      )}

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 bg-[#2d5f3f] hover:bg-[#4a7c59] active:bg-[#1a3d2b] text-white font-semibold text-sm py-3.5 rounded-xl transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                      >
                        {isLoading ? (
                          <>
                            <Spinner />
                            {mode === "login" ? "Signing in…" : "Creating account…"}
                          </>
                        ) : (
                          <>
                            {mode === "login" ? "Sign In" : "Create Account"}
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

              {/* ── FOOTER toggle ── */}
              {!success && (
                <div className="px-8 pb-7 pt-1 text-center">
                  <p className="text-sm text-gray-400 font-sans">
                    {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                    <button
                      type="button"
                      onClick={() => setMode(mode === "login" ? "register" : "login")}
                      className="font-semibold text-[#2d5f3f] hover:text-[#4a7c59] transition-colors"
                    >
                      {mode === "login" ? "Sign up" : "Sign in"}
                    </button>
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
