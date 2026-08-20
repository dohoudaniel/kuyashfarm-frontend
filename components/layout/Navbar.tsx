"use client";

/**
 * The site header.
 *
 * **The design is the frontend redesign's; the behaviour is this branch's.**
 * Main's version could not be ported wholesale: it read identity from
 * `getCurrentUser()` in `localStorage`, which is an object the browser owns
 * and can edit, and it opened an `AuthModal` rather than the `/login` route.
 * Client-owned identity is the exact pattern this branch removed, so taking
 * that file verbatim would have been a security regression dressed as a
 * redesign. What is ported is the *look*: transparent over the hero, dark and
 * blurred once scrolled, a brand rule at the very top, the leaf mark beside
 * the wordmark, and the underline that slides in under each link.
 *
 * Identity comes from `useAuth`, which is backed by an access token held in
 * memory and a refresh cookie the browser will not let JavaScript read.
 *
 * Mounted once by `SiteChrome` in the root layout. Do not add it to a page:
 * inside a page it remounts on every client-side navigation, which is what
 * made the cart re-fetch on every view.
 */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Heart,
  LogOut,
  Menu,
  Package,
  ShieldCheck,
  User as UserIcon,
  X,
} from "lucide-react";

import { NAV_LINKS, SITE_CONFIG } from "@/lib/constants";
import { useAuth } from "@/lib/context/AuthContext";
import { useCartStore } from "@/lib/store/useCartStore";
import CartButton from "@/components/cart/CartButton";
import CartDrawer from "@/components/cart/CartDrawer";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { user, isAuthenticated, isBackOffice, logout } = useAuth();
  const loadCart = useCartStore((state) => state.load);
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /**
   * Transparent over the hero, solid once scrolled.
   *
   * Only the homepage has a full-bleed hero to sit over. Everywhere else the
   * header starts solid, because transparent-over-white is invisible.
   */
  const onHomepage = pathname === "/";
  const solid = isScrolled || !onHomepage;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The cart follows the session: a signed-in user has a server cart keyed to
  // their account, an anonymous visitor one keyed to their session id.
  useEffect(() => {
    void loadCart();
  }, [isAuthenticated, loadCart]);

  // Close the account menu on an outside click, which is what people expect.
  useEffect(() => {
    if (!userMenuOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [userMenuOpen]);

  // Anchors resolve against the homepage when you are not on it.
  const hrefFor = (link: { label: string; href: string }) =>
    link.href.startsWith("#") ? (onHomepage ? link.href : `/${link.href}`) : link.href;

  const initials = (user?.full_name || user?.email || "?")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");

  async function handleSignOut() {
    setUserMenuOpen(false);
    await logout();
  }

  return (
    <>
      <nav
        className={cn(
          "fixed left-0 right-0 top-0 z-40 transition-all duration-500",
          solid
            ? "bg-[#080f0a]/95 shadow-[0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md"
            : "bg-transparent",
        )}
      >
        {/* A thin brand rule, revealed once the header goes solid. */}
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-[2px] bg-[#2d5f3f] transition-opacity duration-500",
            solid ? "opacity-100" : "opacity-0",
          )}
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Wordmark */}
            <Link href="/" className="group flex min-h-11 items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#2d5f3f] transition-transform duration-300 group-hover:scale-105">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4 text-white"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 22V12M12 12C12 7 7 3 2 4c0 5 4 9 10 8M12 12c0-5 5-9 10-8-1 5-5 9-10 8" />
                </svg>
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-white">
                {SITE_CONFIG.name}
              </span>
            </Link>

            {/* Primary navigation */}
            <div className="hidden md:flex md:items-center md:gap-1">
              {NAV_LINKS.map((link) =>
                link.label === "Academy" ? (
                  <Link
                    key={link.label}
                    href={hrefFor(link)}
                    className="ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-[#e8d5a3] px-4 text-sm font-semibold text-[#1a3d2b] transition-colors hover:bg-[#dfc98a]"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <Link
                    key={link.label}
                    href={hrefFor(link)}
                    className="group relative inline-flex min-h-11 min-w-11 items-center justify-center px-3 font-sans text-sm font-medium text-white/75 transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                    <span className="absolute bottom-2 left-3 right-3 h-px origin-left scale-x-0 bg-[#6b9d7a] transition-transform duration-200 group-hover:scale-x-100" />
                  </Link>
                ),
              )}
            </div>

            {/* Account and basket */}
            <div className="hidden items-center gap-3 md:flex">
              <CartButton onClick={() => setCartOpen(true)} />

              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((open) => !open)}
                    aria-expanded={userMenuOpen}
                    aria-haspopup="menu"
                    className="flex min-h-11 items-center gap-2.5 rounded-full border border-white/15 bg-white/8 px-3 backdrop-blur-sm transition-colors hover:bg-white/14"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2d5f3f] text-[10px] font-bold text-white">
                      {initials}
                    </span>
                    <span className="max-w-[100px] truncate font-sans text-sm font-medium text-white">
                      {user?.full_name || user?.email}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 text-white/60 transition-transform duration-200",
                        userMenuOpen && "rotate-180",
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        role="menu"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.16 }}
                        className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white py-1.5 shadow-xl"
                      >
                        <div className="border-b border-gray-50 px-4 py-3">
                          <p className="truncate text-xs font-semibold text-[#080f0a]">
                            {user?.full_name || "Your account"}
                          </p>
                          <p className="truncate text-xs text-gray-500">{user?.email}</p>
                        </div>

                        <Link
                          href="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <UserIcon className="h-4 w-4" /> My profile
                        </Link>
                        <Link
                          href="/saved"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Heart className="h-4 w-4" /> Saved items
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Package className="h-4 w-4" /> My orders
                        </Link>

                        {/*
                          The back-office path is served from /auth/me/ as
                          `admin_url` and is null for anybody who is not staff.
                          It must never become a NEXT_PUBLIC_* variable — that
                          would ship the path to every anonymous visitor.
                        */}
                        {isBackOffice && user?.admin_url && (
                          <Link
                            href={user.admin_url}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 border-t border-gray-50 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <ShieldCheck className="h-4 w-4" /> Back office
                          </Link>
                        )}

                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-2 border-t border-gray-50 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <LogOut className="h-4 w-4" /> Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex min-h-11 items-center rounded-full bg-white/10 px-5 font-sans text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  Sign in
                </Link>
              )}
            </div>

            {/* Mobile */}
            <div className="flex items-center gap-2 md:hidden">
              <CartButton onClick={() => setCartOpen(true)} />
              <button
                type="button"
                onClick={() => setMobileOpen((open) => !open)}
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-white/10 bg-[#080f0a] md:hidden"
            >
              <div className="flex flex-col gap-1 px-4 py-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={hrefFor(link)}
                    onClick={() => setMobileOpen(false)}
                    className="flex min-h-11 items-center text-sm font-medium text-white/90"
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="mt-2 border-t border-white/10 pt-2">
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/profile"
                        onClick={() => setMobileOpen(false)}
                        className="flex min-h-11 items-center text-sm font-medium text-white/90"
                      >
                        My profile
                      </Link>
                      <Link
                        href="/saved"
                        onClick={() => setMobileOpen(false)}
                        className="flex min-h-11 items-center text-sm font-medium text-white/90"
                      >
                        Saved items
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setMobileOpen(false)}
                        className="flex min-h-11 items-center text-sm font-medium text-white/90"
                      >
                        My orders
                      </Link>
                      {isBackOffice && user?.admin_url && (
                        <Link
                          href={user.admin_url}
                          onClick={() => setMobileOpen(false)}
                          className="flex min-h-11 items-center text-sm font-medium text-white/90"
                        >
                          Back office
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setMobileOpen(false);
                          void logout();
                        }}
                        className="flex min-h-11 items-center text-sm font-medium text-white/90"
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex min-h-11 items-center text-sm font-semibold text-[#e8d5a3]"
                    >
                      Sign in
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
