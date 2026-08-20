/**
 * Section components — barrel export for cleaner imports.
 *
 * The homepage imports these directly rather than through the barrel, because
 * a barrel that re-exports a dozen client components pulls all of them into
 * any module that touches one. Kept for the few places that use it.
 */
export { Hero } from "./Hero";
export { HeroStatsBar } from "./HeroStatsBar";
export { IdentityStrip } from "./IdentityStrip";
export { OriginStory } from "./OriginStory";
export { ProcessStrip } from "./ProcessStrip";
export { FiveSides } from "./FiveSides";
export { KuyashModel } from "./KuyashModel";
export { PeopleSection } from "./PeopleSection";
export { GrowingWithOthers } from "./GrowingWithOthers";
export { ImpactNumbers } from "./ImpactNumbers";
export { ThereIsMoreToGrow } from "./ThereIsMoreToGrow";
export { VisitFarm } from "./VisitFarm";
