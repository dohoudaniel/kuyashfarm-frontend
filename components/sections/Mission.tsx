/**
 * Mission statement with supporting imagery.
 */

import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Mission Section - Two-column layout with text and image
 */
export function Mission() {
  return (
    <Section id="about" className="bg-cream">
      <Container>
        <Reveal className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Text Content */}
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-bold leading-tight text-primary md:text-4xl lg:text-5xl">
              About Kuyash Farms
            </h2>
            <div className="space-y-4 font-sans text-base leading-relaxed text-gray-700 md:text-lg">
              <p>
                Kuyash Farms is a leading, innovative integrated farm dedicated to producing premium-quality food crops and livestock through sustainable agricultural practices. Our approach combines modern technology with the principles of environmental stewardship to ensure long-term food security and ecosystem balance.
              </p>
              <p>
                At Kuyash Farms, we operate a fully integrated farming system that includes poultry production, cattle and sheep rearing, fish farming, vegetable cultivation, oil palm plantations, and food processing. By connecting every aspect of agriculture — from crop production to livestock management — we maximize efficiency, reduce waste, and deliver fresh, high-quality products to our customers.
              </p>
              <p className="italic text-gray-600">
                &ldquo;Driven by innovation and sustainability, Kuyash Farms is shaping the future of agribusiness — one harvest at a time.&rdquo;
              </p>
            </div>
          </div>

          {/* Image */}
          <div className="relative h-[400px] overflow-hidden rounded-lg shadow-xl lg:h-[500px]">
            <Image
              src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=2070"
              alt="Agricultural landscape"
              sizes="(max-width: 1024px) 100vw, 50vw"
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
