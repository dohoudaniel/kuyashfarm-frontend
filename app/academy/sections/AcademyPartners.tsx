"use client";

import { motion } from "framer-motion";
import { ACADEMY_PARTNERS } from "@/lib/data/academy";

export function AcademyPartners() {
  return (
    <section className="bg-white py-20 border-t border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs font-mono uppercase tracking-[0.25em] text-gray-300 mb-12"
        >
          Trusted partners & accreditation bodies
        </motion.p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6 items-center">
          {ACADEMY_PARTNERS.map((partner, i) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group flex flex-col items-center gap-2 cursor-default"
            >
              {/* Monochrome logo placeholder — elegant typographic representation */}
              <div className="w-full h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center px-3 group-hover:border-[#2d5f3f]/20 group-hover:bg-[#f0f7f3] transition-all duration-300">
                <span className="font-sans font-bold text-[10px] text-gray-400 text-center leading-tight uppercase tracking-wider group-hover:text-[#2d5f3f] transition-colors duration-300">
                  {partner.name}
                </span>
              </div>
              <span className="text-[9px] font-mono uppercase tracking-widest text-gray-300">{partner.category}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
