/**
 * One order.
 *
 * Guests reach this too, after checking out. They are identified by the
 * email held for the tab, because order numbers are guessable and the API
 * refuses to show an order without proof of ownership.
 */

import type { Metadata } from "next";
import OrderDetailClient from "./OrderDetailClient";

export const metadata: Metadata = {
  title: "Order",
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
