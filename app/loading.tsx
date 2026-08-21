/**
 * Streamed while the route's data is being fetched.
 *
 * **A skeleton, not a spinner.** This was a centred spinner over a full-height
 * cream background, and it was the single most-seen loading state in the
 * application. A spinner communicates one thing — "wait" — and communicates it
 * for an unbounded time, which is why a spinner that runs for three seconds
 * feels broken while a skeleton that does the same feels slow. A skeleton also
 * says *what* is coming, so the eye is already in the right place when the
 * content lands, and the layout does not jump underneath it.
 *
 * The shapes here mirror a marketing page: a tall hero, then a band of stats,
 * then a card grid. They do not need to match any specific route pixel for
 * pixel — this is the root fallback and covers several — but they do need the
 * same *rhythm*, or the fill-in reads as a different page arriving.
 *
 * `animate-pulse` is the whole animation, and it is a CSS one. The reduced
 * motion block in `globals.css` reduces it to a static grey, which is the
 * correct outcome: the shape still communicates the layout without anything
 * moving.
 *
 * Keep this alongside the route when moving it — losing it turns a slow
 * request into a blank screen.
 */

export default function Loading() {
  return (
    <div className="min-h-screen bg-cream" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>

      {/* Hero */}
      <div className="relative h-[60vh] min-h-[380px] w-full animate-pulse bg-primary/10">
        <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center gap-4 px-6">
          <div className="h-10 w-4/5 rounded-lg bg-primary/15 md:h-14" />
          <div className="h-10 w-3/5 rounded-lg bg-primary/15 md:h-14" />
          <div className="mt-4 flex gap-3">
            <div className="h-11 w-32 rounded-full bg-primary/20" />
            <div className="h-11 w-32 rounded-full bg-primary/10" />
          </div>
        </div>
      </div>

      {/* Stats band */}
      <div className="mx-auto grid max-w-7xl 2xl:max-w-[1536px] grid-cols-2 gap-8 px-6 py-16 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex animate-pulse flex-col items-center gap-2">
            <div className="h-9 w-24 rounded bg-primary/15" />
            <div className="h-3 w-28 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Card grid */}
      <div className="mx-auto grid max-w-7xl 2xl:max-w-[1536px] grid-cols-1 gap-6 px-6 pb-24 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="h-48 w-full bg-gray-200" />
            <div className="space-y-3 p-5">
              <div className="h-4 w-2/3 rounded bg-gray-200" />
              <div className="h-3 w-full rounded bg-gray-100" />
              <div className="h-3 w-4/5 rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
