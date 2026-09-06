/**
 * Leave the mailing list, from a link in any newsletter email.
 */

import type { Metadata } from "next";
import { Suspense } from "react";

import NewsletterUnsubscribeClient from "./NewsletterUnsubscribeClient";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

export default function NewsletterUnsubscribePage() {
  return (
    <Suspense>
      <NewsletterUnsubscribeClient />
    </Suspense>
  );
}
