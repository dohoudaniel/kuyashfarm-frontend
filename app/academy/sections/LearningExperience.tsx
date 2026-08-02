"use client";

/**
 * What a day of training actually looks like.
 */
import { motion } from "framer-motion";
import { Cpu, Users, Sprout, FlaskConical } from "lucide-react";

const EXPERIENCES = [
  {
    tag: "01 — Practical Farm Training",
    title: "Real farm.\nReal skills.",
    description:
      "You don't learn farming by reading about it. Every program at Kuyash Academy is built around direct, supervised work on our 40-acre farm — from soil testing to harvest. Our instructors are beside you, not behind a podium.",
    highlight: "60% hands-on fieldwork in every program",
    icon: Sprout,
    color: "#22c55e",
    features: ["Live crop and livestock units", "Supervised practical assessments", "Daily field journaling"],
    flipped: false,
  },
  {
    tag: "02 — Smart Classrooms",
    title: "Where technology\nmeets agriculture.",
    description:
      "Our training facility integrates modern learning tools — precision agriculture software, drone simulation suites, IoT dashboards, and agri-fintech platforms — giving students exposure to the tools shaping the future of farming.",
    highlight: "Nigeria's most technology-equipped farm training facility",
    icon: Cpu,
    color: "#06b6d4",
    features: ["Drone flight simulation & operation", "IoT sensor configuration labs", "AI crop monitoring systems"],
    flipped: true,
  },
  {
    tag: "03 — Industry Mentorship",
    title: "Learn from those\nwho built it.",
    description:
      "Every student is paired with a practicing industry mentor — a farmer, agribusiness owner, or agricultural specialist — who provides real-world guidance beyond the curriculum. This is the connection that accelerates careers.",
    highlight: "1-on-1 mentorship with industry veterans",
    icon: Users,
    color: "#8b5cf6",
    features: ["Bi-weekly mentorship sessions", "Industry site visits", "Professional reference letters"],
    flipped: false,
  },
  {
    tag: "04 — Research & Innovation",
    title: "Push the boundaries\nof what's possible.",
    description:
      "Students engage in active agricultural research projects in partnership with IITA and the University of Ibadan. Apply what you learn to solve real problems facing Nigerian farmers today.",
    highlight: "Active research partnership with IITA",
    icon: FlaskConical,
    color: "#f97316",
    features: ["Soil and crop research projects", "Aquaculture trial systems", "Data collection & analysis"],
    flipped: true,
  },
];

export function LearningExperience() {
  return (
    <section className="bg-white py-28 md:py-36">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        {/* Header */}
        <div className="max-w-2xl mb-24">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-mono uppercase tracking-[0.2em] text-[#6b9d7a] mb-4"
          >
            The Learning Experience
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-[#080f0a] leading-[1.05]"
          >
            Four pillars of
            <br />
            <span className="text-[#2d5f3f]">world-class training.</span>
          </motion.h2>
        </div>

        {/* Alternating rows */}
        <div className="space-y-32">
          {EXPERIENCES.map((exp, i) => {
            const Icon = exp.icon;
            return (
              <div
                key={exp.tag}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${
                  exp.flipped ? "lg:[&>*:first-child]:order-last" : ""
                }`}
              >
                {/* Text side */}
                <motion.div
                  initial={{ opacity: 0, x: exp.flipped ? 40 : -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                >
                  <p className="text-xs font-mono uppercase tracking-[0.2em] text-gray-400 mb-5">{exp.tag}</p>
                  <h3
                    className="font-serif text-3xl md:text-4xl font-bold text-[#080f0a] leading-tight mb-5"
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {exp.title}
                  </h3>
                  <p className="text-gray-500 text-lg leading-relaxed font-sans mb-8">{exp.description}</p>

                  {/* Highlight badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl mb-8 text-sm font-medium bg-[#eef5f1] text-[#2d5f3f] border border-[#c6dece]">
                    <Icon className="w-4 h-4" />
                    {exp.highlight}
                  </div>

                  {/* Feature list */}
                  <ul className="space-y-3">
                    {exp.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-gray-700 font-sans text-sm">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-[#eef5f1]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2d5f3f]" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Visual side */}
                <motion.div
                  initial={{ opacity: 0, x: exp.flipped ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  className="relative h-[400px] rounded-3xl overflow-hidden bg-[#eef5f1] border border-[#c6dece]"
                >
                  {/* Grid pattern */}
                  <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                      backgroundImage: `linear-gradient(rgba(45,95,63,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(45,95,63,0.4) 1px, transparent 1px)`,
                      backgroundSize: "32px 32px",
                    }}
                  />
                  {/* Central icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-28 h-28 rounded-3xl flex items-center justify-center shadow-lg bg-white border-2 border-[#c6dece]">
                      <Icon className="w-14 h-14 text-[#2d5f3f]" />
                    </div>
                  </div>
                  {/* Step label */}
                  <div className="absolute bottom-6 left-6">
                    <span className="text-7xl font-serif font-bold opacity-[0.07] text-gray-900 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
