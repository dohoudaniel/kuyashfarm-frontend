/**
 * Matches the shape of the saved grid, so the fill-in does not move anything.
 */
export default function Loading() {
  return (
    <main className="min-h-screen bg-cream pb-24 pt-28">
      <div className="mx-auto max-w-7xl 2xl:max-w-[1536px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 h-10 w-48 animate-pulse rounded-lg bg-gray-200" />
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="mb-3 aspect-4/3 rounded-2xl bg-gray-200" />
              <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-3 w-1/2 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
