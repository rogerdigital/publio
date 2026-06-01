import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { darkTheme } from '@/styles/tokens.css';
import Sidebar from '@/components/layout/Sidebar';
import ToastContainer from '@/components/feedback/Toast';
import ShortcutCheatSheet from '@/components/feedback/ShortcutCheatSheet';
import * as styles from './layout.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Publio',
  description: 'Publish Markdown content to multiple platforms in one workflow.',
};

const themeScript = `(function(){try{var c='${darkTheme}',s=localStorage.getItem('publio-theme'),p=s||'light',e=p==='system'?window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light':p;if(e==='dark'){document.documentElement.classList.add(c)}else{document.documentElement.classList.remove(c)}}catch(e){}})()`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={inter.className}>
        <a href="#main-content" className={styles.skipLink}>
          跳到主要内容
        </a>
        <div className={styles.shell}>
          <Sidebar />

          <main id="main-content" className={styles.main} tabIndex={-1}>
            {children}
          </main>
        </div>

        <ToastContainer />
        <ShortcutCheatSheet />
      </body>
    </html>
  );
}
