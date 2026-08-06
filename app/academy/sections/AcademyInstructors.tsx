"use client";

/**
 * Instructor profiles, from the back office.
 *
 * This section rendered a hardcoded array until now, so an instructor added by
 * staff appeared nowhere and the page slowly diverged from who actually
 * teaches. Presentational: the page fetches and passes down, matching how the
 * class schedule already works.
 *
 * Renders nothing when the list is empty rather than an empty grid with a
 * heading over it — a "The Faculty" section with no faces reads as broken.
 */
import { motion } from "framer-motion";
import Image from "next/image";
import { BadgeCheck } from "lucide-react";

import type { Instructor } from "@/lib/api/academy";

/** Two letters for the avatar, since a photograph is optional. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((part) => /\p{L}/u.test(part))
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export function AcademyInstructors({ instructors }: { instructors: Instructor[] }) {
  if (instructors.length === 0) return null;

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
              className="text-xs font-mono uppercase tracking-[0.2em] text-accent mb-4"
            >
              The Faculty
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-serif text-4xl md:text-5xl font-bold text-ink leading-tight"
            >
              Taught by practitioners,
              <br />
              <span className="text-primary">not just professors.</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
          {instructors.map((inst, i) => (
            <motion.div
              key={inst.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative p-8 rounded-3xl border border-gray-100 hover:border-gray-200 hover:shadow-2xl transition-all duration-400 bg-white overflow-hidden"
            >
              {/* Subtle bg glow */}
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-primary/10" />

              {/* Avatar */}
              <div className="relative mb-6">
                <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center text-white font-serif text-xl font-bold shadow-lg bg-primary overflow-hidden">
                  {inst.photo ? (
                    <Image src={inst.photo} alt={inst.name} fill sizes="64px" className="object-cover" />
                  ) : (
                    initials(inst.name)
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-white flex items-center justify-center shadow">
                  <BadgeCheck className="w-4 h-4 text-primary" />
                </div>
              </div>

              {/* Info */}
              <h3 className="font-serif text-lg font-bold text-ink leading-tight mb-0.5">{inst.name}</h3>
              <p className="text-sm font-semibold text-primary mb-1">{inst.title}</p>
              {inst.bio && (
                <p className="text-gray-400 text-xs font-sans mb-5 line-clamp-3">{inst.bio}</p>
              )}

              {/* Credentials */}
              <ul className="space-y-2">
                {inst.specialties.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-xs text-gray-500 font-sans leading-snug">
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-primary" />
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
