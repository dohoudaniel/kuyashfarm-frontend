"use client";

/**
 * Interactive programme browser: filters and comparison.
 */
import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Search, X, ChevronRight, Star, Users, Clock, Award,
  Filter, TrendingUp, Zap, ArrowRight, BookOpen,
  Bird, Beef, Fish, Wheat, Building2, Cpu, Settings,
  Package, Smartphone, Leaf, Rocket, FlaskConical,
  Mountain, Droplets, LayoutDashboard, BarChart2,
  Wind, Banknote, CheckCircle, ChevronDown,
  type LucideIcon,
} from "lucide-react";
import {
  CATALOG_PROGRAMS, LEARNING_PATHWAYS, CAREER_PATHS, CATALOG_STATS,
  type CatalogProgram,
} from "@/lib/data/catalog";

/* ─── icon map ─── */
const ICON_MAP: Record<string, LucideIcon> = {
  Bird, Beef, Fish, Wheat, Building2, Cpu, Settings, Package,
  Smartphone, Leaf, Rocket, FlaskConical, Mountain, Droplets,
  LayoutDashboard, BarChart2, Wind, Banknote, TrendingUp,
};

/* ─── constants ─── */
const ALL_CATEGORIES = ["All", ...Array.from(new Set(CATALOG_PROGRAMS.map((p) => p.category)))];
const ALL_LEVELS = ["All Levels", "Beginner", "Intermediate", "Advanced"];
const ALL_DURATIONS = ["Any Duration", "2 Months", "3 Months", "4 Months"];
const ALL_FORMATS = ["Any Format", "Full-Time", "Part-Time", "Weekend"];
const ALL_STATUS = ["Any Status", "Open", "Closing Soon", "Coming Soon"];
const ALL_CERT = ["Any Certification", "NABTEB", "NAFDAC", "Industry", "Organic"];

/* brand tokens */

/* ─── animated counter ─── */
function Counter({ to, suffix }: { to: number; suffix: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const start = Date.now();
      const tick = () => {
        const p = Math.min((Date.now() - start) / 1800, 1);
        setVal(Math.round((1 - Math.pow(1 - p, 3)) * to));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ─── program card ─── */
function ProgramCard({ program, index }: { program: CatalogProgram; index: number }) {
  const Icon = ICON_MAP[program.icon] ?? Leaf;
  const href = "/academy#classes";
  const isAvailable = program.enrollmentStatus === "Open" || program.enrollmentStatus === "Closing Soon";

  const statusStyle: Record<string, string> = {
    "Open":          "bg-[#eef5f1] text-[#2d5f3f] border-[#c6dece]",
    "Closing Soon":  "bg-[#eef5f1] text-[#2d5f3f] border-[#c6dece]",
    "Sold Out":      "bg-gray-50 text-gray-400 border-gray-200",
    "Coming Soon":   "bg-gray-50 text-gray-400 border-gray-200",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="group bg-white rounded-2xl border border-gray-100 hover:border-[#c6dece] hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden shrink-0">
        <Image
          src={program.image} alt={program.title} fill
          sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent" />

        {/* Status badge — top left */}
        <div className="absolute top-3 left-3">
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border backdrop-blur-sm ${statusStyle[program.enrollmentStatus]}`}>
            {program.enrollmentStatus}
          </span>
        </div>

        {/* Trending badge — top right, brand-toned */}
        {program.trending && (
          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full border bg-[#080f0a]/60 text-[#e8d5a3] border-[#e8d5a3]/30 backdrop-blur-sm">
              {program.trending}
            </span>
          </div>
        )}

        {/* Icon — bottom left, brand-toned */}
        <div className="absolute bottom-3 left-3 w-8 h-8 rounded-xl flex items-center justify-center bg-white/15 border border-white/25 backdrop-blur-sm">
          <Icon className="w-4 h-4 text-white" />
        </div>

        {/* Demand — bottom right */}
        <div className="absolute bottom-3 right-3">
          <span className="text-[10px] font-medium text-white/80 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
            {program.industryDemand} demand
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">

        {/* Department + level pill in one row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 truncate">
            {program.department}
          </span>
          <span className="shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full border bg-[#eef5f1] text-[#2d5f3f] border-[#c6dece]">
            {program.level}
          </span>
        </div>

        <h3 className="font-serif text-base font-bold text-[#080f0a] leading-tight mb-1.5">
          {program.title}
        </h3>
        <p className="text-gray-400 text-xs leading-relaxed font-sans mb-4 line-clamp-2">
          {program.summary}
        </p>

        {/* Duration + cert */}
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-[#6b9d7a]" />
            {program.duration}
          </span>
          <span className="text-gray-200">·</span>
          <span className="flex items-center gap-1.5">
            <Award className="w-3 h-3 text-[#6b9d7a]" />
            {program.certification}
          </span>
        </div>

        {/* Practical training bar — unified brand color */}
        <div className="mb-4">
          <div className="flex justify-between text-[10px] mb-1.5">
            <span className="text-gray-400">Practical training</span>
            <span className="font-semibold text-[#2d5f3f]">{program.practicalPercent}%</span>
          </div>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${program.practicalPercent}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.15 }}
              className="h-full rounded-full bg-[#2d5f3f]"
            />
          </div>
        </div>

        {/* Rating + enrolled */}
        <div className="flex items-center gap-3 mb-4 text-xs">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-[#e8d5a3] text-[#e8d5a3]" />
            <span className="font-semibold text-[#080f0a]">{program.rating}</span>
            <span className="text-gray-400">({program.reviewCount})</span>
          </div>
          <span className="text-gray-200">·</span>
          <div className="flex items-center gap-1 text-gray-400">
            <Users className="w-3 h-3" />
            <span>{program.enrolledCount.toLocaleString()} enrolled</span>
          </div>
        </div>

        {/* Instructor — brand-toned avatar */}
        <div className="flex items-center gap-2 mb-5">
          <div className="w-6 h-6 rounded-full bg-[#2d5f3f] flex items-center justify-center text-white text-[9px] font-bold shrink-0">
            {program.instructor.initials}
          </div>
          <span className="text-xs text-gray-500 font-sans">{program.instructor.name}</span>
        </div>

        {/* Price + CTAs */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
          <div>
            <p className="font-serif text-lg font-bold text-[#080f0a]">₦{program.price.toLocaleString()}</p>
            <p className="text-[10px] text-gray-400">per person</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={href}
              className="text-xs font-semibold text-[#2d5f3f] border border-[#2d5f3f]/25 px-3 py-2 rounded-lg hover:bg-[#eef5f1] transition-colors duration-200"
            >
              Learn More
            </Link>
            {isAvailable ? (
              <Link
                href={href}
                className="text-xs font-semibold text-white bg-[#2d5f3f] px-3 py-2 rounded-lg hover:bg-[#4a7c59] transition-colors duration-200"
              >
                Apply
              </Link>
            ) : (
              <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-2 rounded-lg cursor-not-allowed">
                Apply
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── filter pill ─── */
function FilterPill({ label, active, onClick }: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-semibold px-3.5 py-2 rounded-full border whitespace-nowrap transition-all duration-200 ${
        active
          ? "bg-[#2d5f3f] text-white border-[#2d5f3f]"
          : "border-gray-200 text-gray-600 hover:border-[#2d5f3f] hover:text-[#2d5f3f] bg-white"
      }`}
    >
      {label}
    </button>
  );
}

/* ─── select filter ─── */
function SelectFilter({ options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none text-xs font-medium border border-gray-200 text-gray-700 bg-white pl-3 pr-8 py-2 rounded-lg focus:outline-none focus:border-[#2d5f3f] hover:border-gray-300 transition-colors cursor-pointer"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
    </div>
  );
}

/* ─── main component ─── */
export function ProgramsClient() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [level, setLevel] = useState("All Levels");
  const [duration, setDuration] = useState("Any Duration");
  const [format, setFormat] = useState("Any Format");
  const [status, setStatus] = useState("Any Status");
  const [cert, setCert] = useState("Any Certification");
  const [showFilters, setShowFilters] = useState(false);
  const [activeCareer, setActiveCareer] = useState<string | null>(null);
  const [activePathway, setActivePathway] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  /* ── filtering ── */
  const filtered = useMemo(() => {
    let list = CATALOG_PROGRAMS;

    if (activeCareer) {
      const cp = CAREER_PATHS.find((c) => c.id === activeCareer);
      if (cp) list = list.filter((p) => cp.programs.includes(p.id));
    }
    if (activePathway) {
      const pw = LEARNING_PATHWAYS.find((p) => p.id === activePathway);
      if (pw) list = list.filter((p) => pw.programs.includes(p.id));
    }
    if (activeCategory !== "All") list = list.filter((p) => p.category === activeCategory);
    if (level !== "All Levels") list = list.filter((p) => p.level === level);
    if (duration !== "Any Duration") list = list.filter((p) => p.duration === duration);
    if (format !== "Any Format") list = list.filter((p) => p.format === format);
    if (status !== "Any Status") list = list.filter((p) => p.enrollmentStatus === status);
    if (cert !== "Any Certification") list = list.filter((p) => p.certType === cert);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.skills.some((s) => s.toLowerCase().includes(q)) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.instructor.name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [query, activeCategory, level, duration, format, status, cert, activeCareer, activePathway]);

  const featured = CATALOG_PROGRAMS.filter((p) => p.featured);
  const hasActiveFilters = activeCategory !== "All" || level !== "All Levels" || duration !== "Any Duration"
    || format !== "Any Format" || status !== "Any Status" || cert !== "Any Certification"
    || query.trim() !== "" || activeCareer !== null || activePathway !== null;

  const clearAll = () => {
    setQuery(""); setActiveCategory("All"); setLevel("All Levels");
    setDuration("Any Duration"); setFormat("Any Format"); setStatus("Any Status");
    setCert("Any Certification"); setActiveCareer(null); setActivePathway(null);
  };

  return (
    <main className="bg-[#f9f8f6] min-h-screen">

      {/* ── Page header ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-5 font-sans">
            <Link href="/" className="hover:text-[#2d5f3f] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/academy" className="hover:text-[#2d5f3f] transition-colors">Academy</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#2d5f3f] font-medium">Course Catalog</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#080f0a] leading-tight">
                Course Catalog
              </h1>
              <p className="mt-1.5 text-gray-500 text-sm font-sans">
                {CATALOG_PROGRAMS.length} programs across {new Set(CATALOG_PROGRAMS.map((p) => p.department)).size} departments
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 font-sans">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{CATALOG_PROGRAMS.filter((p) => p.enrollmentStatus === "Open" || p.enrollmentStatus === "Closing Soon").length} programs open for enrollment</span>
              </div>
            </div>
          </div>

          {/* ── Search ── */}
          <div className="mt-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by program name, skill, instructor, certification, career path..."
              className="w-full bg-[#f9f8f6] border border-gray-200 rounded-xl pl-11 pr-12 py-3.5 text-sm font-sans text-[#080f0a] placeholder:text-gray-400 focus:outline-none focus:border-[#2d5f3f] focus:bg-white transition-all duration-200"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* ── Category chips ── */}
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {ALL_CATEGORIES.map((cat) => (
              <FilterPill key={cat} label={cat} active={activeCategory === cat} onClick={() => setActiveCategory(cat)} />
            ))}
          </div>

          {/* ── Advanced filters row ── */}
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-lg border transition-all duration-200 ${showFilters ? "bg-[#2d5f3f] text-white border-[#2d5f3f]" : "border-gray-200 text-gray-600 bg-white hover:border-gray-300"}`}
            >
              <Filter className="w-3.5 h-3.5" />
              Filters
            </button>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex items-center gap-2 overflow-hidden"
                >
                  <SelectFilter label="Level" options={ALL_LEVELS} value={level} onChange={setLevel} />
                  <SelectFilter label="Duration" options={ALL_DURATIONS} value={duration} onChange={setDuration} />
                  <SelectFilter label="Format" options={ALL_FORMATS} value={format} onChange={setFormat} />
                  <SelectFilter label="Status" options={ALL_STATUS} value={status} onChange={setStatus} />
                  <SelectFilter label="Certification" options={ALL_CERT} value={cert} onChange={setCert} />
                </motion.div>
              )}
            </AnimatePresence>

            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors ml-1"
              >
                <X className="w-3 h-3" /> Clear all
              </motion.button>
            )}

            <span className="ml-auto text-xs text-gray-400 font-sans">
              {filtered.length} program{filtered.length !== 1 ? "s" : ""} found
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-12 space-y-20">

        {/* ── Featured Programs ── */}
        {!hasActiveFilters && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-6 h-6 rounded-lg bg-[#e8d5a3] flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-[#1a3d2b]" />
              </div>
              <h2 className="font-serif text-xl font-bold text-[#080f0a]">Featured Programs</h2>
              <span className="text-xs text-gray-400 font-sans ml-1">— Our flagship training pathways</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {featured.map((program, i) => {
                const Icon = ICON_MAP[program.icon] ?? Leaf;
                const href = "/academy#classes";
                return (
                  <motion.div
                    key={program.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="group relative rounded-3xl overflow-hidden border border-[#c6dece]/40 hover:border-[#c6dece] hover:shadow-xl transition-all duration-300 bg-white"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-[#2d5f3f]" />
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-5">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110 bg-[#eef5f1] border border-[#c6dece]">
                          <Icon className="w-6 h-6 text-[#2d5f3f]" />
                        </div>
                        <div className="text-right">
                          <p className="font-serif text-xl font-bold text-[#080f0a]">₦{(program.price / 1000).toFixed(0)}k</p>
                          <p className="text-[10px] text-gray-400">{program.duration}</p>
                        </div>
                      </div>
                      <h3 className="font-serif text-lg font-bold text-[#080f0a] leading-tight mb-2">{program.title}</h3>
                      <p className="text-gray-400 text-xs leading-relaxed mb-4 line-clamp-2">{program.summary}</p>
                      <div className="flex items-center gap-2 mb-5 text-xs text-gray-400">
                        <Star className="w-3.5 h-3.5 fill-[#e8d5a3] text-[#e8d5a3]" />
                        <span className="font-semibold text-[#080f0a]">{program.rating}</span>
                        <span>· {program.enrolledCount.toLocaleString()} enrolled</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-[#eef5f1] text-[#2d5f3f] border border-[#c6dece]">
                          {program.employmentRate}% employed
                        </span>
                        <Link href={href} className="inline-flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-2 rounded-full transition-all duration-200 bg-[#2d5f3f] hover:bg-[#4a7c59]">
                          Apply <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Learning Pathways ── */}
        {!hasActiveFilters && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-6 h-6 rounded-lg bg-[#eef5f1] flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-[#2d5f3f]" />
              </div>
              <h2 className="font-serif text-xl font-bold text-[#080f0a]">Learning Pathways</h2>
              <span className="text-xs text-gray-400 font-sans ml-1">— Recommended course journeys</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {LEARNING_PATHWAYS.map((pw, i) => {
                const Icon = ICON_MAP[pw.icon] ?? Leaf;
                const isActive = activePathway === pw.id;
                return (
                  <motion.button
                    key={pw.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => setActivePathway(isActive ? null : pw.id)}
                    className={`text-left p-5 rounded-2xl border transition-all duration-300 ${isActive
                      ? "border-[#2d5f3f] bg-[#eef5f1] shadow-lg"
                      : "border-gray-100 bg-white hover:border-[#c6dece] hover:shadow-md"}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 border ${isActive ? "bg-[#2d5f3f] border-[#2d5f3f]" : "bg-[#eef5f1] border-[#c6dece]"}`}>
                      <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-[#2d5f3f]"}`} />
                    </div>
                    <h3 className="font-serif text-sm font-bold text-[#080f0a] leading-tight mb-1.5">{pw.title}</h3>
                    <p className="text-gray-400 text-xs leading-relaxed mb-3">{pw.description}</p>
                    <span className="text-[10px] font-semibold text-[#2d5f3f]">
                      {pw.programs.length} programs →
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Career Explorer ── */}
        {!hasActiveFilters && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-6 h-6 rounded-lg bg-[#eef5f1] flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-[#2d5f3f]" />
              </div>
              <h2 className="font-serif text-xl font-bold text-[#080f0a]">Career Explorer</h2>
              <span className="text-xs text-gray-400 font-sans ml-1">— Browse by the career you want</span>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {CAREER_PATHS.map((cp, i) => {
                const isActive = activeCareer === cp.id;
                return (
                  <motion.button
                    key={cp.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setActiveCareer(isActive ? null : cp.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-[#2d5f3f] text-white border-[#2d5f3f] shadow-lg"
                        : "bg-white text-gray-700 border-gray-200 hover:border-[#2d5f3f] hover:text-[#2d5f3f]"
                    }`}
                  >
                    {isActive && <CheckCircle className="w-3.5 h-3.5" />}
                    {cp.title}
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                      {cp.programs.length}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Stats strip ── */}
        {!hasActiveFilters && (
          <section className="bg-[#080f0a] rounded-3xl py-10 px-8 md:px-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
              {CATALOG_STATS.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                  <p className="font-serif text-2xl md:text-3xl font-bold text-white">
                    <Counter to={s.value} suffix={s.suffix} />
                  </p>
                  <p className="text-white/40 text-xs mt-1 font-sans">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ── All Programs grid ── */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <h2 className="font-serif text-xl font-bold text-[#080f0a]">
                {hasActiveFilters ? "Matching Programs" : "All Programs"}
              </h2>
              <span className="bg-[#eef5f1] text-[#2d5f3f] text-xs font-bold px-2.5 py-1 rounded-full">
                {filtered.length}
              </span>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-gray-100">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="font-serif text-lg font-bold text-gray-700 mb-2">No programs found</h3>
              <p className="text-gray-400 text-sm font-sans mb-6">Try adjusting your filters or search query.</p>
              <button onClick={clearAll} className="text-sm font-semibold text-[#2d5f3f] hover:underline">Clear all filters</button>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <AnimatePresence mode="popLayout">
                {filtered.map((p, i) => <ProgramCard key={p.id} program={p} index={i} />)}
              </AnimatePresence>
            </motion.div>
          )}
        </section>

        {/* ── CTA ── */}
        <section className="relative rounded-3xl overflow-hidden border border-white/10"
          style={{ background: "linear-gradient(135deg, #0f2318 0%, #1a3d2b 60%, #0f2318 100%)" }}>
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
              backgroundSize: "48px 48px",
            }} />
          <div className="relative z-10 px-8 md:px-14 py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#6b9d7a] mb-3">Ready to enrol?</p>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-white leading-tight mb-3">
                Begin your agricultural
                <br />
                <span className="text-[#e8d5a3]">career today.</span>
              </h2>
              <p className="text-white/45 text-sm font-sans max-w-md leading-relaxed">
                Applications are reviewed within 48 hours. Our admissions team is ready to help you find the right program for your goals.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href="/academy#classes"
                className="inline-flex items-center gap-2 bg-[#e8d5a3] text-[#1a3d2b] font-semibold px-7 py-3.5 rounded-full hover:bg-[#dfc98a] transition-colors text-sm"
              >
                Apply Now <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="mailto:academy@kuyashfarm.com"
                className="inline-flex items-center gap-2 border border-white/20 text-white/80 font-semibold px-7 py-3.5 rounded-full hover:border-white/40 hover:text-white transition-all text-sm"
              >
                Contact Admissions
              </a>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
