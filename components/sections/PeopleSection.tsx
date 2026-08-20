"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/**
 * The collage, and the span arithmetic that has to add up.
 *
 * The container is `grid-cols-2 grid-rows-2` with a fixed height, so there are
 * exactly four cells to fill. The first entry used to be `col-span-2
 * row-span-2` — every cell — which pushed the other two into *implicit* rows
 * the container never sized. Implicit rows in a fixed-height grid are zero
 * pixels tall, so both images rendered at height 0: present in the DOM,
 * invisible on the page, and reported only as a `next/image` warning about a
 * parent with no height.
 *
 * One wide across the top, two side by side beneath. Three entries, four
 * cells, and the spans total four. **If an image is added here, the spans and
 * the container's row count have to be changed together** — that is the whole
 * trap, and it fails silently rather than loudly.
 */
const TEAM_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=800",
    alt: "Farm worker tending crops",
    className: "col-span-2 row-span-1",
  },
  {
    src: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=800",
    alt: "Team members at harvest",
    className: "col-span-1 row-span-1",
  },
  {
    src: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=800",
    alt: "Workers on the farm",
    className: "col-span-1 row-span-1",
  },
];

export function PeopleSection() {
  return (
    <section className="bg-[#080f0a] py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* LEFT — copy */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#6b9d7a] mb-4">
              Our People
            </p>
            <h2
              className="font-serif font-bold text-white leading-[1.06] mb-6"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)" }}
            >
              The People Behind<br />Our Harvest.
              <span className="inline-block ml-2 text-[#6b9d7a]">
                <svg viewBox="0 0 24 24" className="inline w-6 h-6 fill-none stroke-current stroke-[1.5]">
                  <path d="M12 2C9 2 6 5 6 9c0 2.5 1.5 4.5 3.5 5.5L9 22h6l-.5-7.5C16.5 13.5 18 11.5 18 9c0-4-3-7-6-7z" />
                </svg>
              </span>
            </h2>
            <p className="text-white/50 font-sans text-sm leading-relaxed mb-4 max-w-md">
              A farm is only as strong as the people who care for it. Our team works with passion, knowledge and commitment every single day.
            </p>
            <p className="text-white/50 font-sans text-sm leading-relaxed mb-8 max-w-md">
              From field managers and agronomists to processors and drivers — 65+ dedicated people show up for the land, and for each other.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-[#6b9d7a] font-semibold text-sm hover:gap-3 transition-all duration-200"
            >
              Meet Our Team <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* RIGHT — photo collage */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-2 grid-rows-2 gap-3 h-[420px]"
          >
            {TEAM_IMAGES.map((img, i) => (
              <motion.div
                key={img.alt}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
                className={`relative rounded-2xl overflow-hidden ${img.className}`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width:1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-[#080f0a]/20" />
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
