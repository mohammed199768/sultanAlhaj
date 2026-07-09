/**
 * Route-segment loading fallback (server-rendered, zero JS).
 * Shown by Next.js while a route segment streams (e.g. /work/[slug]).
 * Matches the SiteBootLoader composition so the two states read as one system.
 */
import { profile } from "@/lib/data/profile";

export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="fixed inset-0 z-[110] flex items-center justify-center overflow-hidden bg-navy-600 px-6"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(152,170,194,0.16),transparent_48%),linear-gradient(180deg,rgba(0,4,25,0.92),#071739)]"
      />
      <div className="relative z-10 w-full max-w-sm border-y border-steel-400/20 py-9 text-center">
        <p className="font-display text-[0.58rem] uppercase tracking-[0.34em] text-champagne/75">
          Case File
        </p>
        <p className="mt-4 font-display text-[clamp(2rem,10vw,2.85rem)] font-extrabold uppercase leading-none tracking-normal text-mist-300">
          Sultan<span className="text-champagne"> Shadi</span>
        </p>
        <p className="mx-auto mt-4 max-w-[18rem] font-display text-[0.62rem] uppercase leading-relaxed tracking-[0.16em] text-haze/70">
          {profile.primaryTitle}
        </p>
        <div className="mx-auto mt-8 w-full max-w-[17rem]">
          <div className="mb-3 flex items-center justify-between font-display text-[0.56rem] uppercase tracking-[0.2em] text-haze/45">
            <span>Opening</span>
            <span>Portfolio</span>
          </div>
          <div className="h-px overflow-hidden bg-mist/10">
            <div className="loading-rail h-full w-1/3 bg-champagne-600" />
          </div>
        </div>
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}
