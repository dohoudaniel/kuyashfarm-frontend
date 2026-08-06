/**
 * Streamed while the route's data is being fetched.
 *
 * Keep this alongside the route when moving it — losing it turns a slow
 * request into a blank screen.
 */

export default function AcademyLoading() {
  return (
    <div className="min-h-screen bg-cream pt-20">
      {/* Hero skeleton */}
      <div className="bg-primary/5 px-6 py-16">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="h-4 w-24 animate-pulse rounded-full bg-primary/20" />
          <div className="h-10 w-2/3 animate-pulse rounded-lg bg-primary/20" />
          <div className="h-4 w-1/2 animate-pulse rounded-full bg-primary/10" />
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="h-48 w-full animate-pulse bg-gray-100" />
              <div className="space-y-3 p-5">
                <div className="h-3 w-16 animate-pulse rounded-full bg-gray-100" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-full animate-pulse rounded-full bg-gray-100" />
                <div className="h-3 w-2/3 animate-pulse rounded-full bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
