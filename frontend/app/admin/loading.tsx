export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* Header skeleton */}
        <div className="mb-8 space-y-2">
          <div className="h-7 w-40 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-4 w-64 animate-pulse rounded-full bg-gray-200" />
        </div>

        {/* Stats row */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3 h-3 w-20 animate-pulse rounded-full bg-gray-100" />
              <div className="h-8 w-16 animate-pulse rounded-lg bg-gray-100" />
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <div className="h-5 w-32 animate-pulse rounded bg-gray-100" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-gray-50 px-6 py-4 last:border-0">
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-100" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-40 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-24 animate-pulse rounded-full bg-gray-100" />
              </div>
              <div className="h-6 w-16 animate-pulse rounded-full bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
