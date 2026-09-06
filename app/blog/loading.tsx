export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero skeleton */}
      <div className="bg-ink py-24 md:py-32 px-6 md:px-12 lg:px-16">
        <div className="max-w-7xl 2xl:max-w-[1536px] mx-auto space-y-5">
          <div className="w-64 h-3 bg-white/10 rounded animate-pulse" />
          <div className="space-y-3">
            <div className="w-2/3 h-14 bg-white/10 rounded-xl animate-pulse" />
            <div className="w-1/2 h-14 bg-white/10 rounded-xl animate-pulse" />
          </div>
          <div className="w-96 h-4 bg-white/10 rounded animate-pulse" />
          <div className="max-w-lg h-12 bg-white/10 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Body skeleton */}
      <div className="max-w-7xl 2xl:max-w-[1536px] mx-auto px-6 md:px-12 lg:px-16 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
          {/* Left */}
          <div className="space-y-8">
            {/* Featured */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-white rounded-2xl overflow-hidden border border-gray-100">
              <div className="h-64 bg-gray-100 animate-pulse" />
              <div className="p-8 space-y-4">
                <div className="w-24 h-5 bg-gray-100 rounded-full animate-pulse" />
                <div className="space-y-2">
                  <div className="w-full h-6 bg-gray-100 rounded animate-pulse" />
                  <div className="w-4/5 h-6 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <div className="w-full h-3 bg-gray-100 rounded animate-pulse" />
                  <div className="w-full h-3 bg-gray-100 rounded animate-pulse" />
                  <div className="w-2/3 h-3 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="w-28 h-10 bg-gray-100 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Article grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                  <div className="h-48 bg-gray-100 animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="w-20 h-4 bg-gray-100 rounded-full animate-pulse" />
                    <div className="space-y-1.5">
                      <div className="w-full h-4 bg-gray-100 rounded animate-pulse" />
                      <div className="w-5/6 h-4 bg-gray-100 rounded animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      {[1, 2, 3].map(j => (
                        <div key={j} className="w-full h-3 bg-gray-100 rounded animate-pulse" />
                      ))}
                    </div>
                    <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex gap-2 items-center">
                        <div className="w-7 h-7 rounded-full bg-gray-100 animate-pulse" />
                        <div className="w-24 h-3 bg-gray-100 rounded animate-pulse" />
                      </div>
                      <div className="w-16 h-3 bg-gray-100 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <aside className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <div className="w-36 h-3 bg-gray-100 rounded animate-pulse" />
              </div>
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3 border-b border-gray-50">
                  <div className="flex gap-3 items-center">
                    <div className="w-4 h-4 bg-gray-100 rounded animate-pulse" />
                    <div className="w-28 h-3 bg-gray-100 rounded animate-pulse" />
                  </div>
                  <div className="w-8 h-5 bg-gray-100 rounded-full animate-pulse" />
                </div>
              ))}
            </div>

            <div className="bg-ink rounded-2xl p-6 space-y-4">
              <div className="w-24 h-3 bg-white/10 rounded animate-pulse" />
              <div className="w-48 h-5 bg-white/10 rounded animate-pulse" />
              <div className="w-full h-3 bg-white/10 rounded animate-pulse" />
              <div className="w-full h-11 bg-white/10 rounded-xl animate-pulse" />
              <div className="w-full h-11 bg-primary/50 rounded-xl animate-pulse" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
