'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PenLine, Settings2, Library, ChevronsRight, ChevronsLeft } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  prefetchDraftLibraryData,
  prefetchHomePageChromeData,
  prefetchSettingsPageData,
} from '@/lib/navigationDataCache';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';
import * as styles from './Sidebar.css';

const STORAGE_KEY = 'publio-sidebar-expanded';

const navItems = [
  { href: '/', label: '写作台', icon: PenLine, color: '#3B82F6' },
  { href: '/drafts', label: '稿件库', icon: Library, color: '#8B5CF6' },
  { href: '/settings', label: '设置', icon: Settings2, color: '#6B7280' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') setExpanded(true);
  }, []);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  useEffect(() => {
    for (const item of navItems) {
      router.prefetch(item.href);
    }
  }, [router]);

  useEffect(() => {
    const prefetchData = () => {
      prefetchHomePageChromeData();
      prefetchDraftLibraryData();
      prefetchSettingsPageData();
      void import('@/components/editor/MarkdownEditor');
      void import('@/components/publish/PlatformPreviewPanel');
      void import('@/components/publish/PlatformVariantPanel');
      void import('@/components/publish/PublishProgressOverlay');
    };

    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(prefetchData, { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }

    const id = setTimeout(prefetchData, 300);
    return () => clearTimeout(id);
  }, []);

  function handleNavigate(href: string) {
    if (href !== pathname) {
      setPendingHref(href);
    }
  }

  const toggle = () => {
    setExpanded((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  const variant = expanded ? 'expanded' : 'collapsed';

  return (
    <>
      <aside className={cn(styles.sidebarBase, styles.sidebarVariants[variant])}>
        <div className={styles.brand}>
          {expanded ? (
            <>
              <div className={styles.brandLeft}>
                <span className={styles.brandLogo}>
                  <Logo size={28} />
                </span>
                <span className={styles.brandName}>Publio</span>
              </div>
              <button
                type="button"
                className={styles.collapseToggle}
                onClick={toggle}
                title="收起侧边栏"
                aria-expanded={expanded}
              >
                <ChevronsLeft size={14} />
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles.collapseToggle}
              onClick={toggle}
              title="展开侧边栏"
              aria-expanded={expanded}
            >
              <ChevronsRight size={14} />
            </button>
          )}
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = pendingHref
              ? pendingHref === item.href
              : pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            const state = isActive ? 'active' : 'inactive';

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(styles.navItemBase, styles.navItemVariants[state])}
                onClick={() => handleNavigate(item.href)}
              >
                <span className={cn(styles.navIconBase, styles.navIconVariants[state])}>
                  <Icon size={20} color={isActive ? undefined : item.color} />
                </span>
                <span className={cn(styles.navLabel, styles.navLabelVariants[state])}>
                  {item.label}
                </span>
                <span className={styles.navTooltip} aria-hidden="true">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.footer}>
          <div className={styles.themeToggleRow}>
            <ThemeToggle expanded={expanded} />
          </div>
        </div>
      </aside>

      <nav className={styles.mobileTabBar} aria-label="移动端导航">
        {navItems.map((item) => {
          const isActive =
            pendingHref === item.href ||
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          const state = isActive ? 'active' : 'inactive';

          return (
            <Link
              key={item.href}
              href={item.href}
              className={styles.mobileTabItem[state]}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => handleNavigate(item.href)}
            >
              <Icon size={20} color={isActive ? undefined : item.color} />
              <span className={styles.mobileTabLabel[state]}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
