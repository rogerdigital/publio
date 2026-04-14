'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Newspaper,
  PenLine,
  Settings2,
  ArrowRight,
  Library,
} from 'lucide-react';
import { Dancing_Script } from 'next/font/google';
import { cn } from '@/lib/cn';
import * as styles from './Sidebar.css';

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
    href: '/drafts',
    label: '稿件库',
    description: '管理所有草稿，追踪从选题到分发的完整链路。',
    icon: Library,
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
    <aside className={styles.sidebar}>
      <div className={styles.inner}>
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            const state = isActive ? 'active' : 'inactive';

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(styles.navItemBase, styles.navItemVariants[state])}
              >
                <span className={styles.navIndicator[state]} />

                <div className={cn(styles.navIconBase, styles.navIconVariants[state])}>
                  <Icon size={14} />
                </div>

                <div className={styles.navText}>
                  <div className={styles.navLabelRow}>
                    <p className={styles.navLabelVariants[state]}>
                      {item.label}
                    </p>
                    <ArrowRight
                      size={13}
                      className={styles.navArrowVariants[state]}
                    />
                  </div>
                  <p className={styles.navDescription}>
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className={styles.brandFooter}>
          <p className={cn(handwriting.className, styles.brandName)}>
            Publio
          </p>
          <p className={styles.brandSlogan}>
            Write once, publish everywhere.
          </p>
          <p className={styles.version}>v0.1.0</p>
        </div>
      </div>
    </aside>
  );
}
