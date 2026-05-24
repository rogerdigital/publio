'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Newspaper,
  PenLine,
  Settings2,
  Library,
  Send,
  BarChart3,
  CalendarDays,
  ChevronsRight,
  ChevronsLeft,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';
import * as styles from './Sidebar.css';

const STORAGE_KEY = 'publio-sidebar-expanded';

const navItems = [
  { href: '/ai-news', label: '选题台', icon: Newspaper, color: '#F97316' },
  { href: '/', label: '写作台', icon: PenLine, color: '#3B82F6' },
  { href: '/drafts', label: '稿件库', icon: Library, color: '#8B5CF6' },
  { href: '/sync-tasks', label: '分发记录', icon: Send, color: '#EC4899' },
  { href: '/analytics', label: '数据看板', icon: BarChart3, color: '#14B8A6' },
  { href: '/calendar', label: '排期日历', icon: CalendarDays, color: '#EAB308' },
  { href: '/settings', label: '设置', icon: Settings2, color: '#6B7280' },
];

const PRIMARY_MOBILE_COUNT = 5;
const primaryMobileItems = navItems.slice(0, PRIMARY_MOBILE_COUNT);
const moreMobileItems = navItems.slice(PRIMARY_MOBILE_COUNT);

export default function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') setExpanded(true);
  }, []);

  // Close "more" dropdown on outside click
  useEffect(() => {
    if (!moreOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [moreOpen]);

  // Close "more" on route change
  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

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
            const isActive =
              pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            const state = isActive ? 'active' : 'inactive';

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(styles.navItemBase, styles.navItemVariants[state])}
              >
                <span className={cn(styles.navIconBase, styles.navIconVariants[state])}>
                  <Icon size={20} color={isActive ? undefined : item.color} />
                </span>
                <span className={cn(styles.navLabel, styles.navLabelVariants[state])}>
                  {item.label}
                </span>
                <span className={styles.navTooltip}>{item.label}</span>
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
        {primaryMobileItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          const state = isActive ? 'active' : 'inactive';

          return (
            <Link
              key={item.href}
              href={item.href}
              className={styles.mobileTabItem[state]}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={20} color={isActive ? undefined : item.color} />
              <span className={styles.mobileTabLabel[state]}>{item.label}</span>
            </Link>
          );
        })}
        <div className={styles.moreMenuWrapper} ref={moreRef}>
          <button
            type="button"
            className={styles.mobileTabItem[moreOpen ? 'active' : 'inactive']}
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen}
            aria-haspopup="true"
          >
            <MoreHorizontal size={20} />
            <span className={styles.mobileTabLabel[moreOpen ? 'active' : 'inactive']}>更多</span>
          </button>
          {moreOpen && (
            <div className={styles.moreDropdown}>
              {moreMobileItems.map((item) => {
                const isActive =
                  pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={styles.moreDropdownItem[isActive ? 'active' : 'inactive']}
                  >
                    <Icon size={18} color={isActive ? undefined : item.color} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
