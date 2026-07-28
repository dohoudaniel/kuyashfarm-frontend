import type { Metadata } from "next";
import OrdersClient from "./OrdersClient";

export const metadata: Metadata = {
  title: "My orders — Kuyash Integrated Farm",
  robots: { index: false, follow: false },
};

export default function OrdersPage() {
  return <OrdersClient />;
}
