import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'Publio',
  description:
    'Publish Markdown content to multiple platforms in one workflow.',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <div className="flex min-h-dvh flex-col text-[color:var(--wb-text)] lg:flex-row">
          <Sidebar />

          <main className="min-w-0 flex-1 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
