/**
 * Programme listing.
 */

import type { Metadata } from "next";
import { ProgramsClient } from "./ProgramsClient";

export const metadata: Metadata = {
  title: "Course Catalog | Kuyash Farm Academy",
  description:
    "Browse 20 NABTEB-certified agricultural programs — from precision farming and aquaculture to agribusiness and sustainable agriculture. Find the right program for your career.",
};

export default function ProgramsPage() {
  return (
    <>
      <ProgramsClient />
    </>
  );
}
