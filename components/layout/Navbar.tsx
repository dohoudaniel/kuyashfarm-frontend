"use client";

/**
 * Navigation.
 *
 * Rewritten. The previous version read identity from `localStorage`, opened a
 * modal that fabricated a session without contacting the server, and "signed
 * out" by deleting a localStorage key while leaving the JWT valid (audit
 * §3.1). Sign-in now goes to the real `/login` route and the session comes
 * from `useAuth()`.
 *
 * Nav links that point at homepage anchors are rendered as links back to the
 * homepage when we are not on it — previously they were dead on every other
 * page.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Package, Settings, ShieldCheck, User as UserIcon } from "lucide-react";

import CartButton from "@/components/cart/CartButton";
import CartDrawer from "@/components/cart/CartDrawer";
import { NAV_LINKS, SITE_CONFIG } from "@/lib/constants";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useAuth } from "@/lib/context/AuthContext";
import { useCartStore } from "@/lib/store/useCartStore";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { user, isAuthenticated, isBackOffice, logout } = useAuth();
  const resetCart = useCartStore((state) => state.reset);
  const loadCart = useCartStore((state) => state.load);
  const router = useRouter();
  const pathname = usePathname();
  const onHomepage = pathname === "/";

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The cart follows the session: a signed-in user has a server cart keyed to
  // their account, an anonymous visitor one keyed to their session id.
  useEffect(() => {
    void loadCart();
  }, [isAuthenticated, loadCart]);

  async function handleSignOut() {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    await logout();
    resetCart();
    router.push("/");
    router.refresh();
  }

  /** Anchor links only work on the homepage; elsewhere send people back to it. */
  const hrefFor = (link: { label: string; href: string }) => {
    if (link.label === "Home") return "/";
    if (link.href.startsWith("#")) return onHomepage ? link.href : `/${link.href}`;
    return link.href;
  };

  return (
    <>
      <nav
        className={cn(
          "fixed left-0 right-0 top-0 z-40 transition-all duration-300",
          isScrolled ? "bg-primary/95 shadow-md backdrop-blur-md" : "bg-primary",
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex min-h-11 items-center font-serif text-2xl font-bold tracking-tight text-white">
              {SITE_CONFIG.name}
            </Link>

            <div className="hidden md:flex md:items-center md:space-x-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={hrefFor(link)}
                  className={cn(
                    "inline-flex min-h-11 min-w-11 items-center justify-center px-1 font-sans text-sm font-medium transition-colors duration-200",
                    link.label === "Academy"
                      ? "rounded-full bg-wheat px-4 py-2 font-semibold text-primary-dark hover:bg-wheat"
                      : "text-white/90 hover:text-white",
                  )}
                >
                  {link.label}
                </Link>
              ))}

              <CartButton onClick={() => setIsCartOpen(true)} />
              {/* Renders nothing when signed out. Customers get order and
                  academy notifications here; staff get the operational ones
                  in the back office. */}
              <NotificationBell />

              {isAuthenticated ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen((open) => !open)}
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="menu"
                    className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30"
                  >
                    <UserIcon className="h-4 w-4" />
                    <span>{user?.full_name?.split(" ")[0] || "Account"}</span>
                  </button>

                  {isUserMenuOpen && (
                    <div role="menu" className="absolute right-0 z-50 mt-2 w-60 rounded-lg bg-white py-2 shadow-lg">
                      <div className="border-b px-4 pb-2">
                        <p className="truncate text-sm font-medium text-gray-900">{user?.email}</p>
                        {user?.gets_bulk_pricing && (
                          <p className="text-xs font-medium text-green-700">
                            Wholesale pricing active
                          </p>
                        )}
                        {!user?.is_email_verified && (
                          <p className="text-xs text-amber-600">Email not verified</p>
                        )}
                      </div>

                      <Link href="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100">
                        <UserIcon className="h-4 w-4" /> My profile
                      </Link>
                      <Link href="/orders" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100">
                        <Package className="h-4 w-4" /> My orders
                      </Link>
                      <Link href="/profile?tab=settings" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100">
                        <Settings className="h-4 w-4" /> Settings
                      </Link>

                      {/* Shown only when the server says so. Hiding this link is
                          presentation; the API refuses regardless. */}
                      {isBackOffice && user?.admin_url && (
                        <a
                          href={user.admin_url}
                          className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-green-50"
                        >
                          <ShieldCheck className="h-4 w-4" /> Back office
                        </a>
                      )}

                      <hr className="my-2" />
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="rounded-full bg-white/20 px-6 py-2 font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30"
                >
                  Sign in
                </Link>
              )}
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <CartButton onClick={() => setIsCartOpen(true)} />
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((open) => !open)}
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-md p-3 text-white"
              >
                <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="border-t border-white/20 bg-primary py-4 md:hidden">
              <div className="flex flex-col space-y-4">
                {NAV_LINKS.map((link) => (
                  <Link key={link.label} href={hrefFor(link)} onClick={() => setIsMobileMenuOpen(false)} className="font-sans text-sm font-medium text-white/90 hover:text-white">
                    {link.label}
                  </Link>
                ))}

                {isAuthenticated ? (
                  <>
                    <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-white/90">My profile</Link>
                    <Link href="/orders" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-white/90">My orders</Link>
                    <button type="button" onClick={handleSignOut} className="text-left text-sm font-medium text-red-300">
                      Sign out
                    </button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full rounded-full bg-white/20 px-6 py-2 text-center font-medium text-white">
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

export default Navbar;
