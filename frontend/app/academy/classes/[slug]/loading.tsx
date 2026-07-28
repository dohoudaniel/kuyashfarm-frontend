export default function ClassLoading() {
  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero skeleton */}
      <div className="h-72 w-full animate-pulse bg-gray-100" />

      <div className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
        <div className="space-y-5">
          <div className="h-3 w-20 animate-pulse rounded-full bg-gray-100" />
          <div className="h-9 w-3/4 animate-pulse rounded-lg bg-gray-100" />
          <div className="h-4 w-1/2 animate-pulse rounded-full bg-gray-100" />
          <div className="h-px bg-gray-100" />
          <div className="space-y-3 pt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 animate-pulse rounded-full bg-gray-100" style={{ width: `${85 - i * 8}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
