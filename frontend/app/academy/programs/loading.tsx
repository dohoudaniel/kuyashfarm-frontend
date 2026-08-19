export default function ProgramsLoading() {
  return (
    <div className="min-h-screen bg-[#faf8f5] pt-20">
      {/* Hero skeleton */}
      <div className="bg-[#080f0a] px-6 py-16">
        <div className="mx-auto max-w-7xl space-y-4 px-6 md:px-12 lg:px-16">
          <div className="h-3 w-28 animate-pulse rounded-full bg-white/10" />
          <div className="h-10 w-1/2 animate-pulse rounded-lg bg-white/10" />
          <div className="h-4 w-1/3 animate-pulse rounded-full bg-white/5" />
        </div>
      </div>

      {/* Filter bar skeleton */}
      <div className="border-b border-gray-100 bg-white px-6 py-4">
        <div className="mx-auto max-w-7xl flex gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-gray-100" />
          ))}
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-12 lg:px-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
              <div className="h-44 w-full animate-pulse bg-gray-100" />
              <div className="space-y-3 p-5">
                <div className="flex justify-between">
                  <div className="h-3 w-20 animate-pulse rounded-full bg-gray-100" />
                  <div className="h-5 w-16 animate-pulse rounded-full bg-gray-100" />
                </div>
                <div className="h-5 w-3/4 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-full animate-pulse rounded-full bg-gray-100" />
                <div className="h-3 w-2/3 animate-pulse rounded-full bg-gray-100" />
                <div className="h-1 w-full animate-pulse rounded-full bg-gray-100 mt-4" />
                <div className="flex justify-between pt-3">
                  <div className="h-6 w-24 animate-pulse rounded bg-gray-100" />
                  <div className="flex gap-2">
                    <div className="h-8 w-20 animate-pulse rounded-lg bg-gray-100" />
                    <div className="h-8 w-14 animate-pulse rounded-lg bg-gray-100" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
