"use client";

/**
 * Upcoming classes.
 *
 * Rendered from the API, passed down by the page's Server Component. The
 * prototype mapped over a hardcoded `ACADEMY_CLASSES` array whose `seatsLeft`
 * values — "8 seats left", "5 seats left" — were string literals that never
 * changed no matter how many people booked. A sold-out class advertised seats,
 * and a class added through the admin never appeared at all.
 */

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, ArrowRight } from "lucide-react";

import type { AcademyClass } from "@/lib/api/academy";
import { formatPrice } from "@/lib/utils";

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "bg-green-100 text-green-700",
  INTERMEDIATE: "bg-amber-100 text-amber-700",
  ADVANCED: "bg-red-100 text-red-700",
  ALL_LEVELS: "bg-blue-100 text-blue-700",
};

function humanLevel(level: string): string {
  return level
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^./, (character) => character.toUpperCase());
}

function when(iso: string): string {
  const date = new Date(iso);
  return `${date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })} · ${date.toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" })}`;
}

export function UpcomingClasses({ classes }: { classes: AcademyClass[] }) {
  return (
    <section id="classes" className="bg-white py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        {/* Header */}
        <div className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-[#6b9d7a]"
            >
              Upcoming Classes
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-serif text-4xl font-bold leading-tight text-[#080f0a] md:text-5xl"
            >
              Book your spot.
              <br />
              <span className="text-[#2d5f3f]">Seats fill fast.</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-xs font-sans text-sm leading-relaxed text-gray-400"
          >
            All classes are held on our working farm in Lagos. Register early to secure your seat.
          </motion.p>
        </div>

        {classes.length === 0 ? (
          <div className="rounded-3xl border border-gray-100 bg-[#f7f5f0] py-20 text-center">
            <p className="mb-2 font-serif text-xl font-bold text-[#1a3d2b]">
              No classes scheduled just yet
            </p>
            <p className="mx-auto max-w-md text-sm text-gray-500">
              We&apos;re planning the next intake. Leave your email below and we&apos;ll tell you
              the moment dates are announced.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
            {classes.map((cls, index) => (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="duration-400 group flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white transition-all hover:border-gray-200 hover:shadow-2xl"
              >
                <div className="relative h-52 w-full overflow-hidden">
                  {cls.image ? (
                    <Image
                      src={cls.image}
                      alt={cls.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#1a3d2b]" />
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />

                  <span
                    className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-semibold ${
                      LEVEL_COLORS[cls.level] ?? "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {humanLevel(cls.level)}
                  </span>

                  {/* Real seat counts, derived from real bookings. */}
                  {cls.is_full ? (
                    <span className="absolute right-4 top-4 rounded-full bg-gray-900/80 px-3 py-1.5 text-xs font-semibold text-white">
                      Sold out
                    </span>
                  ) : cls.seats_left <= 8 ? (
                    <span className="absolute right-4 top-4 rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">
                      {cls.seats_left} {cls.seats_left === 1 ? "seat" : "seats"} left
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col p-7">
                  <h3 className="mb-2 font-serif text-xl font-bold leading-tight text-[#080f0a]">
                    {cls.title}
                  </h3>
                  <p className="mb-5 font-sans text-sm leading-relaxed text-gray-500">
                    {cls.description}
                  </p>

                  <div className="mb-6 space-y-2.5 border-t border-gray-50 pt-5 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 shrink-0 text-[#2d5f3f]" />
                      <span>{when(cls.scheduled_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-[#2d5f3f]" />
                      <span>{cls.location || "Kuyash Integrated Farm, Lagos"}</span>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <div>
                      <p className="font-serif text-2xl font-bold text-[#080f0a]">
                        {Number(cls.price) === 0 ? "Free" : formatPrice(Number(cls.price))}
                      </p>
                      <p className="font-sans text-xs text-gray-400">per person</p>
                    </div>

                    {!cls.is_open_for_registration ? (
                      <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-400">
                        {cls.is_full ? "Sold out" : "Closed"}
                      </span>
                    ) : (
                      <Link
                        href={`/academy/classes/${cls.slug}`}
                        className="group/btn inline-flex items-center gap-2 rounded-full bg-[#2d5f3f] px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#1a3d2b]"
                      >
                        Register
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
