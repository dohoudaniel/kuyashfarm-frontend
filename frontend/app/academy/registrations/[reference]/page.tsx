import type { Metadata } from "next";

import RegistrationClient from "./RegistrationClient";

export const metadata: Metadata = {
  title: "Your booking — Kuyash Academy",
  robots: { index: false, follow: false },
};

export default async function RegistrationPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  return <RegistrationClient reference={reference} />;
}
