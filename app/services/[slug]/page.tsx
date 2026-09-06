"use client";

/**
 * One service, from static marketing copy.
 */
import { use, useState } from "react";
import { BeforeAfterSlider } from "@/components/ui/BeforeAfterSlider";
import { SERVICES } from "@/lib/constants";
import { SERVICE_CONTENT } from "@/lib/data/services";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Leaf,
  TrendingUp,
  PlayCircle,
} from "lucide-react";
import { notFound } from "next/navigation";

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export default function ServicePage({ params }: ServicePageProps) {
  const { slug } = use(params);
  const [showVideo, setShowVideo] = useState(false);

  const service = SERVICES.find((s) => s.slug === slug);
  const content = SERVICE_CONTENT[slug];

  if (!service || !content) notFound();

  return (
    <>
      <main className="min-h-screen bg-white pt-20">

        {/* Hero */}
        <section className="relative h-[70vh] min-h-[600px] overflow-hidden">
          {showVideo && content.heroVideo ? (
            <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover">
              <source src={content.heroVideo} type="video/mp4" />
            </video>
          ) : (
            <Image
              src={content.heroImage}
              alt={service.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent" />

          <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
            <Link
              href="/#services"
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 font-sans text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Services
            </Link>

            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/20 px-4 py-2 backdrop-blur-sm">
              <Leaf className="h-4 w-4 text-accent" />
              <span className="font-sans text-sm font-medium text-white">100% Organic Certified</span>
            </div>

            <h1 className="max-w-4xl font-serif text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
              {service.title}
            </h1>
            <p className="mt-6 max-w-2xl font-sans text-lg leading-relaxed text-white/90 md:text-xl">
              {service.description}
            </p>

            {content.heroVideo && (
              <button
                onClick={() => setShowVideo(!showVideo)}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 font-sans text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                <PlayCircle className="h-5 w-5" />
                {showVideo ? "View Photo" : "Watch Video"}
              </button>
            )}
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="flex flex-col items-center gap-2 text-white/60">
              <span className="font-sans text-xs uppercase tracking-wider">Scroll to Explore</span>
              <ArrowLeft className="h-5 w-5 rotate-[-90deg]" />
            </div>
          </div>
        </section>

        {/* Overview */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl 2xl:max-w-[1536px] px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <div className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1">
                  <span className="font-sans text-sm font-semibold uppercase tracking-wide text-primary">
                    Our Approach
                  </span>
                </div>
                <h2 className="mb-6 font-serif text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
                  Sustainable Innovation Meets Traditional Wisdom
                </h2>
                <p className="mb-8 font-sans text-lg leading-relaxed text-gray-600">{content.overview}</p>
                <Link
                  href={content.shopHref}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-sans text-base font-semibold text-white transition-all hover:bg-secondary hover:gap-3"
                >
                  Browse Products
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/20 to-accent/20 blur-2xl" />
                <div className="relative aspect-square overflow-hidden rounded-3xl shadow-2xl">
                  <Image
                    src={content.heroImage}
                    alt="Farm overview"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-gradient-to-br from-primary to-secondary py-20">
          <div className="mx-auto max-w-7xl 2xl:max-w-[1536px] px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-4 font-serif text-3xl font-bold text-white md:text-4xl">Impact by the Numbers</h2>
              <p className="font-sans text-lg text-white/80">Measurable results from our innovative farming practices</p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 2xl:gap-10">
              {content.stats.map((stat, i) => (
                <div key={i} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm transition-all hover:bg-white/10">
                  <div className="mb-3 font-serif text-5xl font-bold text-white md:text-6xl">{stat.value}</div>
                  <div className="mb-2 font-sans text-base font-semibold text-white">{stat.label}</div>
                  {stat.description && <div className="font-sans text-sm text-white/70">{stat.description}</div>}
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Farming Process */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl 2xl:max-w-[1536px] px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <div className="mb-4 inline-block rounded-full bg-accent/10 px-4 py-1">
                <span className="font-sans text-sm font-semibold uppercase tracking-wide text-primary">
                  Seed to Harvest
                </span>
              </div>
              <h2 className="mb-6 font-serif text-4xl font-bold text-gray-900 md:text-5xl">Our Farming Process</h2>
              <p className="mx-auto max-w-2xl font-sans text-lg text-gray-600">
                A meticulous journey from soil preparation to harvest, combining innovation with sustainable practices
              </p>
            </div>

            <div className="relative">
              <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-linear-to-b from-primary via-accent to-primary md:left-1/2" />
              <div className="space-y-12">
                {content.farmingProcess.map((phase, i) => {
                  const Icon = phase.icon;
                  const isEven = i % 2 === 0;
                  return (
                    <div key={i} className={`relative flex flex-col items-center gap-8 md:flex-row ${isEven ? "" : "md:flex-row-reverse"}`}>
                      <div className={`w-full md:w-5/12 ${isEven ? "md:text-right" : "md:text-left"}`}>
                        <div className="group rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition-all hover:border-accent hover:shadow-xl">
                          <div className={`mb-4 flex items-center gap-3 ${isEven ? "md:flex-row-reverse md:justify-start" : "md:justify-start"}`}>
                            <span className="font-serif text-5xl font-bold text-primary/20">{phase.phase}</span>
                            <div className="h-px flex-1 bg-linear-to-r from-primary/20 to-transparent" />
                          </div>
                          <h3 className="mb-3 font-serif text-2xl font-bold text-gray-900">{phase.title}</h3>
                          <p className="mb-4 font-sans text-base leading-relaxed text-gray-600">{phase.description}</p>
                          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--light-gray)] px-4 py-2">
                            <span className="font-sans text-sm font-medium text-gray-700">Duration: {phase.duration}</span>
                          </div>
                        </div>
                      </div>
                      <div className="absolute left-8 z-10 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-linear-to-br from-primary to-accent shadow-xl md:left-1/2">
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <div className="hidden w-5/12 md:block" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Technology */}
        <section className="bg-cream py-24">
          <div className="mx-auto max-w-7xl 2xl:max-w-[1536px] px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <div className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1">
                <span className="font-sans text-sm font-semibold uppercase tracking-wide text-primary">Innovation</span>
              </div>
              <h2 className="mb-6 font-serif text-4xl font-bold text-gray-900 md:text-5xl">Technology Driving Excellence</h2>
              <p className="mx-auto max-w-2xl font-sans text-lg text-gray-600">
                Advanced agricultural technology that maximizes efficiency while maintaining sustainability
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              {content.technology.map((tech, i) => {
                const Icon = tech.icon;
                return (
                  <div key={i} className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 shadow-lg transition-all hover:border-accent hover:shadow-2xl">
                    <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 blur-3xl transition-all group-hover:scale-150" />
                    <div className="relative">
                      <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-accent text-white shadow-lg">
                        <Icon className="h-8 w-8" />
                      </div>
                      <h3 className="mb-4 font-serif text-2xl font-bold text-gray-900">{tech.title}</h3>
                      <p className="mb-6 font-sans text-base leading-relaxed text-gray-600">{tech.description}</p>
                      {tech.metrics && (
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="font-sans text-sm font-semibold text-primary">{tech.metrics}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Before / After */}
        {content.beforeAfter && (
          <section className="py-24">
            <div className="mx-auto max-w-7xl 2xl:max-w-[1536px] px-4 sm:px-6 lg:px-8">
              <BeforeAfterSlider {...content.beforeAfter} />
            </div>
          </section>
        )}

        {/* Features */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl 2xl:max-w-[1536px] px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="mb-6 font-serif text-4xl font-bold text-gray-900 md:text-5xl">Why Choose Kuyash</h2>
              <p className="mx-auto max-w-2xl font-sans text-lg text-gray-600">
                Our commitment to excellence sets us apart in the agricultural industry
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 2xl:gap-10">
              {content.features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div key={i} className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:border-accent hover:shadow-xl">
                    <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-primary/5 to-accent/5 blur-2xl transition-all group-hover:scale-150" />
                    <div className="relative">
                      <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-accent group-hover:text-white">
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="mb-3 font-serif text-xl font-bold text-gray-900">{feature.title}</h3>
                      <p className="font-sans text-sm leading-relaxed text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-white py-24">
          <div className="mx-auto max-w-7xl 2xl:max-w-[1536px] px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-accent/20 to-primary/20 blur-2xl" />
                <div className="relative grid gap-4 sm:grid-cols-2">
                  {content.gallery.slice(0, 4).map((image, i) => (
                    <div key={i} className="aspect-square overflow-hidden rounded-2xl shadow-lg">
                      <Image
                        src={image}
                        alt={`Benefit ${i + 1}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-4 inline-block rounded-full bg-accent/10 px-4 py-1">
                  <span className="font-sans text-sm font-semibold uppercase tracking-wide text-primary">Benefits</span>
                </div>
                <h2 className="mb-8 font-serif text-4xl font-bold text-gray-900 md:text-5xl">What You Get</h2>
                <div className="space-y-4">
                  {content.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-4 rounded-xl border border-gray-100 bg-cream p-4 transition-all hover:border-accent hover:shadow-md">
                      <CheckCircle2 className="h-6 w-6 shrink-0 text-accent" />
                      <p className="font-sans text-base leading-relaxed text-gray-700">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="bg-[var(--light-gray)] py-24">
          <div className="mx-auto max-w-7xl 2xl:max-w-[1536px] px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="mb-6 font-serif text-4xl font-bold text-gray-900 md:text-5xl">See Our Farm in Action</h2>
              <p className="mx-auto max-w-2xl font-sans text-lg text-gray-600">
                A visual journey through our sustainable farming operations
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {content.gallery.map((image, i) => (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-xl shadow-md ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-accent/40">
                  <Image
                    src={image}
                    alt={`Gallery ${i + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="h-1 w-1 rounded-full bg-white" />
                    <span className="font-sans text-xs font-medium text-white/90">0{i + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-primary py-24">
          {/* Texture, drawn rather than fetched.

              This was `bg-[url('/images/pattern.svg')]`, and that file has
              never existed in `public/images/` — the request 404s on every
              render of every service page. At `opacity-5` the missing texture
              is invisible either way, so the only symptom was a red line in
              the console that looked like it belonged to something else.

              Two crossed gradients give the same faint weave with no network
              request and nothing to keep in sync. Same technique as the grid
              behind the academy hero. */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
              <Leaf className="h-4 w-4 text-white" />
              <span className="font-sans text-sm font-medium text-white">Fresh from Our Farm</span>
            </div>
            <h2 className="mb-6 font-serif text-4xl font-bold leading-tight text-white md:text-5xl">
              Experience Premium Organic Produce
            </h2>
            <p className="mb-10 font-sans text-lg leading-relaxed text-white/90">
              Browse our selection of fresh, sustainably-grown products. Farm-to-table delivery within 24 hours.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href={content.shopHref}
                className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-sans text-base font-semibold text-primary shadow-xl transition-all hover:scale-105 hover:gap-3 hover:shadow-2xl"
              >
                Shop Now
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/#services"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/20 bg-white/10 px-8 py-4 font-sans text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                Explore Services
              </Link>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
