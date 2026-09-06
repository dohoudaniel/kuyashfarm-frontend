"use client";

import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, HandshakeIcon, Sprout, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const PROGRAMMES = [
  {
    icon: GraduationCap,
    title: "Farmer Training",
    description: "Practical training to build skills and confidence in modern farming techniques.",
    image: "/images/stock/children-smiling.webp",
  },
  {
    icon: Sprout,
    title: "Out-grower Support",
    description: "Helping farmers improve yields and income through structured out-grower schemes.",
    image: "/images/stock/field-aerial.webp",
  },
  {
    icon: HandshakeIcon,
    title: "Field Demonstrations",
    description: "Learning by seeing and doing on the farm — hands-on knowledge transfer.",
    image: "/images/stock/soil-preparation.webp",
  },
  {
    icon: Users,
    title: "Community Impact",
    description: "Building stronger communities together through shared agricultural growth.",
    image: "/images/stock/hands-together.webp",
  },
];

export function GrowingWithOthers() {
  return (
    <section className="bg-cream py-24 overflow-hidden">
      <div className="max-w-7xl 2xl:max-w-[1536px] mx-auto px-6 md:px-12 lg:px-16">

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-16 items-start">

          {/* LEFT — copy */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:sticky lg:top-24"
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-primary mb-4">
              Growing With Others
            </p>
            <h2
              className="font-serif font-bold text-ink leading-[1.06] mb-5"
              style={{ fontSize: "clamp(1.8rem, 2.8vw, 2.6rem)" }}
            >
              We believe in shared knowledge and strong partnerships for a better future.
            </h2>
            <p className="text-gray-500 font-sans text-sm leading-relaxed mb-4">
              Through training, out-grower support and community partnerships, we help farmers grow and thrive.
            </p>
            <Link
              href="/academy"
              className="inline-flex items-center gap-2 mt-4 text-primary font-semibold text-sm hover:gap-3 transition-all duration-200"
            >
              Explore Our Academy <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* RIGHT — 2x2 programme cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {PROGRAMMES.map((prog, i) => {
              const Icon = prog.icon;
              return (
                <motion.div
                  key={prog.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="group bg-white border border-[#e8ede9] hover:border-edge hover:shadow-md rounded-2xl overflow-hidden transition-all duration-300"
                >
                  {/* image */}
                  <div className="relative h-36 overflow-hidden">
                    <Image
                      src={prog.image}
                      alt={prog.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width:640px) 100vw, 30vw"
                    />
                    <div className="absolute inset-0 bg-linear-to-b from-black/5 to-black/30" />
                  </div>

                  {/* content */}
                  <div className="p-5">
                    <div className="w-8 h-8 rounded-lg bg-mist flex items-center justify-center mb-3 group-hover:bg-primary transition-colors duration-300">
                      <Icon className="w-4 h-4 text-primary group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="font-serif font-bold text-ink text-base mb-1.5">
                      {prog.title}
                    </h3>
                    <p className="text-xs text-gray-500 font-sans leading-relaxed">
                      {prog.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
