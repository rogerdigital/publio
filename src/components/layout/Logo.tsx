import * as styles from './Logo.css';

export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={styles.logoSvg}
    >
      <rect width="28" height="28" rx="6" fill="currentColor" />
      <path
        d="M9 20V8h4.8c1.3 0 2.3.38 3.02 1.12.72.74 1.08 1.7 1.08 2.88 0 1.18-.36 2.14-1.08 2.88-.72.74-1.72 1.12-3.02 1.12H11.4V20H9Z M11.4 14h2.2c.7 0 1.22-.2 1.58-.58.36-.4.54-.9.54-1.52 0-.62-.18-1.12-.54-1.52-.36-.38-.88-.58-1.58-.58H11.4V14Z"
        fill="var(--logo-letter)"
        fillRule="evenodd"
      />
    </svg>
  );
}
