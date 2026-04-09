'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Newspaper,
  PenLine,
  Settings2,
  ArrowRight,
} from 'lucide-react';

const navItems = [
  {
    href: '/ai-news',
    label: '选题台',
    description: '聚合 AI 热点，提炼可转化的内容线索。',
    icon: Newspaper,
  },
  {
    href: '/',
    label: '写作台',
    description: 'Markdown 写作、排版预览与发布一体化。',
    icon: PenLine,
  },
  {
    href: '/settings',
    label: '设置',
    description: '统一管理公众号、小红书、知乎与 X 凭证。',
    icon: Settings2,
  },
];

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(' ');
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-[color:var(--wb-border)] bg-[linear-gradient(180deg,rgba(252,247,240,0.96)_0%,rgba(244,234,222,0.92)_100%)] text-[color:var(--wb-text)] backdrop-blur-md lg:sticky lg:top-0 lg:h-dvh lg:w-[18rem] lg:shrink-0 lg:border-b-0 lg:border-r lg:overflow-y-auto lg:overscroll-contain">
      <div className="flex flex-col gap-4 p-4 lg:min-h-full">
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={joinClasses(
                  'group block rounded-[22px] border px-4 py-3.5 transition-all duration-200',
                  isActive
                    ? 'border-[color:var(--wb-border-strong)] bg-[linear-gradient(180deg,rgba(255,252,247,0.98)_0%,rgba(246,235,225,0.92)_100%)] shadow-[var(--wb-shadow-tight)]'
                    : 'border-transparent bg-transparent hover:border-[color:var(--wb-border)] hover:bg-[rgba(255,252,247,0.66)]',
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={joinClasses(
                      'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-colors',
                      isActive
                        ? 'border-[color:var(--wb-accent-soft)] bg-[rgba(255,244,235,0.95)] text-[color:var(--wb-accent)]'
                        : 'border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.36)] text-[color:var(--wb-text-muted)] group-hover:text-[color:var(--wb-accent)]',
                    )}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[14px] font-medium text-[color:var(--wb-text)]">
                        {item.label}
                      </p>
                      <ArrowRight
                        size={14}
                        className={joinClasses(
                          'shrink-0 transition-transform duration-200',
                          isActive
                            ? 'translate-x-0 text-[color:var(--wb-accent)]'
                            : 'text-[color:var(--wb-text-muted)] group-hover:translate-x-0.5 group-hover:text-[color:var(--wb-accent)]',
                        )}
                      />
                    </div>
                    <p className="mt-1 text-[13px] leading-5 text-[color:var(--wb-text-muted)]">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-1 pb-1">
          <p
            className="text-[22px] leading-none text-[color:var(--wb-ink)]"
            style={{ fontFamily: 'var(--wb-font-serif)' }}
          >
            Publio
          </p>
          <p className="mt-2 text-[12px] leading-5 text-[color:var(--wb-text-muted)]">
            Write once, publish everywhere.
          </p>
          <p className="mt-3 text-right text-[10px] uppercase tracking-[0.28em] text-[color:var(--wb-accent)]">
            v0.1.0
          </p>
        </div>
      </div>
    </aside>
  );
}
