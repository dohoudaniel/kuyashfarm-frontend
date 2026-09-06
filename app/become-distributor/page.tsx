/**
 * Apply to become a distributor.
 *
 * The form asks for coverage but not for a tier — that is computed by the
 * server on approval — and asks for no bank details at all, which the
 * version this replaced collected into `localStorage`.
 */

import type { Metadata } from "next";

import { Container } from "@/components/ui/Container";
import { ApplicationForm } from "@/components/applications/ApplicationForm";

export const metadata: Metadata = {
  title: "Become a distributor",
  description:
    "Apply to distribute Kuyash Farms produce across Nigeria. Tiered pricing, territory allocation and direct farm supply.",
};

export default function BecomeDistributorPage() {
  return (
    <>
      <main className="min-h-screen bg-cream px-4 pt-28 pb-20">
        <Container>
          <ApplicationForm
            applicationType="DISTRIBUTOR"
            title="Become a distributor"
            intro="Distribute Kuyash produce across your territory at distributor pricing. Tell us about your business and the states you cover — we'll come back to you within two business days."
          />
        </Container>
      </main>
    </>
  );
}
