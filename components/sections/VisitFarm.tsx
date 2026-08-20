"use client";

import { motion } from "framer-motion";
import { ArrowRight, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function VisitFarm() {
  return (
    <section className="relative min-h-[560px] flex items-center overflow-hidden">
      {/* background */}
      <Image
        src="https://images.unsplash.com/photo-1509099381441-ea3c0cf98b94?q=80&w=1800"
        alt="Kuyash Farms landscape"
        fill
        className="object-cover"
        sizes="100vw"
        priority={false}
      />
      <div className="absolute inset-0 bg-[#080f0a]/65" />

      {/* content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-20">
        <div className="max-w-xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#6b9d7a] mb-4"
          >
            Come See What We Are Growing
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif font-bold text-white leading-[1.06] mb-5"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
          >
            Come See What<br />We Are Growing.
            <span className="inline-block ml-2 text-[#6b9d7a]">
              <svg viewBox="0 0 24 24" className="inline w-7 h-7 fill-none stroke-current stroke-[1.5]">
                <path d="M12 2C9 2 6 5 6 9c0 2.5 1.5 4.5 3.5 5.5L9 22h6l-.5-7.5C16.5 13.5 18 11.5 18 9c0-4-3-7-6-7z" />
              </svg>
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="text-white/55 font-sans text-sm leading-relaxed mb-10 max-w-sm"
          >
            We would love to welcome you to our farm, share our story and explore how we can grow together.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.22 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2.5 bg-[#2d5f3f] hover:bg-[#4a7c59] text-white font-semibold text-sm px-7 py-3.5 rounded-full transition-all duration-300"
            >
              Visit The Farm
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2.5 border border-white/20 bg-white/10 hover:bg-white/16 backdrop-blur-sm text-white font-semibold text-sm px-7 py-3.5 rounded-full transition-all duration-300"
            >
              <Users className="w-4 h-4" />
              Partner With Us
            </Link>
          </motion.div>

          {/* Kuyash wordmark watermark */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 flex items-center gap-2.5"
          >
            <div className="w-6 h-6 rounded-md bg-[#2d5f3f] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-white stroke-[1.5]">
                <path d="M12 2C9 2 6 5 6 9c0 2.5 1.5 4.5 3.5 5.5L9 22h6l-.5-7.5C16.5 13.5 18 11.5 18 9c0-4-3-7-6-7z" />
              </svg>
            </div>
            <span className="font-serif font-bold text-white/70 text-sm tracking-wide">KUYASH FARMS</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
