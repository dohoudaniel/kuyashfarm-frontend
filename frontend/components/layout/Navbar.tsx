"use client";

import { useState, useEffect, useRef } from "react";
import { cn, getCurrentUser } from "@/lib/utils";
import { NAV_LINKS, SITE_CONFIG } from "@/lib/constants";
import { AuthModal } from "@/components/auth/AuthModal";
import CartButton from "@/components/cart/CartButton";
import CartDrawer from "@/components/cart/CartDrawer";
import { User, LogOut, Settings, Package, Truck, LayoutDashboard, ChevronDown } from "lucide-react";
import Link from "next/link";
import type { User as UserType } from "@/lib/types";
import { getTierDisplayName, getTierBadgeColor } from "@/lib/features/distributor/distributor-utils";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    const handleStorageChange = () => setUser(getCurrentUser());
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* close dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* close mobile menu on resize */
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setIsMobileMenuOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setIsUserMenuOpen(false);
    window.location.href = "/";
  };

  const userInitials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-500",
          isScrolled
            ? "bg-[#080f0a]/95 backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,0.06)]"
            : "bg-transparent"
        )}
      >
        {/* thin brand accent line at very top */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-[2px] bg-[#2d5f3f] transition-opacity duration-500",
          isScrolled ? "opacity-100" : "opacity-0"
        )} />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* ── Logo ── */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group"
            >
              <div className="w-7 h-7 rounded-lg bg-[#2d5f3f] flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22V12M12 12C12 7 7 3 2 4c0 5 4 9 10 8M12 12c0-5 5-9 10-8-1 5-5 9-10 8" />
                </svg>
              </div>
              <span className="font-serif text-xl font-bold text-white tracking-tight">
                {SITE_CONFIG.name}
              </span>
            </Link>

            {/* ── Desktop Nav ── */}
            <div className="hidden md:flex md:items-center md:gap-1">
              {NAV_LINKS.map((link) => (
                link.label === "Academy" ? (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="ml-2 inline-flex items-center gap-1.5 bg-[#e8d5a3] text-[#1a3d2b] px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-[#dfc98a] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.label === "Home" ? "/" : link.href}
                    className="relative px-3 py-2 font-sans text-sm font-medium text-white/75 hover:text-white transition-colors duration-200 group"
                  >
                    {link.label}
                    <span className="absolute bottom-1 left-3 right-3 h-px bg-[#6b9d7a] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                  </a>
                )
              ))}
            </div>

            {/* ── Right side ── */}
            <div className="hidden md:flex items-center gap-3">
              <CartButton onClick={() => setIsCartOpen(true)} />

              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/8 hover:bg-white/14 backdrop-blur-sm px-3 py-1.5 transition-all duration-200"
                  >
                    {/* initials avatar */}
                    <div className="w-6 h-6 rounded-full bg-[#2d5f3f] flex items-center justify-center shrink-0">
                      <span className="text-white text-[10px] font-bold">{userInitials}</span>
                    </div>
                    <span className="font-sans text-sm font-medium text-white max-w-[100px] truncate">
                      {user.name?.split(" ")[0] || "Account"}
                    </span>
                    <ChevronDown className={cn(
                      "w-3.5 h-3.5 text-white/60 transition-transform duration-200",
                      isUserMenuOpen && "rotate-180"
                    )} />
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-1.5 z-50"
                      >
                        {/* user info header */}
                        <div className="px-4 py-3 border-b border-gray-50">
                          <p className="text-xs font-semibold text-[#080f0a] truncate">{user.name}</p>
                          <p className="text-[10px] text-gray-400 truncate mt-0.5">{user.email}</p>
                        </div>

                        <div className="py-1">
                          <DropdownLink href="/profile" icon={User} label="My Profile" onClick={() => setIsUserMenuOpen(false)} />
                          <DropdownLink href="/orders" icon={Package} label="My Orders" onClick={() => setIsUserMenuOpen(false)} />
                          <DropdownLink href="/academy/dashboard" icon={LayoutDashboard} label="Academy Dashboard" onClick={() => setIsUserMenuOpen(false)} />
                        </div>

                        {user.userType !== "distributor_pending" && user.userType !== "distributor_verified" && (
                          <>
                            <div className="h-px bg-gray-50 mx-3" />
                            <div className="py-1">
                              <DropdownLink href="/become-distributor" icon={Truck} label="Become a Distributor" onClick={() => setIsUserMenuOpen(false)} accent />
                            </div>
                          </>
                        )}

                        {user.userType === "distributor_pending" && (
                          <div className="mx-3 my-1.5 px-3 py-2 bg-[#e8d5a3]/20 border border-[#e8d5a3]/40 rounded-xl">
                            <p className="text-[11px] font-semibold text-[#1a3d2b]">Application pending review</p>
                          </div>
                        )}

                        {user.userType === "distributor_verified" && (
                          <div className="mx-3 my-1.5 px-3 py-2 bg-[#eef5f1] border border-[#c6dece] rounded-xl">
                            <p className="text-[11px] font-semibold text-[#2d5f3f]">✓ Verified Distributor</p>
                            {user.distributorInfo?.tier && (
                              <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getTierBadgeColor(user.distributorInfo.tier)}`}>
                                {getTierDisplayName(user.distributorInfo.tier)}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="h-px bg-gray-50 mx-3" />
                        <div className="py-1">
                          <DropdownLink href="/profile?tab=settings" icon={Settings} label="Settings" onClick={() => setIsUserMenuOpen(false)} />
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors duration-150"
                          >
                            <LogOut className="w-4 h-4 shrink-0" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="rounded-full border border-white/20 bg-white/10 hover:bg-white/18 backdrop-blur-sm px-5 py-2 font-sans text-sm font-semibold text-white transition-all duration-200"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* ── Mobile: cart + hamburger ── */}
            <div className="md:hidden flex items-center gap-2">
              <CartButton onClick={() => setIsCartOpen(true)} />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2.5 rounded-xl text-white hover:bg-white/10 transition-colors"
                aria-label="Toggle menu"
              >
                <div className="w-5 h-4 flex flex-col justify-between">
                  <span className={cn("block h-0.5 bg-white rounded-full transition-all duration-300", isMobileMenuOpen && "rotate-45 translate-y-[7px]")} />
                  <span className={cn("block h-0.5 bg-white rounded-full transition-all duration-300", isMobileMenuOpen && "opacity-0 scale-x-0")} />
                  <span className={cn("block h-0.5 bg-white rounded-full transition-all duration-300", isMobileMenuOpen && "-rotate-45 -translate-y-[9px]")} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden overflow-hidden border-t border-white/10 bg-[#080f0a]/97 backdrop-blur-md"
            >
              <div className="px-4 py-5 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  link.label === "Academy" ? (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="self-start mt-1 inline-flex items-center bg-[#e8d5a3] text-[#1a3d2b] px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#dfc98a] transition-colors"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      key={link.label}
                      href={link.label === "Home" ? "/" : link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-2 py-2.5 font-sans text-sm font-medium text-white/75 hover:text-white transition-colors border-b border-white/5 last:border-0"
                    >
                      {link.label}
                    </a>
                  )
                ))}

                <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-1">
                  {user ? (
                    <>
                      {/* mobile user info */}
                      <div className="flex items-center gap-3 px-2 py-3 mb-1">
                        <div className="w-9 h-9 rounded-full bg-[#2d5f3f] flex items-center justify-center shrink-0">
                          <span className="text-white text-xs font-bold">{userInitials}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{user.name}</p>
                          <p className="text-[10px] text-white/40">{user.email}</p>
                        </div>
                      </div>

                      <MobileLink href="/profile" icon={User} label="My Profile" onClick={() => setIsMobileMenuOpen(false)} />
                      <MobileLink href="/orders" icon={Package} label="My Orders" onClick={() => setIsMobileMenuOpen(false)} />
                      <MobileLink href="/academy/dashboard" icon={LayoutDashboard} label="Academy Dashboard" onClick={() => setIsMobileMenuOpen(false)} />

                      {user.userType !== "distributor_pending" && user.userType !== "distributor_verified" && (
                        <MobileLink href="/become-distributor" icon={Truck} label="Become a Distributor" onClick={() => setIsMobileMenuOpen(false)} accent />
                      )}

                      {user.userType === "distributor_pending" && (
                        <div className="px-2 py-2 text-xs text-[#e8d5a3]/80 bg-white/5 rounded-xl mt-1">
                          Distributor application pending review
                        </div>
                      )}

                      <button
                        onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                        className="flex items-center gap-2.5 px-2 py-2.5 text-sm text-red-400 hover:text-red-300 transition-colors mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => { setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }}
                      className="w-full rounded-full border border-white/20 bg-white/10 px-6 py-3 text-white font-semibold text-sm hover:bg-white/15 transition-colors"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setUser(getCurrentUser());
          setIsAuthModalOpen(false);
        }}
      />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

/* ── shared sub-components ── */
function DropdownLink({
  href, icon: Icon, label, onClick, accent,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 px-4 py-2 text-sm transition-colors duration-150",
        accent
          ? "text-[#2d5f3f] hover:bg-[#eef5f1]"
          : "text-gray-600 hover:bg-gray-50"
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

function MobileLink({
  href, icon: Icon, label, onClick, accent,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 px-2 py-2.5 text-sm font-medium transition-colors",
        accent ? "text-[#6b9d7a]" : "text-white/75 hover:text-white"
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}
