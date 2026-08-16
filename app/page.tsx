/**
 * Landing page. Assembles the marketing sections; no business data.
 *
 * Two things were removed here rather than tidied.
 *
 * The file carried a header comment reading "Home Page - Betàni Farming
 * Landing Page / Assembled with modular, reusable components following best
 * practices" — another company's name, followed by filler. It was the
 * clearest single piece of evidence in the codebase that this page was
 * generated rather than designed.
 *
 * The `Blog` section listed three invented articles dated March 2024, every
 * one linking to `href="#"`, under the heading "Blog is a vibrant space where
 * farming meets innovation" and a subheading — "Experience beauty redefined by
 * effortless elegance in every application" — that was written for a
 * cosmetics product. There is no blog. Three dead links above the footer cost
 * more credibility than the section could ever earn back, so it is gone until
 * there is something real to put there.
 */

import { Hero } from "@/components/sections/Hero";
import { Stats } from "@/components/sections/Stats";
import { Mission } from "@/components/sections/Mission";
import { Services } from "@/components/sections/Services";
import { InventoryShowcase } from "@/components/sections/InventoryShowcase";
import { Collaboration } from "@/components/sections/Collaboration";
import { Goals } from "@/components/sections/Goals";
import { RecentlyViewed } from "@/components/shop/RecentlyViewed";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        {/* Renders nothing for a first-time visitor. */}
        <RecentlyViewed />
        <Stats />
        <Mission />
        <Services />
        <InventoryShowcase />
        <Collaboration />
        <Goals />
      </main>
    </>
  );
}
