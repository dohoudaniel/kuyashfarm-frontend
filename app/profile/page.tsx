/**
 * Account: profile, addresses, applications and academy bookings.
 */

import type { Metadata } from "next";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = {
  title: "My account — Kuyash Integrated Farm",
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return <ProfileClient />;
}
