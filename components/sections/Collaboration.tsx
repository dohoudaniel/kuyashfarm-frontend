/**
 * Collaboration Section - Full-width background with overlay text
 */
export function Collaboration() {
  return (
    <section className="relative min-h-[600px] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1500651230702-0e2d8a49d7ad?q=80&w=2070')",
        }}
      >
        {/* Green Overlay */}
        <div className="absolute inset-0 bg-[#2d5f3f]/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-[600px] items-center px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-8 font-serif text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
            Collaborate and Learn from Industry Experts and Enthusiasts
          </h2>

          {/* Features List */}
          <div className="mt-12 grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
            {[
              "Agricultural Monitoring",
              "Farm Management",
              "Precision Agriculture",
              "Crop Consulting",
              "Soil Analysis",
              "Organic Farming",
            ].map((feature, index) => (
              <div
                key={index}
                className="group flex items-center space-x-3 rounded-lg bg-white/10 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
              >
                <div className="h-2 w-2 rounded-full bg-[#6b9d7a] group-hover:scale-150 transition-transform" />
                <span className="font-sans text-sm text-white md:text-base">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
