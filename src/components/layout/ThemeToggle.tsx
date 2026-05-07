'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { darkTheme } from '@/styles/tokens.css';
import * as css from './ThemeToggle.css';

const STORAGE_KEY = 'publio-theme';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark') {
      setDark(true);
      document.documentElement.classList.add(darkTheme);
    }
  }, []);

  const toggle = () => {
    setDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add(darkTheme);
        localStorage.setItem(STORAGE_KEY, 'dark');
      } else {
        document.documentElement.classList.remove(darkTheme);
        localStorage.setItem(STORAGE_KEY, 'light');
      }
      return next;
    });
  };

  return (
    <button type="button" className={css.toggle} onClick={toggle} aria-label={dark ? '切换到亮色模式' : '切换到暗色模式'}>
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
