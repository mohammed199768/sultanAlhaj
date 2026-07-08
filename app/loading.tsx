/**
 * Route-segment loading fallback (server-rendered, zero JS).
 * Shown by Next.js while a route segment streams (e.g. /work/[slug]).
 * Matches the SiteBootLoader composition so the two states read as one system.
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-navy-600"
    >
      <p className="font-display text-sm font-semibold uppercase tracking-[0.4em] text-mist-300">
        Sultan<span className="text-champagne"> Shadi</span>
      </p>
      <div className="mt-6 h-px w-[min(220px,60vw)] bg-mist/10">
        <div className="loading-rail h-full w-1/3 bg-champagne-600" />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}
