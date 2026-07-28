import type { Metadata } from "next";
import { Suspense } from "react";

import ConfirmClient from "./ConfirmClient";

export const metadata: Metadata = {
  title: "Confirming your payment — Kuyash Integrated Farm",
  robots: { index: false, follow: false },
};

export default function ConfirmPage() {
  return (
    <Suspense>
      <ConfirmClient />
    </Suspense>
  );
}
