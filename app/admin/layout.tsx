/**
 * Back-office layout.
 *
 * `robots: noindex` on the whole section. The pages are behind a permission
 * check, but an indexed URL advertises the back office exists and where it
 * lives — the same reason `DJANGO_ADMIN_URL` was moved off its default path.
 */

import type { Metadata } from "next";

import { AdminGuard } from "./AdminGuard";
import { AdminShell } from "./AdminShell";

export const metadata: Metadata = {
  title: "Back office — Kuyash Integrated Farm",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminShell>{children}</AdminShell>
    </AdminGuard>
  );
}
