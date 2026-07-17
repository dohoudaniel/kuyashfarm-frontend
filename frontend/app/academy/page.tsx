import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AcademyHero } from "./sections/AcademyHero";
import { AcademyStats } from "./sections/AcademyStats";
import { WhyAcademy } from "./sections/WhyAcademy";
import { AcademyPrograms } from "./sections/AcademyPrograms";
import { UpcomingClasses } from "./sections/UpcomingClasses";
import { LearningExperience } from "./sections/LearningExperience";
import { AcademyMethodology } from "./sections/AcademyMethodology";
import { AcademyInstructors } from "./sections/AcademyInstructors";
import { AcademyTestimonials } from "./sections/AcademyTestimonials";
import { AcademyPartners } from "./sections/AcademyPartners";
import { AcademyFAQ } from "./sections/AcademyFAQ";
import { AcademyNewsletter } from "./sections/AcademyNewsletter";

export const metadata: Metadata = {
  title: "Kuyash Farm Academy — Africa's Premier Agricultural Innovation Hub",
  description:
    "Practical, technology-driven agricultural education. Train on a real 40-acre farm with Nigeria's leading practitioners. NABTEB certified programs in crop production, livestock, aquaculture, agribusiness, precision agriculture, and more.",
  openGraph: {
    title: "Kuyash Farm Academy",
    description:
      "Building Africa's next generation of agricultural innovators. Hands-on training, smart farming tech, NABTEB certification, and career placement.",
    images: [{ url: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1200" }],
  },
};

export default function AcademyPage() {
  return (
    <>
      <Navbar />
      <main>
        <AcademyHero />
        <AcademyStats />
        <WhyAcademy />
        <AcademyPrograms />
        <UpcomingClasses />
        <LearningExperience />
        <AcademyMethodology />
        <AcademyInstructors />
        <AcademyTestimonials />
        <AcademyPartners />
        <AcademyFAQ />
        <AcademyNewsletter />
      </main>
      <Footer />
    </>
  );
}
