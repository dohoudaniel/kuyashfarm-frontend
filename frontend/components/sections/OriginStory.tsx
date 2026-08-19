"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function OriginStory() {
  return (
    <section className="bg-white py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* LEFT — copy */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#2d5f3f] mb-4">
              Our Beginning
            </p>
            <h2
              className="font-serif font-bold text-[#080f0a] leading-[1.06] mb-6"
              style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)" }}
            >
              Every Farm Has<br />A Beginning.
              <span className="inline-block ml-2 text-[#2d5f3f]">
                <svg viewBox="0 0 24 24" className="inline w-7 h-7 fill-none stroke-current stroke-[1.5]">
                  <path d="M12 2C9 2 6 5 6 9c0 2.5 1.5 4.5 3.5 5.5L9 22h6l-.5-7.5C16.5 13.5 18 11.5 18 9c0-4-3-7-6-7z" />
                </svg>
              </span>
            </h2>
            <div className="space-y-4 text-gray-500 font-sans text-sm leading-relaxed max-w-md">
              <p>
                Kuyash began with a simple belief that agriculture can do more — feed people, create opportunities and strengthen communities.
              </p>
              <p>
                From a small piece of land in Nasarawa State, that belief has grown into a thriving integrated farm touching lives and building a better future.
              </p>
            </div>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 mt-8 text-[#2d5f3f] font-semibold text-sm hover:gap-3 transition-all duration-200"
            >
              Read Our Story <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* RIGHT — image with play button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-2xl overflow-hidden group cursor-pointer"
            style={{ aspectRatio: "4/3" }}
          >
            <Image
              src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1600"
              alt="Kuyash farm aerial view"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width:1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-[#080f0a]/30 group-hover:bg-[#080f0a]/20 transition-colors duration-300" />

            {/* play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Play className="w-6 h-6 text-[#2d5f3f] fill-[#2d5f3f] ml-1" />
              </div>
            </div>

            {/* caption */}
            <div className="absolute bottom-5 left-5 right-5">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3">
                <p className="font-serif font-bold text-white text-sm">Nasarawa State, Nigeria</p>
                <p className="text-white/60 text-[10px] font-sans mt-0.5">56 hectares of integrated farmland</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
