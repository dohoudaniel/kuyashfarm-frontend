import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Stats } from "@/components/sections/Stats";
import { Mission } from "@/components/sections/Mission";
import { Services } from "@/components/sections/Services";
import { InventoryShowcase } from "@/components/sections/InventoryShowcase";
import { Collaboration } from "@/components/sections/Collaboration";
import { Blog } from "@/components/sections/Blog";
import { Goals } from "@/components/sections/Goals";

/**
 * Home Page - Betàni Farming Landing Page
 * Assembled with modular, reusable components following best practices
 */
export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Mission />
        <Services />
        <InventoryShowcase />
        <Collaboration />
        <Blog />
        <Goals />
      </main>
      <Footer />
    </>
  );
}
