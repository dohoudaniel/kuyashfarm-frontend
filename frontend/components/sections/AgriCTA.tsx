"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function AgriCTA() {
  return (
    <section className="bg-[#080f0a] py-20 relative overflow-hidden">
      {/* subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 39px, #6b9d7a 39px, #6b9d7a 40px),
            repeating-linear-gradient(90deg, transparent, transparent 39px, #6b9d7a 39px, #6b9d7a 40px)`,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-10">

        <motion.h2
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif font-bold text-white leading-[1.05] max-w-2xl"
          style={{ fontSize: "clamp(1.8rem, 3.5vw, 3.2rem)" }}
        >
          LET&apos;S BUILD THE{" "}
          <span className="text-transparent bg-clip-text"
            style={{ backgroundImage: "linear-gradient(90deg, #6b9d7a, #e8d5a3)" }}>
            FUTURE OF AGRICULTURE
          </span>{" "}
          TOGETHER.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="shrink-0"
        >
          <Link
            href="/contact"
            className="group inline-flex items-center gap-3 border border-[#2d5f3f] bg-[#2d5f3f]/10 hover:bg-[#2d5f3f] text-white font-semibold text-sm px-8 py-4 rounded-full transition-all duration-300"
          >
            START A CONVERSATION
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
