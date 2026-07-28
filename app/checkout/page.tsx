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
