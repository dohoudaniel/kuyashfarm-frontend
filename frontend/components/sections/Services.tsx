"use client";

import { motion } from "framer-motion";
import { SERVICES } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Wheat, Beef, Fish, Droplets, Package, ShoppingBag } from "lucide-react";

const SERVICE_META = [
  {
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=800",
    icon: Wheat,
    tag: "Core Operations",
  },
  {
    image: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=800",
    icon: Beef,
    tag: "Livestock",
  },
  {
    image: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?q=80&w=800",
    icon: Fish,
    tag: "Aquaculture",
  },
  {
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=800",
    icon: Droplets,
    tag: "Processing",
  },
  {
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800",
    icon: Package,
    tag: "Value Chain",
  },
  {
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800",
    icon: ShoppingBag,
    tag: "Digital",
  },
];

export function Services() {
  return (
    <section id="services" className="bg-[#faf8f5] py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#2d5f3f] mb-3">
              Our Services
            </p>
            <h2
              className="font-serif font-bold text-[#080f0a] leading-[1.08]"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)" }}
            >
              Empowering communities through<br />
              sustainable agriculture.
            </h2>
          </div>
          <Link
            href="/services/crop-vegetable-production"
            className="inline-flex items-center gap-2 text-[#2d5f3f] font-semibold text-sm hover:gap-3 transition-all duration-200 shrink-0"
          >
            View all services <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((service, i) => {
            const meta = SERVICE_META[i];
            const Icon = meta.icon;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={`/services/${service.slug}`}
                  className="group flex flex-col bg-white border border-[#e8ede9] hover:border-[#c6dece] hover:shadow-lg rounded-2xl overflow-hidden transition-all duration-300 h-full"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden shrink-0">
                    <Image
                      src={meta.image}
                      alt={service.title}
                      fill
                      sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* subtle top fade */}
                    <div className="absolute inset-0 bg-linear-to-b from-black/10 to-transparent" />
                    {/* tag pill */}
                    <span className="absolute top-3 left-3 text-[9px] font-mono uppercase tracking-[0.18em] bg-white/90 backdrop-blur-sm text-[#2d5f3f] px-2.5 py-1 rounded-full">
                      {meta.tag}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-5">
                    {/* icon */}
                    <div className="w-9 h-9 rounded-xl bg-[#eef5f1] flex items-center justify-center mb-4 group-hover:bg-[#2d5f3f] transition-colors duration-300">
                      <Icon className="w-4 h-4 text-[#2d5f3f] group-hover:text-white transition-colors duration-300" />
                    </div>

                    <h3 className="font-serif font-bold text-[#080f0a] text-base leading-snug mb-2 group-hover:text-[#2d5f3f] transition-colors duration-200">
                      {service.title}
                    </h3>
                    <p className="text-xs text-gray-400 font-sans leading-relaxed flex-1">
                      {service.description}
                    </p>

                    {/* footer */}
                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#eef5f1]">
                      <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#6b9d7a]">
                        Learn more
                      </span>
                      <div className="w-7 h-7 rounded-full border border-[#c6dece] flex items-center justify-center group-hover:bg-[#2d5f3f] group-hover:border-[#2d5f3f] transition-all duration-300">
                        <ArrowRight className="w-3 h-3 text-[#2d5f3f] group-hover:text-white transition-colors duration-300" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
