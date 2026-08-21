"use client";

import { motion } from "framer-motion";
import { Leaf, Users, Building2, Layers, GitMerge } from "lucide-react";

const STATS = [
  { value: "56", label: "Hectares", sub: "Farm Site", icon: Leaf },
  { value: "25", label: "Hectares", sub: "Currently in Use", icon: Layers },
  { value: "65+", label: "Dedicated", sub: "Farm Workers", icon: Users },
  { value: "13", label: "Screen Houses", sub: "(Greenhouses)", icon: Building2 },
  { value: "Multi", label: "Integrated", sub: "Operations", icon: GitMerge },
];

export function HeroStatsBar() {
  return (
    <div className="bg-primary-dark border-t border-primary/40">
      <div className="max-w-7xl 2xl:max-w-[1536px] mx-auto px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-primary/30">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.sub}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="flex items-center gap-3.5 px-5 py-5 first:pl-0 last:pr-0"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/40 border border-primary/50 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-accent" />
                </div>
                <div>
                  <p className="font-serif font-bold text-white text-lg leading-none">
                    {stat.value}
                    <span className="text-sm font-sans font-normal text-white/60 ml-1">{stat.label}</span>
                  </p>
                  <p className="text-[10px] text-white/60 font-sans mt-0.5">{stat.sub}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
