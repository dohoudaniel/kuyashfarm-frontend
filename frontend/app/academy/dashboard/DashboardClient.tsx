"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  LayoutDashboard, BookOpen, CalendarDays, History,
  Award, CreditCard, Bell, User, Settings, LogOut,
  Search, ChevronRight, Download, Eye, Plus,
  Clock, MapPin, CheckCircle2, XCircle, AlertCircle,
  Menu, X, Filter, ExternalLink, FileText,
  Briefcase, GraduationCap, Phone, Mail, Globe,
  RefreshCw, ChevronDown, ChevronUp, MoreHorizontal,
  Leaf, BookMarked, CalendarPlus, ArrowRight,
} from "lucide-react";
import {
  MOCK_STUDENT, MOCK_ENROLLMENTS, MOCK_UPCOMING_CLASSES,
  MOCK_REGISTRATIONS, MOCK_CERTIFICATES, MOCK_PAYMENTS, MOCK_NOTIFICATIONS,
  type Notification,
} from "@/lib/data/student";

/* ─── types ─── */
type Section =
  | "dashboard" | "programs" | "classes" | "history"
  | "certificates" | "payments" | "notifications" | "profile" | "settings";

/* ─── helpers ─── */
function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("");
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

/* ─── STATUS BADGE ─── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Upcoming:       "bg-[#eef5f1] text-[#2d5f3f] border-[#c6dece]",
    Ongoing:        "bg-[#2d5f3f]/10 text-[#2d5f3f] border-[#2d5f3f]/20",
    Completed:      "bg-gray-100 text-gray-500 border-gray-200",
    Cancelled:      "bg-red-50 text-red-500 border-red-100",
    Confirmed:      "bg-[#eef5f1] text-[#2d5f3f] border-[#c6dece]",
    Waitlisted:     "bg-[#e8d5a3]/30 text-[#1a3d2b] border-[#e8d5a3]/50",
    Pending:        "bg-[#e8d5a3]/30 text-[#1a3d2b] border-[#e8d5a3]/50",
    Paid:           "bg-[#eef5f1] text-[#2d5f3f] border-[#c6dece]",
    "Partially Paid": "bg-[#e8d5a3]/30 text-[#1a3d2b] border-[#e8d5a3]/50",
    Refunded:       "bg-gray-100 text-gray-500 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${map[status] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}>
      {status}
    </span>
  );
}

/* ─── AVATAR ─── */
function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const sz = { sm: "w-7 h-7 text-[10px]", md: "w-9 h-9 text-xs", lg: "w-12 h-12 text-sm" }[size];
  return (
    <div className={`${sz} rounded-full bg-[#2d5f3f] flex items-center justify-center text-white font-semibold shrink-0`}>
      {initials(name)}
    </div>
  );
}

/* ─── EMPTY STATE ─── */
function EmptyState({ icon: Icon, title, body, action }: {
  icon: React.ElementType; title: string; body: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#eef5f1] border border-[#c6dece] flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-[#2d5f3f]" />
      </div>
      <p className="font-serif text-base font-bold text-gray-900 mb-1">{title}</p>
      <p className="text-sm text-gray-400 font-sans max-w-xs leading-relaxed">{body}</p>
      {action && (
        <Link href={action.href}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#2d5f3f] border border-[#c6dece] px-4 py-2 rounded-full hover:bg-[#eef5f1] transition-colors">
          {action.label} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}

/* ─── LOADING SKELETON ─── */
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />;
}

/* ─── SECTION WRAPPER ─── */
function Section({ title, subtitle, action, children }: {
  title: string; subtitle?: string;
  action?: { label: string; onClick?: () => void; href?: string };
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="font-serif text-lg font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400 font-sans mt-0.5">{subtitle}</p>}
        </div>
        {action && (
          action.href ? (
            <Link href={action.href} className="text-xs font-semibold text-[#2d5f3f] hover:underline underline-offset-2">
              {action.label}
            </Link>
          ) : (
            <button onClick={action.onClick} className="text-xs font-semibold text-[#2d5f3f] hover:underline underline-offset-2">
              {action.label}
            </button>
          )
        )}
      </div>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════
   DASHBOARD SECTION
══════════════════════════════════════════════ */
function DashboardSection({ setSection }: { setSection: (s: Section) => void }) {
  const summaryCards = [
    {
      icon: BookOpen, label: "Programs Enrolled",
      value: MOCK_ENROLLMENTS.length,
      sub: `${MOCK_ENROLLMENTS.filter(e => e.status === "Upcoming").length} upcoming`,
      onClick: () => setSection("programs"),
    },
    {
      icon: CalendarDays, label: "Upcoming Classes",
      value: MOCK_UPCOMING_CLASSES.length,
      sub: "Next: Apr 19",
      onClick: () => setSection("classes"),
    },
    {
      icon: GraduationCap, label: "Completed",
      value: MOCK_ENROLLMENTS.filter(e => e.status === "Completed").length,
      sub: "Programs finished",
      onClick: () => setSection("programs"),
    },
    {
      icon: Award, label: "Certificates Earned",
      value: MOCK_CERTIFICATES.length,
      sub: "Available to download",
      onClick: () => setSection("certificates"),
    },
  ];

  const pendingPayments = MOCK_PAYMENTS.filter(p => p.status === "Pending");
  const totalPending = pendingPayments.reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.button
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              onClick={card.onClick}
              className="group text-left bg-white border border-gray-100 hover:border-[#c6dece] rounded-2xl p-5 transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-9 h-9 rounded-xl bg-[#eef5f1] border border-[#c6dece] flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[#2d5f3f]" />
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#2d5f3f] transition-colors" />
              </div>
              <p className="font-serif text-3xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">{card.label}</p>
              <p className="text-[10px] text-gray-400 mt-1 font-sans">{card.sub}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Upcoming Classes preview */}
      <Section title="Upcoming Classes" subtitle="Your next scheduled sessions"
        action={{ label: "View all", onClick: () => setSection("classes") }}>
        <div className="space-y-3">
          {MOCK_UPCOMING_CLASSES.map((cls, i) => (
            <UpcomingClassCard key={cls.id} cls={cls} isNext={i === 0} compact />
          ))}
        </div>
      </Section>

      {/* Two-col: recent enrollments + pending payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Enrollments */}
        <Section title="Recent Enrollments" action={{ label: "View all", onClick: () => setSection("programs") }}>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50">
            {MOCK_ENROLLMENTS.slice(0, 3).map((enr) => (
              <div key={enr.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/50 transition-colors">
                <Avatar name={enr.instructorInitials} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{enr.programName}</p>
                  <p className="text-[11px] text-gray-400 font-sans">{fmtDate(enr.startDate)}</p>
                </div>
                <StatusBadge status={enr.status} />
              </div>
            ))}
          </div>
        </Section>

        {/* Pending Payments */}
        <Section title="Pending Payments" action={{ label: "View all", onClick: () => setSection("payments") }}>
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            {pendingPayments.length > 0 ? (
              <>
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-[10px] text-gray-400 font-sans uppercase tracking-wider mb-1">Total Outstanding</p>
                    <p className="font-serif text-2xl font-bold text-gray-900">₦{totalPending.toLocaleString()}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#e8d5a3]/30 text-[#1a3d2b] border border-[#e8d5a3]/50">
                    Pay on Arrival
                  </span>
                </div>
                <div className="space-y-2.5">
                  {pendingPayments.map((p) => (
                    <div key={p.ref} className="flex items-center justify-between text-sm">
                      <p className="text-gray-600 font-sans truncate flex-1 pr-3">{p.programName}</p>
                      <p className="font-semibold text-gray-900 shrink-0">₦{p.amount.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">No pending payments.</p>
            )}
          </div>
        </Section>
      </div>

      {/* Quick Actions */}
      <Section title="Quick Actions">
        <QuickActionGrid setSection={setSection} />
      </Section>

      {/* Notifications preview */}
      <Section title="Recent Notifications" action={{ label: "View all", onClick: () => setSection("notifications") }}>
        <NotificationList limit={3} />
      </Section>
    </div>
  );
}

/* ══════════════════════════════════════════════
   UPCOMING CLASS CARD
══════════════════════════════════════════════ */
function UpcomingClassCard({ cls, isNext, compact }: {
  cls: typeof MOCK_UPCOMING_CLASSES[0]; isNext: boolean; compact?: boolean;
}) {
  const days = daysUntil(new Date(cls.date).toISOString().split("T")[0]);
  const countdownText = days === 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days} days`;
  const countdownColor = days <= 1 ? "text-[#2d5f3f] font-bold" : days <= 7 ? "text-[#1a3d2b]" : "text-gray-400";

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 ${isNext ? "border-[#2d5f3f]/30 shadow-md shadow-[#2d5f3f]/5" : "border-gray-100 hover:border-gray-200"} p-5`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge status={cls.status} />
            <span className={`text-[11px] font-sans font-medium ${countdownColor}`}>{countdownText}</span>
          </div>
          <h3 className="font-serif font-bold text-gray-900 text-sm leading-tight mb-3">{cls.title}</h3>
          <div className={`grid gap-1.5 text-[11px] text-gray-500 font-sans ${compact ? "grid-cols-1" : "grid-cols-2"}`}>
            <span className="flex items-center gap-1.5"><User className="w-3 h-3 shrink-0 text-gray-300" />{cls.instructor}</span>
            <span className="flex items-center gap-1.5"><CalendarDays className="w-3 h-3 shrink-0 text-gray-300" />{cls.date}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 shrink-0 text-gray-300" />{cls.time}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 shrink-0 text-gray-300" />{cls.location}</span>
          </div>
        </div>
        {!compact && (
          <div className="flex flex-col gap-2 shrink-0">
            <Link href={`/academy/classes/${cls.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#2d5f3f] px-3 py-2 rounded-lg hover:bg-[#4a7c59] transition-colors">
              <Eye className="w-3 h-3" /> View
            </Link>
            <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2d5f3f] border border-[#c6dece] px-3 py-2 rounded-lg hover:bg-[#eef5f1] transition-colors">
              <CalendarPlus className="w-3 h-3" /> Add to Cal
            </button>
          </div>
        )}
      </div>
      {!compact && (
        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
          <span className="text-[10px] font-mono text-gray-300">Ref: {cls.ref}</span>
          <span className="text-[10px] text-gray-400 font-sans">{cls.address}</span>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   CLASSES SECTION
══════════════════════════════════════════════ */
function ClassesSection() {
  return (
    <Section title="Upcoming Classes" subtitle={`${MOCK_UPCOMING_CLASSES.length} classes scheduled`}>
      {MOCK_UPCOMING_CLASSES.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No upcoming classes"
          body="You don't have any scheduled classes yet. Browse programs to register."
          action={{ label: "Browse Programs", href: "/academy/programs" }} />
      ) : (
        <div className="space-y-4">
          {MOCK_UPCOMING_CLASSES.map((cls, i) => (
            <UpcomingClassCard key={cls.id} cls={cls} isNext={i === 0} />
          ))}
        </div>
      )}
    </Section>
  );
}

/* ══════════════════════════════════════════════
   PROGRAMS SECTION
══════════════════════════════════════════════ */
function ProgramsSection() {
  const [filter, setFilter] = useState<string>("All");
  const filters = ["All", "Upcoming", "Ongoing", "Completed", "Cancelled"];
  const filtered = filter === "All" ? MOCK_ENROLLMENTS : MOCK_ENROLLMENTS.filter(e => e.status === filter);

  return (
    <Section title="My Programs" subtitle={`${MOCK_ENROLLMENTS.length} total enrollments`}>
      <div className="flex gap-2 flex-wrap mb-5">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-150 ${f === filter ? "bg-[#2d5f3f] text-white border-[#2d5f3f]" : "border-gray-200 text-gray-500 hover:border-[#c6dece] hover:text-[#2d5f3f]"}`}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="No enrollments found"
          body="No programs match this filter."
          action={{ label: "Browse Programs", href: "/academy/programs" }} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((enr) => (
            <motion.div key={enr.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white border border-gray-100 hover:border-[#c6dece] rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md group">
              <div className="relative h-36 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={enr.image} alt={enr.programName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                <div className="absolute top-3 left-3"><StatusBadge status={enr.status} /></div>
                <div className="absolute bottom-3 right-3">
                  <Avatar name={enr.instructorInitials} size="sm" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-serif font-bold text-gray-900 text-sm leading-tight mb-1">{enr.programName}</h3>
                <p className="text-[11px] text-gray-400 font-sans mb-3">{enr.instructor} · {enr.duration}</p>

                {enr.status === "Ongoing" && (
                  <div className="mb-3">
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>Progress</span>
                      <span className="font-semibold text-[#2d5f3f]">{enr.progress}%</span>
                    </div>
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#2d5f3f] rounded-full" style={{ width: `${enr.progress}%` }} />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <span className="text-[10px] font-mono text-gray-300">Ref: {enr.ref}</span>
                  <div className="flex gap-2">
                    <Link href={`/academy/classes/${enr.classId}`}
                      className="text-[11px] font-semibold text-[#2d5f3f] border border-[#c6dece] px-2.5 py-1.5 rounded-lg hover:bg-[#eef5f1] transition-colors">
                      View Details
                    </Link>
                    {enr.status !== "Cancelled" && enr.status !== "Completed" && (
                      <Link href={`/academy/classes/${enr.classId}`}
                        className="text-[11px] font-semibold text-white bg-[#2d5f3f] px-2.5 py-1.5 rounded-lg hover:bg-[#4a7c59] transition-colors">
                        {enr.status === "Ongoing" ? "Continue" : "Details"}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Section>
  );
}

/* ══════════════════════════════════════════════
   REGISTRATION HISTORY SECTION
══════════════════════════════════════════════ */
function HistorySection() {
  const [search, setSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filtered = useMemo(() =>
    MOCK_REGISTRATIONS.filter(r =>
      r.programName.toLowerCase().includes(search.toLowerCase()) ||
      r.ref.toLowerCase().includes(search.toLowerCase())
    ), [search]);

  return (
    <Section title="Registration History" subtitle={`${MOCK_REGISTRATIONS.length} total registrations`}>
      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by program or reference..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-sans outline-none focus:border-[#2d5f3f] focus:ring-2 focus:ring-[#2d5f3f]/10 transition-all" />
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50">
              {["Reference", "Program", "Registered", "Payment", "Enrollment", "Actions"].map(col => (
                <th key={col} className="text-left px-5 py-3.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider font-sans">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(r => (
              <tr key={r.ref} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-4 font-mono text-[11px] text-gray-500">{r.ref}</td>
                <td className="px-5 py-4 font-sans text-gray-900 font-medium max-w-[200px] truncate">{r.programName}</td>
                <td className="px-5 py-4 font-sans text-gray-500 text-xs">{fmtDate(r.registeredAt)}</td>
                <td className="px-5 py-4"><StatusBadge status={r.paymentStatus} /></td>
                <td className="px-5 py-4"><StatusBadge status={r.enrollmentStatus} /></td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2d5f3f] hover:underline underline-offset-2">
                      <Eye className="w-3 h-3" /> View
                    </button>
                    <button className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-gray-700">
                      <Download className="w-3 h-3" /> Slip
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <EmptyState icon={History} title="No records found" body="Try a different search term." />
        )}
      </div>

      {/* Mobile expandable cards */}
      <div className="md:hidden space-y-3">
        {filtered.map(r => (
          <div key={r.ref} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <button onClick={() => setExpandedRow(expandedRow === r.ref ? null : r.ref)}
              className="w-full flex items-center justify-between gap-3 px-4 py-4 text-left">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{r.programName}</p>
                <p className="text-[10px] font-mono text-gray-400 mt-0.5">{r.ref}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={r.enrollmentStatus} />
                {expandedRow === r.ref ? <ChevronUp className="w-4 h-4 text-gray-300" /> : <ChevronDown className="w-4 h-4 text-gray-300" />}
              </div>
            </button>
            <AnimatePresence>
              {expandedRow === r.ref && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                  className="overflow-hidden border-t border-gray-50">
                  <div className="px-4 py-4 space-y-2.5">
                    {[
                      ["Registered", fmtDate(r.registeredAt)],
                      ["Payment", r.paymentStatus],
                      ["Amount", `₦${r.amount.toLocaleString()}`],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs">
                        <span className="text-gray-400 font-sans">{k}</span>
                        <span className="font-semibold text-gray-900">{v}</span>
                      </div>
                    ))}
                    <div className="flex gap-2 pt-2">
                      <button className="flex-1 text-xs font-semibold text-[#2d5f3f] border border-[#c6dece] py-2 rounded-lg hover:bg-[#eef5f1] transition-colors">View</button>
                      <button className="flex-1 text-xs font-semibold text-gray-500 border border-gray-200 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5">
                        <Download className="w-3 h-3" /> Slip
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ══════════════════════════════════════════════
   CERTIFICATES SECTION
══════════════════════════════════════════════ */
function CertificatesSection() {
  return (
    <Section title="Certificates" subtitle={`${MOCK_CERTIFICATES.length} certificate${MOCK_CERTIFICATES.length !== 1 ? "s" : ""} earned`}>
      {MOCK_CERTIFICATES.length === 0 ? (
        <EmptyState icon={Award} title="No certificates yet"
          body="Complete a program to receive your NABTEB-certified certificate."
          action={{ label: "Browse Programs", href: "/academy/programs" }} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_CERTIFICATES.map((cert) => (
            <motion.div key={cert.id}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
              className="group bg-white border border-gray-100 hover:border-[#c6dece] rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200">
              {/* Certificate preview */}
              <div className="relative h-40 bg-linear-to-br from-[#0f2318] to-[#1a3d2b] flex flex-col items-center justify-center p-5">
                <div className="absolute inset-0 opacity-[0.05]"
                  style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                <Award className="w-8 h-8 text-[#e8d5a3] mb-2" />
                <p className="text-white font-serif font-bold text-xs text-center leading-tight">{cert.programName}</p>
                <p className="text-[#6b9d7a] text-[9px] font-mono mt-1.5 tracking-widest uppercase">Certificate of Completion</p>
                <div className="absolute top-3 right-3">
                  <span className="text-[9px] font-semibold text-[#e8d5a3] bg-[#e8d5a3]/10 border border-[#e8d5a3]/20 px-2 py-0.5 rounded-full">
                    {cert.grade}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-serif font-bold text-gray-900 text-sm leading-tight mb-3">{cert.programName}</h3>
                <div className="space-y-1.5 text-[11px] text-gray-400 font-sans mb-4">
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#2d5f3f]" /> Completed {cert.completedAt}</div>
                  <div className="flex items-center gap-1.5"><FileText className="w-3 h-3 text-gray-300" />Cert No: {cert.certificateNumber}</div>
                </div>
                <div className="flex gap-2 pt-3 border-t border-gray-50">
                  <button className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#2d5f3f] border border-[#c6dece] py-2 rounded-lg hover:bg-[#eef5f1] transition-colors">
                    <Eye className="w-3 h-3" /> View
                  </button>
                  <button className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-[#2d5f3f] py-2 rounded-lg hover:bg-[#4a7c59] transition-colors">
                    <Download className="w-3 h-3" /> Download
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Section>
  );
}

/* ══════════════════════════════════════════════
   PAYMENTS SECTION
══════════════════════════════════════════════ */
function PaymentsSection() {
  const paid = MOCK_PAYMENTS.filter(p => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
  const pending = MOCK_PAYMENTS.filter(p => p.status === "Pending").reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Paid", value: `₦${paid.toLocaleString()}`, color: "text-[#2d5f3f]" },
          { label: "Pending", value: `₦${pending.toLocaleString()}`, color: "text-[#1a3d2b]" },
          { label: "Outstanding", value: `₦${pending.toLocaleString()}`, color: "text-gray-900" },
        ].map(c => (
          <div key={c.label} className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="text-[10px] text-gray-400 font-sans uppercase tracking-wider mb-2">{c.label}</p>
            <p className={`font-serif text-xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Notice */}
      <div className="flex items-start gap-3 bg-[#eef5f1] border border-[#c6dece] rounded-xl px-4 py-3.5 mb-6">
        <AlertCircle className="w-4 h-4 text-[#2d5f3f] shrink-0 mt-0.5" />
        <p className="text-xs text-[#1a3d2b] font-sans leading-relaxed">
          Payments are currently collected on arrival at the farm. Online payment via card and bank transfer will be available soon.
        </p>
      </div>

      <Section title="Payment History">
        {/* Desktop table */}
        <div className="hidden md:block bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                {["Reference", "Program", "Amount", "Method", "Status", "Date", "Receipt"].map(col => (
                  <th key={col} className="text-left px-5 py-3.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider font-sans">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MOCK_PAYMENTS.map(p => (
                <tr key={p.ref} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4 font-mono text-[11px] text-gray-500">{p.ref}</td>
                  <td className="px-5 py-4 font-sans text-gray-900 font-medium text-xs max-w-[160px] truncate">{p.programName}</td>
                  <td className="px-5 py-4 font-semibold text-gray-900 text-xs">₦{p.amount.toLocaleString()}</td>
                  <td className="px-5 py-4 text-xs text-gray-500 font-sans">{p.paymentMethod}</td>
                  <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-4 text-xs text-gray-500 font-sans">{fmtDate(p.date)}</td>
                  <td className="px-5 py-4">
                    {p.receiptAvailable ? (
                      <button className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2d5f3f] hover:underline underline-offset-2">
                        <Download className="w-3 h-3" /> PDF
                      </button>
                    ) : (
                      <span className="text-[11px] text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {MOCK_PAYMENTS.map(p => (
            <div key={p.ref} className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-start">
                <p className="text-sm font-semibold text-gray-900 leading-tight">{p.programName}</p>
                <StatusBadge status={p.status} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><p className="text-gray-400">Amount</p><p className="font-semibold text-gray-900">₦{p.amount.toLocaleString()}</p></div>
                <div><p className="text-gray-400">Date</p><p className="font-semibold text-gray-900">{fmtDate(p.date)}</p></div>
                <div><p className="text-gray-400">Method</p><p className="font-semibold text-gray-900">{p.paymentMethod}</p></div>
                <div><p className="text-gray-400">Ref</p><p className="font-mono text-[10px] text-gray-500">{p.ref}</p></div>
              </div>
              {p.receiptAvailable && (
                <button className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-[#2d5f3f] border border-[#c6dece] py-2 rounded-lg hover:bg-[#eef5f1] transition-colors">
                  <Download className="w-3 h-3" /> Download Receipt
                </button>
              )}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ══════════════════════════════════════════════
   NOTIFICATIONS
══════════════════════════════════════════════ */
const NOTIF_ICONS: Record<Notification["type"], React.ElementType> = {
  registration: CheckCircle2,
  reminder: Bell,
  schedule: CalendarDays,
  certificate: Award,
  payment: CreditCard,
  general: AlertCircle,
};

function NotificationList({ limit }: { limit?: number }) {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const shown = limit ? notifications.slice(0, limit) : notifications;
  const unread = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <div>
      {!limit && (
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg font-bold text-gray-900">Notifications</h2>
            {unread > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#2d5f3f] text-white text-[10px] font-bold flex items-center justify-center">{unread}</span>
            )}
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} className="text-xs font-semibold text-[#2d5f3f] hover:underline underline-offset-2">Mark all read</button>
          )}
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50">
        {shown.map(n => {
          const Icon = NOTIF_ICONS[n.type];
          const ts = new Date(n.timestamp);
          const timeStr = ts.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
          return (
            <button key={n.id} onClick={() => markRead(n.id)}
              className={`w-full flex items-start gap-3 px-4 py-4 text-left hover:bg-gray-50/50 transition-colors ${!n.read ? "bg-[#eef5f1]/40" : ""}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${!n.read ? "bg-[#2d5f3f] text-white" : "bg-gray-100 text-gray-400"}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm font-sans ${!n.read ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>{n.title}</p>
                  <span className="text-[10px] text-gray-300 font-sans shrink-0">{timeStr}</span>
                </div>
                <p className="text-xs text-gray-400 font-sans mt-0.5 leading-relaxed">{n.body}</p>
              </div>
              {!n.read && <span className="w-2 h-2 rounded-full bg-[#2d5f3f] shrink-0 mt-2" />}
            </button>
          );
        })}
        {shown.length === 0 && (
          <div className="py-10 text-center text-sm text-gray-400 font-sans">No notifications.</div>
        )}
      </div>
    </div>
  );
}

function NotificationsSection() {
  return <NotificationList />;
}

/* ══════════════════════════════════════════════
   QUICK ACTIONS
══════════════════════════════════════════════ */
function QuickActionGrid({ setSection }: { setSection: (s: Section) => void }) {
  const actions = [
    { icon: Plus, label: "Register Program", onClick: () => window.location.href = "/academy/programs" },
    { icon: BookOpen, label: "Browse Courses", onClick: () => window.location.href = "/academy/programs" },
    { icon: Download, label: "Download Certificate", onClick: () => setSection("certificates") },
    { icon: CalendarDays, label: "View Timetable", onClick: () => setSection("classes") },
    { icon: Mail, label: "Contact Academy", onClick: () => window.location.href = "mailto:academy@kuyashfarm.com" },
    { icon: User, label: "Update Profile", onClick: () => setSection("profile") },
  ];
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <button key={a.label} onClick={a.onClick}
            className="group flex flex-col items-center gap-2.5 p-3 bg-white border border-gray-100 hover:border-[#c6dece] rounded-2xl transition-all duration-200 hover:shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#eef5f1] border border-[#c6dece] flex items-center justify-center group-hover:bg-[#2d5f3f] transition-colors duration-200">
              <Icon className="w-4 h-4 text-[#2d5f3f] group-hover:text-white transition-colors duration-200" />
            </div>
            <span className="text-[10px] font-semibold text-gray-500 text-center leading-tight">{a.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════
   PROFILE SECTION
══════════════════════════════════════════════ */
function ProfileSection() {
  const s = MOCK_STUDENT;
  const rows: [string, string][] = [
    ["Student ID", s.studentId],
    ["Email", s.email],
    ["Phone", s.phone],
    ["Member Since", s.memberSince],
    ["Farming Experience", s.farmingExperience],
    ["Education", s.education],
    ["Occupation", s.occupation],
    ["State", s.state],
    ["LGA", s.lga],
    ["Preferred Language", s.preferredLanguage],
  ];

  return (
    <Section title="Student Profile">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-[#2d5f3f] flex items-center justify-center text-white font-serif text-2xl font-bold mb-4">
            {initials(`${s.firstName} ${s.lastName}`)}
          </div>
          <h3 className="font-serif font-bold text-gray-900 text-lg">{s.firstName} {s.lastName}</h3>
          <p className="text-xs text-gray-400 font-mono mt-1">{s.studentId}</p>
          <div className="flex flex-wrap gap-1.5 justify-center mt-4">
            {s.areasOfInterest.map(a => (
              <span key={a} className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#eef5f1] text-[#2d5f3f] border border-[#c6dece]">{a}</span>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 w-full space-y-2 text-left">
            <div className="flex items-center gap-2 text-xs text-gray-500"><Mail className="w-3.5 h-3.5 text-gray-300" />{s.email}</div>
            <div className="flex items-center gap-2 text-xs text-gray-500"><Phone className="w-3.5 h-3.5 text-gray-300" />{s.phone}</div>
            <div className="flex items-center gap-2 text-xs text-gray-500"><MapPin className="w-3.5 h-3.5 text-gray-300" />{s.state}</div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-serif font-bold text-gray-900 text-sm">Profile Details</h3>
            <button className="text-xs font-semibold text-[#2d5f3f] border border-[#c6dece] px-3 py-1.5 rounded-lg hover:bg-[#eef5f1] transition-colors">
              Edit Profile
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {rows.map(([label, value]) => (
              <div key={label} className="border-b border-gray-50 pb-3">
                <p className="text-[10px] text-gray-400 font-sans uppercase tracking-wider mb-1">{label}</p>
                <p className="text-sm font-semibold text-gray-900 font-sans">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ══════════════════════════════════════════════
   SETTINGS SECTION
══════════════════════════════════════════════ */
function SettingsSection() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    classReminders: true,
    paymentReminders: true,
    newsletter: false,
    certificateAlerts: true,
  });

  const toggle = (key: keyof typeof settings) =>
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  const notifSettings = [
    { key: "emailNotifications" as const, label: "Email Notifications", sub: "Receive updates via email" },
    { key: "smsNotifications" as const, label: "SMS Notifications", sub: "Receive updates via text message" },
    { key: "classReminders" as const, label: "Class Reminders", sub: "7-day and 1-day reminders before class" },
    { key: "paymentReminders" as const, label: "Payment Reminders", sub: "Reminders for pending payments" },
    { key: "certificateAlerts" as const, label: "Certificate Alerts", sub: "When your certificate is ready" },
    { key: "newsletter" as const, label: "Academy Newsletter", sub: "Monthly updates and program news" },
  ];

  return (
    <Section title="Settings">
      <div className="space-y-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h3 className="font-serif font-bold text-gray-900 text-sm mb-5">Notification Preferences</h3>
          <div className="space-y-4">
            {notifSettings.map(({ key, label, sub }) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900 font-sans">{label}</p>
                  <p className="text-xs text-gray-400 font-sans mt-0.5">{sub}</p>
                </div>
                <button onClick={() => toggle(key)}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ${settings[key] ? "bg-[#2d5f3f]" : "bg-gray-200"}`}>
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${settings[key] ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h3 className="font-serif font-bold text-gray-900 text-sm mb-5">Account</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between px-4 py-3 border border-gray-100 rounded-xl hover:border-gray-200 hover:bg-gray-50 transition-all text-sm font-semibold text-gray-700">
              Change Password <ChevronRight className="w-4 h-4 text-gray-300" />
            </button>
            <button className="w-full flex items-center justify-between px-4 py-3 border border-red-100 rounded-xl hover:bg-red-50 transition-all text-sm font-semibold text-red-500">
              Delete Account <ChevronRight className="w-4 h-4 text-red-300" />
            </button>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ══════════════════════════════════════════════
   SIDEBAR NAV
══════════════════════════════════════════════ */
const NAV_ITEMS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "dashboard",     label: "Dashboard",         icon: LayoutDashboard },
  { id: "programs",      label: "My Programs",        icon: BookOpen },
  { id: "classes",       label: "Upcoming Classes",   icon: CalendarDays },
  { id: "history",       label: "Registration History", icon: History },
  { id: "certificates",  label: "Certificates",       icon: Award },
  { id: "payments",      label: "Payments",           icon: CreditCard },
  { id: "notifications", label: "Notifications",      icon: Bell },
  { id: "profile",       label: "Profile",            icon: User },
  { id: "settings",      label: "Settings",           icon: Settings },
];

function SidebarContent({ active, setSection, onClose }: {
  active: Section; setSection: (s: Section) => void; onClose?: () => void;
}) {
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-gray-100 dark:border-white/5">
        <div className="w-8 h-8 rounded-lg bg-[#2d5f3f] flex items-center justify-center shrink-0">
          <Leaf className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-serif font-bold text-gray-900 dark:text-white text-sm leading-none">Kuyash Academy</p>
          <p className="text-[10px] text-gray-400 font-mono mt-0.5">Student Portal</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => { setSection(item.id); onClose?.(); }}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-sans font-medium transition-all duration-150 text-left
                ${isActive ? "bg-[#eef5f1] text-[#2d5f3f]" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white"}`}>
              {isActive && (
                <motion.span layoutId="sidebar-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#2d5f3f] rounded-full" />
              )}
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
              {item.id === "notifications" && unreadCount > 0 && (
                <span className="ml-auto w-5 h-5 rounded-full bg-[#2d5f3f] text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-gray-100 dark:border-white/5 px-3 py-4 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <Avatar name={`${MOCK_STUDENT.firstName} ${MOCK_STUDENT.lastName}`} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{MOCK_STUDENT.firstName} {MOCK_STUDENT.lastName}</p>
            <p className="text-[10px] text-gray-400 font-mono truncate">{MOCK_STUDENT.studentId}</p>
          </div>
        </div>
        <Link href="/academy"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150">
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </Link>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN LAYOUT
══════════════════════════════════════════════ */
export function DashboardClient() {
  const [section, setSection] = useState<Section>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");

  const unread = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  const sectionTitles: Record<Section, string> = {
    dashboard: "Dashboard", programs: "My Programs", classes: "Upcoming Classes",
    history: "Registration History", certificates: "Certificates", payments: "Payments",
    notifications: "Notifications", profile: "Profile", settings: "Settings",
  };

  return (
    <div className="min-h-screen bg-[#f9f8f6] dark:bg-[#0a0f0d] flex">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-white dark:bg-[#080f0a] border-r border-gray-100 dark:border-white/5 fixed inset-y-0 left-0 z-30">
        <SidebarContent active={section} setSection={setSection} />
      </aside>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden" />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-72 z-50 bg-white dark:bg-[#080f0a] border-r border-gray-100 dark:border-white/5 lg:hidden flex flex-col">
              <SidebarContent active={section} setSection={setSection} onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main ── */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">

        {/* ── Top Nav ── */}
        <header className="sticky top-0 z-20 bg-white/90 dark:bg-[#080f0a]/90 backdrop-blur-md border-b border-gray-100 dark:border-white/5 px-4 lg:px-8 h-14 flex items-center gap-4">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500 -ml-1">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-serif font-bold text-gray-900 dark:text-white text-sm">
            {sectionTitles[section]}
          </h1>

          <div className="ml-auto flex items-center gap-2">
            {/* Search */}
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 w-52">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
                className="bg-transparent text-sm font-sans outline-none w-full text-gray-700 dark:text-white placeholder:text-gray-400" />
            </div>

            {/* Notifications */}
            <button onClick={() => setSection("notifications")}
              className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-white/60 transition-colors">
              <Bell className="w-4.5 h-4.5 w-5 h-5" />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#2d5f3f]" />
              )}
            </button>

            {/* Avatar */}
            <button onClick={() => setSection("profile")} className="flex items-center gap-2 pl-1">
              <Avatar name={`${MOCK_STUDENT.firstName} ${MOCK_STUDENT.lastName}`} size="sm" />
            </button>
          </div>
        </header>

        {/* ── Content ── */}
        <main className="flex-1 px-4 lg:px-8 py-7 max-w-6xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={section}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}>
              {section === "dashboard"    && <DashboardSection setSection={setSection} />}
              {section === "programs"     && <ProgramsSection />}
              {section === "classes"      && <ClassesSection />}
              {section === "history"      && <HistorySection />}
              {section === "certificates" && <CertificatesSection />}
              {section === "payments"     && <PaymentsSection />}
              {section === "notifications" && <NotificationsSection />}
              {section === "profile"      && <ProfileSection />}
              {section === "settings"     && <SettingsSection />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
