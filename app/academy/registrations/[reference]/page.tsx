/**
 * A booking receipt.
 *
 * The backend emails this URL. A guest arriving days later on another device
 * is asked for the email the booking was made with, because references are
 * guessable.
 */

import type { Metadata } from "next";

import RegistrationClient from "./RegistrationClient";

export const metadata: Metadata = {
  title: { absolute: "Your booking — Kuyash Farms Academy" },
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
