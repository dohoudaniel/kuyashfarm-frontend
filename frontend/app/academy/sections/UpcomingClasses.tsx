"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { ACADEMY_CLASSES, LEVEL_COLORS } from "@/lib/data/academy";

export function UpcomingClasses() {
  return (
    <section id="classes" className="bg-white py-28 md:py-36">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs font-mono uppercase tracking-[0.2em] text-[#6b9d7a] mb-4"
            >
              Upcoming Classes
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-serif text-4xl md:text-5xl font-bold text-[#080f0a] leading-tight"
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
            className="text-gray-400 text-sm font-sans max-w-xs leading-relaxed"
          >
            All classes are held on our working farm in Lagos. Register early to secure your seat.
          </motion.p>
        </div>

        {/* Class cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          {ACADEMY_CLASSES.map((cls, i) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-2xl transition-all duration-400 flex flex-col"
            >
              {/* Image */}
              <div className="relative h-52 w-full overflow-hidden">
                <Image
                  src={cls.image}
                  alt={cls.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />

                {/* Level badge */}
                <span className={`absolute top-4 left-4 text-xs font-semibold px-3 py-1.5 rounded-full ${LEVEL_COLORS[cls.level]}`}>
                  {cls.level}
                </span>

                {/* Seats left badge */}
                {cls.seatsLeft === 0 ? (
                  <span className="absolute top-4 right-4 text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-900/80 text-white">
                    Sold Out
                  </span>
                ) : cls.seatsLeft <= 8 ? (
                  <span className="absolute top-4 right-4 text-xs font-semibold px-3 py-1.5 rounded-full bg-red-100 text-red-700">
                    {cls.seatsLeft} seats left
                  </span>
                ) : null}
              </div>

              {/* Body */}
              <div className="p-7 flex flex-col flex-1">
                <h3 className="font-serif text-xl font-bold text-[#080f0a] mb-2 leading-tight">
                  {cls.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed font-sans mb-5">
                  {cls.description}
                </p>

                {/* Topic pills */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {cls.topics.map((topic) => (
                    <span
                      key={topic}
                      className="text-xs font-medium bg-[#f0f7f3] text-[#2d5f3f] px-3 py-1 rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>

                {/* Meta */}
                <div className="mt-auto space-y-2.5 text-sm text-gray-400 border-t border-gray-50 pt-5 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#2d5f3f] shrink-0" />
                    <span>{cls.date} &bull; {cls.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#2d5f3f] shrink-0" />
                    <span>{cls.location}</span>
                  </div>
                </div>

                {/* Price + CTA */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-serif text-2xl font-bold text-[#080f0a]">
                      ₦{cls.price.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 font-sans">per person</p>
                  </div>

                  {cls.seatsLeft === 0 ? (
                    <span className="inline-flex items-center gap-2 bg-gray-100 text-gray-400 font-semibold text-sm px-6 py-3 rounded-full cursor-not-allowed">
                      Sold Out
                    </span>
                  ) : (
                    <Link
                      href={`/academy/classes/${cls.id}`}
                      className="group/btn inline-flex items-center gap-2 bg-[#2d5f3f] text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-[#1a3d2b] transition-colors duration-200"
                    >
                      Register
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
