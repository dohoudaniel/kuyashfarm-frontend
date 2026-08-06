/**
 * Streamed while the route's data is being fetched.
 *
 * Keep this alongside the route when moving it — losing it turns a slow
 * request into a blank screen.
 */

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        </div>
        <p className="font-sans text-sm text-gray-400 tracking-wide">Loading…</p>
      </div>
    </div>
  );
}
