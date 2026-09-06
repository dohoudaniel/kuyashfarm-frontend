/**
 * Apply for wholesale pricing.
 *
 * Requires an account: approval writes `account_type` to a user row, and an
 * anonymous application has nobody to approve.
 */

import type { Metadata } from "next";

import { Container } from "@/components/ui/Container";
import { ApplicationForm } from "@/components/applications/ApplicationForm";

export const metadata: Metadata = {
  title: "Apply for wholesale pricing",
  description:
    "Buy from Kuyash Farms at wholesale rates. Apply with your business details and start ordering at bulk pricing.",
};

export default function BecomeWholesalerPage() {
  return (
    <>
      <main className="min-h-screen bg-cream px-4 pt-28 pb-20">
        <Container>
          <ApplicationForm
            applicationType="WHOLESALE"
            title="Apply for wholesale pricing"
            intro="Buying in bulk for a shop, restaurant or hotel? Wholesale approval unlocks bulk pricing on every order. Tell us about your business below."
          />
        </Container>
      </main>
    </>
  );
}
