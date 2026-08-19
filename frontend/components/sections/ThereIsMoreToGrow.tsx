"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function ThereIsMoreToGrow() {
  return (
    <section className="bg-white py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* LEFT — copy */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2
              className="font-serif font-bold text-[#080f0a] leading-[1.06] mb-4"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)" }}
            >
              There Is More
              <span className="inline-block ml-2 text-[#2d5f3f]">
                <svg viewBox="0 0 24 24" className="inline w-6 h-6 fill-none stroke-current stroke-[1.5]">
                  <path d="M12 2C9 2 6 5 6 9c0 2.5 1.5 4.5 3.5 5.5L9 22h6l-.5-7.5C16.5 13.5 18 11.5 18 9c0-4-3-7-6-7z" />
                </svg>
              </span>
              <br />To Grow
            </h2>
            <p className="text-gray-500 font-sans text-sm leading-relaxed mb-6 max-w-xs">
              We remain committed to improving, expanding and creating more value for people, communities and the land.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-[#2d5f3f] font-semibold text-sm hover:gap-3 transition-all duration-200"
            >
              Our Vision For The Future <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* RIGHT — wide farm landscape image */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-2xl overflow-hidden"
            style={{ aspectRatio: "16/7" }}
          >
            <Image
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600"
              alt="Kuyash farm at sunset"
              fill
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 55vw"
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
