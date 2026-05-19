import * as styles from './Logo.css';

export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={styles.logoSvg}
    >
      {/* 笔尖主体 */}
      <path d="M13 4Q9 16 16 29Q23 16 19 4Z" fill="currentColor" />
      {/* 呼吸孔 */}
      <circle cx="16" cy="11" r="2" fill="white" opacity="0.85" />
      {/* 中缝 */}
      <line x1="16" y1="13" x2="16" y2="29" stroke="white" strokeWidth="0.8" opacity="0.5" />
    </svg>
  );
}
