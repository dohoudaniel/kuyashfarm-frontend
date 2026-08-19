"use client";

import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Beef, Fish, Leaf } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const CHART_POINTS = [30, 42, 38, 55, 50, 63, 58, 72, 68, 80, 76, 88];

export function ImpactDashboard() {
  const max = Math.max(...CHART_POINTS);
  const min = Math.min(...CHART_POINTS);
  const W = 260;
  const H = 80;
  const points = CHART_POINTS.map((v, i) => {
    const x = (i / (CHART_POINTS.length - 1)) * W;
    const y = H - ((v - min) / (max - min)) * H;
    return `${x},${y}`;
  }).join(" ");

  return (
    <section className="relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">

        {/* ── LEFT — impact copy with farm image bg ── */}
        <div className="relative flex items-center overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1500651230702-0e2d8a49d7ad?q=80&w=1200"
            alt="Kuyash farm workers"
            fill
            className="object-cover"
            sizes="(max-width:1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-[#080f0a]/75" />

          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 px-10 md:px-16 py-20"
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#6b9d7a] mb-5">
              Our Impact
            </p>
            <h2 className="font-serif font-bold text-white leading-[1.08] mb-6"
              style={{ fontSize: "clamp(1.8rem, 3vw, 3rem)" }}>
              Growing Food.<br />
              Growing Communities.<br />
              Growing Futures.
            </h2>
            <p className="text-white/55 font-sans text-sm leading-relaxed mb-10 max-w-sm">
              We are committed to sustainable agriculture, knowledge sharing and economic growth across every community we operate in.
            </p>
            <Link
              href="/academy"
              className="inline-flex items-center gap-2 border border-white/20 bg-white/10 hover:bg-white/18 backdrop-blur-sm text-white font-semibold text-sm px-6 py-3 rounded-full transition-all duration-200"
            >
              Our Impact <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* ── RIGHT — dashboard ── */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#0f1f14] flex items-center px-8 md:px-12 py-16"
        >
          <div className="w-full max-w-md mx-auto">

            {/* dashboard card */}
            <div className="bg-[#080f0a]/80 border border-white/8 rounded-2xl overflow-hidden">

              {/* header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/6">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-[#2d5f3f] flex items-center justify-center">
                    <Leaf className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white text-xs font-semibold">Kuyash Farm Dashboard</span>
                </div>
                <span className="text-white/30 text-[10px] font-sans border border-white/10 px-2 py-0.5 rounded-md">This Month</span>
              </div>

              {/* top metrics */}
              <div className="grid grid-cols-3 divide-x divide-white/6 border-b border-white/6">
                <div className="px-4 py-4">
                  <p className="text-white/35 text-[9px] font-sans mb-1">Crop Health</p>
                  <p className="text-white font-serif font-bold text-lg leading-none">94%</p>
                  <p className="text-[#6b9d7a] text-[9px] font-sans mt-0.5">Excellent</p>
                </div>
                <div className="px-4 py-4">
                  <p className="text-white/35 text-[9px] font-sans mb-1">Irrigation</p>
                  <p className="text-white font-serif font-bold text-lg leading-none">82%</p>
                  <p className="text-[#6b9d7a] text-[9px] font-sans mt-0.5">Good</p>
                </div>
                <div className="px-4 py-4">
                  <p className="text-white/35 text-[9px] font-sans mb-1">Active Fields</p>
                  <p className="text-white font-serif font-bold text-lg leading-none">25</p>
                  <p className="text-[#6b9d7a] text-[9px] font-sans mt-0.5">Operational</p>
                </div>
              </div>

              {/* secondary row */}
              <div className="grid grid-cols-3 divide-x divide-white/6 border-b border-white/6">
                <div className="px-4 py-4 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-[#6b9d7a] shrink-0" />
                  <div>
                    <p className="text-white font-serif font-bold text-base leading-none">+18%</p>
                    <p className="text-white/30 text-[9px] font-sans mt-0.5">Yield Prediction</p>
                  </div>
                </div>
                <div className="px-4 py-4 flex items-center gap-2">
                  <Beef className="w-3.5 h-3.5 text-[#6b9d7a] shrink-0" />
                  <div>
                    <p className="text-white font-serif font-bold text-base leading-none">Active</p>
                    <p className="text-white/30 text-[9px] font-sans mt-0.5">Livestock</p>
                  </div>
                </div>
                <div className="px-4 py-4 flex items-center gap-2">
                  <Fish className="w-3.5 h-3.5 text-[#6b9d7a] shrink-0" />
                  <div>
                    <p className="text-white font-serif font-bold text-base leading-none">Active</p>
                    <p className="text-white/30 text-[9px] font-sans mt-0.5">Aquaculture</p>
                  </div>
                </div>
              </div>

              {/* chart */}
              <div className="px-5 py-4">
                <p className="text-white/30 text-[9px] font-sans mb-3">Farm Performance</p>
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-16" preserveAspectRatio="none">
                  {/* fill */}
                  <defs>
                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2d5f3f" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#2d5f3f" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points={`0,${H} ${points} ${W},${H}`}
                    fill="url(#chartFill)"
                  />
                  <polyline
                    points={points}
                    fill="none"
                    stroke="#2d5f3f"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex justify-between mt-1">
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map(m => (
                    <span key={m} className="text-white/20 text-[8px] font-mono">{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
