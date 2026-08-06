/**
 * Streamed while the route's data is being fetched.
 *
 * Keep this alongside the route when moving it — losing it turns a slow
 * request into a blank screen.
 */

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-cream pt-20">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <div className="h-3 w-20 animate-pulse rounded-full bg-gray-200" />
          <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
        </div>

        {/* Filter row */}
        <div className="mb-8 flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-20 animate-pulse rounded-full bg-gray-200" />
          ))}
        </div>

        {/* Product grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="aspect-square w-full animate-pulse bg-gray-100" />
              <div className="space-y-2.5 p-4">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-full animate-pulse rounded-full bg-gray-100" />
                <div className="flex items-center justify-between pt-1">
                  <div className="h-5 w-20 animate-pulse rounded bg-gray-100" />
                  <div className="h-8 w-8 animate-pulse rounded-full bg-gray-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
