"use client";

import { useState, useEffect } from "react";

/**
 * Hero Section - Full-width background with cross-fade image transition
 */
export function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const heroImages = [
    { url: '/images/backgrounds/hero-kuyash.jpg', position: 'center' },
    { url: '/images/backgrounds/hero-transition.jpg', position: 'center' },
    { url: '/images/backgrounds/sunset.jpeg', position: 'top' },
    { url: '/images/backgrounds/dam.jpeg', position: 'center' },
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(intervalId);
  }, [heroImages.length]);

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Background Images with Cross-Fade Transition */}
      <div className="absolute inset-0 z-0">
        {heroImages.map((image, index) => (
          <div
            key={image.url}
            className={`absolute inset-0 h-full w-full bg-cover bg-no-repeat transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url('${image.url}')`,
              backgroundPosition: image.position,
            }}
          />
        ))}
        {/* Dark Overlay for text readability */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 text-center">
        <h1 className="font-serif text-5xl font-bold leading-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
          <span className="block">Farming</span>
          <span className="block">for a future</span>
        </h1>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <a
            href="/categories"
            className="group relative overflow-hidden rounded-full bg-green-600 px-8 py-4 font-sans text-base font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-green-700 hover:shadow-2xl"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Shop Now
              <svg
                className="h-5 w-5 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
          </a>

          <a
            href="#about"
            className="rounded-full border-2 border-white/80 bg-white/10 px-8 py-4 font-sans text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-white hover:bg-white/20"
          >
            Learn More
          </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce">
        <div className="flex h-12 w-8 items-start justify-center rounded-full border-2 border-white p-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
        </div>
      </div>
    </section>
  );
}
