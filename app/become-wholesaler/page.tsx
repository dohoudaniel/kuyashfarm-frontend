import type { Metadata } from "next";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { ApplicationForm } from "@/components/applications/ApplicationForm";

export const metadata: Metadata = {
  title: "Apply for wholesale pricing — Kuyash Integrated Farm",
  description:
    "Buy from Kuyash Integrated Farm at wholesale rates. Apply with your business details and start ordering at bulk pricing.",
};

export default function BecomeWholesalerPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f7f5f0] px-4 pt-28 pb-20">
        <Container>
          <ApplicationForm
            applicationType="WHOLESALE"
            title="Apply for wholesale pricing"
            intro="Buying in bulk for a shop, restaurant or hotel? Wholesale approval unlocks bulk pricing on every order. Tell us about your business below."
          />
        </Container>
      </main>
      <Footer />
    </>
  );
}
