"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const PRODUCTS = [
  {
    src: "https://images.unsplash.com/photo-1467638237004-0f284c98e01c?q=80&w=800",
    alt: "Fresh tomatoes",
    label: "Fresh Vegetables",
  },
  {
    src: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=800",
    alt: "Livestock",
    label: "Livestock",
  },
  {
    src: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=800",
    alt: "Fresh produce basket",
    label: "Farm Produce",
  },
  {
    src: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800",
    alt: "Market fresh produce",
    label: "Ready for Market",
  },
];

export function ProductShowcase() {
  return (
    <section className="bg-[#faf8f5] py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-16 items-center">

          {/* LEFT — copy */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#2d5f3f] mb-4">
              From Our Farm
            </p>
            <h2
              className="font-serif font-bold text-[#080f0a] leading-[1.06] mb-5"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)" }}
            >
              From Our Farm<br />To Your Table.
            </h2>
            <p className="text-gray-500 font-sans text-sm leading-relaxed mb-3 max-w-sm">
              Fresh. Healthy. Local. Produced with love and discipline and care.
            </p>
            <p className="text-gray-500 font-sans text-sm leading-relaxed mb-8 max-w-sm">
              Everything we grow is handled with the same care from the first seed to your door — no shortcuts, no compromises.
            </p>
            <Link
              href="/shop/all"
              className="inline-flex items-center gap-2 text-[#2d5f3f] font-semibold text-sm hover:gap-3 transition-all duration-200"
            >
              Explore Our Produce <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* RIGHT — photo grid */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-2 gap-3"
          >
            {PRODUCTS.map((product, i) => (
              <motion.div
                key={product.alt}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                className="group relative rounded-2xl overflow-hidden"
                style={{ aspectRatio: "4/3" }}
              >
                <Image
                  src={product.src}
                  alt={product.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width:640px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#080f0a]/60 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <p className="font-serif font-bold text-white text-xs">{product.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
