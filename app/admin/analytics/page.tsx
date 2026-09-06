import type { Metadata } from "next";

import AnalyticsClient from "./AnalyticsClient";

export const metadata: Metadata = {
  title: "Analytics",
  robots: { index: false, follow: false },
};

export default function AdminAnalyticsPage() {
  return <AnalyticsClient />;
}
