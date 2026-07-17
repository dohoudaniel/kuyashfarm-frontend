"use client";

import { motion } from "framer-motion";
import { ACADEMY_INSTRUCTORS } from "@/lib/data/academy";
import { BadgeCheck } from "lucide-react";

export function AcademyInstructors() {
  return (
    <section className="bg-white py-28 md:py-36">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
          <div className="max-w-xl">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs font-mono uppercase tracking-[0.2em] text-[#6b9d7a] mb-4"
            >
              The Faculty
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-serif text-4xl md:text-5xl font-bold text-[#080f0a] leading-tight"
            >
              Taught by practitioners,
              <br />
              <span className="text-[#2d5f3f]">not just professors.</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-base font-sans max-w-xs leading-relaxed"
          >
            Our instructors combine academic credentials with decades of active farm practice. Theory taught by people living it.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ACADEMY_INSTRUCTORS.map((inst, i) => (
            <motion.div
              key={inst.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative p-8 rounded-3xl border border-gray-100 hover:border-gray-200 hover:shadow-2xl transition-all duration-400 bg-white overflow-hidden"
            >
              {/* Subtle bg glow */}
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[#2d5f3f]/10" />

              {/* Avatar */}
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-serif text-xl font-bold shadow-lg bg-[#2d5f3f]">
                  {inst.initials}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-white flex items-center justify-center shadow">
                  <BadgeCheck className="w-4 h-4 text-[#2d5f3f]" />
                </div>
              </div>

              {/* Info */}
              <h3 className="font-serif text-lg font-bold text-[#080f0a] leading-tight mb-0.5">{inst.name}</h3>
              <p className="text-sm font-semibold text-[#2d5f3f] mb-1">{inst.role}</p>
              <p className="text-gray-400 text-xs font-sans mb-1">{inst.specialty}</p>
              <p className="text-gray-400 text-xs font-sans mb-5">{inst.experience} of experience</p>

              {/* Credentials */}
              <ul className="space-y-2">
                {inst.credentials.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-xs text-gray-500 font-sans leading-snug">
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-[#2d5f3f]" />
                    {c}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
