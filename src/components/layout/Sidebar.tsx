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
    <aside className="w-56 h-screen bg-gray-50 border-r border-gray-200 flex flex-col shrink-0">
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#261b15_0%,#151311_100%)] shadow-sm">
            <span className="text-lg">📰</span>
          </div>
          <h1 className="text-lg font-bold text-gray-900">Publio</h1>
        </div>
        <p className="text-xs text-gray-500 mt-1">
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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
