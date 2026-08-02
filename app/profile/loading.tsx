/**
 * Streamed while the route's data is being fetched.
 *
 * Keep this alongside the route when moving it — losing it turns a slow
 * request into a blank screen.
 */

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-[#faf8f5] pt-20">
      <div className="mx-auto max-w-3xl px-6 py-10 lg:px-8">
        {/* Avatar + name */}
        <div className="mb-8 flex items-center gap-5">
          <div className="h-20 w-20 animate-pulse rounded-full bg-gray-200" />
          <div className="space-y-2">
            <div className="h-6 w-40 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-3.5 w-28 animate-pulse rounded-full bg-gray-200" />
          </div>
        </div>
        {/* Form skeleton */}
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="mb-6 h-5 w-36 animate-pulse rounded bg-gray-100" />
          <div className="grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-20 animate-pulse rounded-full bg-gray-100" />
                <div className="h-11 animate-pulse rounded-lg bg-gray-100" />
              </div>
            ))}
          </div>
          <div className="mt-6 h-11 w-32 animate-pulse rounded-full bg-gray-100" />
        </div>
      </div>
    </div>
  );
}
