"use client";

import { motion } from "framer-motion";
import {
  Sprout, Users, Award, Handshake, Lightbulb, TrendingUp,
  Cpu, Globe, Briefcase, GraduationCap, type LucideIcon,
} from "lucide-react";

const BENEFITS: { icon: LucideIcon; title: string; description: string; accent: string }[] = [
  { icon: Sprout, title: "Hands-On Training", description: "60% of every program is live fieldwork on our 40-acre working farm. You learn by doing.", accent: "#22c55e" },
  { icon: Cpu, title: "Smart Farming Tech", description: "Work with drones, IoT sensors, precision irrigation, and AI farm management tools.", accent: "#06b6d4" },
  { icon: Award, title: "NABTEB Certified", description: "Nationally recognised certificates valid for employment, business, and further study.", accent: "#f59e0b" },
  { icon: Users, title: "Expert Instructors", description: "Learn from PhD agronomists, certified veterinarians, and industry specialists.", accent: "#8b5cf6" },
  { icon: Briefcase, title: "Business Incubation", description: "Graduate alumni get access to our agribusiness incubator and investor network.", accent: "#f97316" },
  { icon: Globe, title: "Industry Network", description: "Connections with government agencies, NGOs, and private agri-companies from day one.", accent: "#ec4899" },
  { icon: Lightbulb, title: "Real-World Projects", description: "Every student completes a farm business plan reviewed by industry professionals.", accent: "#e8d5a3" },
  { icon: Handshake, title: "Alumni Community", description: "500+ graduates across Nigeria and counting. A lifelong peer support ecosystem.", accent: "#6b9d7a" },
  { icon: GraduationCap, title: "Career Placement", description: "85% employment rate. Our careers team actively connects graduates with opportunities.", accent: "#4a7c59" },
  { icon: TrendingUp, title: "Entrepreneurship", description: "We don't just teach farming — we teach profitable farming and business scaling.", accent: "#2d5f3f" },
];

export function WhyAcademy() {
  return (
    <section id="why" className="bg-white py-28 md:py-36">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        {/* Header */}
        <div className="max-w-2xl mb-20">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-mono uppercase tracking-[0.2em] text-[#6b9d7a] mb-4"
          >
            Why Kuyash Academy
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-[#080f0a] leading-[1.05]"
          >
            More than a class —
            <br />
            <span className="text-[#2d5f3f]">a career transformation.</span>
          </motion.h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {BENEFITS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="group relative p-6 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-400 cursor-default bg-white"
              >
                {/* Accent top line */}
                <div className="absolute top-0 left-6 right-6 h-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-400 bg-[#2d5f3f]" />
                <div className="inline-flex w-11 h-11 rounded-xl items-center justify-center mb-5 transition-all duration-400 group-hover:scale-110 bg-[#eef5f1] border border-[#c6dece]">
                  <Icon className="w-5 h-5 text-[#2d5f3f]" />
                </div>
                <h3 className="font-serif text-base font-bold text-[#080f0a] mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-sans">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
