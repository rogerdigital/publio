/* eslint-disable @next/next/no-img-element */
import * as styles from './Logo.css';

export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <img
      src="/logo.png"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={styles.logoSvg}
    />
  );
}
