'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Newspaper,
  PenLine,
  Settings2,
  ArrowRight,
} from 'lucide-react';
import { Dancing_Script } from 'next/font/google';
import { cn } from '@/lib/cn';

const handwriting = Dancing_Script({ subsets: ['latin'], weight: ['700'] });

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

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-[color:var(--wb-border)] bg-[color:var(--wb-bg-elevated)] text-[color:var(--wb-text)] lg:sticky lg:top-0 lg:h-dvh lg:w-[18rem] lg:shrink-0 lg:border-b-0 lg:border-r lg:overflow-y-auto lg:overscroll-contain">
      <div className="flex flex-col p-3 lg:min-h-full">
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group relative flex items-start gap-3 rounded-[var(--wb-radius-xl)] px-3 py-3 transition-colors duration-150',
                  isActive
                    ? 'bg-[color:var(--wb-surface)]'
                    : 'hover:bg-[color:var(--wb-surface)]',
                )}
              >
                {/* 选中左侧竖条 */}
                <span
                  className={cn(
                    'absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full transition-opacity duration-150',
                    isActive ? 'opacity-100' : 'opacity-0',
                  )}
                  style={{ background: 'var(--wb-accent)' }}
                />

                {/* 图标 */}
                <div
                  className={cn(
                    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--wb-radius-lg)] transition-colors duration-150',
                    isActive
                      ? 'bg-[color:var(--wb-accent)] text-white'
                      : 'bg-[color:var(--wb-canvas-deep)] text-[color:var(--wb-text-muted)] group-hover:bg-[color:var(--wb-accent-soft)] group-hover:text-[color:var(--wb-accent)]',
                  )}
                >
                  <Icon size={15} />
                </div>

                {/* 文字 */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={cn(
                        'text-[13px] leading-5 transition-colors duration-150',
                        isActive
                          ? 'font-semibold text-[color:var(--wb-text)]'
                          : 'font-medium text-[color:var(--wb-text-muted)] group-hover:text-[color:var(--wb-text)]',
                      )}
                    >
                      {item.label}
                    </p>
                    <ArrowRight
                      size={13}
                      className={cn(
                        'shrink-0 transition-all duration-150',
                        isActive
                          ? 'text-[color:var(--wb-accent)]'
                          : 'translate-x-1 text-transparent group-hover:translate-x-0 group-hover:text-[color:var(--wb-text-muted)]',
                      )}
                    />
                  </div>
                  <p className="mt-0.5 text-[11px] leading-[1.55] text-[color:var(--wb-text-muted)]">
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-2 pb-2 pt-4 text-right">
          <p
            className={`${handwriting.className} text-[26px] leading-none`}
            style={{ color: 'var(--wb-accent)' }}
          >
            Publio
          </p>
          <p className="mt-1.5 text-[11px] leading-4 text-[color:var(--wb-text-muted)]">
            Write once, publish everywhere.
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.28em]" style={{ color: 'rgba(19,19,20,0.32)' }}>
            v0.1.0
          </p>
        </div>
      </div>
    </aside>
  );
}
