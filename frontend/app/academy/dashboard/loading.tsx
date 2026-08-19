export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#f9f8f6] flex">
      {/* Sidebar skeleton */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-white border-r border-gray-100 fixed inset-y-0 left-0">
        <div className="px-4 py-5 border-b border-gray-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gray-100 animate-pulse" />
          <div className="space-y-1.5">
            <div className="w-28 h-3 bg-gray-100 rounded animate-pulse" />
            <div className="w-20 h-2 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex-1 px-3 py-4 space-y-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5">
              <div className="w-4 h-4 rounded bg-gray-100 animate-pulse shrink-0" />
              <div className="h-3 bg-gray-100 rounded animate-pulse flex-1" />
            </div>
          ))}
        </div>
      </aside>

      {/* Main skeleton */}
      <div className="flex-1 lg:ml-60 flex flex-col">
        {/* Top nav */}
        <header className="h-14 bg-white border-b border-gray-100 px-8 flex items-center gap-4">
          <div className="w-24 h-4 bg-gray-100 rounded animate-pulse" />
          <div className="ml-auto flex items-center gap-3">
            <div className="w-52 h-8 bg-gray-100 rounded-xl animate-pulse hidden sm:block" />
            <div className="w-8 h-8 rounded-xl bg-gray-100 animate-pulse" />
            <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse" />
          </div>
        </header>

        <main className="flex-1 px-8 py-7 max-w-6xl w-full mx-auto">
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
                <div className="w-9 h-9 bg-gray-100 rounded-xl animate-pulse" />
                <div className="w-12 h-7 bg-gray-100 rounded animate-pulse" />
                <div className="w-24 h-3 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
          {/* Section skeleton */}
          <div className="space-y-3">
            <div className="w-36 h-5 bg-gray-100 rounded animate-pulse" />
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
                <div className="flex gap-2">
                  <div className="w-16 h-5 bg-gray-100 rounded-full animate-pulse" />
                  <div className="w-12 h-5 bg-gray-100 rounded-full animate-pulse" />
                </div>
                <div className="w-3/4 h-4 bg-gray-100 rounded animate-pulse" />
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="h-3 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
