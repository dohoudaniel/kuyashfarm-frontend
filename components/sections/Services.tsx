import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SERVICES } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";

/**
 * Services Section - Grid layout with proper responsive design and hover effects
 */
export function Services() {
  const serviceImages = [
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070",
    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=2070",
    "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=2069",
    "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=2070",
  ];

  return (
    <Section id="services" className="bg-white">
      <Container>
        {/* Section Header */}
        <div className="mb-16 max-w-3xl">
          <p className="mb-4 font-sans text-xs uppercase tracking-wider text-gray-500">
            Our Services for a Greener Future
          </p>
          <h2 className="font-serif text-2xl font-bold leading-tight text-[#2d5f3f] md:text-3xl lg:text-4xl">
            Empowering communities through
            <br />
            sustainable agriculture and innovation.
          </h2>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, index) => (
            <Link
              key={service.id}
              href={`/services/${service.slug}`}
              className="group relative overflow-hidden rounded-lg bg-white shadow-md transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer"
            >
              {/* Background Image */}
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={serviceImages[index % serviceImages.length]}
                  alt={service.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-opacity duration-500 group-hover:from-black/80" />
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="mb-2 font-serif text-2xl font-bold transition-transform duration-300 group-hover:translate-y-[-4px]">
                  {service.title}
                </h3>
                <p className="font-sans text-sm leading-relaxed text-white/90 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {service.description}
                </p>
              </div>

              {/* Accent Border on Hover */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-[#6b9d7a] transition-all duration-500 group-hover:w-full" />
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}
