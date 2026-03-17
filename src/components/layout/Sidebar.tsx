'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Newspaper, PenSquare, Settings } from 'lucide-react';

const navItems = [
  { href: '/', label: '编辑器', icon: PenSquare },
  { href: '/ai-news', label: 'AI 新闻', icon: Newspaper },
  { href: '/settings', label: '设置', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 h-screen border-r border-[#e8ddd1] bg-[linear-gradient(180deg,#fffdfa_0%,#f6efe8_100%)] text-[#3e342d] flex flex-col shrink-0">
      <div className="p-5 border-b border-[#eadfd3]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#fff1e7_0%,#f6d6c1_100%)] shadow-[0_8px_18px_rgba(205,131,93,0.18)]">
            <span className="text-lg">📰</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#231b16]">Publio</h1>
            <p className="mt-0.5 text-[11px] uppercase tracking-[0.28em] text-[#d77443]">
              Daily Wire
            </p>
          </div>
        </div>
        <p className="text-xs text-[#7e7268] mt-3">
          Write once, publish everywhere.
        </p>
      </div>
      <nav className="flex-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-1 ${
                isActive
                  ? 'bg-[#fff1e7] text-[#c96535] border border-[#f0c9b2]'
                  : 'text-[#6d6158] hover:bg-white hover:text-[#2b221d]'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
