"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const UPDATES = [
  {
    category: "Farm Update",
    title: "Expanding Our Aquaculture Wing: 200 Tons Capacity Achieved",
    excerpt: "Our catfish production facility has hit a major milestone, with fully operational ponds and a new water recycling system now running at full capacity.",
    date: "July 28, 2026",
    image: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?q=80&w=800",
    href: "/blog",
  },
  {
    category: "Academy",
    title: "Kuyash Academy Trains 120 Farmers in Q2 2026",
    excerpt: "Our second cohort of the Practical Farming Programme graduated this quarter, equipped with modern techniques in horticulture, irrigation and soil management.",
    date: "July 14, 2026",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800",
    href: "/academy",
  },
  {
    category: "Agribusiness",
    title: "Kuyash Launches Wholesale Distribution to 6 States",
    excerpt: "Our produce distribution network now covers Abuja, Lagos, Kano, Enugu, Rivers and Oyo — bringing fresh farm produce directly to retailers.",
    date: "June 30, 2026",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800",
    href: "/blog",
  },
  {
    category: "Sustainability",
    title: "30% Water Reduction Through Smart Irrigation Sensors",
    excerpt: "Deploying IoT-enabled sensors across our screen houses has led to a significant drop in water usage while improving crop health scores across all plots.",
    date: "June 12, 2026",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=800",
    href: "/blog",
  },
];

export function LatestUpdates() {
  return (
    <section className="bg-[#faf8f5] py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">

        {/* header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-12"
        >
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#2d5f3f] mb-3">
              Latest Updates
            </p>
            <h2 className="font-serif font-bold text-[#080f0a] leading-tight"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)" }}>
              From the Farm
            </h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-[#2d5f3f] font-semibold text-sm hover:gap-2.5 transition-all duration-200 shrink-0"
          >
            View All News <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {UPDATES.map((post, i) => (
            <motion.div
              key={post.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={post.href}
                className="group flex flex-col bg-white border border-gray-100 hover:border-[#c6dece] hover:shadow-lg rounded-2xl overflow-hidden transition-all duration-300 h-full"
              >
                {/* image */}
                <div className="relative h-44 overflow-hidden shrink-0">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* content */}
                <div className="p-5 flex flex-col flex-1">
                  <span className="inline-block text-[9px] font-mono uppercase tracking-[0.2em] text-[#2d5f3f] bg-[#eef5f1] px-2.5 py-1 rounded-full mb-3 self-start">
                    {post.category}
                  </span>
                  <h3 className="font-serif font-bold text-[#080f0a] text-sm leading-snug mb-2 group-hover:text-[#2d5f3f] transition-colors duration-200 line-clamp-3">
                    {post.title}
                  </h3>
                  <p className="text-[11px] text-gray-400 font-sans leading-relaxed flex-1 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-1.5 mt-4 text-white/30 text-[10px] font-sans">
                    <Calendar className="w-3 h-3 text-gray-300" />
                    <span className="text-gray-400">{post.date}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
