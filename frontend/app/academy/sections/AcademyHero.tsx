"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play, Cpu, Leaf, TrendingUp } from "lucide-react";

const floatingCards = [
  { icon: Cpu, label: "Precision Agriculture", sub: "IoT & AI-powered", color: "#06b6d4", delay: 0 },
  { icon: Leaf, label: "Regenerative Farming", sub: "Carbon-smart methods", color: "#22c55e", delay: 0.15 },
  { icon: TrendingUp, label: "Agribusiness Growth", sub: "₦4.2M avg first harvest", color: "#8b5cf6", delay: 0.3 },
];

export function AcademyHero() {
  return (
    <section className="relative bg-[#080f0a] overflow-hidden min-h-screen">
      {/* Background grid */}
      <div
        className="absolute inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-[#2d5f3f]/20 blur-[120px] z-0" />
      <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full bg-[#4a7c59]/15 blur-[100px] z-0" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-6 lg:px-8 pt-28 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center w-full">

          {/* LEFT */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="font-serif font-bold text-white leading-[1.05]"
              style={{ fontSize: "clamp(3rem, 5vw, 5.2rem)" }}
            >
              Building
              <br />
              Africa&apos;s Next
              <br />
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, #6b9d7a 0%, #e8d5a3 100%)" }}
              >
                Generation
              </span>
              <br />
              of Innovators.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-white/55 leading-relaxed font-sans max-w-lg"
              style={{ fontSize: "clamp(1rem, 1.3vw, 1.2rem)" }}
            >
              Practical, technology-driven agricultural education on a real 40-acre
              farm — from precision farming and agribusiness to aquaculture, trained
              by Nigeria&apos;s leading practitioners.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link
                href="/academy/classes/1"
                className="group inline-flex items-center gap-3 bg-[#2d5f3f] text-white font-semibold px-8 py-4 rounded-full hover:bg-[#4a7c59] transition-all duration-300"
                style={{ fontSize: "clamp(0.875rem, 1vw, 1rem)" }}
              >
                Apply Now
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/academy/programs"
                className="group inline-flex items-center gap-3 border border-white/25 text-white/80 font-semibold px-8 py-4 rounded-full hover:border-white/50 hover:text-white transition-all duration-300"
                style={{ fontSize: "clamp(0.875rem, 1vw, 1rem)" }}
              >
                <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Play className="w-2.5 h-2.5 fill-white" />
                </span>
                Explore Programs
              </Link>
            </motion.div>
          </div>

          {/* RIGHT — cinematic card */}
          <div className="relative hidden lg:flex items-center justify-center h-[480px]">

            {/* Main panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="absolute inset-0 rounded-3xl overflow-hidden border border-white/8"
              style={{ background: "linear-gradient(135deg, #0f2318 0%, #1a3d2b 50%, #0d1f14 100%)" }}
            >
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
                  backgroundSize: "40px 40px",
                }}
              />
              {/* Central rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="w-52 h-52 rounded-full border border-[#2d5f3f]/30 flex items-center justify-center">
                    <div className="w-36 h-36 rounded-full border border-[#4a7c59]/40 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-[#2d5f3f]/30 border border-[#6b9d7a]/50 flex items-center justify-center">
                        <Leaf className="w-8 h-8 text-[#6b9d7a]" />
                      </div>
                    </div>
                  </div>
                  {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-[#4a7c59]/60"
                      style={{
                        top: "50%", left: "50%",
                        transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-104px)`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="absolute bottom-5 left-6">
                <p className="text-white/20 text-xs font-mono tracking-widest uppercase">
                  Kuyash Farm Academy — Innovation Hub
                </p>
              </div>
            </motion.div>

            {/* Floating cards — left side */}
            {floatingCards.map((card, i) => {
              const positions = ["top-8 -left-10", "top-1/2 -left-14 -translate-y-1/2", "bottom-12 -left-8"];
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + card.delay }}
                  className={`absolute ${positions[i]} z-20`}
                >
                  <div className="flex items-center gap-3 bg-[#0f1f14]/90 border border-white/10 backdrop-blur-md rounded-2xl px-4 py-3 shadow-2xl w-[200px]">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${card.color}20`, border: `1px solid ${card.color}40` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: card.color }} />
                    </div>
                    <div>
                      <p className="text-white text-xs font-semibold leading-tight">{card.label}</p>
                      <p className="text-white/40 text-[10px] mt-0.5">{card.sub}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Top-right accent */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="absolute -top-5 right-4 z-20 bg-[#e8d5a3] rounded-2xl px-5 py-4 shadow-xl"
            >
              <p className="font-serif text-[#1a3d2b] text-2xl font-bold">40 acres</p>
              <p className="text-[#1a3d2b]/60 text-xs mt-0.5 font-sans">Working farm campus</p>
            </motion.div>

            {/* Bottom-right accent */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.72 }}
              className="absolute bottom-3 right-5 z-20 bg-[#0f2318]/90 border border-[#2d5f3f]/40 backdrop-blur-md rounded-2xl px-5 py-4 shadow-xl"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                <span className="text-[#6b9d7a] text-xs font-medium">Live enrollment</span>
              </div>
              <p className="text-white font-semibold text-sm">Next cohort: August 2026</p>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <div className="w-px h-10 bg-linear-to-b from-transparent to-white/20" />
        <span className="text-white/25 text-[10px] tracking-widest uppercase font-mono">Scroll</span>
      </div>
    </section>
  );
}
