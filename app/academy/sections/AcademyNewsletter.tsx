"use client";

/**
 * Newsletter sign-up for announcements about new dates.
 */
import { useState } from "react";

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
    // NOTE: there is no newsletter endpoint on the API — no serializer, no
    // route, no table. This delay and the success panel below it are the
    // prototype's, and nobody is subscribed by pressing this button. The
    // address is validated so that whoever wires up the real endpoint is not
    // handed a backlog of malformed input, but the confirmation message is
    // still untrue until that endpoint exists.
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <section className="bg-[#080f0a] py-28">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="relative rounded-3xl overflow-hidden border border-white/8 p-12 md:p-16"
          style={{ background: "linear-gradient(135deg, #0f2318 0%, #1a3d2b 60%, #0f2318 100%)" }}
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
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-full bg-[#2d5f3f]/30 blur-[80px]" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
            <div className="max-w-lg">
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-xs font-mono uppercase tracking-[0.2em] text-[#6b9d7a] mb-4"
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
                <span className="text-[#e8d5a3]">delivered to your inbox.</span>
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
                <div className="flex items-center gap-3 bg-[#2d5f3f]/30 border border-[#2d5f3f]/50 rounded-2xl px-6 py-5">
                  <CheckCircle className="w-6 h-6 text-[#6b9d7a] shrink-0" />
                  <div>
                    <p className="text-white font-semibold text-sm">You&apos;re subscribed!</p>
                    <p className="text-white/50 text-xs mt-0.5 font-sans">Look out for your first email from us.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    onBlur={() => setError(validateEmail(email) ?? "")}
                    required
                    aria-invalid={!!error}
                    aria-describedby={error ? "newsletter-error" : undefined}
                    className={`flex-1 bg-white/[0.06] border text-white placeholder:text-white/30 rounded-xl px-5 py-4 text-sm font-sans outline-none focus:bg-white/[0.09] transition-all duration-200 ${
                      error ? "border-red-400/70" : "border-white/15 focus:border-[#2d5f3f]"
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 bg-[#e8d5a3] text-[#1a3d2b] font-semibold px-6 py-4 rounded-xl hover:bg-[#dfc98a] transition-colors duration-200 text-sm shrink-0 disabled:opacity-70"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-[#1a3d2b]/30 border-t-[#1a3d2b] rounded-full animate-spin" />
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
