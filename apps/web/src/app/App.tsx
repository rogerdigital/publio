import { BrowserRouter } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { NavigationContent, NavigationProvider } from '@/components/layout/NavigationProvider';
import ToastContainer from '@/components/feedback/Toast';
import ShortcutCheatSheet from '@/components/feedback/ShortcutCheatSheet';
import { darkTheme } from '@/app/styles/tokens.css';
import * as styles from '@/app/styles/layout.css';
import { AppRouter } from './routes/AppRouter';

function applyTheme() {
  try {
    const stored = localStorage.getItem('publio-theme');
    const pref = stored || 'dark';
    const effective =
      pref === 'system'
        ? window.matchMedia('(prefers-color-scheme:dark)').matches
          ? 'dark'
          : 'light'
        : pref;
    if (effective === 'dark') {
      document.documentElement.classList.add(darkTheme);
    } else {
      document.documentElement.classList.remove(darkTheme);
    }
  } catch {
    // ignore
  }
}

export default function App() {
  useEffect(() => {
    applyTheme();
  }, []);

  return (
    <BrowserRouter>
      <NavigationProvider>
        <a href="#main-content" className={styles.skipLink}>
          跳到主要内容
        </a>
        <div className={styles.shell}>
          <Sidebar />
          <main id="main-content" className={styles.main} tabIndex={-1}>
            <NavigationContent>
              <AppRouter />
            </NavigationContent>
          </main>
        </div>
      </NavigationProvider>
      <ToastContainer />
      <ShortcutCheatSheet />
    </BrowserRouter>
  );
}
