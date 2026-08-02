/**
 * Request a password reset link.
 */

import type { Metadata } from "next";

import ForgotPasswordClient from "./ForgotPasswordClient";

export const metadata: Metadata = {
  title: "Reset your password — Kuyash Integrated Farm",
  description: "Request a link to reset your Kuyash Integrated Farm password.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
