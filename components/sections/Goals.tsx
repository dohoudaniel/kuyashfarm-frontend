/**
 * Sustainability goals and progress.
 */

import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { GOALS } from "@/lib/constants";

/**
 * Goals Section - Black and white layout with metrics
 */
export function Goals() {
  return (
    <Section className="bg-gradient-to-br from-gray-50 to-white">
      <Container>
        {/* Section Title */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-serif text-4xl font-bold text-primary md:text-5xl">
            Our Goals
          </h2>
          <p className="mx-auto max-w-2xl font-sans text-lg text-gray-600">
            We&apos;re making a measurable impact on sustainable farming worldwide
          </p>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {GOALS.map((goal) => (
            <div
              key={goal.id}
              className="group text-center transition-transform duration-300 hover:scale-105"
            >
              {/* Icon Circle */}
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all duration-300 group-hover:bg-secondary group-hover:shadow-xl">
                <span className="font-serif text-2xl font-bold">{goal.id}</span>
              </div>

              {/* Metric Value */}
              <div className="mb-4 font-serif text-5xl font-bold text-primary md:text-6xl">
                {goal.value}
              </div>

              {/* Description */}
              <p className="font-sans text-sm leading-relaxed text-gray-600 md:text-base">
                {goal.label}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Stats */}
        <div className="mt-20 rounded-2xl bg-gradient-to-r from-primary to-secondary p-8 text-white shadow-2xl md:p-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 font-serif text-3xl font-bold md:text-4xl">
                50+
              </div>
              <div className="font-sans text-sm text-white/90">
                Countries Reached
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 font-serif text-3xl font-bold md:text-4xl">
                1M+
              </div>
              <div className="font-sans text-sm text-white/90">
                Hectares Improved
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 font-serif text-3xl font-bold md:text-4xl">
                85%
              </div>
              <div className="font-sans text-sm text-white/90">
                Efficiency Increase
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 font-serif text-3xl font-bold md:text-4xl">
                24/7
              </div>
              <div className="font-sans text-sm text-white/90">
                Support Available
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
