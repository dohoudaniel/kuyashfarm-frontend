/**
 * Headline farm statistics. Marketing copy from `lib/data`, not live figures —
 * business metrics belong to the staff analytics endpoints.
 */

import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { STATS } from "@/lib/constants";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Stats Section - Displays key metrics in a grid
 */
export function Stats() {
  return (
    <Section className="bg-white">
      <Container>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, index) => (
            // Staggered by index so the row reads left to right rather than
            // arriving as one block. 60ms apart: ordered, not slow.
            <Reveal
              key={index}
              delay={index * 0.06}
              className="group text-center transition-transform duration-300 hover:scale-105"
            >
              <div className="mb-2 font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-primary">
                {stat.value}
              </div>
              <div className="font-sans text-sm sm:text-base text-gray-600">
                {stat.label}
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
