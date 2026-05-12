'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { cn } from '@/lib/cn';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';
import * as styles from './Sidebar.css';

const STORAGE_KEY = 'publio-sidebar-expanded';

const navItems = [
  { href: '/ai-news', label: '选题台', icon: Newspaper },
  { href: '/', label: '写作台', icon: PenLine },
  { href: '/drafts', label: '稿件库', icon: Library },
  { href: '/sync-tasks', label: '分发记录', icon: Send },
  { href: '/analytics', label: '数据看板', icon: BarChart3 },
  { href: '/calendar', label: '排期日历', icon: CalendarDays },
  { href: '/settings', label: '设置', icon: Settings2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') setExpanded(true);
  }, []);

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
                  <Icon size={20} />
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
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <nav className={styles.mobileTabBar} aria-label="移动端导航">
        {navItems.map((item) => {
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
              <Icon size={20} />
              <span className={styles.mobileTabLabel[state]}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
