import type { Metadata } from "next";
import { DashboardClient } from "./DashboardClient";

export const metadata: Metadata = {
  title: "Student Dashboard | Kuyash Farm Academy",
  description: "Manage your enrollments, upcoming classes, certificates, and payments.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
