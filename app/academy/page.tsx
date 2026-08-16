/**
 * Academy landing page.
 *
 * The class schedule is fetched here and passed down, so the sections stay
 * presentational and the page keeps a single source for it.
 */

import type { Metadata } from "next";

import {
  fetchClassesPublic,
  fetchInstructorsPublic,
  fetchProgramsPublic,
} from "@/lib/api/academy";
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
  title: {
    // `absolute` opts out of the root layout's "%s — Kuyash Farms"
    // template. Without it this reads "…Innovation Hub — Kuyash Farms", which
    // says the parent brand twice in one line.
    absolute: "Kuyash Farms Academy — Africa's Premier Agricultural Innovation Hub",
  },
  description:
    "Practical, technology-driven agricultural education. Train on a real 40-acre farm with Nigeria's leading practitioners. NABTEB certified programs in crop production, livestock, aquaculture, agribusiness, precision agriculture, and more.",
  openGraph: {
    title: "Kuyash Farms Academy",
    description:
      "Building Africa's next generation of agricultural innovators. Hands-on training, smart farming tech, NABTEB certification, and career placement.",
    images: [{ url: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1200" }],
  },
};

export default async function AcademyPage() {
  // Classes come from the API. If it is unreachable the page still renders —
  // the schedule section shows an honest empty state rather than crashing the
  // whole academy landing page, which is what SSR against a hardcoded array
  // hid until now.
  // Both in parallel: two sequential round-trips would double the time to
  // first byte for a page that is mostly static marketing either side of them.
  const [classes, instructors, programs] = await Promise.all([
    fetchClassesPublic().then(
      (list) => list,
      () => [],
    ),
    fetchInstructorsPublic().then(
      (list) => list,
      // The faculty section renders nothing when empty, so a failure here
      // costs one section rather than the page.
      () => [],
    ),
    // Programmes come from the API now. They used to be read from a hardcoded
    // array in `lib/data/academy.ts`, so anything staff created in the back
    // office was saved, listed in the admin, and never shown to a customer.
    fetchProgramsPublic().then(
      (list) => list,
      () => [],
    ),
  ]);

  return (
    <>
      <main>
        <AcademyHero />
        <AcademyStats />
        <WhyAcademy />
        <AcademyPrograms programs={programs} />
        <UpcomingClasses classes={classes} />
        <LearningExperience />
        <AcademyMethodology />
        <AcademyInstructors instructors={instructors} />
        <AcademyTestimonials />
        <AcademyPartners />
        <AcademyFAQ />
        <AcademyNewsletter />
      </main>
    </>
  );
}
