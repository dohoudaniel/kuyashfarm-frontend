"use client";

import { motion } from "framer-motion";
import { TrendingUp, Droplets, Layers, CheckCircle2, BarChart2 } from "lucide-react";

const METRICS = [
  { label: "Farm Performance", value: "94.7%", trend: "+2.3%", positive: true },
  { label: "Crop Health", value: "Excellent", trend: "Stable", positive: true },
  { label: "Irrigation", value: "82%", trend: "-1.4%", positive: false },
];

const SECONDARY = [
  { label: "Yield Forecast", value: "+18.4%", icon: TrendingUp },
  { label: "Active Fields", value: "24", icon: Layers },
  { label: "Total Area", value: "1,250 Ac", icon: Droplets },
];

const FEATURES = [
  "Farm Management", "Procurement",
  "Crop Monitoring", "Sales & Distribution",
  "Inventory Management", "Workforce Management",
  "Analytics & Insights", "Smart Irrigation",
];

/* tiny sparkline bars */
const CHART_BARS = [40, 55, 48, 62, 58, 72, 68, 80, 75, 88, 82, 94];

export function DataSection() {
  return (
    <section className="bg-[#080f0a] py-24 overflow-hidden relative">
      {/* grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)`,
          backgroundSize: "48px 48px",
        }} />
      {/* glow */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#2d5f3f]/15 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-20 w-[400px] h-[400px] rounded-full bg-[#4a7c59]/10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">

          {/* ── LEFT — copy ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#6b9d7a] mb-4">
              Smart Agriculture
            </p>
            <h2 className="font-serif font-bold text-white leading-[1.06] mb-5"
              style={{ fontSize: "clamp(2rem, 3.5vw, 3.2rem)" }}>
              Data meets <br />the soil.
            </h2>
            <p className="text-white/50 font-sans text-sm leading-relaxed mb-8 max-w-md">
              Smart technology. Better decisions. Stronger tomorrow. Our integrated farm management platform gives us real-time visibility across every acre, every crop, every operation.
            </p>

            {/* feature checklist */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-10">
              {FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2d5f3f] shrink-0" />
                  <span className="text-white/60 text-xs font-sans">{f}</span>
                </div>
              ))}
            </div>

            <a
              href="#"
              className="inline-flex items-center gap-2 border border-white/15 bg-white/8 hover:bg-white/14 backdrop-blur-sm text-white font-semibold text-sm px-6 py-3 rounded-full transition-all duration-200"
            >
              <BarChart2 className="w-4 h-4" />
              Learn More
            </a>
          </motion.div>

          {/* ── RIGHT — dashboard mockup ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative bg-[#0f1f14]/80 border border-white/8 rounded-2xl overflow-hidden shadow-2xl">

              {/* dashboard header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#2d5f3f] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22V12M12 12C12 7 7 3 2 4c0 5 4 9 10 8M12 12c0-5 5-9 10-8-1 5-5 9-10 8" />
                    </svg>
                  </div>
                  <span className="text-white text-xs font-semibold font-sans">Kuyash Farm</span>
                  <span className="text-white/30 text-xs font-sans">/ Overview</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                  <span className="text-white/40 text-[10px] font-sans">Live</span>
                </div>
              </div>

              {/* main metrics row */}
              <div className="grid grid-cols-3 divide-x divide-white/6 border-b border-white/6">
                {METRICS.map((m) => (
                  <div key={m.label} className="px-5 py-5">
                    <p className="text-white/35 text-[10px] font-sans mb-1.5">{m.label}</p>
                    <p className="text-white font-serif font-bold text-xl leading-none mb-1">{m.value}</p>
                    <span className={`text-[10px] font-semibold font-mono ${m.positive ? "text-[#6b9d7a]" : "text-red-400"}`}>
                      {m.trend}
                    </span>
                  </div>
                ))}
              </div>

              {/* chart area */}
              <div className="px-5 py-5 border-b border-white/6">
                <div className="flex items-end justify-between gap-1 h-20">
                  {CHART_BARS.map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.04, ease: "easeOut" }}
                      className="flex-1 rounded-sm origin-bottom"
                      style={{
                        height: `${h}%`,
                        background: i === CHART_BARS.length - 1
                          ? "#2d5f3f"
                          : `rgba(107,157,122,${0.15 + (i / CHART_BARS.length) * 0.35})`,
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map(m => (
                    <span key={m} className="text-white/20 text-[9px] font-mono">{m}</span>
                  ))}
                </div>
              </div>

              {/* secondary metrics */}
              <div className="grid grid-cols-3 divide-x divide-white/6">
                {SECONDARY.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="px-5 py-4 flex flex-col gap-2">
                      <Icon className="w-3.5 h-3.5 text-[#6b9d7a]" />
                      <p className="text-white font-serif font-bold text-lg leading-none">{s.value}</p>
                      <p className="text-white/30 text-[10px] font-sans">{s.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* floating badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="absolute -bottom-5 -left-5 bg-white rounded-2xl px-5 py-4 shadow-2xl border border-gray-100"
            >
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#6b9d7a] mb-1">Stock Accuracy</p>
              <p className="font-serif text-2xl font-bold text-[#080f0a]">100%</p>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
