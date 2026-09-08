"use client";

/**
 * Newsletter sign-up for announcements about new dates.
 *
 * Subscribing here does **not** put the address on the list — it sends a
 * confirmation link, and the address joins only when that link is opened. The
 * success copy says so. It previously said "You're subscribed!" after an 800ms
 * `setTimeout` against no endpoint at all, which was untrue twice over.
 */
import { useState } from "react";

import { ApiError } from "@/lib/api/client";
import { subscribe } from "@/lib/api/newsletter";
import { validateEmail } from "@/lib/validation";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";

export function AcademyNewsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const problem = validateEmail(email);
    if (problem) {
      setError(problem);
      return;
    }
    setError("");

    setLoading(true);
    try {
      await subscribe(email.trim(), "academy");
      setSubmitted(true);
    } catch (caught) {
      // Rate limiting is the realistic failure — the endpoint is public and
      // each request can send mail. Anything else is a genuine outage. Neither
      // reveals whether the address is already on the list.
      setError(
        caught instanceof ApiError
          ? caught.message
          : "We couldn't sign you up just now. Please try again shortly.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-ink py-28">
      <div className="max-w-7xl 2xl:max-w-[1536px] mx-auto px-6 md:px-12 lg:px-16">
        <div className="relative rounded-3xl overflow-hidden border border-white/8 p-12 md:p-16"
          style={{ background: "linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-dark) 60%, var(--primary-dark) 100%)" }}
        >
          {/* Background grid */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
              backgroundSize: "48px 48px",
            }}
          />
          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-full bg-primary/30 blur-[80px]" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
            <div className="max-w-lg">
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-xs font-mono uppercase tracking-[0.2em] text-primary mb-4"
              >
                Stay Connected
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="font-serif text-3xl md:text-4xl font-bold text-white leading-tight mb-4"
              >
                Get agricultural insights
                <br />
                <span className="text-wheat">delivered to your inbox.</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-white/45 font-sans text-sm leading-relaxed"
              >
                Upcoming programs, scholarship alerts, farming insights, and alumni success stories —
                sent monthly, never spammy.
              </motion.p>
            </div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="w-full lg:w-auto lg:min-w-[400px]"
            >
              {submitted ? (
                <div className="flex items-center gap-3 bg-primary/30 border border-primary/50 rounded-2xl px-6 py-5">
                  <CheckCircle className="w-6 h-6 text-accent shrink-0" />
                  <div>
                    <p className="text-white font-semibold text-sm">Check your email</p>
                    <p className="text-white/50 text-xs mt-0.5 font-sans">
                      We&apos;ve sent a link to confirm your subscription. You&apos;re not on the
                      list until you open it.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Your email address, e.g. adaeze@gmail.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    onBlur={() => setError(validateEmail(email) ?? "")}
                    required
                    aria-invalid={!!error}
                    aria-describedby={error ? "newsletter-error" : undefined}
                    className={`flex-1 bg-white/[0.06] border text-white placeholder:text-white/60 rounded-xl px-5 py-4 text-sm font-sans outline-none focus:bg-white/[0.09] transition-all duration-200 ${
                      error ? "border-red-400/70" : "border-white/15 focus:border-primary"
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 bg-wheat text-primary-dark font-semibold px-6 py-4 rounded-xl hover:bg-wheat transition-colors duration-200 text-sm shrink-0 disabled:opacity-70"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-primary-dark/30 border-t-primary-dark rounded-full animate-spin" />
                    ) : (
                      <>Subscribe <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                  </div>
                  {error && (
                    <p id="newsletter-error" role="alert" className="text-xs text-red-300">
                      {error}
                    </p>
                  )}
                </form>
              )}
              <p className="mt-3 text-white/25 text-xs font-sans">
                No spam. Unsubscribe anytime.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
