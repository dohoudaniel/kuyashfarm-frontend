/**
 * Landing page.
 *
 * The section order is the frontend redesign's, and the ordering is the point:
 * it tells a story rather than listing features. Who we are, what we stand
 * for, where we started, how we work, what we grow, how it connects, the
 * people, our partners, our impact, what is new, come and visit. The previous
 * arrangement — hero, stats, mission, services, showcase, collaboration,
 * goals — was a list of headings with no argument running through it.
 *
 * `Navbar` and `Footer` are deliberately absent: they live in the root layout
 * via `SiteChrome`, because a header mounted inside a page remounts on every
 * client-side navigation and re-fetches the cart each time.
 *
 * `RecentlyViewed` is ours and renders nothing for a first-time visitor. It
 * sits directly under the hero so a returning customer meets what they were
 * last looking at before the marketing narrative starts — for them the story
 * is already told, and the shop is what they came back for.
 */

import { Hero } from "@/components/sections/Hero";
import { HeroStatsBar } from "@/components/sections/HeroStatsBar";
import { IdentityStrip } from "@/components/sections/IdentityStrip";
import { OriginStory } from "@/components/sections/OriginStory";
import { ProcessStrip } from "@/components/sections/ProcessStrip";
import { FiveSides } from "@/components/sections/FiveSides";
import { KuyashModel } from "@/components/sections/KuyashModel";
import { PeopleSection } from "@/components/sections/PeopleSection";
import { GrowingWithOthers } from "@/components/sections/GrowingWithOthers";
import { ImpactNumbers } from "@/components/sections/ImpactNumbers";
import { ThereIsMoreToGrow } from "@/components/sections/ThereIsMoreToGrow";
import { VisitFarm } from "@/components/sections/VisitFarm";
import { RecentlyViewed } from "@/components/shop/RecentlyViewed";

export default function Home() {
  return (
    <main>
      {/* 1. Who we are */}
      <Hero />
      <HeroStatsBar />

      {/* Returning customers first: renders nothing for anybody else. */}
      <RecentlyViewed />

      {/* 2. Instant identity */}
      <IdentityStrip />
      {/* 3. Where we started */}
      <OriginStory />
      {/* 4. How we work */}
      <ProcessStrip />
      {/* 5. What we grow */}
      <FiveSides />
      {/* 6. How it all connects */}
      <KuyashModel />
      {/* 7. The people */}
      <PeopleSection />
      {/* 8. Growing with others */}
      <GrowingWithOthers />
      {/* 9. Our impact */}
      <ImpactNumbers />
      {/* 10. Stay current */}
      <ThereIsMoreToGrow />
      {/* 11. Come and visit */}
      <VisitFarm />
    </main>
  );
}
