"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const STATS = [
  { value: "56+", label: "Hectares", sub: "Farm Area" },
  { value: "65+", label: "People", sub: "On Our Team" },
  { value: "1,200+", label: "Farmers", sub: "Trained" },
  { value: "10+", label: "Communities", sub: "Reached" },
  { value: "7+", label: "Years of", sub: "Experience" },
];

export function ImpactNumbers() {
  return (
    <section className="bg-white py-24 border-t border-gray-100 overflow-hidden">
      <div className="max-w-7xl 2xl:max-w-[1536px] mx-auto px-6 md:px-12 lg:px-16">

        {/* header row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55 }}
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-primary mb-3">
              Our Impact
            </p>
            <h2
              className="font-serif font-bold text-ink leading-[1.08]"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)" }}
            >
              Our work creates impact<br />beyond the farm.
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all duration-200 shrink-0"
            >
              See Full Impact Report <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* stat row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-0 lg:divide-x lg:divide-gray-100">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.sub}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="lg:px-8 first:lg:pl-0 last:lg:pr-0 flex flex-col"
            >
              {/* accent line */}
              <div className="w-8 h-0.5 bg-primary mb-5" />
              <p
                className="font-serif font-bold text-ink leading-none mb-1"
                style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)" }}
              >
                {stat.value}
              </p>
              <p className="font-sans font-semibold text-sm text-primary mb-0.5">{stat.label}</p>
              <p className="font-sans text-xs text-gray-500">{stat.sub}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
