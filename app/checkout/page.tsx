/**
 * Route entry point. A Server Component: it owns `metadata` and any data
 * fetching, and hands interactivity to the sibling client component.
 *
 * Totals come from the server quote; this page never adds a basket up.
 */

import type { Metadata } from "next";

import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout — Kuyash Integrated Farm",
  description: "Complete your order from Kuyash Integrated Farm.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
