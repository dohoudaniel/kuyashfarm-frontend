import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { STATS } from "@/lib/constants";

/**
 * Stats Section - Displays key metrics in a grid
 */
export function Stats() {
  return (
    <Section className="bg-white">
      <Container>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, index) => (
            <div
              key={index}
              className="group text-center transition-transform duration-300 hover:scale-105"
            >
              <div className="mb-2 font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#2d5f3f]">
                {stat.value}
              </div>
              <div className="font-sans text-sm sm:text-base text-gray-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
