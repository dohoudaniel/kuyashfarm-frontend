import type { Metadata } from "next";

import { SavedClient } from "./SavedClient";

export const metadata: Metadata = {
  title: "Saved items",
  description: "Products you have saved for later at Kuyash Farms.",
  // Personal, and behind authentication. Nothing here should be indexed.
  robots: { index: false, follow: false },
};

export default function SavedPage() {
  return <SavedClient />;
}
