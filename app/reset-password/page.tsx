import type { Metadata } from "next";
import { Suspense } from "react";

import ResetPasswordClient from "./ResetPasswordClient";

export const metadata: Metadata = {
  title: "Choose a new password — Kuyash Integrated Farm",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordClient />
    </Suspense>
  );
}
