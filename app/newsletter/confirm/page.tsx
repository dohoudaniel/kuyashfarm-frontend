/**
 * Complete a newsletter subscription from an emailed link.
 */

import type { Metadata } from "next";
import { Suspense } from "react";

import NewsletterConfirmClient from "./NewsletterConfirmClient";

export const metadata: Metadata = {
  title: "Confirm your subscription — Kuyash Integrated Farm",
  // The URL carries a signed token. Keeping it out of an index is the same
  // reason the reset-password page does.
  robots: { index: false, follow: false },
};

export default function NewsletterConfirmPage() {
  return (
    <Suspense>
      <NewsletterConfirmClient />
    </Suspense>
  );
}
