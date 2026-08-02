/**
 * Streamed while the route's data is being fetched.
 *
 * Keep this alongside the route when moving it — losing it turns a slow
 * request into a blank screen.
 */

export default function ServiceLoading() {
  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero skeleton */}
      <div className="relative h-[70vh] min-h-[500px] w-full animate-pulse bg-gray-100">
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 space-y-4 text-center">
          <div className="mx-auto h-5 w-36 rounded-full bg-white/20" />
          <div className="mx-auto h-12 w-96 max-w-xs rounded-xl bg-white/20 sm:max-w-none" />
          <div className="mx-auto h-4 w-72 rounded-full bg-white/10" />
        </div>
      </div>

      {/* Overview skeleton */}
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="h-3 w-24 animate-pulse rounded-full bg-gray-100" />
            <div className="h-9 w-3/4 animate-pulse rounded-lg bg-gray-100" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 animate-pulse rounded-full bg-gray-100" style={{ width: `${90 - i * 10}%` }} />
              ))}
            </div>
            <div className="h-11 w-40 animate-pulse rounded-full bg-gray-100" />
          </div>
          <div className="aspect-square animate-pulse rounded-3xl bg-gray-100" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="bg-[#2d5f3f]/5 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-3 h-10 w-20 animate-pulse rounded-lg bg-gray-100" />
                <div className="mx-auto h-3 w-28 animate-pulse rounded-full bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
