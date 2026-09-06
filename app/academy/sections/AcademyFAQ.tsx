"use client";

/**
 * Frequently asked questions, as an accordion.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { ACADEMY_FAQS } from "@/lib/data/academy";

export function AcademyFAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-white py-28 md:py-36">
      <div className="max-w-7xl 2xl:max-w-[1536px] mx-auto px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          {/* Left — sticky header */}
          <div className="lg:sticky lg:top-32">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs font-mono uppercase tracking-[0.2em] text-primary mb-4"
            >
              Frequently Asked
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-serif text-4xl md:text-5xl font-bold text-ink leading-tight mb-6"
            >
              Questions we
              <br />
              <span className="text-primary">get asked most.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-gray-500 font-sans leading-relaxed mb-10"
            >
              Can&apos;t find what you&apos;re looking for? Reach out to our admissions team directly.
            </motion.p>
            <a
              href="mailto:academy@kuyashfarms.com"
              className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3.5 rounded-full hover:bg-secondary transition-colors duration-300 text-sm"
            >
              Contact Admissions
            </a>
          </div>

          {/* Right — accordion */}
          <div className="space-y-3">
            {ACADEMY_FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  open === i
                    ? "border-primary/30 bg-mist"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <button
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span className="font-sans font-semibold text-ink text-base leading-snug pr-4">
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                      open === i ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {open === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>

                <AnimatePresence>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6">
                        <p className="text-gray-600 font-sans leading-relaxed text-sm">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
