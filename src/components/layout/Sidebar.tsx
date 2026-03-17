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
    <aside className="w-56 h-screen border-r border-white/8 bg-[linear-gradient(180deg,#181614_0%,#11100f_100%)] text-[#ece2d6] flex flex-col shrink-0">
      <div className="p-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2f2118_0%,#171311_100%)] shadow-[0_8px_24px_rgba(0,0,0,0.28)]">
            <span className="text-lg">📰</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#fff5e8]">Publio</h1>
            <p className="mt-0.5 text-[11px] uppercase tracking-[0.28em] text-[#ff9a67]">
              Daily Wire
            </p>
          </div>
        </div>
        <p className="text-xs text-[#9f978d] mt-3">
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
                  ? 'bg-[rgba(255,122,69,0.16)] text-[#fff2e8] border border-[rgba(255,122,69,0.22)]'
                  : 'text-[#b8afa3] hover:bg-white/6 hover:text-[#fff2e8]'
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
