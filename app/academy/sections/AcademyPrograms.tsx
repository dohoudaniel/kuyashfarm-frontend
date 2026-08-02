"use client";

/**
 * Programme overview cards, linking to the full listing.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bird, Beef, Fish, Wheat, TrendingUp, Building2, Cpu,
  Settings, Package, Smartphone, Leaf, Rocket, CheckCircle,
  Clock, GraduationCap, type LucideIcon,
} from "lucide-react";
import { ACADEMY_PROGRAMS, type AcademyProgram } from "@/lib/data/academy";
import Link from "next/link";

const ICON_MAP: Record<string, LucideIcon> = {
  Bird, Beef, Fish, Wheat, TrendingUp, Building2, Cpu,
  Settings, Package, Smartphone, Leaf, Rocket,
};

const CATEGORIES = ["All", "Livestock", "Aquaculture", "Crops", "Technology", "Business", "Processing", "Sustainability"];

function ProgramCard({ program, index }: { program: AcademyProgram; index: number }) {
  const Icon = ICON_MAP[program.icon] ?? Leaf;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-2xl transition-all duration-400 overflow-hidden flex flex-col"
    >
      {/* Card header */}
      <div className="relative p-6 pb-5 bg-[#eef5f1]/40">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-400 group-hover:scale-110 bg-[#eef5f1] border border-[#c6dece]">
            <Icon className="w-6 h-6 text-[#2d5f3f]" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-[#eef5f1] text-[#2d5f3f] border border-[#c6dece]">
            {program.category}
          </span>
        </div>
        <h3 className="font-serif text-lg font-bold text-[#080f0a] leading-tight mb-2">{program.title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed font-sans">{program.description}</p>
      </div>

      {/* Meta row */}
      <div className="px-6 py-3 border-t border-gray-50 flex gap-4 text-xs text-gray-400 font-sans">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {program.duration}
        </span>
        <span className="flex items-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5" />
          {program.level}
        </span>
        <span className="flex items-center gap-1.5 text-[#2d5f3f] font-medium">
          <CheckCircle className="w-3.5 h-3.5" />
          {program.certification}
        </span>
      </div>

      {/* Outcomes */}
      <div className="px-6 pt-4 pb-6 flex-1 flex flex-col justify-between">
        <ul className="space-y-2 mb-6">
          {program.outcomes.map((o) => (
            <li key={o} className="flex items-start gap-2 text-sm text-gray-600 font-sans">
              <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0 bg-[#2d5f3f]" />
              {o}
            </li>
          ))}
        </ul>
        {program.classId ? (
          <Link
            href="/academy#classes"
            className="text-sm font-semibold text-[#2d5f3f] flex items-center gap-2 group/link"
          >
            <span className="group-hover/link:underline underline-offset-2">Enrol in this program</span>
            <span className="transition-transform duration-300 group-hover/link:translate-x-1">→</span>
          </Link>
        ) : (
          <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Coming Soon
          </span>
        )}
      </div>
    </motion.div>
  );
}

export function AcademyPrograms() {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? ACADEMY_PROGRAMS : ACADEMY_PROGRAMS.filter((p) => p.category === active);

  return (
    <section id="programs" className="bg-[#f9f8f6] py-28 md:py-36">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-14">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs font-mono uppercase tracking-[0.2em] text-[#6b9d7a] mb-4"
            >
              Learning Pathways
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-serif text-4xl md:text-5xl font-bold text-[#080f0a] leading-tight"
            >
              12 programs. One destination:
              <br />
              <span className="text-[#2d5f3f]">agricultural mastery.</span>
            </motion.h2>
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all duration-200 ${
                  active === cat
                    ? "bg-[#2d5f3f] text-white border-[#2d5f3f]"
                    : "border-gray-200 text-gray-600 hover:border-[#2d5f3f] hover:text-[#2d5f3f]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Cards grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((program, i) => (
              <ProgramCard key={program.id} program={program} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
