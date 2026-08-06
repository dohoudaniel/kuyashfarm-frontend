"use client";

/**
 * Programme overview cards, linking to the full listing.
 *
 * **Programmes come from the API.** They used to come from `ACADEMY_PROGRAMS`,
 * a hardcoded array in `lib/data/academy.ts` — so the back office could create
 * a programme, list it, and it would never appear here. Nothing reported the
 * gap; it simply did not show up. That is the prototype's localStorage problem
 * in a different costume, and it survived the migration that was meant to kill
 * it.
 *
 * The icon is the one thing still resolved on the client, because a lucide
 * component cannot be sent over JSON. The server stores its *name*; anything
 * unrecognised falls back to a leaf rather than crashing the section.
 *
 * The category filter is built from what the data actually contains rather
 * than from a fixed list, so a programme in a new category is reachable
 * instead of being filtered into invisibility by a constant nobody updated.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bird, Beef, Fish, Wheat, TrendingUp, Building2, Cpu,
  Settings, Package, Smartphone, Leaf, Rocket, CheckCircle,
  Clock, GraduationCap, type LucideIcon,
} from "lucide-react";
import type { Program } from "@/lib/api/academy";
import Link from "next/link";

const ICON_MAP: Record<string, LucideIcon> = {
  Bird, Beef, Fish, Wheat, TrendingUp, Building2, Cpu,
  Settings, Package, Smartphone, Leaf, Rocket,
};

function ProgramCard({ program, index }: { program: Program; index: number }) {
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
      <div className="relative p-6 pb-5 bg-mist/40">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-400 group-hover:scale-110 bg-mist border border-edge">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-mist text-primary border border-edge">
            {program.category}
          </span>
        </div>
        <h3 className="font-serif text-lg font-bold text-ink leading-tight mb-2">{program.title}</h3>
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
        <span className="flex items-center gap-1.5 text-primary font-medium">
          <CheckCircle className="w-3.5 h-3.5" />
          {program.certification}
        </span>
      </div>

      {/* Outcomes */}
      <div className="px-6 pt-4 pb-6 flex-1 flex flex-col justify-between">
        <ul className="space-y-2 mb-6">
          {program.outcomes.map((o) => (
            <li key={o} className="flex items-start gap-2 text-sm text-gray-600 font-sans">
              <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0 bg-primary" />
              {o}
            </li>
          ))}
        </ul>
        {/* Every programme links to the schedule. The old "Coming Soon" state
            keyed off a `classId` that only the hardcoded array had, so it was
            really saying "this programme was not in the file", which is not
            something a visitor can act on. */}
        <Link
          href="/academy#classes"
          className="text-sm font-semibold text-primary flex items-center gap-2 group/link"
        >
          <span className="group-hover/link:underline underline-offset-2">See upcoming dates</span>
          <span className="transition-transform duration-300 group-hover/link:translate-x-1">→</span>
        </Link>
      </div>
    </motion.div>
  );
}

export function AcademyPrograms({ programs }: { programs: Program[] }) {
  const [active, setActive] = useState("All");

  // Built from the data, not from a constant. A staff member who creates a
  // programme in a new category would otherwise have it rendered but
  // unreachable behind a filter list nobody remembered to update.
  const categories = [
    "All",
    ...Array.from(new Set(programs.map((p) => p.category).filter(Boolean))).sort(),
  ];

  const filtered = active === "All" ? programs : programs.filter((p) => p.category === active);

  // The API being unreachable must not leave a heading over an empty grid.
  if (programs.length === 0) return null;

  return (
    <section id="programs" className="bg-cream py-28 md:py-36">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-14">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs font-mono uppercase tracking-[0.2em] text-accent mb-4"
            >
              Learning Pathways
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-serif text-4xl md:text-5xl font-bold text-ink leading-tight"
            >
              {/* Counted, not asserted. This said "12 programs" against a
                  hardcoded array of eight, so the heading was wrong before the
                  data even moved — and would have gone on being wrong every
                  time staff added or retired one. */}
              {programs.length} {programs.length === 1 ? "programme" : "programmes"}. One
              destination:
              <br />
              <span className="text-primary">agricultural mastery.</span>
            </motion.h2>
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all duration-200 ${
                  active === cat
                    ? "bg-primary text-white border-primary"
                    : "border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Cards grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
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
