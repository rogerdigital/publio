import type { ReactNode } from 'react';

interface AppShellHeaderProps {
  kicker: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function AppShellHeader({
  kicker,
  title,
  description,
  action,
}: AppShellHeaderProps) {
  return (
    <header className="w-full py-2">
      <div className="flex items-end justify-between gap-4">
        <div className="max-w-4xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-[color:var(--wb-accent)]">
            {kicker}
          </p>
          <h1
            className="mt-2 text-[26px] leading-tight text-[color:var(--wb-text)] sm:text-[32px]"
            style={{ fontFamily: 'var(--wb-font-serif)' }}
          >
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[color:var(--wb-text-muted)]">
              {description}
            </p>
          ) : null}
        </div>
        {action ? (
          <div className="shrink-0">{action}</div>
        ) : null}
      </div>
    </header>
  );
}
