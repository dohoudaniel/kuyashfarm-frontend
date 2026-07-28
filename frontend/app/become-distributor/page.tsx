import type { Metadata } from "next";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { ApplicationForm } from "@/components/applications/ApplicationForm";

export const metadata: Metadata = {
  title: "Become a distributor — Kuyash Integrated Farm",
  description:
    "Apply to distribute Kuyash Integrated Farm produce across Nigeria. Tiered pricing, territory allocation and direct farm supply.",
};

export default function BecomeDistributorPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f7f5f0] px-4 pt-28 pb-20">
        <Container>
          <ApplicationForm
            applicationType="DISTRIBUTOR"
            title="Become a distributor"
            intro="Distribute Kuyash produce across your territory at distributor pricing. Tell us about your business and the states you cover — we'll come back to you within two business days."
          />
        </Container>
      </main>
      <Footer />
    </>
  );
}
