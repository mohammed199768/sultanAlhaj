import styles from "./AnimatedBrandMark.module.css";

export default function AnimatedBrandMark() {
  return (
    <span className={styles.root} aria-hidden="true">
      <span className={styles.stage} data-brand-stage>
        <span className={`${styles.face} ${styles.managerFace}`}>
          Marketing Manager
        </span>
        <span className={`${styles.face} ${styles.nameFace}`}>
          Sultan Shadi
        </span>
      </span>
    </span>
  );
}
