/**
 * Request a password reset link.
 */

import type { Metadata } from "next";

import ForgotPasswordClient from "./ForgotPasswordClient";

export const metadata: Metadata = {
  title: "Reset your password",
  description: "Request a link to reset your Kuyash Farms password.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
