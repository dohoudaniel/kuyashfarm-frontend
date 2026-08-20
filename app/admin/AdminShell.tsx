"use client";

/**
 * The back-office frame: navigation, identity, and the sign-out.
 *
 * Deliberately not the storefront `Navbar` and `Footer`. The two audiences
 * want opposite things — a customer wants the shop, a warehouse hand wants the
 * order queue — and sharing the chrome means every change to one has to be
 * checked against the other. It also keeps the back office visually distinct,
 * so nobody edits live stock believing they are browsing.
 */

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  GraduationCap,
  Image as ImageIcon,
  LogOut,
  Mail,
  Package,
  PenLine,
  SlidersHorizontal,
  Truck,
  Users,
} from "lucide-react";

import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useAuth } from "@/lib/context/AuthContext";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Package;
  /** Administrator-only, mirroring what the API enforces. */
  adminOnly?: boolean;
}

const NAV: NavItem[] = [
  { href: "/admin", label: "Overview", icon: BarChart3 },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/products", label: "Products & photos", icon: ImageIcon },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/delivery", label: "Delivery", icon: Truck },
  { href: "/admin/applications", label: "Applications", icon: Package },
  { href: "/admin/academy", label: "Academy", icon: GraduationCap },
  { href: "/admin/blog", label: "Blog", icon: PenLine },
  { href: "/admin/subscribers", label: "Newsletter", icon: Mail },
  { href: "/admin/staff", label: "Staff", icon: Users, adminOnly: true },
  { href: "/admin/settings", label: "Settings", icon: SlidersHorizontal, adminOnly: true },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isAdministrator = user?.role === "ADMIN";
  // Hiding a link the API would refuse anyway. Not a control — see AdminGuard.
  const items = NAV.filter((item) => !item.adminOnly || isAdministrator);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-primary-dark">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 2xl:max-w-[1720px]">
          <Link href="/admin" className="font-serif text-lg font-bold text-white">
            Kuyash Farms{" "}
            <span className="font-sans text-xs font-normal text-white/60">back office</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-white/70 sm:inline">
              {user?.full_name || user?.email}
              <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs">
                {user?.role === "ADMIN" ? "Administrator" : "Staff"}
              </span>
            </span>
            {/* Where the low-stock warnings, new-application alerts and
                failed-delivery notices actually surface. Until this existed
                they were written to a table only Django Admin could read —
                and Django Admin is off in production. */}
            <NotificationBell />
            {/* Back to the shop, because staff are customers too and the
                alternative is retyping the URL. */}
            <Link href="/" className="text-sm text-white/70 hover:text-white">
              View shop
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 2xl:max-w-[1720px] 2xl:gap-8">
        <nav className="hidden w-56 shrink-0 lg:block" aria-label="Back office">
          <ul className="space-y-1">
            {items.map((item) => {
              // `startsWith` for sections, exact for the overview — otherwise
              // "Overview" stays highlighted on every page under /admin.
              const active =
                item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-white font-semibold text-primary-dark shadow-sm"
                        : "text-gray-600 hover:bg-white/60 hover:text-gray-900",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Scrolls horizontally on its own rather than pushing the page wide:
            these screens hold tables that are genuinely wider than a phone. */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {/* The same nav as a bottom bar on small screens, because the warehouse
          runs this on a phone. */}
      <nav
        aria-label="Back office"
        className="sticky bottom-0 z-40 flex overflow-x-auto border-t border-gray-200 bg-white lg:hidden"
      >
        {items.map((item) => {
          const active =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-w-[5rem] flex-col items-center gap-1 px-3 py-2 text-[11px]",
                active ? "font-semibold text-primary-dark" : "text-gray-500",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label.split(" ")[0]}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
