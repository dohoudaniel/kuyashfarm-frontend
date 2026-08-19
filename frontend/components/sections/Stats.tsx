"use client";

import { motion } from "framer-motion";
import { Users, TrendingUp, Leaf, Award } from "lucide-react";

const STATS = [
  { value: "40", unit: "acres", label: "Working Farm", icon: Leaf, description: "Of actively managed, certified farmland across Kuyash operations" },
  { value: "5,000+", unit: "", label: "Farmers Connected", icon: Users, description: "Smallholder farmers empowered through our training and supply network" },
  { value: "90%", unit: "", label: "Yield Improvement", icon: TrendingUp, description: "Average yield increase recorded across partner farms in the first season" },
  { value: "98%", unit: "", label: "Positive Impact", icon: Award, description: "Customer satisfaction score across all product lines and delivery services" },
];

export function Stats() {
  return (
    <section className="bg-[#faf8f5] py-20 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-4"
        >
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#6b9d7a] mb-3">
              Impact by the numbers
            </p>
            <h2 className="font-serif font-bold text-[#080f0a] leading-tight"
              style={{ fontSize: "clamp(1.6rem, 2.8vw, 2.4rem)" }}>
              Measurable results, <br className="hidden md:block" />
              real-world impact.
            </h2>
          </div>
          <p className="text-sm text-gray-400 font-sans max-w-xs leading-relaxed">
            Every number represents a farmer helped, a harvest improved, or a community fed.
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="group relative bg-white border border-gray-100 hover:border-[#c6dece] hover:shadow-lg rounded-2xl p-7 transition-all duration-300 overflow-hidden"
              >
                {/* top accent */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#2d5f3f] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                {/* icon */}
                <div className="w-10 h-10 rounded-xl bg-[#eef5f1] border border-[#c6dece] flex items-center justify-center mb-5 group-hover:bg-[#2d5f3f] group-hover:border-[#2d5f3f] transition-all duration-300">
                  <Icon className="w-4 h-4 text-[#2d5f3f] group-hover:text-white transition-colors duration-300" />
                </div>

                {/* value */}
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-serif font-bold text-[#080f0a] leading-none"
                    style={{ fontSize: "clamp(2rem, 3vw, 2.8rem)" }}>
                    {stat.value}
                  </span>
                  {stat.unit && (
                    <span className="text-sm font-semibold text-[#2d5f3f] font-sans">{stat.unit}</span>
                  )}
                </div>

                {/* label */}
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2d5f3f] font-mono mb-3">
                  {stat.label}
                </p>

                {/* description */}
                <p className="text-xs text-gray-400 font-sans leading-relaxed">
                  {stat.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
