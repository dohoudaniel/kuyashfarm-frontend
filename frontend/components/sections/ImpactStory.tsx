"use client";

import { motion } from "framer-motion";
import { Sprout, Droplets, Users, Globe } from "lucide-react";
import Image from "next/image";

const IMPACT = [
  { value: "500+", label: "Acres Managed" },
  { value: "25+", label: "Farm Operations" },
  { value: "1,000+", label: "People Reached" },
  { value: "30%", label: "Less Resource Waste" },
];

const PILLARS = [
  { icon: Sprout, title: "Soil", description: "Protecting our foundation" },
  { icon: Droplets, title: "Water", description: "Using resources responsibly" },
  { icon: Users, title: "People", description: "Empowering communities" },
  { icon: Globe, title: "Future", description: "Building a stronger tomorrow" },
];

export function ImpactStory() {
  return (
    <section className="bg-white py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-8">

          {/* ── Col 1 — Our Impact ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#6b9d7a] mb-4">
              Our Impact
            </p>
            <h3 className="font-serif font-bold text-[#080f0a] leading-tight mb-4"
              style={{ fontSize: "clamp(1.4rem, 2vw, 2rem)" }}>
              Building a better farm. Stronger communities. A sustainable future.
            </h3>
            <p className="text-sm text-gray-400 font-sans leading-relaxed mb-8">
              Our integrated operations create ripple effects across the entire agricultural value chain — from soil health to market access.
            </p>

            {/* impact numbers */}
            <div className="grid grid-cols-2 gap-4">
              {IMPACT.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
                  className="bg-[#faf8f5] border border-gray-100 rounded-xl p-4"
                >
                  <p className="font-serif font-bold text-[#2d5f3f] text-2xl leading-none mb-1">
                    {item.value}
                  </p>
                  <p className="text-[11px] text-gray-400 font-sans leading-snug">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── Col 2 — Our Story ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col"
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#6b9d7a] mb-4">
              Our Story
            </p>

            {/* image */}
            <div className="relative h-52 rounded-2xl overflow-hidden mb-6 shrink-0">
              <Image
                src="https://images.unsplash.com/photo-1500651230702-0e2d8a49d7ad?q=80&w=1600"
                alt="Kuyash farm team"
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#080f0a]/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <p className="font-serif text-white font-bold text-sm">Kuyash.</p>
                <p className="text-white/60 text-[10px] font-sans">Growing Better. Feeding Tomorrow.</p>
              </div>
            </div>

            <h3 className="font-serif font-bold text-[#080f0a] text-lg mb-3">
              It starts with the soil.
            </h3>
            <p className="text-sm text-gray-400 font-sans leading-relaxed flex-1">
              The people. The discipline. The vision. Kuyash was founded on the belief that Africa&apos;s agricultural potential is limitless when paired with the right technology, training, and tenacity. Every crop we grow is a step toward that vision.
            </p>

            <p className="mt-5 font-serif italic text-[#2d5f3f] text-base">
              &ldquo;One harvest at a time.&rdquo;
            </p>
          </motion.div>

          {/* ── Col 3 — Sustainability pillars ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#6b9d7a] mb-4">
              Sustainable for a Better Tomorrow
            </p>
            <h3 className="font-serif font-bold text-[#080f0a] leading-tight mb-8"
              style={{ fontSize: "clamp(1.2rem, 1.8vw, 1.6rem)" }}>
              Four pillars that guide every decision we make on the farm.
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {PILLARS.map((pillar, i) => {
                const Icon = pillar.icon;
                return (
                  <motion.div
                    key={pillar.title}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.07 }}
                    className="group bg-[#faf8f5] border border-gray-100 hover:border-[#c6dece] hover:shadow-md rounded-2xl p-5 transition-all duration-300"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#eef5f1] border border-[#c6dece] flex items-center justify-center mb-4 group-hover:bg-[#2d5f3f] group-hover:border-[#2d5f3f] transition-all duration-300">
                      <Icon className="w-4 h-4 text-[#2d5f3f] group-hover:text-white transition-colors duration-300" />
                    </div>
                    <p className="font-serif font-bold text-[#080f0a] text-base mb-1">
                      {pillar.title}
                    </p>
                    <p className="text-[11px] text-gray-400 font-sans leading-snug">
                      {pillar.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
