import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import '@/styles/globals.css';
import Sidebar from '@/components/layout/Sidebar';
import * as styles from './layout.css';

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
        <div className={styles.shell}>
          <Sidebar />

          <main className={styles.main}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
