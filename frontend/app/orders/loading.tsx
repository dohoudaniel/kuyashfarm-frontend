export default function OrdersLoading() {
  return (
    <div className="min-h-screen bg-[#faf8f5] pt-20">
      <div className="mx-auto max-w-4xl px-6 py-10 lg:px-8">
        <div className="mb-8 space-y-2">
          <div className="h-7 w-32 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-3.5 w-48 animate-pulse rounded-full bg-gray-200" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4">
                <div className="space-y-1.5">
                  <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-20 animate-pulse rounded-full bg-gray-100" />
                </div>
                <div className="h-6 w-20 animate-pulse rounded-full bg-gray-100" />
              </div>
              <div className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 animate-pulse rounded-xl bg-gray-100" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
                    <div className="h-3 w-24 animate-pulse rounded-full bg-gray-100" />
                  </div>
                  <div className="h-5 w-16 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
