/**
 * The driver's round.
 *
 * Outside `/admin` on purpose: a driver is not staff, and the back-office
 * guard would turn them away. `noindex` for the same reason as the back
 * office — it is behind a permission check, but an indexed URL advertises it.
 */

import type { Metadata } from "next";

import DriverClient from "./DriverClient";

export const metadata: Metadata = {
  title: "My round — Kuyash Integrated Farm",
  robots: { index: false, follow: false },
};

export default function DriverPage() {
  return <DriverClient />;
}
