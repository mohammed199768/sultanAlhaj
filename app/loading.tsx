/**
 * Route-segment loading fallback (server-rendered, zero JS).
 * Shown by Next.js while a route segment streams (e.g. /work/[slug]).
 * Matches the SiteBootLoader composition so the two states read as one system.
 */
import SultanShadiMark from "@/components/brand/SultanShadiMark";
import styles from "@/components/system/SiteBootLoader.module.css";

export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="fixed inset-0 z-[110] flex items-center justify-center overflow-hidden bg-navy-600 px-6"
    >
      <div className={styles.content}>
        <div className={styles.stage} aria-hidden="true">
          <svg className={styles.rings} viewBox="0 0 100 100">
            <circle className={styles.staticRing} cx="50" cy="50" r="47" />
            <circle className={styles.outerArc} cx="50" cy="50" r="47" pathLength="100" />
            <circle className={styles.progressTrack} cx="50" cy="50" r="40" />
            <circle className={styles.innerArc} cx="50" cy="50" r="35.5" pathLength="100" />
            <path className={styles.alignmentMark} d="M50 0L51.6 2.6L50 5.2L48.4 2.6Z" />
            <path className={styles.alignmentMark} d="M50 94.8L51.6 97.4L50 100L48.4 97.4Z" />
          </svg>
          <SultanShadiMark variant="full" size="68%" decorative className={styles.mark} />
        </div>
        <p className={styles.label} aria-hidden="true">
          Opening portfolio
        </p>
      </div>
    </div>
  );
}
