import SurfaceCard from '@/components/layout/SurfaceCard';

interface AppShellHeaderProps {
  kicker: string;
  title: string;
  description?: string;
}

export default function AppShellHeader({
  kicker,
  title,
  description,
}: AppShellHeaderProps) {
  return (
    <header className="w-full">
      <SurfaceCard tone="soft" className="px-5 py-5 sm:px-6">
        <div className="max-w-4xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-[color:var(--wb-accent)]">
            {kicker}
          </p>
          <h1
            className="mt-2 text-[24px] leading-tight text-[color:var(--wb-text)] sm:text-[30px]"
            style={{ fontFamily: 'var(--wb-font-serif)' }}
          >
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--wb-text-muted)]">
              {description}
            </p>
          ) : null}
        </div>
      </SurfaceCard>
    </header>
  );
}
