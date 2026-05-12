'use client';

import { useCallback, useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { darkTheme } from '@/styles/tokens.css';
import * as css from './ThemeToggle.css';

const STORAGE_KEY = 'publio-theme';

type ThemeMode = 'light' | 'dark' | 'system';

function getSystemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveEffectiveTheme(mode: ThemeMode): 'light' | 'dark' {
  return mode === 'system' ? getSystemPreference() : mode;
}

function applyTheme(effective: 'light' | 'dark') {
  if (effective === 'dark') {
    document.documentElement.classList.add(darkTheme);
  } else {
    document.documentElement.classList.remove(darkTheme);
  }
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    const initialMode: ThemeMode =
      stored && ['light', 'dark', 'system'].includes(stored) ? stored : 'dark';
    setMode(initialMode);
    applyTheme(resolveEffectiveTheme(initialMode));

    // Listen for system preference changes when in system mode
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (localStorage.getItem(STORAGE_KEY) === 'system' || !localStorage.getItem(STORAGE_KEY)) {
        applyTheme(getSystemPreference());
      }
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const cycle = useCallback(() => {
    setMode((prev) => {
      const next: ThemeMode = prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : 'light';
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(resolveEffectiveTheme(next));
      return next;
    });
  }, []);

  const labels: Record<ThemeMode, string> = {
    light: '亮色模式（点击切换到暗色）',
    dark: '暗色模式（点击跟随系统）',
    system: '跟随系统（点击切换到亮色）',
  };

  const icons: Record<ThemeMode, React.ReactNode> = {
    light: <Sun size={16} />,
    dark: <Moon size={16} />,
    system: <Monitor size={16} />,
  };

  return (
    <button
      type="button"
      className={css.toggle}
      onClick={cycle}
      aria-label={labels[mode]}
      title={labels[mode]}
    >
      {icons[mode]}
    </button>
  );
}
