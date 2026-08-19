"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";

export function FooterCTA() {
  return (
    <section className="bg-[#080f0a] py-28 relative overflow-hidden">
      {/* grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)`,
          backgroundSize: "60px 60px",
        }} />

      {/* glow blobs */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#2d5f3f]/20 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-[#4a7c59]/15 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 lg:px-16 text-center">

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-[10px] font-mono uppercase tracking-[0.28em] text-[#6b9d7a] mb-6"
        >
          Built for partners who think long term
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif font-bold text-white leading-[1.04] mb-6"
          style={{ fontSize: "clamp(2.4rem, 6vw, 5.5rem)" }}
        >
          Let&apos;s grow something{" "}
          <span
            className="text-transparent bg-clip-text"
            style={{ backgroundImage: "linear-gradient(135deg, #6b9d7a 0%, #e8d5a3 100%)" }}
          >
            meaningful.
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, delay: 0.18 }}
          className="text-white/45 font-sans leading-relaxed mx-auto mb-12"
          style={{ fontSize: "clamp(0.95rem, 1.3vw, 1.1rem)", maxWidth: "520px" }}
        >
          From our farm to a better future. Join thousands of farmers, businesses and communities building with Kuyash.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.26 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/academy"
            className="group inline-flex items-center gap-2.5 bg-[#2d5f3f] hover:bg-[#4a7c59] text-white font-semibold px-8 py-4 rounded-full transition-all duration-300"
            style={{ fontSize: "clamp(0.875rem, 1vw, 1rem)" }}
          >
            Work With Us
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          <Link
            href="/#about"
            className="inline-flex items-center gap-2.5 border border-white/15 bg-white/8 hover:bg-white/14 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-full transition-all duration-300"
            style={{ fontSize: "clamp(0.875rem, 1vw, 1rem)" }}
          >
            <Phone className="w-4 h-4" />
            Contact Kuyash
          </Link>
        </motion.div>

        {/* partner types */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.36 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
        >
          {["Retailers", "Distributors", "Food Businesses", "Institutions", "Agribusiness Partners"].map((partner) => (
            <span key={partner} className="text-white/25 text-xs font-sans">
              {partner}
            </span>
          ))}
        </motion.div>

        {/* bottom rule */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 h-px bg-linear-to-r from-transparent via-white/10 to-transparent"
        />
      </div>
    </section>
  );
}
