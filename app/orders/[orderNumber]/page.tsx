import type { Metadata } from "next";
import OrderDetailClient from "./OrderDetailClient";

export const metadata: Metadata = {
  title: "Order — Kuyash Integrated Farm",
  robots: { index: false, follow: false },
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  return <OrderDetailClient orderNumber={orderNumber} />;
}
