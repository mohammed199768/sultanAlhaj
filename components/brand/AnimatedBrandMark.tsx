import SultanShadiMark from "./SultanShadiMark";
import styles from "./AnimatedBrandMark.module.css";

export default function AnimatedBrandMark() {
  return (
    <span className={styles.root} aria-hidden="true">
      <span className={styles.stage} data-brand-stage>
        <span className={`${styles.face} ${styles.logoFace}`}>
          <SultanShadiMark
            variant="compact"
            size="var(--brand-mark-width)"
            decorative
          />
        </span>
        <span className={`${styles.face} ${styles.signatureFace}`}>
          Sultan Shadi
        </span>
      </span>
    </span>
  );
}
