export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-[#faf8f5] pt-20">
      <div className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
        <div className="mb-8 h-7 w-32 animate-pulse rounded-lg bg-gray-200" />
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form skeleton */}
          <div className="space-y-6 lg:col-span-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-4 h-5 w-32 animate-pulse rounded bg-gray-100" />
                <div className="space-y-3">
                  <div className="h-11 animate-pulse rounded-lg bg-gray-100" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-11 animate-pulse rounded-lg bg-gray-100" />
                    <div className="h-11 animate-pulse rounded-lg bg-gray-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Summary skeleton */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 h-5 w-28 animate-pulse rounded bg-gray-100" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-3.5 w-28 animate-pulse rounded-full bg-gray-100" />
                  <div className="h-3.5 w-16 animate-pulse rounded-full bg-gray-100" />
                </div>
              ))}
              <div className="h-px bg-gray-100" />
              <div className="flex justify-between">
                <div className="h-5 w-16 animate-pulse rounded bg-gray-100" />
                <div className="h-5 w-20 animate-pulse rounded bg-gray-100" />
              </div>
              <div className="h-12 animate-pulse rounded-full bg-gray-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
